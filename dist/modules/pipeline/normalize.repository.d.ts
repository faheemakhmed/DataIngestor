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
export declare class PrismaNormalizedRecordRepository implements NormalizedRecordRepository {
    create(data: NormalizedRecordData): Promise<NormalizedRecord>;
    findById(id: string): Promise<NormalizedRecord | null>;
    findByRawRecordId(rawRecordId: string): Promise<NormalizedRecord | null>;
    updateStatus(id: string, status: RecordStatus): Promise<NormalizedRecord>;
    findPending(limit: number): Promise<NormalizedRecord[]>;
}
export declare const normalizedRecordRepository: PrismaNormalizedRecordRepository;
//# sourceMappingURL=normalize.repository.d.ts.map