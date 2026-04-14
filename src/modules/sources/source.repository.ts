import prisma from '@/lib/prisma';
import { Source, SourceType, SourceCheckpoint, Prisma } from '@prisma/client';

export interface CreateSourceDto {
  name: string;
  type: SourceType;
  config: Prisma.InputJsonValue;
}

export interface UpdateSourceDto {
  name?: string;
  type?: SourceType;
  config?: Prisma.InputJsonValue;
  isActive?: boolean;
}

export interface SourceRepository {
  create(data: CreateSourceDto): Promise<Source>;
  findById(id: string): Promise<Source | null>;
  findAll(): Promise<Source[]>;
  update(id: string, data: UpdateSourceDto): Promise<Source>;
  delete(id: string): Promise<void>;
  getCheckpoint(sourceId: string): Promise<SourceCheckpoint | null>;
  upsertCheckpoint(sourceId: string, cursor: string): Promise<SourceCheckpoint>;
}

export class PrismaSourceRepository implements SourceRepository {
  async create(data: CreateSourceDto): Promise<Source> {
    return prisma.source.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config,
        isActive: true,
      },
    });
  }

  async findById(id: string): Promise<Source | null> {
    return prisma.source.findUnique({ where: { id } });
  }

  async findAll(): Promise<Source[]> {
    return prisma.source.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateSourceDto): Promise<Source> {
    return prisma.source.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.source.delete({ where: { id } });
  }

  async getCheckpoint(sourceId: string): Promise<SourceCheckpoint | null> {
    return prisma.sourceCheckpoint.findUnique({
      where: { sourceId },
    });
  }

  async upsertCheckpoint(sourceId: string, cursor: string): Promise<SourceCheckpoint> {
    return prisma.sourceCheckpoint.upsert({
      where: { sourceId },
      update: {
        cursor,
        lastFetchedAt: new Date(),
      },
      create: {
        sourceId,
        cursor,
        lastFetchedAt: new Date(),
      },
    });
  }
}

export const sourceRepository = new PrismaSourceRepository();