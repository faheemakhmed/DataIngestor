"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
exports.getCachedEnrichment = getCachedEnrichment;
exports.setCachedEnrichment = setCachedEnrichment;
exports.clearEnrichmentCache = clearEnrichmentCache;
class InMemoryCache {
    cache = new Map();
    defaultTTL;
    constructor(defaultTTL = 3600) {
        this.defaultTTL = defaultTTL;
        this.cleanup();
    }
    set(key, value, ttl) {
        const expiresAt = Date.now() + (ttl || this.defaultTTL) * 1000;
        this.cache.set(key, { value, expiresAt });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    has(key) {
        return this.get(key) !== null;
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    cleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.cache.entries()) {
                if (now > entry.expiresAt) {
                    this.cache.delete(key);
                }
            }
        }, 60000);
    }
}
exports.cache = new InMemoryCache(parseInt(process.env.ENRICHMENT_CACHE_TTL || '3600', 10));
async function getCachedEnrichment(key) {
    return exports.cache.get(key);
}
function setCachedEnrichment(key, value, ttl) {
    exports.cache.set(key, value, ttl);
}
function clearEnrichmentCache(key) {
    if (key) {
        exports.cache.delete(key);
    }
    else {
        exports.cache.clear();
    }
}
//# sourceMappingURL=cache.js.map