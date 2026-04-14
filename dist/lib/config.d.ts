export interface AppConfig {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    workerConcurrency: number;
    jobPollInterval: number;
    maxRetries: number;
    retryBackoffMs: number;
    enrichmentApiUrl: string;
    enrichmentCacheTtl: number;
}
export declare const config: AppConfig;
export default config;
//# sourceMappingURL=config.d.ts.map