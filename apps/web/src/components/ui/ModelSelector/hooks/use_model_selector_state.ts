import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../../lib/api';
import { cacheUtils } from '../../../../lib/modelCache';
import { AIProviderModel, ContentType } from '../types';

export interface ModelSelectorState {
  models: AIProviderModel[];
  default_models: Record<string, string>;
  last_used_models: Record<string, string>;
  loading: boolean;
  testing_model: string | null;
}

export interface ModelSelectorActions {
  set_models: (models: AIProviderModel[]) => void;
  set_default_models: (models: Record<string, string>) => void;
  set_last_used_models: (models: Record<string, string>) => void;
  set_loading: (loading: boolean) => void;
  set_testing_model: (model_id: string | null) => void;
  load_models: (force_refresh?: boolean) => Promise<void>;
  load_preferences: (force_refresh?: boolean) => Promise<void>;
  test_model: (model_id: string) => Promise<void>;
  set_default_model: (content_type: ContentType, model_id: string) => Promise<void>;
}

export function use_model_selector_state(content_type: ContentType) {
  const [models, set_models] = useState<AIProviderModel[]>([]);
  const [default_models, set_default_models] = useState<Record<string, string>>({});
  const [last_used_models, set_last_used_models] = useState<Record<string, string>>({});
  const [loading, set_loading] = useState(false);
  const [testing_model, set_testing_model] = useState<string | null>(null);

  const load_models = useCallback(async (force_refresh = false) => {
    try {
      set_loading(true);

      const cached_data = cacheUtils.getModels();
      const should_use_cache = !force_refresh && cached_data && !cacheUtils.getCacheInfo().models.expired;

      if (should_use_cache) {
        const models_by_type = cached_data!.modelsByType;
        const filtered_models = (models_by_type[content_type] || []).filter((m: any) => {
          const provider = cached_data!.providers.find((p: any) =>
            p.models?.some((pm: any) => pm.id === m.id)
          );
          return provider?.enabled;
        });
        set_models(filtered_models);
        set_loading(false);
        return;
      }

      const providers = await apiClient.getAIProviders();

      const enabled_providers = providers.providers.filter(p => p.enabled);

      const all_models = enabled_providers
        .flatMap(provider => {
          return (provider.models || []).filter(m => {
            const has_script = m.types?.includes(content_type);
            return has_script;
          });
        });

      const models_by_type: Record<string, typeof models> = {};
      providers.providers
        .filter(p => p.enabled)
        .forEach(provider => {
          provider.models?.forEach(model => {
            model.types?.forEach(type => {
              if (!models_by_type[type]) {
                models_by_type[type] = [];
              }
              models_by_type[type].push(model as AIProviderModel);
            });
          });
        });

      cacheUtils.setModels({
        providers: providers.providers,
        modelsByType: models_by_type,
        lastUpdated: Date.now(),
      });

      set_models(all_models);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      set_loading(false);
    }
  }, [content_type]);

  const load_preferences = useCallback(async (force_refresh = false) => {
    try {
      const cached_data = cacheUtils.getPreferences();
      const should_use_cache = !force_refresh && cached_data && !cacheUtils.getCacheInfo().preferences.expired;

      if (should_use_cache) {
        set_default_models(cached_data!.defaultModels || {});
        set_last_used_models(cached_data!.lastUsedModels || {});
        return;
      }

      const prefs = await apiClient.getModelPreferences();
      set_default_models(prefs.defaultModels || {});
      set_last_used_models(prefs.lastUsedModels || {});

      cacheUtils.setPreferences({
        defaultModels: prefs.defaultModels || {},
        lastUsedModels: prefs.lastUsedModels || {},
        modelParameters: prefs.modelParameters || {},
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const test_model = useCallback(async (model_id: string) => {
    try {
      set_testing_model(model_id);
      const result = await apiClient.testModel({ modelId: model_id });
      console.log('Model test result:', result);
    } catch (error) {
      console.error('Model test failed:', error);
    } finally {
      set_testing_model(null);
    }
  }, []);

  const set_default_model = useCallback(async (type: ContentType, model_id: string) => {
    try {
      const configurations = Object.entries({
        ...default_models,
        [type]: model_id
      }).map(([type, model_id]) => ({ type, model_id }));

      await apiClient.setDefaultModels(configurations);
      set_default_models(prev => ({ ...prev, [type]: model_id }));
    } catch (error) {
      console.error('Failed to set default model:', error);
    }
  }, [default_models]);

  useEffect(() => {
    load_models(true);
    load_preferences(true);
  }, [load_models, load_preferences]);

  return {
    state: {
      models,
      default_models,
      last_used_models,
      loading,
      testing_model,
    },
    actions: {
      set_models,
      set_default_models,
      set_last_used_models,
      set_loading,
      set_testing_model,
      load_models,
      load_preferences,
      test_model,
      set_default_model,
    },
  };
}
