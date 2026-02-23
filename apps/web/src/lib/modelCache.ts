const CACHE_PREFIX = 'model_cache_'
const CACHE_EXPIRY = 5 * 60 * 1000
const MODELS_CACHE_KEY = `${CACHE_PREFIX}models`
const PREFERENCES_CACHE_KEY = `${CACHE_PREFIX}preferences`

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export class ModelCache {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      const now = Date.now()

      if (now - entry.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.error('Failed to get from cache:', error)
      return null
    }
  }

  static set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      console.error('Failed to set cache:', error)
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from cache:', error)
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  static isExpired(key: string): boolean {
    try {
      const item = localStorage.getItem(key)
      if (!item) return true

      const entry: CacheEntry<any> = JSON.parse(item)
      const now = Date.now()

      return now - entry.timestamp > CACHE_EXPIRY
    } catch (error) {
      console.error('Failed to check cache expiry:', error)
      return true
    }
  }

  static getAge(key: string): number {
    try {
      const item = localStorage.getItem(key)
      if (!item) return Infinity

      const entry: CacheEntry<any> = JSON.parse(item)
      const now = Date.now()

      return now - entry.timestamp
    } catch (error) {
      console.error('Failed to get cache age:', error)
      return Infinity
    }
  }

  static getTTL(key: string): number {
    const age = this.getAge(key)
    if (age === Infinity) return 0
    return Math.max(0, CACHE_EXPIRY - age)
  }

  static shouldRefresh(key: string): boolean {
    return this.isExpired(key)
  }

  static prefetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key)
    if (cached && !this.shouldRefresh(key)) {
      return Promise.resolve(cached)
    }

    return fetchFn().then(data => {
      this.set(key, data)
      return data
    })
  }
}

export interface ModelsCacheData {
  providers: any[]
  modelsByType: Record<string, any[]>
  lastUpdated: number
}

export interface PreferencesCacheData {
  defaultModels: Record<string, string>
  lastUsedModels: Record<string, string>
  modelParameters: Record<string, any>
  lastUpdated: number
}

export const cacheUtils = {
  getModels: (): ModelsCacheData | null => {
    return ModelCache.get<ModelsCacheData>(MODELS_CACHE_KEY)
  },

  setModels: (data: ModelsCacheData): void => {
    ModelCache.set(MODELS_CACHE_KEY, data)
  },

  clearModels: (): void => {
    ModelCache.remove(MODELS_CACHE_KEY)
  },

  getPreferences: (): PreferencesCacheData | null => {
    return ModelCache.get<PreferencesCacheData>(PREFERENCES_CACHE_KEY)
  },

  setPreferences: (data: PreferencesCacheData): void => {
    ModelCache.set(PREFERENCES_CACHE_KEY, data)
  },

  clearPreferences: (): void => {
    ModelCache.remove(PREFERENCES_CACHE_KEY)
  },

  clearAll: (): void => {
    ModelCache.clear()
  },

  getCacheInfo: () => {
    const modelsAge = ModelCache.getAge(MODELS_CACHE_KEY)
    const prefsAge = ModelCache.getAge(PREFERENCES_CACHE_KEY)

    return {
      models: {
        exists: !isNaN(modelsAge) && modelsAge !== Infinity,
        age: modelsAge,
        ttl: ModelCache.getTTL(MODELS_CACHE_KEY),
        expired: ModelCache.isExpired(MODELS_CACHE_KEY),
      },
      preferences: {
        exists: !isNaN(prefsAge) && prefsAge !== Infinity,
        age: prefsAge,
        ttl: ModelCache.getTTL(PREFERENCES_CACHE_KEY),
        expired: ModelCache.isExpired(PREFERENCES_CACHE_KEY),
      },
    }
  },
}
