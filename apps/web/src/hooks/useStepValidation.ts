import { useEffect, useCallback } from 'react';
import { useWorkflow, WorkflowStepId, StepStatus } from '../contexts/WorkflowContext';
import { apiClient } from '../lib/api';

interface StepValidationResult {
  isValid: boolean;
  percentage: number;
}

export function useStepValidation(projectId: string | undefined) {
  const { state, actions } = useWorkflow();

  const validateScriptStep = useCallback(async (): Promise<StepValidationResult> => {
    if (!projectId) return { isValid: false, percentage: 0 };
    
    try {
      const scripts = await apiClient.getProjectScripts(projectId);
      const script = scripts[0];
      
      if (!script || !script.content) {
        return { isValid: false, percentage: 0 };
      }
      
      const wordCount = script.content.length;
      const percentage = Math.min(100, Math.round((wordCount / 500) * 100));
      
      return {
        isValid: wordCount > 100,
        percentage,
      };
    } catch (error) {
      return { isValid: false, percentage: 0 };
    }
  }, [projectId]);

  const validateCharactersStep = useCallback(async (): Promise<StepValidationResult> => {
    if (!projectId) return { isValid: false, percentage: 0 };
    
    try {
      const characters = await apiClient.getCharacters(projectId);
      
      if (!characters || characters.length === 0) {
        return { isValid: false, percentage: 0 };
      }
      
      const charactersWithPortrait = characters.filter((char: any) => 
        char.portrait?.imageUrl
      );
      
      const percentage = characters.length > 0
        ? Math.round((charactersWithPortrait.length / characters.length) * 100)
        : 0;
      
      return {
        isValid: charactersWithPortrait.length > 0,
        percentage,
      };
    } catch (error) {
      return { isValid: false, percentage: 0 };
    }
  }, [projectId]);

  const validateScenesStep = useCallback(async (): Promise<StepValidationResult> => {
    if (!projectId) return { isValid: false, percentage: 0 };
    
    try {
      const scenes = await apiClient.getScenes(projectId);
      
      if (!scenes || scenes.length === 0) {
        return { isValid: false, percentage: 0 };
      }
      
      const scenesWithReference = scenes.filter(
        (scene: { referenceImages?: string[] }) => 
          scene.referenceImages && scene.referenceImages.length > 0
      );
      
      const percentage = scenes.length > 0
        ? Math.round((scenesWithReference.length / scenes.length) * 100)
        : 0;
      
      return {
        isValid: scenes.length > 0,
        percentage: Math.max(percentage, scenes.length > 0 ? 30 : 0),
      };
    } catch (error) {
      return { isValid: false, percentage: 0 };
    }
  }, [projectId]);

  const validateStoryboardStep = useCallback(async (): Promise<StepValidationResult> => {
    if (!projectId) return { isValid: false, percentage: 0 };
    
    try {
      const shots = await apiClient.getShots(projectId);
      
      if (!shots || shots.length === 0) {
        return { isValid: false, percentage: 0 };
      }
      
      const shotsWithVideo = shots.filter(
        (shot: { videoUrl?: string }) => shot.videoUrl
      );
      const shotsWithImages = shots.filter(
        (shot: { startImageUrl?: string }) => shot.startImageUrl
      );
      
      let percentage = 0;
      if (shotsWithImages.length > 0) {
        percentage = Math.round((shotsWithImages.length / shots.length) * 50);
      }
      if (shotsWithVideo.length > 0) {
        percentage += Math.round((shotsWithVideo.length / shots.length) * 50);
      }
      
      return {
        isValid: shots.length > 0,
        percentage: Math.max(percentage, shots.length > 0 ? 20 : 0),
      };
    } catch (error) {
      return { isValid: false, percentage: 0 };
    }
  }, [projectId]);

  const validateStep = useCallback(async (stepId: WorkflowStepId): Promise<StepValidationResult> => {
    switch (stepId) {
      case 'script':
        return validateScriptStep();
      case 'characters':
        return validateCharactersStep();
      case 'scenes':
        return validateScenesStep();
      case 'storyboard':
        return validateStoryboardStep();
      default:
        return { isValid: false, percentage: 0 };
    }
  }, [projectId]);

  const validateAllSteps = useCallback(async () => {
    if (!projectId) return;
    
    const steps: WorkflowStepId[] = ['script', 'characters', 'scenes', 'storyboard'];
    
    for (const step of steps) {
      const result = await validateStep(step);
      
      let status: StepStatus = 'pending';
      if (result.isValid) {
        status = 'completed';
      } else if (result.percentage > 0) {
        status = 'in_progress';
      }
      
      actions.updateStepProgress(step, {
        status,
        percentage: result.percentage,
      });
      
      if (result.isValid && !state.completedSteps.includes(step)) {
        actions.completeStep(step);
      }
    }
  }, [projectId, validateStep, actions, state.completedSteps]);

  useEffect(() => {
    if (projectId) {
      actions.setProject(projectId);
      validateAllSteps();
    }
  }, [projectId, actions, validateAllSteps]);

  return {
    validateStep,
    validateAllSteps,
  };
}
