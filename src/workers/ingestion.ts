import { JobType } from '@prisma/client';
import { getPendingJobs, processJob } from '../modules/queue/queue.service';
import { ingestFromSource } from '../modules/ingestion/ingestion.service';
import { logger } from '../lib/logger';
import config from '../lib/config';

async function runIngestionWorker(): Promise<void> {
  logger.info('Starting ingestion worker', { concurrency: config.workerConcurrency });

  while (true) {
    try {
      const jobs = await getPendingJobs(JobType.INGEST);
      
      if (jobs.length === 0) {
        await new Promise(r => setTimeout(r, config.jobPollInterval));
        continue;
      }

      for (const job of jobs) {
        const payload = job.payload as { sourceId: string };
        const sourceId = payload.sourceId;
        
        await processJob(job, async () => {
          logger.info('Processing ingestion job', { jobId: job.id, sourceId });
          await ingestFromSource(sourceId);
        });
      }
    } catch (error) {
      logger.error('Ingestion worker error', { error: error instanceof Error ? error.message : 'Unknown' });
      await new Promise(r => setTimeout(r, config.jobPollInterval));
    }
  }
}

runIngestionWorker().catch(error => {
  logger.error('Ingestion worker crashed', { error: error instanceof Error ? error.message : 'Unknown' });
  process.exit(1);
});