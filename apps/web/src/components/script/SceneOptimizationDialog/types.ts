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
  sceneId: string;
  originalContent: string;
  optimizedContent: string;
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
  customPrompt: string;
  intensity: OptimizationIntensity;
  createdAt: string;
}

export interface SceneOptimizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: ParsedScene[];
  selectedSceneIds: string[];
  onSceneSelect: (sceneIds: string[]) => void;
  onOptimize: (params: {
    sceneIds: string[];
    direction: OptimizationDirection;
    customPrompt: string;
    intensity: OptimizationIntensity;
    stylePreference?: string;
  }) => Promise<OptimizationResult[]>;
  onApplyOptimization: (results: OptimizationResult[]) => void;
  templates: OptimizationTemplate[];
  onSaveTemplate: (template: Omit<OptimizationTemplate, 'id' | 'createdAt'>) => void;
}
