import { JobType, JobStatus, PipelineJob, LogLevel } from '@prisma/client';
import { jobRepository, CreateJobDto } from './queue.repository';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import config from '@/lib/config';

export async function createIngestionJob(sourceId: string, correlationId?: string): Promise<PipelineJob> {
  const dto: CreateJobDto = {
    type: JobType.INGEST,
    payload: { sourceId },
    correlationId,
  };
  return jobRepository.create(dto);
}

export async function createNormalizeJob(rawRecordId: string, correlationId?: string): Promise<PipelineJob> {
  const dto: CreateJobDto = {
    type: JobType.NORMALIZE,
    payload: { rawRecordId },
    correlationId,
  };
  return jobRepository.create(dto);
}

export async function createEnrichJob(normalizedRecordId: string, correlationId?: string): Promise<PipelineJob> {
  const dto: CreateJobDto = {
    type: JobType.ENRICH,
    payload: { normalizedRecordId },
    correlationId,
  };
  return jobRepository.create(dto);
}

export async function addJobLog(jobId: string, message: string, level: LogLevel = LogLevel.INFO): Promise<void> {
  await prisma.pipelineLog.create({
    data: {
      jobId,
      message,
      level,
    },
  });
}

export async function processJob(job: PipelineJob, handler: (payload: Record<string, unknown>) => Promise<void>): Promise<void> {
  const correlationId = job.correlationId;
  
  try {
    logger.info(`Processing job ${job.id}`, { type: job.type, correlationId });
    await jobRepository.updateStatus(job.id, JobStatus.PROCESSING);
    await addJobLog(job.id, `Starting ${job.type} job`, LogLevel.INFO);
    
    await handler(job.payload as Record<string, unknown>);
    
    await jobRepository.updateStatus(job.id, JobStatus.COMPLETED);
    await addJobLog(job.id, `Job completed successfully`, LogLevel.INFO);
    logger.info(`Job completed ${job.id}`, { type: job.type, correlationId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Job failed ${job.id}`, { type: job.type, correlationId, error: errorMessage });
    await addJobLog(job.id, `Job failed: ${errorMessage}`, LogLevel.ERROR);
    
    const jobData = await jobRepository.findById(job.id);
    if (!jobData) return;
    
    if (jobData.retries >= jobData.maxRetries) {
      await jobRepository.markDeadLetter(job.id, errorMessage);
      await addJobLog(job.id, `Job moved to dead letter after ${jobData.retries} retries`, LogLevel.ERROR);
    } else {
      await jobRepository.incrementRetry(job.id);
      await addJobLog(job.id, `Retrying job (attempt ${jobData.retries + 1}/${jobData.maxRetries})`, LogLevel.WARN);
    }
    
    throw error;
  }
}

export async function getJobWithLogs(jobId: string): Promise<{ job: PipelineJob | null; logs: Array<{ message: string; level: string; timestamp: Date }> }> {
  const job = await jobRepository.findById(jobId);
  if (!job) return { job: null, logs: [] };
  
  const logs = await prisma.pipelineLog.findMany({
    where: { jobId },
    orderBy: { timestamp: 'asc' },
    select: { message: true, level: true, timestamp: true },
  });
  
  return { job, logs };
}

export async function getPendingJobs(type: JobType): Promise<PipelineJob[]> {
  return jobRepository.findPending(type, config.workerConcurrency);
}

export async function reprocessJob(jobId: string): Promise<PipelineJob> {
  const job = await jobRepository.findById(jobId);
  if (!job) throw new Error('Job not found');
  
  return jobRepository.updateStatus(jobId, JobStatus.PENDING);
}

export async function reprocessDeadLetter(jobId: string): Promise<PipelineJob> {
  const job = await jobRepository.findById(jobId);
  if (!job) throw new Error('Job not found');
  if (job.status !== JobStatus.DEAD_LETTER) {
    throw new Error('Job is not in dead letter state');
  }
  
  return prisma.pipelineJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.PENDING,
      retries: 0,
      error: null,
      scheduledAt: new Date(),
    },
  });
}