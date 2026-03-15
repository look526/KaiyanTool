import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../SceneOptimizationDialog.module.css';

export interface LoadingStateProps {
  scene_count: number;
}

export function LoadingState({ scene_count }: LoadingStateProps) {
  return (
    <div className={styles.loadingState}>
      <div className={styles.loadingIcon}>
        <Loader2 className={styles.spinner} />
      </div>
      <h3 className={styles.loadingTitle}>AI 正在优化您的场景...</h3>
      <p className={styles.loadingDescription}>正在处理 {scene_count} 个场景，请稍候</p>
    </div>
  );
}
