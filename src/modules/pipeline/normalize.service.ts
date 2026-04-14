import { NormalizedRecord } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { rawRecordRepository } from '../ingestion/ingestion.repository';
import { normalizedRecordRepository, NormalizedRecordData } from './normalize.repository';
import { createEnrichJob } from '../queue/queue.service';
import { logger } from '@/lib/logger';
import { RecordStatus } from '@prisma/client';

interface NormalizationRule {
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url';
  required?: boolean;
  default?: unknown;
}

type NormalizationConfig = Record<string, NormalizationRule[]>;

function normalizeValue(value: unknown, rule: NormalizationRule): unknown {
  if (value === null || value === undefined) {
    if (rule.default !== undefined) return rule.default;
    if (rule.required) throw new Error(`Required field missing`);
    return null;
  }

  switch (rule.type) {
    case 'string':
      return String(value).trim();
    case 'number':
      const num = Number(value);
      if (isNaN(num)) throw new Error(`Invalid number: ${value}`);
      return num;
    case 'boolean':
      return Boolean(value);
    case 'date':
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
        return date.toISOString();
      }
      throw new Error(`Invalid date: ${value}`);
    case 'email':
      const email = String(value).toLowerCase();
      if (!email.includes('@')) throw new Error(`Invalid email: ${value}`);
      return email;
    case 'url':
      const url = String(value);
      try { new URL(url); } catch { throw new Error(`Invalid URL: ${value}`); }
      return url;
    default:
      return value;
  }
}

function applyNormalizationRules(payload: Record<string, unknown>, config: NormalizationConfig): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(config)) {
    for (const rule of rules) {
      try {
        const value = payload[field];
        result[field] = normalizeValue(value, rule);
      } catch (error) {
        errors.push(`${field}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Normalization errors: ${errors.join('; ')}`);
  }

  return result;
}

const defaultNormalizationConfig: NormalizationConfig = {
  name: [{ type: 'string', required: true }],
  email: [{ type: 'email', required: true }],
  price: [{ type: 'number', required: false }],
  category: [{ type: 'string', required: false }],
  created: [{ type: 'date', required: false }],
};

export async function normalizeRawRecord(rawRecordId: string): Promise<NormalizedRecord> {
  const rawRecord = await rawRecordRepository.findById(rawRecordId);
  if (!rawRecord) {
    throw new Error(`Raw record not found: ${rawRecordId}`);
  }

  const existingNormalized = await normalizedRecordRepository.findByRawRecordId(rawRecordId);
  if (existingNormalized) {
    logger.info('Normalized record already exists', { rawRecordId, normalizedId: existingNormalized.id });
    return existingNormalized;
  }

  logger.info('Normalizing record', { rawRecordId, externalId: rawRecord.externalId });

  const payload = rawRecord.payload as Record<string, unknown>;
  let structuredData: Record<string, unknown>;

  try {
    structuredData = applyNormalizationRules(payload, defaultNormalizationConfig);
  } catch (error) {
    const normalizedData: NormalizedRecordData = {
      rawRecordId,
      structuredData: { error: error instanceof Error ? error.message : 'Unknown error', original: payload } as unknown as Prisma.InputJsonValue,
      status: RecordStatus.FAILED,
    };
    const normalized = await normalizedRecordRepository.create(normalizedData);
    logger.error('Normalization failed', { rawRecordId, error: error instanceof Error ? error.message : 'Unknown' });
    throw error;
  }

  const normalizedData: NormalizedRecordData = {
    rawRecordId,
    structuredData: structuredData as Prisma.InputJsonValue,
    status: RecordStatus.COMPLETED,
  };

  const normalized = await normalizedRecordRepository.create(normalizedData);
  await createEnrichJob(normalized.id, rawRecord.id);

  logger.info('Normalization completed', { rawRecordId, normalizedId: normalized.id });

  return normalized;
}

export async function normalizeBatch(rawRecordIds: string[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const rawRecordId of rawRecordIds) {
    try {
      await normalizeRawRecord(rawRecordId);
      success++;
    } catch (error) {
      failed++;
      logger.error('Batch normalization error', { rawRecordId, error: error instanceof Error ? error.message : 'Unknown' });
    }
  }

  return { success, failed };
}