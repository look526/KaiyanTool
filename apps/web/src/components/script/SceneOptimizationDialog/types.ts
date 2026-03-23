/**
 * Scene Optimization Dialog type definitions
 */
import { ParsedScene } from '../../../utils/SceneParser';

export type OptimizationDirection = 
  | 'plot_pacing'
  | 'character_development'
  | 'dialogue_quality'
  | 'scene_description'
  | 'conflict_design'
  | 'emotional_depth'
  | 'visual_imagery';

export type OptimizationIntensity = 'light' | 'medium' | 'deep';

export interface OptimizationResult {
  scene_id: string;
  original_content: string;
  optimized_content: string;
  suggestions: string[];
  changes: {
    type: string;
    description: string;
    before?: string;
    after?: string;
  }[];
  score: number;
}

export interface OptimizationTemplate {
  id: string;
  name: string;
  direction: OptimizationDirection;
  custom_prompt: string;
  intensity: OptimizationIntensity;
  created_at: string;
}

export interface SceneOptimizationDialogProps {
  is_open: boolean;
  on_close: () => void;
  scenes: ParsedScene[];
  selected_scene_ids: string[];
  on_scene_select: (scene_ids: string[]) => void;
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
}
