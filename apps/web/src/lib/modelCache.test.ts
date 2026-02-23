import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheUtils, ModelsCacheData, PreferencesCacheData } from './modelCache';

describe('cacheUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Models cache', () => {
    it('should set and get models cache values', () => {
      const data: ModelsCacheData = {
        providers: [],
        modelsByType: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setModels(data);
      const result = cacheUtils.getModels();
      expect(result).toEqual(data);
    });

    it('should return null for non-existent models cache', () => {
      const result = cacheUtils.getModels();
      expect(result).toBeNull();
    });

    it('should expire models cache after TTL', () => {
      const data: ModelsCacheData = {
        providers: [],
        modelsByType: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setModels(data);
      vi.advanceTimersByTime(6 * 60 * 1000);
      const result = cacheUtils.getModels();
      expect(result).toBeNull();
    });

    it('should clear models cache', () => {
      const data: ModelsCacheData = {
        providers: [],
        modelsByType: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setModels(data);
      cacheUtils.clearModels();
      expect(cacheUtils.getModels()).toBeNull();
    });
  });

  describe('Preferences cache', () => {
    it('should set and get preferences cache values', () => {
      const data: PreferencesCacheData = {
        defaultModels: {},
        lastUsedModels: {},
        modelParameters: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setPreferences(data);
      const result = cacheUtils.getPreferences();
      expect(result).toEqual(data);
    });

    it('should return null for non-existent preferences cache', () => {
      const result = cacheUtils.getPreferences();
      expect(result).toBeNull();
    });

    it('should expire preferences cache after TTL', () => {
      const data: PreferencesCacheData = {
        defaultModels: {},
        lastUsedModels: {},
        modelParameters: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setPreferences(data);
      vi.advanceTimersByTime(6 * 60 * 1000);
      const result = cacheUtils.getPreferences();
      expect(result).toBeNull();
    });

    it('should clear preferences cache', () => {
      const data: PreferencesCacheData = {
        defaultModels: {},
        lastUsedModels: {},
        modelParameters: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setPreferences(data);
      cacheUtils.clearPreferences();
      expect(cacheUtils.getPreferences()).toBeNull();
    });
  });

  describe('Cache info', () => {
    it('should return cache info for empty cache', () => {
      const info = cacheUtils.getCacheInfo();
      expect(info.models.exists).toBe(false);
      expect(info.preferences.exists).toBe(false);
    });

    it('should return cache info for populated cache', () => {
      const modelsData: ModelsCacheData = {
        providers: [],
        modelsByType: {},
        lastUpdated: Date.now()
      };
      const prefsData: PreferencesCacheData = {
        defaultModels: {},
        lastUsedModels: {},
        modelParameters: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setModels(modelsData);
      cacheUtils.setPreferences(prefsData);

      const info = cacheUtils.getCacheInfo();
      expect(info.models.exists).toBe(true);
      expect(info.models.expired).toBe(false);
      expect(info.preferences.exists).toBe(true);
      expect(info.preferences.expired).toBe(false);
    });

    it('should return cache info for expired cache', () => {
      const modelsData: ModelsCacheData = {
        providers: [],
        modelsByType: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setModels(modelsData);
      vi.advanceTimersByTime(6 * 60 * 1000);
      
      cacheUtils.getModels();

      const info = cacheUtils.getCacheInfo();
      expect(info.models.exists).toBe(false);
      expect(info.models.expired).toBe(true);
    });
  });

  describe('Clear all', () => {
    it('should clear all cache entries', () => {
      const modelsData: ModelsCacheData = {
        providers: [],
        modelsByType: {},
        lastUpdated: Date.now()
      };
      const prefsData: PreferencesCacheData = {
        defaultModels: {},
        lastUsedModels: {},
        modelParameters: {},
        lastUpdated: Date.now()
      };
      cacheUtils.setModels(modelsData);
      cacheUtils.setPreferences(prefsData);
      cacheUtils.clearAll();
      expect(cacheUtils.getModels()).toBeNull();
      expect(cacheUtils.getPreferences()).toBeNull();
    });
  });
});