import React from 'react';
import { Layers, Settings2, Sparkles, ChevronRight, Check } from 'lucide-react';
import styles from '../SceneOptimizationDialog.module.css';

export interface Step {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface StepIndicatorProps {
  current_step: 'select' | 'configure' | 'processing' | 'result';
}

const STEPS: Step[] = [
  { id: 'select', label: '选择场景', icon: Layers },
  { id: 'configure', label: '配置选项', icon: Settings2 },
  { id: 'result', label: '查看结果', icon: Sparkles },
];

export function StepIndicator({ current_step }: StepIndicatorProps) {
  const current_step_index = STEPS.findIndex(s => s.id === (current_step === 'processing' ? 'configure' : current_step));

  return (
    <div className={styles.stepsContainer}>
      {STEPS.map((s, index) => {
        const Icon = s.icon;
        const is_active = index === current_step_index;
        const is_completed = index < current_step_index;

        return (
          <React.Fragment key={s.id}>
            <div
              className={`${styles.stepItem} ${is_active ? styles.active : ''} ${is_completed ? styles.completed : ''}`}
            >
              <div className={`${styles.stepIcon} ${is_active ? styles.active : ''} ${is_completed ? styles.completed : ''}`}>
                {is_completed ? (
                  <Check className={styles.icon} />
                ) : (
                  <Icon className={styles.icon} />
                )}
              </div>
              <span
                className={`${styles.stepLabel} ${is_active ? styles.active : ''} ${is_completed ? styles.completed : ''}`}
              >
                {s.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight className={styles.stepSeparator} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
