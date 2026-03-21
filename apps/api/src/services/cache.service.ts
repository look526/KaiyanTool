import logger from '../lib/logger';

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: string;
  access_count: number;
  last_accessed: string;
  ttl_ms?: number;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  total_requests: number;
  hit_rate: number;
  size: number;
  max_size: number;
  evicted_count: number;
  average_entry_age_ms: number;
}

export interface CacheOptions {
  ttl_ms?: number;
  max_size?: number;
  tags?: string[];
  persistent?: boolean;
}

export class CacheService<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private max_size: number;
  private default_ttl: number;
  private persistent: boolean;
  private persistent_cache_path: string;

  constructor(options: {
    max_size?: number;
    default_ttl_ms?: number;
    persistent?: boolean;
    cache_path?: string;
  } = {}) {
    this.max_size = options.max_size || 1000;
    this.default_ttl = options.default_ttl_ms || 30 * 60 * 1000;
    this.persistent = options.persistent || false;
    this.persistent_cache_path = options.cache_path || '.cache/persistent-cache.json';

    if (this.persistent) {
      this.loadPersistentCache();
    }

    logger.info('Cache service initialized', {
      max_size: this.max_size,
      default_ttl: this.default_ttl,
      persistent: this.persistent,
    });
  }

  get(key: string): T | null {
    try {
      const entry = this.cache.get(key);

      if (!entry) {
        logger.debug('Cache miss', { key });
        return null;
      }

      if (this.isExpired(entry)) {
        logger.debug('Cache entry expired', { key });
        this.cache.delete(key);
        return null;
      }

      entry.access_count++;
      entry.last_accessed = new Date().toISOString();

      logger.debug('Cache hit', {
        key,
        access_count: entry.access_count,
      });

      return entry.value;
    } catch (error) {
      logger.error('Cache get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  set(key: string, value: T, options: CacheOptions = {}): boolean {
    try {
      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: new Date().toISOString(),
        access_count: 0,
        last_accessed: new Date().toISOString(),
        ttl_ms: options.ttl_ms || this.default_ttl,
        tags: options.tags,
      };

      if (this.cache.size >= this.max_size && !this.cache.has(key)) {
        this.evict();
      }

      this.cache.set(key, entry);

      if (this.persistent) {
        this.savePersistentCache();
      }

      logger.debug('Cache set', {
        key,
        ttl_ms: entry.ttl_ms,
        tags: options.tags,
      });

      return true;
    } catch (error) {
      logger.error('Cache set error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (deleted) {
      logger.debug('Cache entry deleted', { key });

      if (this.persistent) {
        this.savePersistentCache();
      }
    }

    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();

    logger.info('Cache cleared', { entries_deleted: size });

    if (this.persistent) {
      this.savePersistentCache();
    }
  }

  getMultiple(keys: string[]): Map<string, T> {
    const results = new Map<string, T>();

    for (const key of keys) {
      const value = this.get(key);
      if (value !== null) {
        results.set(key, value);
      }
    }

    return results;
  }

  setMultiple(entries: Map<string, T>, options: CacheOptions = {}): number {
    let count = 0;

    for (const [key, value] of entries.entries()) {
      if (this.set(key, value, options)) {
        count++;
      }
    }

    return count;
  }

  getByTag(tag: string): Map<string, T> {
    const results = new Map<string, T>();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag) && !this.isExpired(entry)) {
        results.set(key, entry.value);
        entry.access_count++;
        entry.last_accessed = new Date().toISOString();
      }
    }

    return results;
  }

  invalidateTag(tag: string): number {
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }

    logger.info('Cache entries invalidated by tag', {
      tag,
      count,
    });

    if (this.persistent) {
      this.savePersistentCache();
    }

    return count;
  }

  getStats(): CacheStats {
    const stats = this.collectStats();

    logger.debug('Cache stats', stats);

    return stats;
  }

  clean(): void {
    const beforeSize = this.cache.size;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    const afterSize = this.cache.size;
    const cleaned = beforeSize - afterSize;

    if (cleaned > 0) {
      logger.info('Cache cleaned', {
        entries_before: beforeSize,
        entries_after: afterSize,
        entries_cleaned: cleaned,
      });

      if (this.persistent) {
        this.savePersistentCache();
      }
    }
  }

  warmup(keys: string[], fetchFn: (key: string) => Promise<T>): Promise<void> {
    logger.info('Cache warmup started', { keys_count: keys.length });

    const promises = keys.map(async key => {
      if (!this.has(key)) {
        try {
          const value = await fetchFn(key);
          this.set(key, value, { tags: ['warmup'] });
        } catch (error) {
          logger.warn('Cache warmup failed', {
            key,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });

    return Promise.all(promises).then(() => {
      logger.info('Cache warmup completed', {
        total_keys: keys.length,
        cached_keys: keys.filter(k => this.has(k)).length,
      });
    });
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.ttl_ms) {
      return false;
    }

    const now = Date.now();
    const entryTime = new Date(entry.timestamp).getTime();
    const age = now - entryTime;

    return age > entry.ttl_ms;
  }

  private evict(): void {
    const entries = Array.from(this.cache.entries());
    
    entries.sort((a, b) => {
      const aScore = this.calculateEvictionScore(a[1]);
      const bScore = this.calculateEvictionScore(b[1]);
      return bScore - aScore;
    });

    const [keyToEvict] = entries[0];
    
    if (keyToEvict) {
      this.cache.delete(keyToEvict[0]);
      
      logger.debug('Cache entry evicted', {
        key: keyToEvict[0],
        access_count: keyToEvict[1].access_count,
        age: Date.now() - new Date(keyToEvict[1].timestamp).getTime(),
      });
    }
  }

  private calculateEvictionScore(entry: CacheEntry<T>): number {
    const age = Date.now() - new Date(entry.timestamp).getTime();
    const timeSinceAccess = Date.now() - new Date(entry.last_accessed).getTime();
    
    const accessScore = 1 / (entry.access_count + 1);
    const ageScore = age / (1000 * 60 * 60);
    const recentAccessScore = timeSinceAccess / (1000 * 60 * 60);

    return (accessScore * 0.4) + (ageScore * 0.3) + (recentAccessScore * 0.3);
  }

  private collectStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    
    const hits = entries.reduce((sum, e) => sum + (e.access_count - 1), 0);
    const misses = this.max_size;
    const totalRequests = hits + misses;
    const hitRate = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;

    const now = Date.now();
    const totalAge = entries.reduce((sum, e) => 
      sum + (now - new Date(e.timestamp).getTime()), 0
    );
    const averageAge = entries.length > 0 ? totalAge / entries.length : 0;

    return {
      hits,
      misses,
      total_requests: totalRequests,
      hit_rate: hitRate,
      size: this.cache.size,
      max_size: this.max_size,
      evicted_count: 0,
      average_entry_age_ms: averageAge,
    };
  }

  private async loadPersistentCache(): Promise<void> {
    try {
      const { promises: fs } = await import('fs');
      const { existsSync, readFileSync } = fs;

      if (!existsSync(this.persistent_cache_path)) {
        return;
      }

      const data = readFileSync(this.persistent_cache_path, 'utf-8');
      const entries = JSON.parse(data);

      for (const [key, entry] of Object.entries(entries)) {
        if (!this.isExpired(entry as CacheEntry<T>)) {
          this.cache.set(key, entry as CacheEntry<T>);
        }
      }

      logger.info('Persistent cache loaded', {
        entries_loaded: this.cache.size,
      });
    } catch (error) {
      logger.warn('Failed to load persistent cache', {
        path: this.persistent_cache_path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async savePersistentCache(): Promise<void> {
    try {
      const { promises: fs } = await import('fs');
      const { mkdirSync, writeFileSync } = fs;

      const dir = this.persistent_cache_path.split('/').slice(0, -1).join('/');

      mkdirSync(dir, { recursive: true });

      const entries: Record<string, CacheEntry<T>> = {};
      for (const [key, entry] of this.cache.entries()) {
        entries[key] = entry;
      }

      writeFileSync(this.persistent_cache_path, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Failed to save persistent cache', {
        path: this.persistent_cache_path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export class MultiLevelCacheService {
  private l1_cache: CacheService;
  private l2_cache: CacheService;
  private l3_cache: CacheService;

  constructor() {
    this.l1_cache = new CacheService({
      max_size: 100,
      default_ttl_ms: 5 * 60 * 1000,
      persistent: false,
    });

    this.l2_cache = new CacheService({
      max_size: 500,
      default_ttl_ms: 30 * 60 * 1000,
      persistent: false,
    });

    this.l3_cache = new CacheService({
      max_size: 2000,
      default_ttl_ms: 2 * 60 * 60 * 1000,
      persistent: true,
      cache_path: '.cache/l3-cache.json',
    });

    logger.info('Multi-level cache service initialized');
  }

  async get(key: string, fetchFn?: () => Promise<any>): Promise<any> {
    let value = this.l1_cache.get(key);
    
    if (value !== null) {
      performanceMetricsService.recordMetric('cache.l1_hit', 1, { key });
      return value;
    }

    value = this.l2_cache.get(key);
    
    if (value !== null) {
      performanceMetricsService.recordMetric('cache.l2_hit', 1, { key });
      this.l1_cache.set(key, value);
      return value;
    }

    value = this.l3_cache.get(key);
    
    if (value !== null) {
      performanceMetricsService.recordMetric('cache.l3_hit', 1, { key });
      this.l2_cache.set(key, value);
      this.l1_cache.set(key, value);
      return value;
    }

    performanceMetricsService.recordMetric('cache.miss', 1, { key });

    if (fetchFn) {
      const fetchedValue = await fetchFn();
      this.l1_cache.set(key, fetchedValue);
      this.l2_cache.set(key, fetchedValue);
      this.l3_cache.set(key, fetchedValue);
      return fetchedValue;
    }

    return null;
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    await Promise.all([
      this.l1_cache.set(key, value, options),
      this.l2_cache.set(key, value, options),
      this.l3_cache.set(key, value, options),
    ]);
  }

  async invalidate(key: string): Promise<void> {
    this.l1_cache.delete(key);
    this.l2_cache.delete(key);
    this.l3_cache.delete(key);
  }

  getStats(): {
    l1: CacheStats;
    l2: CacheStats;
    l3: CacheStats;
    overall: CacheStats;
  } {
    const l1Stats = this.l1_cache.getStats();
    const l2Stats = this.l2_cache.getStats();
    const l3Stats = this.l3_cache.getStats();

    const overallStats: CacheStats = {
      hits: l1Stats.hits + l2Stats.hits + l3Stats.hits,
      misses: l1Stats.misses + l2Stats.misses + l3Stats.misses,
      total_requests: l1Stats.total_requests + l2Stats.total_requests + l3Stats.total_requests,
      hit_rate: (l1Stats.hit_rate + l2Stats.hit_rate + l3Stats.hit_rate) / 3,
      size: l1Stats.size + l2Stats.size + l3Stats.size,
      max_size: l1Stats.max_size + l2Stats.max_size + l3Stats.max_size,
      evicted_count: l1Stats.evicted_count + l2Stats.evicted_count + l3Stats.evicted_count,
      average_entry_age_ms: 
        (l1Stats.average_entry_age_ms + l2Stats.average_entry_age_ms + l3Stats.average_entry_age_ms) / 3,
    };

    return {
      l1: l1Stats,
      l2: l2Stats,
      l3: l3Stats,
      overall: overallStats,
    };
  }

  async clear(): Promise<void> {
    this.l1_cache.clear();
    this.l2_cache.clear();
    this.l3_cache.clear();
  }
}

const performanceMetricsService = {
  recordMetric: (name: string, value: number, tags?: Record<string, string>, unit?: string) => {
  },
};

export const cacheService = new CacheService();
export const multiLevelCacheService = new MultiLevelCacheService();
