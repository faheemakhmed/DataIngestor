import prisma from '@/lib/prisma';
import { NormalizedRecord, RecordStatus, Prisma } from '@prisma/client';

export interface NormalizedRecordData {
  rawRecordId: string;
  structuredData: Prisma.InputJsonValue;
  status: RecordStatus;
}

export interface NormalizedRecordRepository {
  create(data: NormalizedRecordData): Promise<NormalizedRecord>;
  findById(id: string): Promise<NormalizedRecord | null>;
  findByRawRecordId(rawRecordId: string): Promise<NormalizedRecord | null>;
  updateStatus(id: string, status: RecordStatus): Promise<NormalizedRecord>;
  findPending(limit: number): Promise<NormalizedRecord[]>;
}

export class PrismaNormalizedRecordRepository implements NormalizedRecordRepository {
  async create(data: NormalizedRecordData): Promise<NormalizedRecord> {
    return prisma.normalizedRecord.create({
      data: {
        rawRecordId: data.rawRecordId,
        structuredData: data.structuredData,
        status: data.status || RecordStatus.PENDING,
      },
    });
  }

  async findById(id: string): Promise<NormalizedRecord | null> {
    return prisma.normalizedRecord.findUnique({ where: { id } });
  }

  async findByRawRecordId(rawRecordId: string): Promise<NormalizedRecord | null> {
    return prisma.normalizedRecord.findUnique({ where: { rawRecordId } });
  }

  async updateStatus(id: string, status: RecordStatus): Promise<NormalizedRecord> {
    return prisma.normalizedRecord.update({
      where: { id },
      data: { status },
    });
  }

  async findPending(limit: number): Promise<NormalizedRecord[]> {
    return prisma.normalizedRecord.findMany({
      where: { status: RecordStatus.PENDING },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const normalizedRecordRepository = new PrismaNormalizedRecordRepository();