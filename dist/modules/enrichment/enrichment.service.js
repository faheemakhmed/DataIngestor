"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichNormalizedRecord = enrichNormalizedRecord;
exports.enrichBatch = enrichBatch;
const axios_1 = __importDefault(require("axios"));
const normalize_repository_1 = require("../pipeline/normalize.repository");
const enrichment_repository_1 = require("./enrichment.repository");
const cache_1 = require("@/lib/cache");
const logger_1 = require("@/lib/logger");
const config_1 = __importDefault(require("@/lib/config"));
const client_1 = require("@prisma/client");
const mockEnrichmentProviders = {
    email: async (data) => {
        const email = data.email;
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
        const name = data.name;
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
async function callExternalEnrichmentApi(normalizedRecordId, structuredData) {
    const cacheKey = `enrich:${JSON.stringify(structuredData)}`;
    const cached = await (0, cache_1.getCachedEnrichment)(cacheKey);
    if (cached) {
        logger_1.logger.info('Using cached enrichment', { normalizedRecordId });
        return cached;
    }
    try {
        const response = await axios_1.default.post(config_1.default.enrichmentApiUrl, {
            data: structuredData,
        }, {
            timeout: 5000,
        });
        const enriched = response.data;
        (0, cache_1.setCachedEnrichment)(cacheKey, enriched, config_1.default.enrichmentCacheTtl);
        return enriched;
    }
    catch (error) {
        logger_1.logger.warn('External enrichment API failed, using mock', { normalizedRecordId, error });
    }
    const dataStr = JSON.stringify(structuredData);
    let provider = 'default';
    if (dataStr.includes('email'))
        provider = 'email';
    else if (dataStr.includes('name'))
        provider = 'company';
    const mockEnrichment = await mockEnrichmentProviders[provider](structuredData);
    (0, cache_1.setCachedEnrichment)(cacheKey, mockEnrichment, config_1.default.enrichmentCacheTtl);
    return mockEnrichment;
}
async function enrichNormalizedRecord(normalizedRecordId) {
    const normalized = await normalize_repository_1.normalizedRecordRepository.findById(normalizedRecordId);
    if (!normalized) {
        throw new Error(`Normalized record not found: ${normalizedRecordId}`);
    }
    const existingEnriched = await enrichment_repository_1.enrichedRecordRepository.findByNormalizedId(normalizedRecordId);
    if (existingEnriched) {
        logger_1.logger.info('Enriched record already exists', { normalizedRecordId, enrichedId: existingEnriched.id });
        return existingEnriched;
    }
    logger_1.logger.info('Enriching record', { normalizedRecordId });
    const structuredData = normalized.structuredData;
    let enrichedData;
    try {
        enrichedData = await callExternalEnrichmentApi(normalizedRecordId, structuredData);
    }
    catch (error) {
        const data = {
            normalizedRecordId,
            enrichedData: { error: error instanceof Error ? error.message : 'Unknown error', original: structuredData },
            status: client_1.RecordStatus.FAILED,
        };
        const enriched = await enrichment_repository_1.enrichedRecordRepository.create(data);
        logger_1.logger.error('Enrichment failed', { normalizedRecordId, error: error instanceof Error ? error.message : 'Unknown' });
        throw error;
    }
    const data = {
        normalizedRecordId,
        enrichedData: {
            original: structuredData,
            enriched: enrichedData,
        },
        status: client_1.RecordStatus.COMPLETED,
    };
    const enriched = await enrichment_repository_1.enrichedRecordRepository.create(data);
    await normalize_repository_1.normalizedRecordRepository.updateStatus(normalizedRecordId, client_1.RecordStatus.COMPLETED);
    logger_1.logger.info('Enrichment completed', { normalizedRecordId, enrichedId: enriched.id });
    return enriched;
}
async function enrichBatch(normalizedRecordIds) {
    let success = 0;
    let failed = 0;
    for (const normalizedRecordId of normalizedRecordIds) {
        try {
            await enrichNormalizedRecord(normalizedRecordId);
            success++;
        }
        catch (error) {
            failed++;
            logger_1.logger.error('Batch enrichment error', { normalizedRecordId, error: error instanceof Error ? error.message : 'Unknown' });
        }
    }
    return { success, failed };
}
//# sourceMappingURL=enrichment.service.js.map