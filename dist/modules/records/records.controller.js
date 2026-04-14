"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordsController = exports.RecordsController = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
class RecordsController {
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page || '1', 10);
            const limit = parseInt(req.query.limit || '50', 10);
            const offset = (page - 1) * limit;
            const status = req.query.status;
            const sourceId = req.query.sourceId;
            const where = {};
            if (status)
                where.status = status;
            if (sourceId)
                where.sourceId = sourceId;
            const [rawRecords, total] = await Promise.all([
                prisma_1.default.rawRecord.findMany({
                    where,
                    include: {
                        normalized: {
                            include: { enriched: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                }),
                prisma_1.default.rawRecord.count({ where }),
            ]);
            res.json({
                data: rawRecords,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const record = await prisma_1.default.rawRecord.findUnique({
                where: { id },
                include: {
                    normalized: {
                        include: { enriched: true },
                    },
                },
            });
            if (!record) {
                res.status(404).json({ error: 'Record not found' });
                return;
            }
            res.json(record);
        }
        catch (error) {
            next(error);
        }
    }
    async getEnriched(req, res, next) {
        try {
            const page = parseInt(req.query.page || '1', 10);
            const limit = parseInt(req.query.limit || '50', 10);
            const offset = (page - 1) * limit;
            const [enrichedRecords, total] = await Promise.all([
                prisma_1.default.enrichedRecord.findMany({
                    where: { status: client_1.RecordStatus.COMPLETED },
                    include: {
                        normalized: {
                            include: {
                                rawRecord: {
                                    include: { source: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                }),
                prisma_1.default.enrichedRecord.count({ where: { status: client_1.RecordStatus.COMPLETED } }),
            ]);
            res.json({
                data: enrichedRecords,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RecordsController = RecordsController;
exports.recordsController = new RecordsController();
//# sourceMappingURL=records.controller.js.map