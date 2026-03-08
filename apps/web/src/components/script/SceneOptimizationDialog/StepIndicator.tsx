import React from 'react';
import { Layers, Settings2, Sparkles, Check } from 'lucide-react';
import styles from '../SceneOptimizationDialog.module.css';

/**
 * Step indicator component for optimization dialog
 */
interface StepIndicatorProps {
  steps: Array<{ id: string; label: string; icon: React.ElementType }>;
  currentStepIndex: number;
}

export function StepIndicator({ steps, currentStepIndex }: StepIndicatorProps) {
  return (
    <div className={styles['scene-optimization-dialog__steps']}>
      {steps.map((s, index) => {
        const Icon = s.icon;
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        
        return (
          <React.Fragment key={s.id}>
            <div className={`${styles['scene-optimization-dialog__step']} ${isActive ? styles['scene-optimization-dialog__step--active'] : ''} ${isCompleted ? styles['scene-optimization-dialog__step--completed'] : ''}`}>
              <div className={`${styles['scene-optimization-dialog__step-icon']} ${isActive ? styles['scene-optimization-dialog__step-icon--active'] : ''} ${isCompleted ? styles['scene-optimization-dialog__step-icon--completed'] : ''}`}>
                {isCompleted ? (
                  <Check className={styles['scene-optimization-dialog__icon--xs']} />
                ) : (
                  <Icon className={styles['scene-optimization-dialog__icon--sm']} />
                )}
              </div>
              <span className={`${styles['scene-optimization-dialog__step-label']} ${isActive ? styles['scene-optimization-dialog__step-label--active'] : ''} ${isCompleted ? styles['scene-optimization-dialog__step-label--completed'] : ''}`}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
