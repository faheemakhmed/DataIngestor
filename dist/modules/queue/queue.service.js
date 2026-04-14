"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIngestionJob = createIngestionJob;
exports.createNormalizeJob = createNormalizeJob;
exports.createEnrichJob = createEnrichJob;
exports.addJobLog = addJobLog;
exports.processJob = processJob;
exports.getJobWithLogs = getJobWithLogs;
exports.getPendingJobs = getPendingJobs;
exports.reprocessJob = reprocessJob;
exports.reprocessDeadLetter = reprocessDeadLetter;
const client_1 = require("@prisma/client");
const queue_repository_1 = require("./queue.repository");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const logger_1 = require("../../lib/logger");
const config_1 = __importDefault(require("../../lib/config"));
async function createIngestionJob(sourceId, correlationId) {
    const dto = {
        type: client_1.JobType.INGEST,
        payload: { sourceId },
        correlationId,
    };
    return queue_repository_1.jobRepository.create(dto);
}
async function createNormalizeJob(rawRecordId, correlationId) {
    const dto = {
        type: client_1.JobType.NORMALIZE,
        payload: { rawRecordId },
        correlationId,
    };
    return queue_repository_1.jobRepository.create(dto);
}
async function createEnrichJob(normalizedRecordId, correlationId) {
    const dto = {
        type: client_1.JobType.ENRICH,
        payload: { normalizedRecordId },
        correlationId,
    };
    return queue_repository_1.jobRepository.create(dto);
}
async function addJobLog(jobId, message, level = client_1.LogLevel.INFO) {
    await prisma_1.default.pipelineLog.create({
        data: {
            jobId,
            message,
            level,
        },
    });
}
async function processJob(job, handler) {
    const correlationId = job.correlationId;
    try {
        logger_1.logger.info(`Processing job ${job.id}`, { type: job.type, correlationId });
        await queue_repository_1.jobRepository.updateStatus(job.id, client_1.JobStatus.PROCESSING);
        await addJobLog(job.id, `Starting ${job.type} job`, client_1.LogLevel.INFO);
        await handler(job.payload);
        await queue_repository_1.jobRepository.updateStatus(job.id, client_1.JobStatus.COMPLETED);
        await addJobLog(job.id, `Job completed successfully`, client_1.LogLevel.INFO);
        logger_1.logger.info(`Job completed ${job.id}`, { type: job.type, correlationId });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error(`Job failed ${job.id}`, { type: job.type, correlationId, error: errorMessage });
        await addJobLog(job.id, `Job failed: ${errorMessage}`, client_1.LogLevel.ERROR);
        const jobData = await queue_repository_1.jobRepository.findById(job.id);
        if (!jobData)
            return;
        if (jobData.retries >= jobData.maxRetries) {
            await queue_repository_1.jobRepository.markDeadLetter(job.id, errorMessage);
            await addJobLog(job.id, `Job moved to dead letter after ${jobData.retries} retries`, client_1.LogLevel.ERROR);
        }
        else {
            await queue_repository_1.jobRepository.incrementRetry(job.id);
            await addJobLog(job.id, `Retrying job (attempt ${jobData.retries + 1}/${jobData.maxRetries})`, client_1.LogLevel.WARN);
        }
        throw error;
    }
}
async function getJobWithLogs(jobId) {
    const job = await queue_repository_1.jobRepository.findById(jobId);
    if (!job)
        return { job: null, logs: [] };
    const logs = await prisma_1.default.pipelineLog.findMany({
        where: { jobId },
        orderBy: { timestamp: 'asc' },
        select: { message: true, level: true, timestamp: true },
    });
    return { job, logs };
}
async function getPendingJobs(type) {
    return queue_repository_1.jobRepository.findPending(type, config_1.default.workerConcurrency);
}
async function reprocessJob(jobId) {
    const job = await queue_repository_1.jobRepository.findById(jobId);
    if (!job)
        throw new Error('Job not found');
    return queue_repository_1.jobRepository.updateStatus(jobId, client_1.JobStatus.PENDING);
}
async function reprocessDeadLetter(jobId) {
    const job = await queue_repository_1.jobRepository.findById(jobId);
    if (!job)
        throw new Error('Job not found');
    if (job.status !== client_1.JobStatus.DEAD_LETTER) {
        throw new Error('Job is not in dead letter state');
    }
    return prisma_1.default.pipelineJob.update({
        where: { id: jobId },
        data: {
            status: client_1.JobStatus.PENDING,
            retries: 0,
            error: null,
            scheduledAt: new Date(),
        },
    });
}
//# sourceMappingURL=queue.service.js.map