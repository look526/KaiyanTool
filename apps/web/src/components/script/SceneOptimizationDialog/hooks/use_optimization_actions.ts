import { useCallback } from 'react';
import { OptimizationResult, OptimizationTemplate, OptimizationDirection, OptimizationIntensity } from '../types';

export interface OptimizationActions {
  handle_start_optimize: () => Promise<void>;
  handle_apply_all: () => void;
  handle_save_as_template: () => void;
  handle_apply_template: (template: OptimizationTemplate) => void;
  handle_copy_result: (result: OptimizationResult) => void;
  handle_retry: () => void;
}

export function use_optimization_actions(
  state: {
    step: 'select' | 'configure' | 'processing' | 'result';
    direction: OptimizationDirection;
    custom_prompt: string;
    intensity: OptimizationIntensity;
    style_preference: string;
    results: OptimizationResult[];
  },
  actions: {
    set_step: (step: 'select' | 'configure' | 'processing' | 'result') => void;
    set_results: (results: OptimizationResult[]) => void;
    set_error: (error: string | null) => void;
    set_direction: (direction: OptimizationDirection) => void;
    set_custom_prompt: (prompt: string) => void;
    set_intensity: (intensity: OptimizationIntensity) => void;
    toggle_template_menu: () => void;
  },
  params: {
    selected_scene_ids: string[];
    on_optimize: (params: {
      scene_ids: string[];
      direction: OptimizationDirection;
      custom_prompt: string;
      intensity: OptimizationIntensity;
      style_preference?: string;
    }) => Promise<OptimizationResult[]>;
    on_apply_optimization: (results: OptimizationResult[]) => void;
    templates: OptimizationTemplate[];
    on_save_template: (template: Omit<OptimizationTemplate, 'id' | 'created_at'>) => void;
    on_close: () => void;
  }
): OptimizationActions {
  const {
    selected_scene_ids,
    on_optimize,
    on_apply_optimization,
    templates,
    on_save_template,
    on_close,
  } = params;

  const { step, direction, custom_prompt, intensity, style_preference, results } = state;
  const { set_step, set_results, set_error, set_direction, set_custom_prompt, set_intensity, toggle_template_menu } = actions;

  const handle_start_optimize = useCallback(async () => {
    if (selected_scene_ids.length === 0) return;

    set_step('processing');
    set_error(null);

    try {
      const optimization_results = await on_optimize({
        scene_ids: selected_scene_ids,
        direction,
        custom_prompt,
        intensity,
        style_preference,
      });
      set_results(optimization_results);
      set_step('result');
    } catch (err) {
      set_error(err instanceof Error ? err.message : '优化失败，请重试');
      set_step('configure');
    }
  }, [selected_scene_ids, direction, custom_prompt, intensity, style_preference, on_optimize, set_step, set_results, set_error]);

  const handle_apply_all = useCallback(() => {
    on_apply_optimization(results);
    on_close();
  }, [results, on_apply_optimization, on_close]);

  const handle_save_as_template = useCallback(() => {
    on_save_template({
      name: `模板 ${templates.length + 1}`,
      direction,
      custom_prompt,
      intensity,
    });
    toggle_template_menu();
  }, [direction, custom_prompt, intensity, templates.length, on_save_template, toggle_template_menu]);

  const handle_apply_template = useCallback((template: OptimizationTemplate) => {
    set_direction(template.direction);
    set_custom_prompt(template.custom_prompt);
    set_intensity(template.intensity);
    toggle_template_menu();
  }, [set_direction, set_custom_prompt, set_intensity, toggle_template_menu]);

  const handle_copy_result = useCallback((result: OptimizationResult) => {
    navigator.clipboard.writeText(result.optimized_content);
  }, []);

  const handle_retry = useCallback(() => {
    set_step('configure');
    set_results([]);
    set_error(null);
  }, [set_step, set_results, set_error]);

  return {
    handle_start_optimize,
    handle_apply_all,
    handle_save_as_template,
    handle_apply_template,
    handle_copy_result,
    handle_retry,
  };
}
