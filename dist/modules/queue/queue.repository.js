"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRepository = exports.PrismaJobRepository = void 0;
const prisma_1 = __importDefault(require("@/lib/prisma"));
const client_1 = require("@prisma/client");
const logger_1 = require("@/lib/logger");
const config_1 = __importDefault(require("@/lib/config"));
class PrismaJobRepository {
    async create(data) {
        return prisma_1.default.pipelineJob.create({
            data: {
                type: data.type,
                status: client_1.JobStatus.PENDING,
                payload: data.payload,
                scheduledAt: data.scheduledAt || new Date(),
                correlationId: data.correlationId || (0, logger_1.createCorrelationId)(),
                maxRetries: config_1.default.maxRetries,
            },
        });
    }
    async findById(id) {
        return prisma_1.default.pipelineJob.findUnique({ where: { id } });
    }
    async findPending(type, limit) {
        const now = new Date();
        return prisma_1.default.pipelineJob.findMany({
            where: {
                type,
                status: client_1.JobStatus.PENDING,
                scheduledAt: { lte: now },
            },
            orderBy: { scheduledAt: 'asc' },
            take: limit,
        });
    }
    async updateStatus(id, status, error) {
        return prisma_1.default.pipelineJob.update({
            where: { id },
            data: {
                status,
                error,
                ...(status === client_1.JobStatus.PROCESSING ? { startedAt: new Date() } : {}),
                ...(status === client_1.JobStatus.COMPLETED || status === client_1.JobStatus.FAILED ? { completedAt: new Date() } : {}),
            },
        });
    }
    async incrementRetry(id) {
        const job = await prisma_1.default.pipelineJob.findUnique({ where: { id } });
        if (!job)
            throw new Error('Job not found');
        return prisma_1.default.pipelineJob.update({
            where: { id },
            data: {
                retries: { increment: 1 },
                status: client_1.JobStatus.PENDING,
                scheduledAt: new Date(Date.now() + config_1.default.retryBackoffMs * Math.pow(2, job.retries)),
            },
        });
    }
    async markDeadLetter(id, error) {
        return prisma_1.default.pipelineJob.update({
            where: { id },
            data: {
                status: client_1.JobStatus.DEAD_LETTER,
                error,
                completedAt: new Date(),
            },
        });
    }
}
exports.PrismaJobRepository = PrismaJobRepository;
exports.jobRepository = new PrismaJobRepository();
//# sourceMappingURL=queue.repository.js.map