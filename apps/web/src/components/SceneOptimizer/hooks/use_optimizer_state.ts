import { useState, useEffect, useMemo, useCallback } from 'react';
import { Scene, Step } from '../types';

export interface OptimizerState {
  step: Step;
  scenes: Scene[];
  selected_scene_ids: Set<number>;
  search_query: string;
  current_page: number;
  items_per_page: number;
  selected_directions: string[];
  custom_prompt: string;
  optimization_result: Record<number, string> | null;
  is_optimizing: boolean;
  optimization_progress: number;
  expanded_scenes: Set<number>;
}

export interface OptimizerActions {
  set_step: (step: Step) => void;
  set_scenes: (scenes: Scene[]) => void;
  set_selected_scene_ids: (ids: Set<number>) => void;
  set_search_query: (query: string) => void;
  set_current_page: (page: number) => void;
  set_selected_directions: (directions: string[]) => void;
  set_custom_prompt: (prompt: string) => void;
  set_optimization_result: (result: Record<number, string> | null) => void;
  set_is_optimizing: (optimizing: boolean) => void;
  set_optimization_progress: (progress: number) => void;
  set_expanded_scenes: (scenes: Set<number>) => void;
  reset: () => void;
}

export function use_optimizer_state() {
  const [step, set_step] = useState<Step>('list');
  const [scenes, set_scenes] = useState<Scene[]>([]);
  const [selected_scene_ids, set_selected_scene_ids] = useState<Set<number>>(new Set());
  const [search_query, set_search_query] = useState('');
  const [current_page, set_current_page] = useState(1);
  const [items_per_page] = useState(10);
  const [selected_directions, set_selected_directions] = useState<string[]>([]);
  const [custom_prompt, set_custom_prompt] = useState('');
  const [optimization_result, set_optimization_result] = useState<Record<number, string> | null>(null);
  const [is_optimizing, set_is_optimizing] = useState(false);
  const [optimization_progress, set_optimization_progress] = useState(0);
  const [expanded_scenes, set_expanded_scenes] = useState<Set<number>>(new Set());

  const reset = useCallback(() => {
    set_step('list');
    set_scenes([]);
    set_selected_scene_ids(new Set());
    set_search_query('');
    set_current_page(1);
    set_selected_directions([]);
    set_custom_prompt('');
    set_optimization_result(null);
    set_is_optimizing(false);
    set_optimization_progress(0);
    set_expanded_scenes(new Set());
  }, []);

  const actions = useMemo(() => ({
    set_step,
    set_scenes,
    set_selected_scene_ids,
    set_search_query,
    set_current_page,
    set_selected_directions,
    set_custom_prompt,
    set_optimization_result,
    set_is_optimizing,
    set_optimization_progress,
    set_expanded_scenes,
    reset,
  }), [reset]);

  return {
    state: {
      step,
      scenes,
      selected_scene_ids,
      search_query,
      current_page,
      items_per_page,
      selected_directions,
      custom_prompt,
      optimization_result,
      is_optimizing,
      optimization_progress,
      expanded_scenes,
    },
    actions,
  };
}

export function use_scene_parser() {
  const parse_script_into_scenes = useCallback((content: string): Scene[] => {
    const scene_regex = /(?:^|\n)\s*场景\s*(\d+)\s*[：:]?\s*([^\n]*)/g;
    const matches = Array.from(content.matchAll(scene_regex));

    if (matches.length === 0) {
      return [{
        id: 1,
        heading: '整篇剧本',
        content: content,
        original_content: content,
      }];
    }

    const parsed_scenes: Scene[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const scene_number = parseInt(match[1]);
      const scene_heading = match[2].trim() || `场景 ${scene_number}`;

      const start_idx = match.index!;
      const end_idx = i < matches.length - 1 ? matches[i + 1].index! : content.length;

      const scene_content = content.slice(start_idx, end_idx).trim();

      parsed_scenes.push({
        id: scene_number,
        heading: scene_heading,
        content: scene_content,
        original_content: scene_content,
      });
    }

    return parsed_scenes;
  }, []);

  return { parse_script_into_scenes };
}

export function use_scene_filter(
  scenes: Scene[],
  search_query: string,
  current_page: number,
  items_per_page: number
) {
  const filtered_scenes = useMemo(() => {
    const query = search_query.toLowerCase();
    return scenes.filter(scene => {
      return scene.heading.toLowerCase().includes(query) ||
             scene.content.toLowerCase().includes(query);
    });
  }, [scenes, search_query]);

  const total_pages = Math.ceil(filtered_scenes.length / items_per_page);
  const start_index = (current_page - 1) * items_per_page;
  const end_index = start_index + items_per_page;
  const current_scenes = filtered_scenes.slice(start_index, end_index);

  return {
    filtered_scenes,
    total_pages,
    current_scenes,
  };
}
