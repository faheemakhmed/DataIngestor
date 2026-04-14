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
export declare class PrismaEnrichedRecordRepository implements EnrichedRecordRepository {
    create(data: EnrichedRecordData): Promise<EnrichedRecord>;
    findById(id: string): Promise<EnrichedRecord | null>;
    findByNormalizedId(normalizedRecordId: string): Promise<EnrichedRecord | null>;
    updateStatus(id: string, status: RecordStatus): Promise<EnrichedRecord>;
    findPending(limit: number): Promise<EnrichedRecord[]>;
}
export declare const enrichedRecordRepository: PrismaEnrichedRecordRepository;
//# sourceMappingURL=enrichment.repository.d.ts.map