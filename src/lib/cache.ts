import { logger } from './logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600) {
    this.defaultTTL = defaultTTL;
    this.cleanup();
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL) * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
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

export const cache = new InMemoryCache(parseInt(process.env.ENRICHMENT_CACHE_TTL || '3600', 10));

export async function getCachedEnrichment<T>(key: string): Promise<T | null> {
  return cache.get<T>(key);
}

export function setCachedEnrichment<T>(key: string, value: T, ttl?: number): void {
  cache.set(key, value, ttl);
}

export function clearEnrichmentCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}