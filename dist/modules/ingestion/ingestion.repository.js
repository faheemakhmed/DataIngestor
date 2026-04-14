"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawRecordRepository = exports.PrismaRawRecordRepository = void 0;
const prisma_1 = __importDefault(require("@/lib/prisma"));
class PrismaRawRecordRepository {
    async create(data) {
        return prisma_1.default.rawRecord.create({
            data: {
                sourceId: data.sourceId,
                externalId: data.externalId,
                payload: data.payload,
                hash: data.hash,
            },
        });
    }
    async createMany(data) {
        if (data.length === 0)
            return 0;
        const result = await prisma_1.default.rawRecord.createMany({
            data: data.map(d => ({
                sourceId: d.sourceId,
                externalId: d.externalId,
                payload: d.payload,
                hash: d.hash,
            })),
            skipDuplicates: true,
        });
        return result.count;
    }
    async findByHash(hash) {
        return prisma_1.default.rawRecord.findFirst({
            where: { hash },
        });
    }
    async findById(id) {
        return prisma_1.default.rawRecord.findUnique({ where: { id } });
    }
    async findBySourceId(sourceId, limit, offset) {
        return prisma_1.default.rawRecord.findMany({
            where: { sourceId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
    }
    async countBySourceId(sourceId) {
        return prisma_1.default.rawRecord.count({ where: { sourceId } });
    }
}
exports.PrismaRawRecordRepository = PrismaRawRecordRepository;
exports.rawRecordRepository = new PrismaRawRecordRepository();
//# sourceMappingURL=ingestion.repository.js.map