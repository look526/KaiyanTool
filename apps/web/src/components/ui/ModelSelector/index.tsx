import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Star, Clock } from 'lucide-react';
import { apiClient } from '../../../lib/api';
import { ModelSelectorProps, ContentType, AIProviderModel } from './types';
import { use_model_selector_state } from './hooks/use_model_selector_state';
import { ModelSelectorTrigger } from './components/ModelSelectorTrigger';
import { ModelSelectorSearch } from './components/ModelSelectorSearch';
import { ModelSelectorItem, ModelSelectorSpecialItem } from './components/ModelSelectorItem';
import { ModelSelectorEmpty, ModelSelectorLoading } from './components/ModelSelectorEmpty';
import styles from './ModelSelector.module.css';

export function ModelSelector({
  content_type,
  value,
  on_change,
  show_last_used = true,
  show_default = true,
  allow_custom = false,
  on_manage_models,
  on_refresh_models,
  class_name,
  style,
  disabled = false,
  placeholder = '选择模型',
  auto_select_when_empty = false,
}: ModelSelectorProps) {
  const [is_open, set_is_open] = useState(false);
  const [search_value, set_search_value] = useState('');
  const container_ref = useRef<HTMLDivElement>(null);

  const { state, actions } = use_model_selector_state(content_type);

  useEffect(() => {
    if (!auto_select_when_empty || value) return;
    if (state.loading || state.models.length === 0) return;
    const def_id = state.default_models[content_type];
    const pick =
      def_id && state.models.some(m => m.id === def_id)
        ? def_id
        : state.models[0].id;
    if (pick) on_change(pick);
  }, [
    auto_select_when_empty,
    value,
    state.loading,
    state.models,
    state.default_models,
    content_type,
    on_change,
  ]);

  const handle_refresh = useCallback(() => {
    actions.load_models(true);
    actions.load_preferences(true);
    on_refresh_models?.();
  }, [actions, on_refresh_models]);

  const handle_select = useCallback((model_id: string) => {
    on_change(model_id);
    set_is_open(false);
    apiClient.recordModelUsage({
      modelId: model_id,
      contentType: content_type,
      success: true,
    }).catch(err => {
      console.error('[ModelSelector] Failed to record model usage:', err);
    });
  }, [on_change, content_type]);

  const get_filtered_models = useMemo(() => {
    if (!search_value) return state.models;
    const search_lower = search_value.toLowerCase();
    return state.models.filter(model =>
      model.name.toLowerCase().includes(search_lower) ||
      model.description?.toLowerCase().includes(search_lower)
    );
  }, [state.models, search_value]);

  const get_display_value = useCallback(() => {
    if (!value) return placeholder;
    const model = state.models.find(m => m.id === value);
    return model?.name || value;
  }, [value, state.models, placeholder]);

  const get_default_model = useCallback(() => {
    const default_id = state.default_models[content_type];
    return state.models.find(m => m.id === default_id);
  }, [state.default_models, content_type, state.models]);

  const get_last_used_model = useCallback(() => {
    const last_used_id = state.last_used_models[content_type];
    return state.models.find(m => m.id === last_used_id);
  }, [state.last_used_models, content_type, state.models]);

  const handle_key_down = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      set_is_open(false);
    } else if (e.key === 'Enter' && is_open) {
      const filtered = get_filtered_models;
      if (filtered.length > 0) {
        handle_select(filtered[0].id);
      }
    }
  }, [is_open, get_filtered_models, handle_select]);

  const default_model = get_default_model();
  const last_used_model = get_last_used_model();

  return (
    <div
      className={`${styles.modelSelector} ${class_name || ''}`}
      ref={container_ref}
      style={style}
      onKeyDown={handle_key_down}
    >
      <ModelSelectorTrigger
        content_type={content_type}
        is_open={is_open}
        disabled={disabled}
        on_manage_models={on_manage_models}
        get_display_value={get_display_value}
        on_toggle={() => set_is_open(!is_open)}
        placeholder={placeholder}
      />

      {is_open && (
        <div className={styles.dropdown}>
          <ModelSelectorSearch
            search_value={search_value}
            on_search_change={set_search_value}
            loading={state.loading}
            on_refresh={on_refresh_models}
          />

          {show_default && default_model && (
            <ModelSelectorSpecialItem
              model={default_model}
              icon={<Star style={{ width: '16px', height: '16px', color: '#fbbf24' }} />}
              label="默认模型"
              is_selected={value === default_model.id}
              on_select={() => handle_select(default_model.id)}
            />
          )}

          {show_last_used && last_used_model && last_used_model.id !== default_model?.id && (
            <ModelSelectorSpecialItem
              model={last_used_model}
              icon={<Clock style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />}
              label="最近使用"
              is_selected={value === last_used_model.id}
              on_select={() => handle_select(last_used_model.id)}
            />
          )}

          {get_filtered_models.length > 0 && (
            <div className={styles.sectionHeader}>
              可用模型 ({get_filtered_models.length})
            </div>
          )}

          {get_filtered_models.map((model) => (
            <ModelSelectorItem
              key={model.id}
              model={model}
              is_selected={value === model.id}
              testing_model={state.testing_model}
              is_default={state.default_models[content_type] === model.id}
              on_select={() => handle_select(model.id)}
              on_test={() => actions.test_model(model.id)}
              on_set_default={() => actions.set_default_model(content_type, model.id)}
            />
          ))}

          {get_filtered_models.length === 0 && !state.loading && (
            <ModelSelectorEmpty
              allow_custom={allow_custom}
              on_manage_models={on_manage_models}
              on_close={() => set_is_open(false)}
            />
          )}

          {state.loading && <ModelSelectorLoading />}
        </div>
      )}
    </div>
  );
}
