import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sourceService } from './source.service';
import { logger, createCorrelationId } from '@/lib/logger';
import { Prisma } from '@prisma/client';

const createSourceSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['API', 'RSS', 'CSV', 'JSON']),
  config: z.record(z.unknown()),
}).transform(data => ({
  ...data,
  config: data.config as Prisma.InputJsonValue,
}));

const updateSourceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['API', 'RSS', 'CSV', 'JSON']).optional(),
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
}).transform(data => ({
  ...data,
  config: data.config as Prisma.InputJsonValue | undefined,
}));

export class SourceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const correlationId = createCorrelationId();
      const data = createSourceSchema.parse(req.body);
      const source = await sourceService.createSource(data);
      logger.info('Source created successfully', { correlationId, sourceId: source.id });
      res.status(201).json(source);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sources = await sourceService.getAllSources();
      res.json(sources);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const source = await sourceService.getSource(id);
      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }
      res.json(source);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = updateSourceSchema.parse(req.body);
      const source = await sourceService.updateSource(id, data);
      res.json(source);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await sourceService.deleteSource(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async sync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const source = await sourceService.getSource(id);
      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }
      const { createIngestionJob } = await import('@/modules/queue/queue.service');
      const job = await createIngestionJob(id);
      logger.info('Ingestion job created', { sourceId: id, jobId: job.id });
      res.status(202).json({ message: 'Sync initiated', jobId: job.id });
    } catch (error) {
      next(error);
    }
  }

  async getCheckpoint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const checkpoint = await sourceService.getSourceCheckpoint(id);
      res.json(checkpoint);
    } catch (error) {
      next(error);
    }
  }
}

export const sourceController = new SourceController();