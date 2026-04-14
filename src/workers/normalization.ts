import { JobType } from '@prisma/client';
import { getPendingJobs, processJob } from '../modules/queue/queue.service';
import { normalizeRawRecord } from '../modules/pipeline/normalize.service';
import { logger } from '../lib/logger';
import config from '../lib/config';

async function runNormalizationWorker(): Promise<void> {
  logger.info('Starting normalization worker', { concurrency: config.workerConcurrency });

  while (true) {
    try {
      const jobs = await getPendingJobs(JobType.NORMALIZE);
      
      if (jobs.length === 0) {
        await new Promise(r => setTimeout(r, config.jobPollInterval));
        continue;
      }

      for (const job of jobs) {
        const payload = job.payload as { rawRecordId: string };
        const rawRecordId = payload.rawRecordId;
        
        await processJob(job, async () => {
          logger.info('Processing normalization job', { jobId: job.id, rawRecordId });
          await normalizeRawRecord(rawRecordId);
        });
      }
    } catch (error) {
      logger.error('Normalization worker error', { error: error instanceof Error ? error.message : 'Unknown' });
      await new Promise(r => setTimeout(r, config.jobPollInterval));
    }
  }
}

runNormalizationWorker().catch(error => {
  logger.error('Normalization worker crashed', { error: error instanceof Error ? error.message : 'Unknown' });
  process.exit(1);
});