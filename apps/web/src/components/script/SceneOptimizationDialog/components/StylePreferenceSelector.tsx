import React from 'react';
import { Layers, FileText, Target, Palette } from 'lucide-react';
import styles from '../SceneOptimizationDialog.module.css';

export interface StylePreference {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

export interface StylePreferenceSelectorProps {
  preferences: StylePreference[];
  selected_preference: string;
  on_preference_select: (preference_id: string) => void;
}

export function StylePreferenceSelector({
  preferences,
  selected_preference,
  on_preference_select,
}: StylePreferenceSelectorProps) {
  return (
    <div className={styles.stylePreferenceSelector}>
      <h4 className={styles.advancedSectionTitle}>风格偏好</h4>
      <div className={styles.stylePreferencesGrid}>
        {preferences.map((style) => {
          const Icon = style.icon;
          const is_active = selected_preference === style.id;

          return (
            <button
              key={style.id}
              onClick={() => on_preference_select(style.id)}
              className={`${styles.stylePreferenceButton} ${is_active ? styles.active : ''}`}
            >
              <div className={`${styles.stylePreferenceIcon} ${is_active ? styles.active : ''}`}>
                <Icon className={styles.icon} />
              </div>
              <div className={styles.stylePreferenceInfo}>
                <div className={styles.stylePreferenceLabel}>{style.label}</div>
                <div className={styles.stylePreferenceDescription}>{style.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const STYLE_PREFERENCES: StylePreference[] = [
  { id: 'cinematic', label: '电影风格', icon: Layers, description: '注重视觉冲击' },
  { id: 'literary', label: '文学风格', icon: FileText, description: '注重文字美感' },
  { id: 'commercial', label: '商业风格', icon: Target, description: '注重观众体验' },
  { id: 'artistic', label: '艺术风格', icon: Palette, description: '注重创新表达' },
];
