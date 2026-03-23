import React from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import { ContentType } from '../types';
import styles from '../ModelSelector.module.css';

export interface ModelSelectorTriggerProps {
  content_type: ContentType;
  is_open: boolean;
  disabled: boolean;
  on_manage_models?: () => void;
  get_display_value: () => string;
  on_toggle: () => void;
  placeholder: string;
}

const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  text: '📝',
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  script: '📋',
  novel: '📚',
  storyline: '📖',
  outline: '📑',
};

export function ModelSelectorTrigger({
  content_type,
  is_open,
  disabled,
  on_manage_models,
  get_display_value,
  on_toggle,
  placeholder,
}: ModelSelectorTriggerProps) {
  return (
    <div
      onClick={() => !disabled && on_toggle()}
      className={`${styles.trigger} ${disabled ? styles.disabled : ''}`}
    >
      <div className={styles.triggerContent}>
        <span className={styles.contentTypeIcon}>{CONTENT_TYPE_ICONS[content_type]}</span>
        <span
          className={`${styles.triggerText} ${!get_display_value() ? styles.placeholder : ''}`}
        >
          {get_display_value() || placeholder}
        </span>
      </div>
      <div className={styles.triggerActions}>
        {on_manage_models && (
          <Settings
            className={styles.settingsIcon}
            onClick={(e) => {
              e.stopPropagation();
              on_manage_models();
            }}
          />
        )}
        <ChevronDown
          className={`${styles.chevron} ${is_open ? styles.open : ''}`}
        />
      </div>
    </div>
  );
}
