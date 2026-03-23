import { useCallback } from 'react';
import { Scene, OptimizationDirection } from '../types';
import { Step } from '../types';

export interface OptimizerActionsHandlers {
  handle_scene_toggle: (scene_id: number) => void;
  handle_select_all: (current_scenes: Scene[]) => void;
  handle_direction_toggle: (direction_id: string) => void;
  handle_scene_expand: (scene_id: number) => void;
  handle_continue_to_configure: () => void;
  handle_start_optimization: () => Promise<void>;
  handle_apply_all: () => void;
  handle_reset_scene: (scene_id: number) => void;
}

export function use_optimizer_actions(
  state: {
    step: Step;
    selected_scene_ids: Set<number>;
    selected_directions: string[];
    custom_prompt: string;
    scenes: Scene[];
    optimization_result: Record<number, string> | null;
  },
  actions: {
    set_step: (step: Step) => void;
    set_selected_scene_ids: (ids: Set<number>) => void;
    set_selected_directions: (directions: string[]) => void;
    set_expanded_scenes: (scenes: Set<number>) => void;
    set_optimization_result: (result: Record<number, string> | null) => void;
    set_is_optimizing: (optimizing: boolean) => void;
    set_optimization_progress: (progress: number) => void;
  },
  params: {
    script_content: string;
    on_apply_optimization: (optimized_content: string) => void;
    on_close: () => void;
  }
): OptimizerActionsHandlers {
  const {
    selected_scene_ids,
    selected_directions,
    custom_prompt,
    scenes,
    optimization_result,
  } = state;

  const {
    set_step,
    set_selected_scene_ids,
    set_selected_directions,
    set_expanded_scenes,
    set_optimization_result,
    set_is_optimizing,
    set_optimization_progress,
  } = actions;

  const { script_content, on_apply_optimization, on_close } = params;

  const handle_scene_toggle = useCallback((scene_id: number) => {
    const new_selected = new Set(selected_scene_ids);
    if (new_selected.has(scene_id)) {
      new_selected.delete(scene_id);
    } else {
      new_selected.add(scene_id);
    }
    set_selected_scene_ids(new_selected);
  }, [selected_scene_ids, set_selected_scene_ids]);

  const handle_select_all = useCallback((current_scenes: Scene[]) => {
    if (selected_scene_ids.size === current_scenes.length) {
      set_selected_scene_ids(new Set());
    } else {
      set_selected_scene_ids(new Set(current_scenes.map(s => s.id)));
    }
  }, [selected_scene_ids, set_selected_scene_ids]);

  const handle_direction_toggle = useCallback((direction_id: string) => {
    const new_selected = selected_directions.includes(direction_id)
      ? selected_directions.filter(d => d !== direction_id)
      : [...selected_directions, direction_id];
    set_selected_directions(new_selected);
  }, [selected_directions, set_selected_directions]);

  const handle_scene_expand = useCallback((scene_id: number) => {
    const new_expanded = new Set(state.expanded_scenes);
    if (new_expanded.has(scene_id)) {
      new_expanded.delete(scene_id);
    } else {
      new_expanded.add(scene_id);
    }
    set_expanded_scenes(new_expanded);
  }, [state.expanded_scenes, set_expanded_scenes]);

  const handle_continue_to_configure = useCallback(() => {
    if (selected_scene_ids.size === 0) return;
    set_step('configure');
  }, [selected_scene_ids, set_step]);

  const handle_start_optimization = useCallback(async () => {
    if (selected_directions.length === 0 && !custom_prompt.trim()) {
      alert('请至少选择一个优化方向或输入自定义提示词');
      return;
    }

    set_step('processing');
    set_is_optimizing(true);
    set_optimization_progress(0);

    try {
      const results: Record<number, string> = {};
      let processed_count = 0;
      const total_to_process = selected_scene_ids.size;

      const OPTIMIZATION_DIRECTIONS: OptimizationDirection[] = [
        { id: 'dialogue', label: '对话增强', description: '让对话更自然流畅', icon: '💬' },
        { id: 'plot', label: '情节紧凑', description: '提升剧情节奏感', icon: '📖' },
        { id: 'character', label: '角色塑造', description: '强化人物性格', icon: '👤' },
        { id: 'atmosphere', label: '场景氛围', description: '增强环境描写', icon: '🎬' },
        { id: 'visual', label: '画面增强', description: '提升视觉表现', icon: '🎨' },
        { id: 'emotional', label: '情感深化', description: '增加情感层次', icon: '❤️' },
      ];

      for (const scene_id of selected_scene_ids) {
        const scene = scenes.find(s => s.id === scene_id);
        if (!scene) continue;

        const direction_text = selected_directions.length > 0
          ? OPTIMIZATION_DIRECTIONS
              .filter(d => selected_directions.includes(d.id))
              .map(d => `${d.label}（${d.description}）`)
              .join('、')
          : '';

        const prompt = custom_prompt.trim()
          ? custom_prompt.trim()
          : `请按照以下方向优化以下场景内容：${direction_text}\n\n场景内容：\n${scene.content}`;

        const response = await fetch('/api/optimize-scene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scene_content: scene.content, prompt }),
        });

        if (!response.ok) throw new Error('优化失败');

        const data = await response.json();
        results[scene_id] = data.optimized_content;

        processed_count++;
        set_optimization_progress(Math.round((processed_count / total_to_process) * 100));
      }

      set_optimization_result(results);
      set_step('result');
    } catch (error) {
      console.error('场景优化失败:', error);
      alert('场景优化失败，请重试');
      set_step('list');
    } finally {
      set_is_optimizing(false);
    }
  }, [
    selected_directions,
    custom_prompt,
    selected_scene_ids,
    scenes,
    set_step,
    set_is_optimizing,
    set_optimization_progress,
    set_optimization_result,
  ]);

  const handle_apply_all = useCallback(() => {
    if (!optimization_result) return;

    let optimized_content = script_content;
    for (const [scene_id, optimized] of Object.entries(optimization_result)) {
      const scene = scenes.find(s => s.id === parseInt(scene_id));
      if (scene) {
        optimized_content = optimized_content.replace(scene.original_content, optimized);
      }
    }

    on_apply_optimization(optimized_content);
    on_close();
  }, [optimization_result, script_content, scenes, on_apply_optimization, on_close]);

  const handle_reset_scene = useCallback((scene_id: number) => {
    const new_results = { ...optimization_result };
    delete new_results[scene_id];
    set_optimization_result(new_results);
  }, [optimization_result, set_optimization_result]);

  return {
    handle_scene_toggle,
    handle_select_all,
    handle_direction_toggle,
    handle_scene_expand,
    handle_continue_to_configure,
    handle_start_optimization,
    handle_apply_all,
    handle_reset_scene,
  };
}
