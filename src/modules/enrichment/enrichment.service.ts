import axios from 'axios';
import { Prisma } from '@prisma/client';
import { normalizedRecordRepository } from '../pipeline/normalize.repository';
import { enrichedRecordRepository, EnrichedRecordData } from './enrichment.repository';
import { getCachedEnrichment, setCachedEnrichment } from '@/lib/cache';
import { logger } from '@/lib/logger';
import config from '@/lib/config';
import { EnrichedRecord, RecordStatus } from '@prisma/client';

interface EnrichmentProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  enrich: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

const mockEnrichmentProviders: Record<string, (data: Record<string, unknown>) => Promise<Record<string, unknown>>> = {
  email: async (data) => {
    const email = data.email as string;
    await new Promise(r => setTimeout(r, 50));
    return {
      email,
      enrichments: {
        isValid: email.includes('@') && email.includes('.'),
        domain: email.split('@')[1] || null,
        isFree: ['gmail.com', 'yahoo.com', 'hotmail.com'].includes(email.split('@')[1] || ''),
      },
    };
  },
  company: async (data) => {
    const name = data.name as string;
    await new Promise(r => setTimeout(r, 50));
    return {
      company: name,
      enrichments: {
        size: 'medium',
        industry: 'technology',
        founded: 2020,
        employees: Math.floor(Math.random() * 500) + 10,
      },
    };
  },
  default: async (data) => {
    await new Promise(r => setTimeout(r, 50));
    return {
      original: data,
      enrichments: {
        processed: true,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

async function callExternalEnrichmentApi(
  normalizedRecordId: string,
  structuredData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const cacheKey = `enrich:${JSON.stringify(structuredData)}`;
  const cached = await getCachedEnrichment<Record<string, unknown>>(cacheKey);
  if (cached) {
    logger.info('Using cached enrichment', { normalizedRecordId });
    return cached;
  }

  try {
    const response = await axios.post(config.enrichmentApiUrl, {
      data: structuredData,
    }, {
      timeout: 5000,
    });
    const enriched = response.data;
    setCachedEnrichment(cacheKey, enriched, config.enrichmentCacheTtl);
    return enriched;
  } catch (error) {
    logger.warn('External enrichment API failed, using mock', { normalizedRecordId, error });
  }

  const dataStr = JSON.stringify(structuredData);
  let provider = 'default';
  if (dataStr.includes('email')) provider = 'email';
  else if (dataStr.includes('name')) provider = 'company';

  const mockEnrichment = await mockEnrichmentProviders[provider](structuredData);
  setCachedEnrichment(cacheKey, mockEnrichment, config.enrichmentCacheTtl);

  return mockEnrichment;
}

export async function enrichNormalizedRecord(normalizedRecordId: string): Promise<EnrichedRecord> {
  const normalized = await normalizedRecordRepository.findById(normalizedRecordId);
  if (!normalized) {
    throw new Error(`Normalized record not found: ${normalizedRecordId}`);
  }

  const existingEnriched = await enrichedRecordRepository.findByNormalizedId(normalizedRecordId);
  if (existingEnriched) {
    logger.info('Enriched record already exists', { normalizedRecordId, enrichedId: existingEnriched.id });
    return existingEnriched;
  }

  logger.info('Enriching record', { normalizedRecordId });

  const structuredData = normalized.structuredData as Record<string, unknown>;
  let enrichedData: Record<string, unknown>;

  try {
    enrichedData = await callExternalEnrichmentApi(normalizedRecordId, structuredData);
  } catch (error) {
    const data: EnrichedRecordData = {
      normalizedRecordId,
      enrichedData: { error: error instanceof Error ? error.message : 'Unknown error', original: structuredData } as unknown as Prisma.InputJsonValue,
      status: RecordStatus.FAILED,
    };
    const enriched = await enrichedRecordRepository.create(data);
    logger.error('Enrichment failed', { normalizedRecordId, error: error instanceof Error ? error.message : 'Unknown' });
    throw error;
  }

  const data: EnrichedRecordData = {
    normalizedRecordId,
    enrichedData: {
      original: structuredData,
      enriched: enrichedData,
    } as unknown as Prisma.InputJsonValue,
    status: RecordStatus.COMPLETED,
  };

  const enriched = await enrichedRecordRepository.create(data);
  await normalizedRecordRepository.updateStatus(normalizedRecordId, RecordStatus.COMPLETED);

  logger.info('Enrichment completed', { normalizedRecordId, enrichedId: enriched.id });

  return enriched;
}

export async function enrichBatch(normalizedRecordIds: string[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const normalizedRecordId of normalizedRecordIds) {
    try {
      await enrichNormalizedRecord(normalizedRecordId);
      success++;
    } catch (error) {
      failed++;
      logger.error('Batch enrichment error', { normalizedRecordId, error: error instanceof Error ? error.message : 'Unknown' });
    }
  }

  return { success, failed };
}