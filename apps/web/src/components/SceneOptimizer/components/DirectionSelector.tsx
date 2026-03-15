import React from 'react';
import { OptimizationDirection } from '../types';
import styles from '../SceneOptimizer.module.css';

export interface DirectionSelectorProps {
  directions: OptimizationDirection[];
  selected_directions: string[];
  on_direction_toggle: (direction_id: string) => void;
}

export function DirectionSelector({
  directions,
  selected_directions,
  on_direction_toggle,
}: DirectionSelectorProps) {
  return (
    <div className={styles.directionSection}>
      <h3 className={styles.sectionTitle}>选择优化方向</h3>
      <div className={styles.directionGrid}>
        {directions.map((direction) => (
          <div
            key={direction.id}
            onClick={() => on_direction_toggle(direction.id)}
            className={`${styles.directionCard} ${selected_directions.includes(direction.id) ? styles.selected : ''}`}
          >
            <div className={styles.directionIcon}>{direction.icon}</div>
            <h4 className={styles.directionLabel}>{direction.label}</h4>
            <p className={styles.directionDescription}>{direction.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const OPTIMIZATION_DIRECTIONS: OptimizationDirection[] = [
  { id: 'dialogue', label: '对话增强', description: '让对话更自然流畅', icon: '💬' },
  { id: 'plot', label: '情节紧凑', description: '提升剧情节奏感', icon: '📖' },
  { id: 'character', label: '角色塑造', description: '强化人物性格', icon: '👤' },
  { id: 'atmosphere', label: '场景氛围', description: '增强环境描写', icon: '🎬' },
  { id: 'visual', label: '画面增强', description: '提升视觉表现', icon: '🎨' },
  { id: 'emotional', label: '情感深化', description: '增加情感层次', icon: '❤️' },
];
