import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const dropdown_ref = useRef<HTMLDivElement>(null);
  const [dropdown_position, set_dropdown_position] = useState({ top: 0, left: 0, width: 0, opens_above: false });

  const { state, actions } = use_model_selector_state(content_type);

  const update_dropdown_position = useCallback(() => {
    if (container_ref.current) {
      const rect = container_ref.current.getBoundingClientRect();
      const dropdown_height = 320; // 最大高度
      const space_below = window.innerHeight - rect.bottom;
      const space_above = rect.top;
      
      // 如果下方空间不足且上方空间足够，则向上展开
      const should_open_above = space_below < dropdown_height && space_above > space_below;
      
      set_dropdown_position({
        top: should_open_above 
          ? rect.top + window.scrollY - dropdown_height - 4
          : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        opens_above: should_open_above,
      });
    }
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    if (!is_open) return;

    const handle_click_outside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        container_ref.current && !container_ref.current.contains(target) &&
        dropdown_ref.current && !dropdown_ref.current.contains(target)
      ) {
        set_is_open(false);
      }
    };

    const handle_scroll = () => {
      update_dropdown_position();
    };

    document.addEventListener('mousedown', handle_click_outside);
    window.addEventListener('scroll', handle_scroll, true);
    window.addEventListener('resize', handle_scroll);

    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
      window.removeEventListener('scroll', handle_scroll, true);
      window.removeEventListener('resize', handle_scroll);
    };
  }, [is_open, update_dropdown_position]);

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
    console.log('[ModelSelector] handle_select called with:', model_id);
    console.log('[ModelSelector] calling on_change with:', model_id);
    on_change(model_id);
    console.log('[ModelSelector] on_change called, closing dropdown');
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
    console.log('[ModelSelector] get_display_value:', { value, model_name: model?.name, models_count: state.models.length, all_models: state.models.map(m => ({ id: m.id, name: m.name })) });
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

  const toggle_dropdown = useCallback(() => {
    if (!is_open) {
      update_dropdown_position();
    }
    set_is_open(!is_open);
  }, [is_open, update_dropdown_position]);

  const default_model = get_default_model();
  const last_used_model = get_last_used_model();

  const dropdown_content = is_open && (
    <div
      ref={dropdown_ref}
      className={styles.dropdown}
      style={{
        position: 'fixed',
        top: dropdown_position.top,
        left: dropdown_position.left,
        width: dropdown_position.width,
        borderTopLeftRadius: dropdown_position.opens_above ? '0' : '8px',
        borderTopRightRadius: dropdown_position.opens_above ? '0' : '8px',
        borderBottomLeftRadius: dropdown_position.opens_above ? '8px' : '8px',
        borderBottomRightRadius: dropdown_position.opens_above ? '8px' : '8px',
      }}
    >
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
  );

  return (
    <>
      <div
        ref={container_ref}
        className={`${styles.modelSelector} ${class_name || ''}`}
        style={style}
        onKeyDown={handle_key_down}
      >
        <ModelSelectorTrigger
          content_type={content_type}
          is_open={is_open}
          disabled={disabled}
          on_manage_models={on_manage_models}
          get_display_value={get_display_value}
          on_toggle={toggle_dropdown}
          placeholder={placeholder}
        />
      </div>
      {is_open && createPortal(dropdown_content, document.body)}
    </>
  );
}
