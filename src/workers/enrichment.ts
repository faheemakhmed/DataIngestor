import 'tsconfig-paths/register';
import { JobType } from '@prisma/client';
import { getPendingJobs, processJob } from '../modules/queue/queue.service';
import { enrichNormalizedRecord } from '../modules/enrichment/enrichment.service';
import { logger } from '../lib/logger';
import config from '../lib/config';

async function runEnrichmentWorker(): Promise<void> {
  logger.info('Starting enrichment worker', { concurrency: config.workerConcurrency });

  while (true) {
    try {
      const jobs = await getPendingJobs(JobType.ENRICH);
      
      if (jobs.length === 0) {
        await new Promise(r => setTimeout(r, config.jobPollInterval));
        continue;
      }

      for (const job of jobs) {
        const payload = job.payload as { normalizedRecordId: string };
        const normalizedRecordId = payload.normalizedRecordId;
        
        await processJob(job, async () => {
          logger.info('Processing enrichment job', { jobId: job.id, normalizedRecordId });
          await enrichNormalizedRecord(normalizedRecordId);
        });
      }
    } catch (error) {
      logger.error('Enrichment worker error', { error: error instanceof Error ? error.message : 'Unknown' });
      await new Promise(r => setTimeout(r, config.jobPollInterval));
    }
  }
}

runEnrichmentWorker().catch(error => {
  logger.error('Enrichment worker crashed', { error: error instanceof Error ? error.message : 'Unknown' });
  process.exit(1);
});