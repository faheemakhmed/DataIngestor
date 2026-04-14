export interface ExternalSourceConfig {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    pagination?: {
        type: 'cursor' | 'offset' | 'timestamp';
        cursorParam?: string;
        offsetParam?: string;
        timestampParam?: string;
    };
    transform?: (data: unknown) => ExternalRecord[];
}
export interface ExternalRecord {
    id: string;
    data: Record<string, unknown>;
}
export declare function ingestFromSource(sourceId: string): Promise<{
    ingested: number;
    duplicates: number;
}>;
//# sourceMappingURL=ingestion.service.d.ts.map