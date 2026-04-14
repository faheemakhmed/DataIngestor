"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceController = exports.SourceController = void 0;
const zod_1 = require("zod");
const source_service_1 = require("./source.service");
const logger_1 = require("@/lib/logger");
const createSourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    type: zod_1.z.enum(['API', 'RSS', 'CSV', 'JSON']),
    config: zod_1.z.record(zod_1.z.unknown()),
}).transform(data => ({
    ...data,
    config: data.config,
}));
const updateSourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    type: zod_1.z.enum(['API', 'RSS', 'CSV', 'JSON']).optional(),
    config: zod_1.z.record(zod_1.z.unknown()).optional(),
    isActive: zod_1.z.boolean().optional(),
}).transform(data => ({
    ...data,
    config: data.config,
}));
class SourceController {
    async create(req, res, next) {
        try {
            const correlationId = (0, logger_1.createCorrelationId)();
            const data = createSourceSchema.parse(req.body);
            const source = await source_service_1.sourceService.createSource(data);
            logger_1.logger.info('Source created successfully', { correlationId, sourceId: source.id });
            res.status(201).json(source);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const sources = await source_service_1.sourceService.getAllSources();
            res.json(sources);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const source = await source_service_1.sourceService.getSource(id);
            if (!source) {
                res.status(404).json({ error: 'Source not found' });
                return;
            }
            res.json(source);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = updateSourceSchema.parse(req.body);
            const source = await source_service_1.sourceService.updateSource(id, data);
            res.json(source);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await source_service_1.sourceService.deleteSource(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    async sync(req, res, next) {
        try {
            const { id } = req.params;
            const source = await source_service_1.sourceService.getSource(id);
            if (!source) {
                res.status(404).json({ error: 'Source not found' });
                return;
            }
            const { createIngestionJob } = await Promise.resolve().then(() => __importStar(require('@/modules/queue/queue.service')));
            const job = await createIngestionJob(id);
            logger_1.logger.info('Ingestion job created', { sourceId: id, jobId: job.id });
            res.status(202).json({ message: 'Sync initiated', jobId: job.id });
        }
        catch (error) {
            next(error);
        }
    }
    async getCheckpoint(req, res, next) {
        try {
            const { id } = req.params;
            const checkpoint = await source_service_1.sourceService.getSourceCheckpoint(id);
            res.json(checkpoint);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SourceController = SourceController;
exports.sourceController = new SourceController();
//# sourceMappingURL=source.controller.js.map