"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceRepository = exports.PrismaSourceRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class PrismaSourceRepository {
    async create(data) {
        return prisma_1.default.source.create({
            data: {
                name: data.name,
                type: data.type,
                config: data.config,
                isActive: true,
            },
        });
    }
    async findById(id) {
        return prisma_1.default.source.findUnique({ where: { id } });
    }
    async findAll() {
        return prisma_1.default.source.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, data) {
        return prisma_1.default.source.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        await prisma_1.default.source.delete({ where: { id } });
    }
    async getCheckpoint(sourceId) {
        return prisma_1.default.sourceCheckpoint.findUnique({
            where: { sourceId },
        });
    }
    async upsertCheckpoint(sourceId, cursor) {
        return prisma_1.default.sourceCheckpoint.upsert({
            where: { sourceId },
            update: {
                cursor,
                lastFetchedAt: new Date(),
            },
            create: {
                sourceId,
                cursor,
                lastFetchedAt: new Date(),
            },
        });
    }
}
exports.PrismaSourceRepository = PrismaSourceRepository;
exports.sourceRepository = new PrismaSourceRepository();
//# sourceMappingURL=source.repository.js.map