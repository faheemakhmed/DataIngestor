"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichedRecordRepository = exports.PrismaEnrichedRecordRepository = void 0;
const prisma_1 = __importDefault(require("@/lib/prisma"));
const client_1 = require("@prisma/client");
class PrismaEnrichedRecordRepository {
    async create(data) {
        return prisma_1.default.enrichedRecord.create({
            data: {
                normalizedRecordId: data.normalizedRecordId,
                enrichedData: data.enrichedData,
                status: data.status || client_1.RecordStatus.PENDING,
            },
        });
    }
    async findById(id) {
        return prisma_1.default.enrichedRecord.findUnique({ where: { id } });
    }
    async findByNormalizedId(normalizedRecordId) {
        return prisma_1.default.enrichedRecord.findUnique({ where: { normalizedRecordId } });
    }
    async updateStatus(id, status) {
        return prisma_1.default.enrichedRecord.update({
            where: { id },
            data: { status },
        });
    }
    async findPending(limit) {
        return prisma_1.default.enrichedRecord.findMany({
            where: { status: client_1.RecordStatus.PENDING },
            take: limit,
            orderBy: { createdAt: 'asc' },
        });
    }
}
exports.PrismaEnrichedRecordRepository = PrismaEnrichedRecordRepository;
exports.enrichedRecordRepository = new PrismaEnrichedRecordRepository();
//# sourceMappingURL=enrichment.repository.js.map