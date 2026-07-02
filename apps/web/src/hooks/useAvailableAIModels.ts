import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import { cacheUtils } from '../lib/modelCache';
import type { AIProviderModel } from '../types';
import type { ContentType } from '../components/ui/ModelSelector';

interface AdminAIProvider {
  id: string;
  name?: string;
  type: string;
  enabled?: boolean;
  models?: AIProviderModel[];
}

export interface AvailableAIModel extends AIProviderModel {
  provider_id: string;
  provider_type: string;
  provider_name: string;
}

function modelMatchesContentType(model: { types?: string[] }, contentType?: ContentType): boolean {
  if (!contentType) return true;
  const types = model.types ?? [];
  if (types.length === 0) return true;
  if (types.includes(contentType)) return true;

  const textLike: ContentType[] = ['script', 'novel', 'storyline', 'outline'];
  if (textLike.includes(contentType) && types.includes('text')) return true;

  return false;
}

function flattenProviders(providers: AdminAIProvider[], contentType?: ContentType): AvailableAIModel[] {
  const unique = new Map<string, AvailableAIModel>();

  providers
    .filter(provider => provider.enabled !== false)
    .forEach(provider => {
      (provider.models || [])
        .filter(model => modelMatchesContentType(model, contentType))
        .forEach(model => {
          if (unique.has(model.id)) return;
          unique.set(model.id, {
            ...model,
            types: model.types || [],
            provider_id: provider.id,
            provider_type: provider.type,
            provider_name: (provider as any).name || provider.type,
          });
        });
    });

  return [...unique.values()];
}

export function useAvailableAIModels(contentType?: ContentType) {
  const [providers, setProviders] = useState<AdminAIProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const cached = cacheUtils.getModels();
      const canUseCache = !forceRefresh && cached && !cacheUtils.getCacheInfo().models.expired;
      if (canUseCache) {
        setProviders(cached!.providers as AdminAIProvider[]);
        return;
      }

      const response = await apiClient.getAIProviders();
      const nextProviders = Array.isArray(response.providers) ? response.providers as AdminAIProvider[] : [];
      setProviders(nextProviders);

      const modelsByType: Record<string, AIProviderModel[]> = {};
      nextProviders
        .filter(provider => provider.enabled !== false)
        .forEach(provider => {
          (provider.models || []).forEach(model => {
            const types = model.types && model.types.length > 0 ? model.types : ['text'];
            types.forEach(type => {
              if (!modelsByType[type]) modelsByType[type] = [];
              modelsByType[type].push(model);
            });
          });
        });

      cacheUtils.setModels({
        providers: nextProviders,
        modelsByType,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error(String(err));
      setError(nextError);
      console.error('Failed to load AI models:', nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const models = useMemo(() => flattenProviders(providers, contentType), [providers, contentType]);

  const getModel = useCallback((modelId?: string | null) => {
    if (!modelId) return undefined;
    return flattenProviders(providers).find(model =>
      model.id === modelId || model.model_id === modelId || model.name === modelId
    );
  }, [providers]);

  return {
    providers,
    models,
    loading,
    error,
    refresh: () => load(true),
    getModel,
  };
}
