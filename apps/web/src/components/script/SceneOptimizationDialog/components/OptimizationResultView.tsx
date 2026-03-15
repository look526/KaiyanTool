import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '../../../ui/button';
import { OptimizationResult } from '../types';
import styles from '../SceneOptimizationDialog.module.css';

export interface OptimizationResultViewProps {
  results: OptimizationResult[];
  active_index: number;
  on_index_change: (index: number) => void;
  on_copy: (result: OptimizationResult) => void;
}

export function OptimizationResultView({
  results,
  active_index,
  on_index_change,
  on_copy,
}: OptimizationResultViewProps) {
  const active_result = results[active_index];

  if (!active_result) return null;

  return (
    <div className={styles.optimizationResultView}>
      <div className={styles.resultTabs}>
        {results.map((result, index) => (
          <Button
            key={result.scene_id}
            variant={active_index === index ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => on_index_change(index)}
          >
            场景 {index + 1}
          </Button>
        ))}
      </div>

      <div className={styles.resultContent}>
        <div className={styles.resultPanel}>
          <div className={styles.resultPanelHeader}>
            <div className={styles.resultPanelIndicator} />
            <h4 className={styles.resultPanelTitle}>原始内容</h4>
          </div>
          <div className={styles.resultPanelContent}>
            {active_result.original_content}
          </div>
        </div>

        <div className={styles.resultPanel}>
          <div className={styles.resultPanelHeader}>
            <div className={`${styles.resultPanelIndicator} ${styles.success}`} />
            <h4 className={styles.resultPanelTitle}>AI 优化建议</h4>
            <div className={styles.resultPanelActions}>
              <span className={styles.scoreBadge}>
                评分: {active_result.score}/5
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => on_copy(active_result)}
                icon={<Copy className={styles.icon} />}
              >
                复制
              </Button>
            </div>
          </div>
          <div className={`${styles.resultPanelContent} ${styles.optimized}`}>
            {active_result.optimized_content}
          </div>
        </div>
      </div>

      {active_result.suggestions && active_result.suggestions.length > 0 && (
        <div className={styles.suggestionsSection}>
          <h4 className={styles.suggestionsTitle}>优化建议</h4>
          <div className={styles.suggestionsList}>
            {active_result.suggestions.map((suggestion, i) => (
              <span key={i} className={styles.suggestionTag}>
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
