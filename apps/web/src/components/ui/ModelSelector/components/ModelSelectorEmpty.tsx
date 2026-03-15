import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import styles from '../ModelSelector.module.css';

export interface ModelSelectorEmptyProps {
  allow_custom: boolean;
  on_manage_models?: () => void;
  on_close: () => void;
}

export function ModelSelectorEmpty({
  allow_custom,
  on_manage_models,
  on_close,
}: ModelSelectorEmptyProps) {
  return (
    <div className={styles.emptyState}>
      <AlertCircle className={styles.emptyIcon} />
      <div className={styles.emptyText}>未找到匹配的模型</div>
      {allow_custom && (
        <button
          onClick={() => {
            on_close();
            on_manage_models?.();
          }}
          className={styles.addButton}
        >
          添加新模型
        </button>
      )}
    </div>
  );
}

export function ModelSelectorLoading() {
  return (
    <div className={styles.loadingState}>
      <Loader2 className={styles.loadingSpinner} />
      <div className={styles.loadingText}>加载中...</div>
    </div>
  );
}
