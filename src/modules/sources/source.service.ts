import { Source, SourceType } from '@prisma/client';
import { sourceRepository, CreateSourceDto, UpdateSourceDto } from './source.repository';
import { logger } from '@/lib/logger';

export class SourceService {
  async createSource(data: CreateSourceDto): Promise<Source> {
    logger.info('Creating new source', { name: data.name, type: data.type });
    return sourceRepository.create(data);
  }

  async getSource(id: string): Promise<Source | null> {
    return sourceRepository.findById(id);
  }

  async getAllSources(): Promise<Source[]> {
    return sourceRepository.findAll();
  }

  async updateSource(id: string, data: UpdateSourceDto): Promise<Source> {
    const existing = await sourceRepository.findById(id);
    if (!existing) {
      throw new Error(`Source not found: ${id}`);
    }
    logger.info('Updating source', { id, updates: data });
    return sourceRepository.update(id, data);
  }

  async deleteSource(id: string): Promise<void> {
    const existing = await sourceRepository.findById(id);
    if (!existing) {
      throw new Error(`Source not found: ${id}`);
    }
    logger.info('Deleting source', { id });
    await sourceRepository.delete(id);
  }

  async getSourceCheckpoint(sourceId: string): Promise<{ cursor: string | null; lastFetchedAt: Date | null }> {
    const checkpoint = await sourceRepository.getCheckpoint(sourceId);
    return {
      cursor: checkpoint?.cursor || null,
      lastFetchedAt: checkpoint?.lastFetchedAt || null,
    };
  }

  async updateSourceCheckpoint(sourceId: string, cursor: string): Promise<void> {
    await sourceRepository.upsertCheckpoint(sourceId, cursor);
    logger.info('Updated source checkpoint', { sourceId, cursor });
  }

  async activateSource(id: string): Promise<Source> {
    return sourceRepository.update(id, { isActive: true });
  }

  async deactivateSource(id: string): Promise<Source> {
    return sourceRepository.update(id, { isActive: false });
  }
}

export const sourceService = new SourceService();