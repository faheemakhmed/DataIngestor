import prisma from '@/lib/prisma';
import { EnrichedRecord, RecordStatus, Prisma } from '@prisma/client';

export interface EnrichedRecordData {
  normalizedRecordId: string;
  enrichedData: Prisma.InputJsonValue;
  status: RecordStatus;
}

export interface EnrichedRecordRepository {
  create(data: EnrichedRecordData): Promise<EnrichedRecord>;
  findById(id: string): Promise<EnrichedRecord | null>;
  findByNormalizedId(normalizedRecordId: string): Promise<EnrichedRecord | null>;
  updateStatus(id: string, status: RecordStatus): Promise<EnrichedRecord>;
  findPending(limit: number): Promise<EnrichedRecord[]>;
}

export class PrismaEnrichedRecordRepository implements EnrichedRecordRepository {
  async create(data: EnrichedRecordData): Promise<EnrichedRecord> {
    return prisma.enrichedRecord.create({
      data: {
        normalizedRecordId: data.normalizedRecordId,
        enrichedData: data.enrichedData,
        status: data.status || RecordStatus.PENDING,
      },
    });
  }

  async findById(id: string): Promise<EnrichedRecord | null> {
    return prisma.enrichedRecord.findUnique({ where: { id } });
  }

  async findByNormalizedId(normalizedRecordId: string): Promise<EnrichedRecord | null> {
    return prisma.enrichedRecord.findUnique({ where: { normalizedRecordId } });
  }

  async updateStatus(id: string, status: RecordStatus): Promise<EnrichedRecord> {
    return prisma.enrichedRecord.update({
      where: { id },
      data: { status },
    });
  }

  async findPending(limit: number): Promise<EnrichedRecord[]> {
    return prisma.enrichedRecord.findMany({
      where: { status: RecordStatus.PENDING },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const enrichedRecordRepository = new PrismaEnrichedRecordRepository();