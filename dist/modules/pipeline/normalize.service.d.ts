import { NormalizedRecord } from '@prisma/client';
export declare function normalizeRawRecord(rawRecordId: string): Promise<NormalizedRecord>;
export declare function normalizeBatch(rawRecordIds: string[]): Promise<{
    success: number;
    failed: number;
}>;
//# sourceMappingURL=normalize.service.d.ts.map