"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRawRecord = normalizeRawRecord;
exports.normalizeBatch = normalizeBatch;
const ingestion_repository_1 = require("../ingestion/ingestion.repository");
const normalize_repository_1 = require("./normalize.repository");
const queue_service_1 = require("../queue/queue.service");
const logger_1 = require("@/lib/logger");
const client_1 = require("@prisma/client");
function normalizeValue(value, rule) {
    if (value === null || value === undefined) {
        if (rule.default !== undefined)
            return rule.default;
        if (rule.required)
            throw new Error(`Required field missing`);
        return null;
    }
    switch (rule.type) {
        case 'string':
            return String(value).trim();
        case 'number':
            const num = Number(value);
            if (isNaN(num))
                throw new Error(`Invalid number: ${value}`);
            return num;
        case 'boolean':
            return Boolean(value);
        case 'date':
            if (typeof value === 'string' || typeof value === 'number') {
                const date = new Date(value);
                if (isNaN(date.getTime()))
                    throw new Error(`Invalid date: ${value}`);
                return date.toISOString();
            }
            throw new Error(`Invalid date: ${value}`);
        case 'email':
            const email = String(value).toLowerCase();
            if (!email.includes('@'))
                throw new Error(`Invalid email: ${value}`);
            return email;
        case 'url':
            const url = String(value);
            try {
                new URL(url);
            }
            catch {
                throw new Error(`Invalid URL: ${value}`);
            }
            return url;
        default:
            return value;
    }
}
function applyNormalizationRules(payload, config) {
    const result = {};
    const errors = [];
    for (const [field, rules] of Object.entries(config)) {
        for (const rule of rules) {
            try {
                const value = payload[field];
                result[field] = normalizeValue(value, rule);
            }
            catch (error) {
                errors.push(`${field}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
    if (errors.length > 0) {
        throw new Error(`Normalization errors: ${errors.join('; ')}`);
    }
    return result;
}
const defaultNormalizationConfig = {
    name: [{ type: 'string', required: true }],
    email: [{ type: 'email', required: true }],
    price: [{ type: 'number', required: false }],
    category: [{ type: 'string', required: false }],
    created: [{ type: 'date', required: false }],
};
async function normalizeRawRecord(rawRecordId) {
    const rawRecord = await ingestion_repository_1.rawRecordRepository.findById(rawRecordId);
    if (!rawRecord) {
        throw new Error(`Raw record not found: ${rawRecordId}`);
    }
    const existingNormalized = await normalize_repository_1.normalizedRecordRepository.findByRawRecordId(rawRecordId);
    if (existingNormalized) {
        logger_1.logger.info('Normalized record already exists', { rawRecordId, normalizedId: existingNormalized.id });
        return existingNormalized;
    }
    logger_1.logger.info('Normalizing record', { rawRecordId, externalId: rawRecord.externalId });
    const payload = rawRecord.payload;
    let structuredData;
    try {
        structuredData = applyNormalizationRules(payload, defaultNormalizationConfig);
    }
    catch (error) {
        const normalizedData = {
            rawRecordId,
            structuredData: { error: error instanceof Error ? error.message : 'Unknown error', original: payload },
            status: client_1.RecordStatus.FAILED,
        };
        const normalized = await normalize_repository_1.normalizedRecordRepository.create(normalizedData);
        logger_1.logger.error('Normalization failed', { rawRecordId, error: error instanceof Error ? error.message : 'Unknown' });
        throw error;
    }
    const normalizedData = {
        rawRecordId,
        structuredData: structuredData,
        status: client_1.RecordStatus.COMPLETED,
    };
    const normalized = await normalize_repository_1.normalizedRecordRepository.create(normalizedData);
    await (0, queue_service_1.createEnrichJob)(normalized.id, rawRecord.id);
    logger_1.logger.info('Normalization completed', { rawRecordId, normalizedId: normalized.id });
    return normalized;
}
async function normalizeBatch(rawRecordIds) {
    let success = 0;
    let failed = 0;
    for (const rawRecordId of rawRecordIds) {
        try {
            await normalizeRawRecord(rawRecordId);
            success++;
        }
        catch (error) {
            failed++;
            logger_1.logger.error('Batch normalization error', { rawRecordId, error: error instanceof Error ? error.message : 'Unknown' });
        }
    }
    return { success, failed };
}
//# sourceMappingURL=normalize.service.js.map