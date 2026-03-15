import React from 'react';
import { Lightbulb, Gauge, Target } from 'lucide-react';
import { OptimizationIntensity } from '../types';
import styles from '../SceneOptimizationDialog.module.css';

export interface IntensityConfig {
  label: string;
  description: string;
  icon: React.ElementType;
}

export interface IntensitySelectorProps {
  intensity: OptimizationIntensity;
  on_intensity_change: (intensity: OptimizationIntensity) => void;
}

const INTENSITY_CONFIG: Record<OptimizationIntensity, IntensityConfig> = {
  light: { label: '轻度', description: '微调细节', icon: Lightbulb },
  medium: { label: '中度', description: '适度改写', icon: Gauge },
  deep: { label: '深度', description: '重构内容', icon: Target },
};

export function IntensitySelector({
  intensity,
  on_intensity_change,
}: IntensitySelectorProps) {
  return (
    <div>
      <h4 className={styles.advancedSectionTitle}>优化强度</h4>
      <div className={styles.intensityOptions}>
        {Object.entries(INTENSITY_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const is_active = intensity === key;

          return (
            <button
              key={key}
              onClick={() => on_intensity_change(key as OptimizationIntensity)}
              className={`${styles.intensityButton} ${is_active ? styles.active : ''}`}
            >
              <div
                className={`${styles.intensityButtonIcon} ${is_active ? styles.active : ''}`}
              >
                <Icon className={styles.icon} />
              </div>
              <div className={styles.intensityButtonLabel}>{config.label}</div>
              <div className={styles.intensityButtonDescription}>
                {config.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
