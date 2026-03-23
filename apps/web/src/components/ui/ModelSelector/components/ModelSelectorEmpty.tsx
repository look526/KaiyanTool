import React from 'react';
import { AlertCircle, Loader2, Settings } from 'lucide-react';
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
      <div className={styles.emptyHint}>请先配置AI模型</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {on_manage_models && (
          <button
            onClick={() => {
              on_close();
              on_manage_models();
            }}
            className={styles.addButton}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Settings style={{ width: '14px', height: '14px' }} />
            管理模型
          </button>
        )}
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
