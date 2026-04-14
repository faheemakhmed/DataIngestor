declare class InMemoryCache {
    private cache;
    private defaultTTL;
    constructor(defaultTTL?: number);
    set<T>(key: string, value: T, ttl?: number): void;
    get<T>(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): void;
    clear(): void;
    private cleanup;
}
export declare const cache: InMemoryCache;
export declare function getCachedEnrichment<T>(key: string): Promise<T | null>;
export declare function setCachedEnrichment<T>(key: string, value: T, ttl?: number): void;
export declare function clearEnrichmentCache(key?: string): void;
export {};
//# sourceMappingURL=cache.d.ts.map