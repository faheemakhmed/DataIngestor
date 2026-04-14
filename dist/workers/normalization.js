"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("tsconfig-paths/register");
const client_1 = require("@prisma/client");
const queue_service_1 = require("../modules/queue/queue.service");
const normalize_service_1 = require("../modules/pipeline/normalize.service");
const logger_1 = require("../lib/logger");
const config_1 = __importDefault(require("../lib/config"));
async function runNormalizationWorker() {
    logger_1.logger.info('Starting normalization worker', { concurrency: config_1.default.workerConcurrency });
    while (true) {
        try {
            const jobs = await (0, queue_service_1.getPendingJobs)(client_1.JobType.NORMALIZE);
            if (jobs.length === 0) {
                await new Promise(r => setTimeout(r, config_1.default.jobPollInterval));
                continue;
            }
            for (const job of jobs) {
                const payload = job.payload;
                const rawRecordId = payload.rawRecordId;
                await (0, queue_service_1.processJob)(job, async () => {
                    logger_1.logger.info('Processing normalization job', { jobId: job.id, rawRecordId });
                    await (0, normalize_service_1.normalizeRawRecord)(rawRecordId);
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Normalization worker error', { error: error instanceof Error ? error.message : 'Unknown' });
            await new Promise(r => setTimeout(r, config_1.default.jobPollInterval));
        }
    }
}
runNormalizationWorker().catch(error => {
    logger_1.logger.error('Normalization worker crashed', { error: error instanceof Error ? error.message : 'Unknown' });
    process.exit(1);
});
//# sourceMappingURL=normalization.js.map