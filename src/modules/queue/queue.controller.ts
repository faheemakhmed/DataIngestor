import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getPendingJobs, reprocessJob, reprocessDeadLetter, getJobWithLogs } from './queue.service';
import { JobStatus, JobType } from '@prisma/client';

const reprocessJobSchema = z.object({
  jobId: z.string().uuid(),
});

export class QueueController {
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.query.type as JobType | undefined;
      const status = req.query.status as JobStatus | undefined;
      const limit = parseInt(req.query.limit as string || '100', 10);
      
      const { jobRepository } = await import('./queue.repository');
      const jobs = await jobRepository.findPending(type || JobType.INGEST, limit);
      
      res.json({ jobs, count: jobs.length });
    } catch (error) {
      next(error);
    }
  }

  async getJobLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { job, logs } = await getJobWithLogs(id);
      
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      
      res.json({ job, logs });
    } catch (error) {
      next(error);
    }
  }

  async reprocess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await reprocessJob(jobId);
      res.json({ message: 'Job requeued', job });
    } catch (error) {
      next(error);
    }
  }

  async reprocessDeadLetter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await reprocessDeadLetter(jobId);
      res.json({ message: 'Dead letter job requeued', job });
    } catch (error) {
      next(error);
    }
  }
}

export const queueController = new QueueController();