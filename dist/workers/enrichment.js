"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const queue_service_1 = require("../modules/queue/queue.service");
const enrichment_service_1 = require("../modules/enrichment/enrichment.service");
const logger_1 = require("../lib/logger");
const config_1 = __importDefault(require("../lib/config"));
async function runEnrichmentWorker() {
    logger_1.logger.info('Starting enrichment worker', { concurrency: config_1.default.workerConcurrency });
    while (true) {
        try {
            const jobs = await (0, queue_service_1.getPendingJobs)(client_1.JobType.ENRICH);
            if (jobs.length === 0) {
                await new Promise(r => setTimeout(r, config_1.default.jobPollInterval));
                continue;
            }
            for (const job of jobs) {
                const payload = job.payload;
                const normalizedRecordId = payload.normalizedRecordId;
                await (0, queue_service_1.processJob)(job, async () => {
                    logger_1.logger.info('Processing enrichment job', { jobId: job.id, normalizedRecordId });
                    await (0, enrichment_service_1.enrichNormalizedRecord)(normalizedRecordId);
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Enrichment worker error', { error: error instanceof Error ? error.message : 'Unknown' });
            await new Promise(r => setTimeout(r, config_1.default.jobPollInterval));
        }
    }
}
runEnrichmentWorker().catch(error => {
    logger_1.logger.error('Enrichment worker crashed', { error: error instanceof Error ? error.message : 'Unknown' });
    process.exit(1);
});
//# sourceMappingURL=enrichment.js.map