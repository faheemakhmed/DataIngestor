"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'default-secret',
    workerConcurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
    jobPollInterval: parseInt(process.env.JOB_POLL_INTERVAL || '5000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    retryBackoffMs: parseInt(process.env.RETRY_BACKOFF_MS || '1000', 10),
    enrichmentApiUrl: process.env.ENRICHMENT_API_URL || 'https://api.example.com/enrich',
    enrichmentCacheTtl: parseInt(process.env.ENRICHMENT_CACHE_TTL || '3600', 10),
};
exports.default = exports.config;
//# sourceMappingURL=config.js.map