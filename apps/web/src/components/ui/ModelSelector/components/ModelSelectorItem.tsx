import React from 'react';
import { Star, Check, Zap, Loader2 } from 'lucide-react';
import { AIProviderModel } from '../types';
import styles from '../ModelSelector.module.css';

export interface ModelSelectorItemProps {
  model: AIProviderModel;
  is_selected: boolean;
  testing_model: string | null;
  is_default: boolean;
  on_select: () => void;
  on_test: () => void;
  on_set_default: () => void;
}

export function ModelSelectorItem({
  model,
  is_selected,
  testing_model,
  is_default,
  on_select,
  on_test,
  on_set_default,
}: ModelSelectorItemProps) {
  return (
    <div
      onClick={on_select}
      className={`${styles.modelItem} ${is_selected ? styles.selected : ''}`}
    >
      <div className={styles.modelItemContent}>
        <div className={styles.modelItemHeader}>
          <span className={styles.modelName}>{model.name}</span>
          {model.capabilities && model.capabilities.length > 0 && (
            <div className={styles.capabilities}>
              {model.capabilities.slice(0, 2).map((cap, i) => (
                <span key={i} className={styles.capability}>
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>
        {model.description && (
          <div className={styles.modelDescription}>
            {model.description}
          </div>
        )}
      </div>
      <div className={styles.modelItemActions}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            on_test();
          }}
          disabled={testing_model === model.id}
          className={styles.actionButton}
          title="测试模型"
        >
          {testing_model === model.id ? (
            <Loader2 className={styles.spinner} />
          ) : (
            <Zap className={styles.actionIcon} />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            on_set_default();
          }}
          className={styles.actionButton}
          title="设为默认"
        >
          <Star
            className={`${styles.actionIcon} ${is_default ? styles.filled : ''}`}
            style={{ fill: is_default ? 'currentColor' : 'none' }}
          />
        </button>
        {is_selected && (
          <Check className={styles.checkIcon} />
        )}
      </div>
    </div>
  );
}

export interface ModelSelectorSpecialItemProps {
  model: AIProviderModel;
  icon: React.ReactNode;
  label: string;
  is_selected: boolean;
  on_select: () => void;
}

export function ModelSelectorSpecialItem({
  model,
  icon,
  label,
  is_selected,
  on_select,
}: ModelSelectorSpecialItemProps) {
  return (
    <div
      onClick={on_select}
      className={`${styles.specialItem} ${is_selected ? styles.selected : ''}`}
    >
      {icon}
      <div className={styles.specialItemContent}>
        <div className={styles.specialItemName}>{model.name}</div>
        <div className={styles.specialItemLabel}>{label}</div>
      </div>
      {is_selected && <Check className={styles.checkIcon} />}
    </div>
  );
}
