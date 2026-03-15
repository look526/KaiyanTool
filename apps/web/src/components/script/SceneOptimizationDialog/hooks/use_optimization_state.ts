import { useState, useEffect, useCallback, useMemo } from 'react';
import { ParsedScene } from '../../../utils/SceneParser';
import { OptimizationResult, OptimizationDirection, OptimizationIntensity } from '../types';

export interface OptimizationState {
  step: 'select' | 'configure' | 'processing' | 'result';
  direction: OptimizationDirection;
  custom_prompt: string;
  intensity: OptimizationIntensity;
  style_preference: string;
  show_advanced: boolean;
  results: OptimizationResult[];
  error: string | null;
  show_template_menu: boolean;
  active_result_index: number;
  hovered_scene: string | null;
}

export interface OptimizationActions {
  set_step: (step: OptimizationState['step']) => void;
  set_direction: (direction: OptimizationDirection) => void;
  set_custom_prompt: (prompt: string) => void;
  set_intensity: (intensity: OptimizationIntensity) => void;
  set_style_preference: (preference: string) => void;
  toggle_advanced: () => void;
  set_results: (results: OptimizationResult[]) => void;
  set_error: (error: string | null) => void;
  toggle_template_menu: () => void;
  set_active_result_index: (index: number) => void;
  set_hovered_scene: (sceneId: string | null) => void;
  reset: () => void;
}

export function use_optimization_state() {
  const [step, set_step] = useState<OptimizationState['step']>('select');
  const [direction, set_direction] = useState<OptimizationDirection>('plot_pacing');
  const [custom_prompt, set_custom_prompt] = useState('');
  const [intensity, set_intensity] = useState<OptimizationIntensity>('medium');
  const [style_preference, set_style_preference] = useState('cinematic');
  const [show_advanced, set_show_advanced] = useState(false);
  const [results, set_results] = useState<OptimizationResult[]>([]);
  const [error, set_error] = useState<string | null>(null);
  const [show_template_menu, set_show_template_menu] = useState(false);
  const [active_result_index, set_active_result_index] = useState(0);
  const [hovered_scene, set_hovered_scene] = useState<string | null>(null);

  const toggle_advanced = useCallback(() => {
    set_show_advanced(prev => !prev);
  }, []);

  const toggle_template_menu = useCallback(() => {
    set_show_template_menu(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    set_step('select');
    set_direction('plot_pacing');
    set_custom_prompt('');
    set_intensity('medium');
    set_style_preference('cinematic');
    set_show_advanced(false);
    set_results([]);
    set_error(null);
    set_show_template_menu(false);
    set_active_result_index(0);
    set_hovered_scene(null);
  }, []);

  return {
    state: {
      step,
      direction,
      custom_prompt,
      intensity,
      style_preference,
      show_advanced,
      results,
      error,
      show_template_menu,
      active_result_index,
      hovered_scene,
    },
    actions: {
      set_step,
      set_direction,
      set_custom_prompt,
      set_intensity,
      set_style_preference,
      toggle_advanced,
      set_results,
      set_error,
      toggle_template_menu,
      set_active_result_index,
      set_hovered_scene,
      reset,
    },
  };
}

export function use_scene_selection(
  scenes: ParsedScene[],
  selected_scene_ids: string[],
  on_scene_select: (ids: string[]) => void
) {
  const selected_scenes = useMemo(() => {
    return scenes.filter(s => selected_scene_ids.includes(s.id));
  }, [scenes, selected_scene_ids]);

  const total_word_count = useMemo(() => {
    return selected_scenes.reduce((sum, s) => sum + s.wordCount, 0);
  }, [selected_scenes]);

  const handle_scene_toggle = useCallback((scene_id: string) => {
    if (selected_scene_ids.includes(scene_id)) {
      on_scene_select(selected_scene_ids.filter(id => id !== scene_id));
    } else {
      if (selected_scene_ids.length < 5) {
        on_scene_select([...selected_scene_ids, scene_id]);
      }
    }
  }, [selected_scene_ids, on_scene_select]);

  const handle_select_all = useCallback(() => {
    const all_ids = scenes.slice(0, 5).map(s => s.id);
    on_scene_select(all_ids);
  }, [scenes, on_scene_select]);

  const handle_clear_selection = useCallback(() => {
    on_scene_select([]);
  }, [on_scene_select]);

  return {
    selected_scenes,
    total_word_count,
    handle_scene_toggle,
    handle_select_all,
    handle_clear_selection,
  };
}
