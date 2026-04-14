"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const queue_service_1 = require("../modules/queue/queue.service");
const ingestion_service_1 = require("../modules/ingestion/ingestion.service");
const logger_1 = require("../lib/logger");
const config_1 = __importDefault(require("../lib/config"));
async function runIngestionWorker() {
    logger_1.logger.info('Starting ingestion worker', { concurrency: config_1.default.workerConcurrency });
    while (true) {
        try {
            const jobs = await (0, queue_service_1.getPendingJobs)(client_1.JobType.INGEST);
            if (jobs.length === 0) {
                await new Promise(r => setTimeout(r, config_1.default.jobPollInterval));
                continue;
            }
            for (const job of jobs) {
                const payload = job.payload;
                const sourceId = payload.sourceId;
                await (0, queue_service_1.processJob)(job, async () => {
                    logger_1.logger.info('Processing ingestion job', { jobId: job.id, sourceId });
                    await (0, ingestion_service_1.ingestFromSource)(sourceId);
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Ingestion worker error', { error: error instanceof Error ? error.message : 'Unknown' });
            await new Promise(r => setTimeout(r, config_1.default.jobPollInterval));
        }
    }
}
runIngestionWorker().catch(error => {
    logger_1.logger.error('Ingestion worker crashed', { error: error instanceof Error ? error.message : 'Unknown' });
    process.exit(1);
});
//# sourceMappingURL=ingestion.js.map