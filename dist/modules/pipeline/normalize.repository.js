"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizedRecordRepository = exports.PrismaNormalizedRecordRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
class PrismaNormalizedRecordRepository {
    async create(data) {
        return prisma_1.default.normalizedRecord.create({
            data: {
                rawRecordId: data.rawRecordId,
                structuredData: data.structuredData,
                status: data.status || client_1.RecordStatus.PENDING,
            },
        });
    }
    async findById(id) {
        return prisma_1.default.normalizedRecord.findUnique({ where: { id } });
    }
    async findByRawRecordId(rawRecordId) {
        return prisma_1.default.normalizedRecord.findUnique({ where: { rawRecordId } });
    }
    async updateStatus(id, status) {
        return prisma_1.default.normalizedRecord.update({
            where: { id },
            data: { status },
        });
    }
    async findPending(limit) {
        return prisma_1.default.normalizedRecord.findMany({
            where: { status: client_1.RecordStatus.PENDING },
            take: limit,
            orderBy: { createdAt: 'asc' },
        });
    }
}
exports.PrismaNormalizedRecordRepository = PrismaNormalizedRecordRepository;
exports.normalizedRecordRepository = new PrismaNormalizedRecordRepository();
//# sourceMappingURL=normalize.repository.js.map