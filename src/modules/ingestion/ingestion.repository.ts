import prisma from '@/lib/prisma';
import { RawRecord, Prisma } from '@prisma/client';

export interface RawRecordData {
  sourceId: string;
  externalId: string;
  payload: Prisma.InputJsonValue;
  hash: string;
}

export interface RawRecordRepository {
  create(data: RawRecordData): Promise<RawRecord>;
  createMany(data: RawRecordData[]): Promise<number>;
  findByHash(hash: string): Promise<RawRecord | null>;
  findById(id: string): Promise<RawRecord | null>;
  findBySourceId(sourceId: string, limit: number, offset: number): Promise<RawRecord[]>;
  countBySourceId(sourceId: string): Promise<number>;
}

export class PrismaRawRecordRepository implements RawRecordRepository {
  async create(data: RawRecordData): Promise<RawRecord> {
    return prisma.rawRecord.create({
      data: {
        sourceId: data.sourceId,
        externalId: data.externalId,
        payload: data.payload,
        hash: data.hash,
      },
    });
  }

  async createMany(data: RawRecordData[]): Promise<number> {
    if (data.length === 0) return 0;
    
    const result = await prisma.rawRecord.createMany({
      data: data.map(d => ({
        sourceId: d.sourceId,
        externalId: d.externalId,
        payload: d.payload,
        hash: d.hash,
      })),
      skipDuplicates: true,
    });
    return result.count;
  }

  async findByHash(hash: string): Promise<RawRecord | null> {
    return prisma.rawRecord.findFirst({
      where: { hash },
    });
  }

  async findById(id: string): Promise<RawRecord | null> {
    return prisma.rawRecord.findUnique({ where: { id } });
  }

  async findBySourceId(sourceId: string, limit: number, offset: number): Promise<RawRecord[]> {
    return prisma.rawRecord.findMany({
      where: { sourceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async countBySourceId(sourceId: string): Promise<number> {
    return prisma.rawRecord.count({ where: { sourceId } });
  }
}

export const rawRecordRepository = new PrismaRawRecordRepository();