import { Request, Response, NextFunction } from 'express';
import prisma from '@/lib/prisma';
import { RecordStatus } from '@prisma/client';

export class RecordsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;
      const status = req.query.status as RecordStatus | undefined;
      const sourceId = req.query.sourceId as string | undefined;

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (sourceId) where.sourceId = sourceId;

      const [rawRecords, total] = await Promise.all([
        prisma.rawRecord.findMany({
          where,
          include: {
            normalized: {
              include: { enriched: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.rawRecord.count({ where }),
      ]);

      res.json({
        data: rawRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const record = await prisma.rawRecord.findUnique({
        where: { id },
        include: {
          normalized: {
            include: { enriched: true },
          },
        },
      });

      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async getEnriched(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      const [enrichedRecords, total] = await Promise.all([
        prisma.enrichedRecord.findMany({
          where: { status: RecordStatus.COMPLETED },
          include: {
            normalized: {
              include: {
                rawRecord: {
                  include: { source: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.enrichedRecord.count({ where: { status: RecordStatus.COMPLETED } }),
      ]);

      res.json({
        data: enrichedRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recordsController = new RecordsController();