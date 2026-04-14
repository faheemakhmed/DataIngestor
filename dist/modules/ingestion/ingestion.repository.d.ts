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
export declare class PrismaRawRecordRepository implements RawRecordRepository {
    create(data: RawRecordData): Promise<RawRecord>;
    createMany(data: RawRecordData[]): Promise<number>;
    findByHash(hash: string): Promise<RawRecord | null>;
    findById(id: string): Promise<RawRecord | null>;
    findBySourceId(sourceId: string, limit: number, offset: number): Promise<RawRecord[]>;
    countBySourceId(sourceId: string): Promise<number>;
}
export declare const rawRecordRepository: PrismaRawRecordRepository;
//# sourceMappingURL=ingestion.repository.d.ts.map