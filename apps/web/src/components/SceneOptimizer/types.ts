export interface Scene {
  id: number;
  heading: string;
  content: string;
  original_content: string;
}

export interface OptimizationDirection {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface SceneOptimizerProps {
  is_open: boolean;
  on_close: () => void;
  script_content: string;
  on_apply_optimization: (optimized_content: string) => void;
}

export type Step = 'list' | 'configure' | 'processing' | 'result';

export interface OptimizationResult {
  [scene_id: number]: string;
}
