import prisma from '@/lib/prisma';
import { JobType, JobStatus, PipelineJob, Prisma } from '@prisma/client';
import { logger, createCorrelationId } from '@/lib/logger';
import config from '@/lib/config';

export interface CreateJobDto {
  type: JobType;
  payload: Prisma.InputJsonValue;
  scheduledAt?: Date;
  correlationId?: string;
}

export interface JobRepository {
  create(data: CreateJobDto): Promise<PipelineJob>;
  findById(id: string): Promise<PipelineJob | null>;
  findPending(type: JobType, limit: number): Promise<PipelineJob[]>;
  updateStatus(id: string, status: JobStatus, error?: string): Promise<PipelineJob>;
  incrementRetry(id: string): Promise<PipelineJob>;
  markDeadLetter(id: string, error: string): Promise<PipelineJob>;
}

export class PrismaJobRepository implements JobRepository {
  async create(data: CreateJobDto): Promise<PipelineJob> {
    return prisma.pipelineJob.create({
      data: {
        type: data.type,
        status: JobStatus.PENDING,
        payload: data.payload,
        scheduledAt: data.scheduledAt || new Date(),
        correlationId: data.correlationId || createCorrelationId(),
        maxRetries: config.maxRetries,
      },
    });
  }

  async findById(id: string): Promise<PipelineJob | null> {
    return prisma.pipelineJob.findUnique({ where: { id } });
  }

  async findPending(type: JobType, limit: number): Promise<PipelineJob[]> {
    const now = new Date();
    return prisma.pipelineJob.findMany({
      where: {
        type,
        status: JobStatus.PENDING,
        scheduledAt: { lte: now },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }

  async updateStatus(id: string, status: JobStatus, error?: string): Promise<PipelineJob> {
    return prisma.pipelineJob.update({
      where: { id },
      data: {
        status,
        error,
        ...(status === JobStatus.PROCESSING ? { startedAt: new Date() } : {}),
        ...(status === JobStatus.COMPLETED || status === JobStatus.FAILED ? { completedAt: new Date() } : {}),
      },
    });
  }

  async incrementRetry(id: string): Promise<PipelineJob> {
    const job = await prisma.pipelineJob.findUnique({ where: { id } });
    if (!job) throw new Error('Job not found');
    
    return prisma.pipelineJob.update({
      where: { id },
      data: {
        retries: { increment: 1 },
        status: JobStatus.PENDING,
        scheduledAt: new Date(Date.now() + config.retryBackoffMs * Math.pow(2, job.retries)),
      },
    });
  }

  async markDeadLetter(id: string, error: string): Promise<PipelineJob> {
    return prisma.pipelineJob.update({
      where: { id },
      data: {
        status: JobStatus.DEAD_LETTER,
        error,
        completedAt: new Date(),
      },
    });
  }
}

export const jobRepository = new PrismaJobRepository();