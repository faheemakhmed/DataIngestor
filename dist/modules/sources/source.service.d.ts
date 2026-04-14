import { Source } from '@prisma/client';
import { CreateSourceDto, UpdateSourceDto } from './source.repository';
export declare class SourceService {
    createSource(data: CreateSourceDto): Promise<Source>;
    getSource(id: string): Promise<Source | null>;
    getAllSources(): Promise<Source[]>;
    updateSource(id: string, data: UpdateSourceDto): Promise<Source>;
    deleteSource(id: string): Promise<void>;
    getSourceCheckpoint(sourceId: string): Promise<{
        cursor: string | null;
        lastFetchedAt: Date | null;
    }>;
    updateSourceCheckpoint(sourceId: string, cursor: string): Promise<void>;
    activateSource(id: string): Promise<Source>;
    deactivateSource(id: string): Promise<Source>;
}
export declare const sourceService: SourceService;
//# sourceMappingURL=source.service.d.ts.map