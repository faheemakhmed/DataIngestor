import axios from 'axios';
import { Prisma } from '@prisma/client';
import { sourceService } from '../sources/source.service';
import { rawRecordRepository } from './ingestion.repository';
import { generateRecordHash } from '@/lib/hash';
import { createNormalizeJob } from '../queue/queue.service';
import { logger } from '@/lib/logger';

export interface ExternalSourceConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  pagination?: {
    type: 'cursor' | 'offset' | 'timestamp';
    cursorParam?: string;
    offsetParam?: string;
    timestampParam?: string;
  };
  transform?: (data: unknown) => ExternalRecord[];
}

export interface ExternalRecord {
  id: string;
  data: Record<string, unknown>;
}

const mockApiData: Record<string, ExternalRecord[]> = {
  users: [
    { id: '1', data: { name: 'John Doe', email: 'john@example.com', created: '2024-01-01' } },
    { id: '2', data: { name: 'Jane Smith', email: 'jane@example.com', created: '2024-01-02' } },
    { id: '3', data: { name: 'Bob Wilson', email: 'bob@example.com', created: '2024-01-03' } },
  ],
  products: [
    { id: 'p1', data: { name: 'Widget A', price: 19.99, category: 'electronics' } },
    { id: 'p2', data: { name: 'Widget B', price: 29.99, category: 'electronics' } },
  ],
};

async function fetchFromApi(config: ExternalSourceConfig): Promise<ExternalRecord[]> {
  const response = await axios({
    method: config.method || 'GET',
    url: config.url,
    headers: config.headers,
  });
  return config.transform ? config.transform(response.data) : response.data;
}

async function fetchMockData(sourceId: string): Promise<ExternalRecord[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const dataType = sourceId.includes('users') ? 'users' : sourceId.includes('products') ? 'products' : 'default';
  return mockApiData[dataType] || mockApiData.default;
}

export async function ingestFromSource(sourceId: string): Promise<{ ingested: number; duplicates: number }> {
  const source = await sourceService.getSource(sourceId);
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  if (!source.isActive) {
    throw new Error(`Source is not active: ${sourceId}`);
  }

  logger.info('Starting ingestion', { sourceId, sourceName: source.name });

  const config = source.config as unknown as ExternalSourceConfig;
  let records: ExternalRecord[];

  if (config.url && config.url.startsWith('http')) {
    records = await fetchFromApi(config);
  } else {
    records = await fetchMockData(sourceId);
  }

  const checkpoint = await sourceService.getSourceCheckpoint(sourceId);
  const newRecords = records.filter(r => !checkpoint.cursor || r.id > checkpoint.cursor);

  if (newRecords.length === 0) {
    logger.info('No new records to ingest', { sourceId });
    return { ingested: 0, duplicates: 0 };
  }

  const rawRecordData = newRecords.map(record => ({
    sourceId,
    externalId: record.id,
    payload: record.data as Prisma.InputJsonValue,
    hash: generateRecordHash(sourceId, record.id, record.data),
  }));

  const existingHashes = new Set();
  const uniqueRecords = rawRecordData.filter(record => {
    if (existingHashes.has(record.hash)) return false;
    existingHashes.add(record.hash);
    return true;
  });

  const ingested = await rawRecordRepository.createMany(uniqueRecords);

  const lastRecord = newRecords[newRecords.length - 1];
  await sourceService.updateSourceCheckpoint(sourceId, lastRecord.id);

  for (const record of uniqueRecords) {
    const rawRecord = await rawRecordRepository.findByHash(record.hash);
    if (rawRecord) {
      await createNormalizeJob(rawRecord.id, sourceId);
    }
  }

  logger.info('Ingestion completed', { sourceId, ingested, total: newRecords.length });

  return {
    ingested,
    duplicates: newRecords.length - ingested,
  };
}