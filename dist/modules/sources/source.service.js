"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceService = exports.SourceService = void 0;
const source_repository_1 = require("./source.repository");
const logger_1 = require("../../lib/logger");
class SourceService {
    async createSource(data) {
        logger_1.logger.info('Creating new source', { name: data.name, type: data.type });
        return source_repository_1.sourceRepository.create(data);
    }
    async getSource(id) {
        return source_repository_1.sourceRepository.findById(id);
    }
    async getAllSources() {
        return source_repository_1.sourceRepository.findAll();
    }
    async updateSource(id, data) {
        const existing = await source_repository_1.sourceRepository.findById(id);
        if (!existing) {
            throw new Error(`Source not found: ${id}`);
        }
        logger_1.logger.info('Updating source', { id, updates: data });
        return source_repository_1.sourceRepository.update(id, data);
    }
    async deleteSource(id) {
        const existing = await source_repository_1.sourceRepository.findById(id);
        if (!existing) {
            throw new Error(`Source not found: ${id}`);
        }
        logger_1.logger.info('Deleting source', { id });
        await source_repository_1.sourceRepository.delete(id);
    }
    async getSourceCheckpoint(sourceId) {
        const checkpoint = await source_repository_1.sourceRepository.getCheckpoint(sourceId);
        return {
            cursor: checkpoint?.cursor || null,
            lastFetchedAt: checkpoint?.lastFetchedAt || null,
        };
    }
    async updateSourceCheckpoint(sourceId, cursor) {
        await source_repository_1.sourceRepository.upsertCheckpoint(sourceId, cursor);
        logger_1.logger.info('Updated source checkpoint', { sourceId, cursor });
    }
    async activateSource(id) {
        return source_repository_1.sourceRepository.update(id, { isActive: true });
    }
    async deactivateSource(id) {
        return source_repository_1.sourceRepository.update(id, { isActive: false });
    }
}
exports.SourceService = SourceService;
exports.sourceService = new SourceService();
//# sourceMappingURL=source.service.js.map