"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestFromSource = ingestFromSource;
const axios_1 = __importDefault(require("axios"));
const source_service_1 = require("../sources/source.service");
const ingestion_repository_1 = require("./ingestion.repository");
const hash_1 = require("../../lib/hash");
const queue_service_1 = require("../queue/queue.service");
const logger_1 = require("../../lib/logger");
const mockApiData = {
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
async function fetchFromApi(config) {
    const response = await (0, axios_1.default)({
        method: config.method || 'GET',
        url: config.url,
        headers: config.headers,
    });
    return config.transform ? config.transform(response.data) : response.data;
}
async function fetchMockData(sourceId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const dataType = sourceId.includes('users') ? 'users' : sourceId.includes('products') ? 'products' : 'default';
    return mockApiData[dataType] || mockApiData.default;
}
async function ingestFromSource(sourceId) {
    const source = await source_service_1.sourceService.getSource(sourceId);
    if (!source) {
        throw new Error(`Source not found: ${sourceId}`);
    }
    if (!source.isActive) {
        throw new Error(`Source is not active: ${sourceId}`);
    }
    logger_1.logger.info('Starting ingestion', { sourceId, sourceName: source.name });
    const config = source.config;
    let records;
    if (config.url && config.url.startsWith('http')) {
        records = await fetchFromApi(config);
    }
    else {
        records = await fetchMockData(sourceId);
    }
    const checkpoint = await source_service_1.sourceService.getSourceCheckpoint(sourceId);
    const newRecords = records.filter(r => !checkpoint.cursor || r.id > checkpoint.cursor);
    if (newRecords.length === 0) {
        logger_1.logger.info('No new records to ingest', { sourceId });
        return { ingested: 0, duplicates: 0 };
    }
    const rawRecordData = newRecords.map(record => ({
        sourceId,
        externalId: record.id,
        payload: record.data,
        hash: (0, hash_1.generateRecordHash)(sourceId, record.id, record.data),
    }));
    const existingHashes = new Set();
    const uniqueRecords = rawRecordData.filter(record => {
        if (existingHashes.has(record.hash))
            return false;
        existingHashes.add(record.hash);
        return true;
    });
    const ingested = await ingestion_repository_1.rawRecordRepository.createMany(uniqueRecords);
    const lastRecord = newRecords[newRecords.length - 1];
    await source_service_1.sourceService.updateSourceCheckpoint(sourceId, lastRecord.id);
    for (const record of uniqueRecords) {
        const rawRecord = await ingestion_repository_1.rawRecordRepository.findByHash(record.hash);
        if (rawRecord) {
            await (0, queue_service_1.createNormalizeJob)(rawRecord.id, sourceId);
        }
    }
    logger_1.logger.info('Ingestion completed', { sourceId, ingested, total: newRecords.length });
    return {
        ingested,
        duplicates: newRecords.length - ingested,
    };
}
//# sourceMappingURL=ingestion.service.js.map