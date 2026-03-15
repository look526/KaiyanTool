import React from 'react';
import { X } from 'lucide-react';
import { Step } from '../types';
import styles from '../SceneOptimizer.module.css';

export interface DialogHeaderProps {
  step: Step;
  scene_count: number;
  selected_count: number;
  on_close: () => void;
}

export function DialogHeader({
  step,
  scene_count,
  selected_count,
  on_close,
}: DialogHeaderProps) {
  const get_title = () => {
    switch (step) {
      case 'list':
        return '场景优化';
      case 'configure':
        return '配置优化参数';
      case 'processing':
        return '正在优化...';
      case 'result':
        return '优化结果';
    }
  };

  const get_subtitle = () => {
    switch (step) {
      case 'list':
        return `共 ${scene_count} 个场景，已选择 ${selected_count} 个`;
      case 'configure':
        return '选择优化方向或输入自定义提示词';
      case 'processing':
        return '正在使用AI优化场景内容...';
      case 'result':
        return '查看并应用优化结果';
    }
  };

  return (
    <div className={styles.dialogHeader}>
      <div>
        <h2 className={styles.dialogTitle}>{get_title()}</h2>
        <p className={styles.dialogSubtitle}>{get_subtitle()}</p>
      </div>
      <button
        onClick={on_close}
        className={styles.closeButton}
      >
        <X size={20} />
      </button>
    </div>
  );
}
