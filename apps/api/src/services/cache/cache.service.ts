import { createClient } from 'redis'
import logger from '../lib/logger'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
}

export class CacheService {
  private client: ReturnType<typeof createClient>
  private stats: Map<string, CacheStats> = new Map()

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: 'reconnect',
      },
    })

    this.client.on('error', (err) => {
      logger.error('Redis连接错误', { error: err })
    })

    this.client.on('connect', () => {
      logger.info('Redis连接成功')
    })
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect()
    } catch (error) {
      logger.error('Redis连接失败', { error })
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit()
      logger.info('Redis已断开连接')
    } catch (error) {
      logger.error('Redis断开连接失败', { error })
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key)
      if (!data) {
        this.updateStats(key, 'miss')
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(data)

      if (Date.now() > entry.timestamp + entry.ttl) {
        await this.client.del(key)
        this.updateStats(key, 'miss')
        return null
      }

      this.updateStats(key, 'hit')
      return entry.data
    } catch (error) {
      logger.error('缓存读取失败', { key, error })
      return null
    }
  }

  async set<T>(
    key: string,
    data: T,
    ttl: number = 3600000
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }

      await this.client.setEx(key, ttl, JSON.stringify(entry))
      this.updateStats(key, 'set')
    } catch (error) {
      logger.error('缓存写入失败', { key, error })
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      logger.error('缓存删除失败', { key, error })
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
        logger.info('批量删除缓存', { count: keys.length, pattern })
      }
    } catch (error) {
      logger.error('批量删除缓存失败', { pattern, error })
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return await this.client.exists(key) === 1
    } catch (error) {
      logger.error('缓存检查失败', { key, error })
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushDb()
      this.stats.clear()
      logger.info('缓存已清空')
    } catch (error) {
      logger.error('缓存清空失败', { error })
    }
  }

  getStats(namespace: string): CacheStats {
    return this.stats.get(namespace) || { hits: 0, misses: 0, size: 0 }
  }

  private updateStats(namespace: string, type: 'hit' | 'miss' | 'set'): void {
    let stats = this.stats.get(namespace)
    if (!stats) {
      stats = { hits: 0, misses: 0, size: 0 }
      this.stats.set(namespace, stats)
    }

    switch (type) {
      case 'hit':
        stats.hits++
        break
      case 'miss':
        stats.misses++
        break
      case 'set':
        stats.size++
        break
    }
  }
}

export const cacheService = new CacheService()
