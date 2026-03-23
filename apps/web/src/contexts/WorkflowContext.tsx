import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

export type WorkflowStepId = 'script' | 'storyline' | 'characters' | 'items' | 'scenes' | 'storyboard';

export type StepStatus = 'pending' | 'in_progress' | 'completed';

export interface StepProgress {
  status: StepStatus;
  percentage: number;
  lastVisited: Date | null;
}

export interface WorkflowState {
  projectId: string | null;
  currentStep: WorkflowStepId;
  completedSteps: WorkflowStepId[];
  stepProgress: Record<WorkflowStepId, StepProgress>;
  lastUpdated: Date | null;
}

type WorkflowAction =
  | { type: 'SET_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: WorkflowStepId }
  | { type: 'COMPLETE_STEP'; payload: WorkflowStepId }
  | { type: 'UPDATE_STEP_PROGRESS'; payload: { stepId: WorkflowStepId; progress: Partial<StepProgress> } }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'LOAD_STATE'; payload: WorkflowState };

const WORKFLOW_STEPS: WorkflowStepId[] = ['script', 'storyline', 'characters', 'items', 'scenes', 'storyboard'];

const initialStepProgress: Record<WorkflowStepId, StepProgress> = {
  script: { status: 'pending', percentage: 0, lastVisited: null },
  storyline: { status: 'pending', percentage: 0, lastVisited: null },
  characters: { status: 'pending', percentage: 0, lastVisited: null },
  items: { status: 'pending', percentage: 0, lastVisited: null },
  scenes: { status: 'pending', percentage: 0, lastVisited: null },
  storyboard: { status: 'pending', percentage: 0, lastVisited: null },
};

const initialState: WorkflowState = {
  projectId: null,
  currentStep: 'script',
  completedSteps: [],
  stepProgress: initialStepProgress,
  lastUpdated: null,
};

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_PROJECT':
      return {
        ...state,
        projectId: action.payload,
      };
    case 'SET_CURRENT_STEP': {
      const currentProgress = state.stepProgress[action.payload];
      const newStatus = currentProgress.status === 'completed' 
        ? 'completed' as StepStatus
        : currentProgress.status === 'in_progress'
          ? 'in_progress' as StepStatus
          : 'in_progress' as StepStatus;

      const newStepProgress = {
        ...state.stepProgress,
        [action.payload]: {
          ...state.stepProgress[action.payload],
          status: newStatus,
          lastVisited: new Date(),
        },
      };
      return {
        ...state,
        currentStep: action.payload,
        stepProgress: newStepProgress,
        lastUpdated: new Date(),
      };
    }
    case 'COMPLETE_STEP': {
      const stepId = action.payload;
      const newCompletedSteps = state.completedSteps.includes(stepId)
        ? state.completedSteps
        : [...state.completedSteps, stepId];
      const newStepProgress = {
        ...state.stepProgress,
        [stepId]: {
          ...state.stepProgress[stepId],
          status: 'completed' as StepStatus,
          percentage: 100,
        },
      };
      return {
        ...state,
        completedSteps: newCompletedSteps,
        stepProgress: newStepProgress,
        lastUpdated: new Date(),
      };
    }
    case 'UPDATE_STEP_PROGRESS': {
      const { stepId, progress } = action.payload;
      const newStepProgress = {
        ...state.stepProgress,
        [stepId]: {
          ...state.stepProgress[stepId],
          ...progress,
        },
      };
      return {
        ...state,
        stepProgress: newStepProgress,
        lastUpdated: new Date(),
      };
    }
    case 'RESET_WORKFLOW':
      return {
        ...initialState,
        projectId: state.projectId,
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface WorkflowContextType {
  state: WorkflowState;
  actions: {
    setCurrentStep: (step: WorkflowStepId) => void;
    completeStep: (step: WorkflowStepId) => void;
    updateStepProgress: (stepId: WorkflowStepId, progress: Partial<StepProgress>) => void;
    resetWorkflow: () => void;
    setProject: (projectId: string) => void;
  };
  computed: {
    progress: number;
    canProceed: boolean;
    nextStep: WorkflowStepId | null;
    previousStep: WorkflowStepId | null;
    steps: WorkflowStepId[];
  };
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

const STORAGE_KEY_PREFIX = 'workflow_state_';

function getStorageKey(projectId: string): string {
  return `${STORAGE_KEY_PREFIX}${projectId}`;
}

function loadFromStorage(projectId: string): WorkflowState | null {
  try {
    const stored = localStorage.getItem(getStorageKey(projectId));
    if (stored) {
      const parsed = JSON.parse(stored);
      const mergedStepProgress = {
        ...initialStepProgress,
        ...(parsed.stepProgress || {}),
      } as Record<WorkflowStepId, StepProgress>;

      const normalizedStepProgress = Object.fromEntries(
        Object.entries(mergedStepProgress).map(([key, value]) => [
          key,
          {
            ...(value as StepProgress),
            lastVisited: (value as StepProgress).lastVisited
              ? new Date((value as StepProgress).lastVisited as any)
              : null,
          },
        ])
      ) as Record<WorkflowStepId, StepProgress>;
      return {
        ...parsed,
        stepProgress: normalizedStepProgress,
        lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : null,
      };
    }
  } catch (e) {
    console.error('Failed to load workflow state from storage:', e);
  }
  return null;
}

function saveToStorage(state: WorkflowState): void {
  if (!state.projectId) return;
  try {
    localStorage.setItem(getStorageKey(state.projectId), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save workflow state to storage:', e);
  }
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  useEffect(() => {
    if (state.projectId) {
      const savedState = loadFromStorage(state.projectId);
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: savedState });
      }
    }
  }, [state.projectId]);

  useEffect(() => {
    if (state.projectId && state.lastUpdated) {
      saveToStorage(state);
    }
  }, [state]);

  const setCurrentStep = useCallback((step: WorkflowStepId) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const completeStep = useCallback((step: WorkflowStepId) => {
    dispatch({ type: 'COMPLETE_STEP', payload: step });
  }, []);

  const updateStepProgress = useCallback((stepId: WorkflowStepId, progress: Partial<StepProgress>) => {
    dispatch({ type: 'UPDATE_STEP_PROGRESS', payload: { stepId, progress } });
  }, []);

  const resetWorkflow = useCallback(() => {
    dispatch({ type: 'RESET_WORKFLOW' });
  }, []);

  const setProject = useCallback((projectId: string) => {
    dispatch({ type: 'SET_PROJECT', payload: projectId });
  }, []);

  const computed = useMemo(() => {
    const completedCount = state.completedSteps.length;
    const progress = Math.round((completedCount / WORKFLOW_STEPS.length) * 100);

    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep);
    const nextStep = currentIndex < WORKFLOW_STEPS.length - 1
      ? WORKFLOW_STEPS[currentIndex + 1]
      : null;
    const previousStep = currentIndex > 0
      ? WORKFLOW_STEPS[currentIndex - 1]
      : null;

    const currentStepProgress = state.stepProgress[state.currentStep];
    const canProceed = currentStepProgress.percentage >= 50 || currentStepProgress.status === 'completed';

    return {
      progress,
      canProceed,
      nextStep,
      previousStep,
      steps: WORKFLOW_STEPS,
    };
  }, [state.currentStep, state.completedSteps, state.stepProgress]);

  const value: WorkflowContextType = {
    state,
    actions: {
      setCurrentStep,
      completeStep,
      updateStepProgress,
      resetWorkflow,
      setProject,
    },
    computed,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

export { WORKFLOW_STEPS };
