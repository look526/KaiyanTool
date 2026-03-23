import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Scene } from '../types';
import styles from '../SceneOptimizer.module.css';

export interface OptimizationResultViewProps {
  scenes: Scene[];
  selected_scene_ids: Set<number>;
  optimization_result: Record<number, string>;
  on_reset_scene: (scene_id: number) => void;
}

export function OptimizationResultView({
  scenes,
  selected_scene_ids,
  optimization_result,
  on_reset_scene,
}: OptimizationResultViewProps) {
  return (
    <div className={styles.resultList}>
      {Array.from(selected_scene_ids).map((scene_id) => {
        const scene = scenes.find(s => s.id === scene_id);
        if (!scene) return null;
        const optimized = optimization_result[scene_id];
        return (
          <div key={scene_id} className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>{scene.heading}</h3>
              <button
                onClick={() => on_reset_scene(scene_id)}
                className={styles.resetButton}
              >
                <RotateCcw size={14} />
                重置
              </button>
            </div>
            <div className={styles.resultContent}>
              <div className={styles.resultColumn}>
                <h4 className={styles.resultColumnTitle}>原文</h4>
                <p className={styles.resultText}>{scene.original_content}</p>
              </div>
              <div className={styles.resultColumn}>
                <h4 className={styles.resultColumnTitle}>优化后</h4>
                <p className={`${styles.resultText} ${styles.optimized}`}>{optimized}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
