import type { CacheEntry } from '../types/common';

export interface CacheOptions {
  ttl?: number;
  enabled?: boolean;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000,
    maxSize: 100,
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  private generateKey(endpoint: string, params?: Record<string, unknown>): string {
    const baseKey = `${endpoint}:${JSON.stringify(params || {})}`;
    let hash = 0;
    for (let i = 0; i < baseKey.length; i++) {
      const char = baseKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `cache:${Math.abs(hash).toString(36)}`;
  }

  set<T>(endpoint: string, data: T, options: CacheOptions = {}): void {
    const { ttl = this.config.defaultTTL, enabled = true } = options;
    
    if (!enabled) return;

    const key = this.generateKey(endpoint);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, entry as CacheEntry<unknown>);
  }

  get<T>(endpoint: string, params?: Record<string, unknown>): T | undefined {
    const key = this.generateKey(endpoint);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return undefined;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  has(endpoint: string, params?: Record<string, unknown>): boolean {
    const key = this.generateKey(endpoint);
    const entry = this.cache.get(key);

    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  invalidate(endpoint?: string): void {
    if (!endpoint) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(endpoint)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0,
    };
  }

  setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const requestCache = new RequestCache();

export function withCache<T>(
  endpoint: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl, enabled = true } = options;

  if (enabled) {
    const cached = requestCache.get<T>(endpoint);
    if (cached !== undefined) {
      return Promise.resolve(cached);
    }
  }

  return fetcher().then(data => {
    if (enabled) {
      requestCache.set(endpoint, data, { ttl, enabled });
    }
    return data;
  });
}
