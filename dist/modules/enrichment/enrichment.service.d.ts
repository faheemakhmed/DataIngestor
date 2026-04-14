import { EnrichedRecord } from '@prisma/client';
export declare function enrichNormalizedRecord(normalizedRecordId: string): Promise<EnrichedRecord>;
export declare function enrichBatch(normalizedRecordIds: string[]): Promise<{
    success: number;
    failed: number;
}>;
//# sourceMappingURL=enrichment.service.d.ts.map