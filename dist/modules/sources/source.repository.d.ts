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
export declare class PrismaSourceRepository implements SourceRepository {
    create(data: CreateSourceDto): Promise<Source>;
    findById(id: string): Promise<Source | null>;
    findAll(): Promise<Source[]>;
    update(id: string, data: UpdateSourceDto): Promise<Source>;
    delete(id: string): Promise<void>;
    getCheckpoint(sourceId: string): Promise<SourceCheckpoint | null>;
    upsertCheckpoint(sourceId: string, cursor: string): Promise<SourceCheckpoint>;
}
export declare const sourceRepository: PrismaSourceRepository;
//# sourceMappingURL=source.repository.d.ts.map