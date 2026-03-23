import React from 'react';
import { Lightbulb } from 'lucide-react';
import styles from '../SceneOptimizationDialog.module.css';

export interface CustomPromptProps {
  value: string;
  on_change: (value: string) => void;
  max_length?: number;
  placeholder?: string;
}

export function CustomPrompt({
  value,
  on_change,
  max_length = 500,
  placeholder = '描述您希望如何优化这些场景，例如：增强角色之间的情感张力，让对话更加生动自然...',
}: CustomPromptProps) {
  const handle_focus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
  };

  const handle_blur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-primary)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className={styles.customPromptSection}>
      <div className={styles.customPromptLabel}>
        <Lightbulb />
        <h3 className={styles.customPromptTitle}>自定义需求</h3>
      </div>
      <textarea
        value={value}
        onChange={(e) => on_change(e.target.value)}
        placeholder={placeholder}
        maxLength={max_length}
        className={styles.customPromptTextarea}
        onFocus={handle_focus}
        onBlur={handle_blur}
      />
      <div className={styles.customPromptFooter}>
        <span className={styles.customPromptHint}>
          提示：越详细的需求描述，AI 优化效果越好
        </span>
        <span
          className={`${styles.customPromptCount} ${value.length > max_length * 0.9 ? styles.warning : ''}`}
        >
          {value.length}/{max_length}
        </span>
      </div>
    </div>
  );
}
