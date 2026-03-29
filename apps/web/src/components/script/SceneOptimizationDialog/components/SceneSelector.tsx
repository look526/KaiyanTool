import React from 'react';
import { Layers, FileText, MessageSquare } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ParsedScene } from '../../../../utils/SceneParser';
import styles from '../SceneOptimizationDialog.module.css';

export interface SceneSelectorProps {
  scenes: ParsedScene[];
  selected_scene_ids: string[];
  selected_scenes: ParsedScene[];
  total_word_count: number;
  hovered_scene: string | null;
  on_scene_toggle: (scene_id: string) => void;
  on_select_all: () => void;
  on_clear_selection: () => void;
  on_scene_hover: (scene_id: string | null) => void;
}

export function SceneSelector({
  scenes,
  selected_scene_ids,
  selected_scenes,
  total_word_count,
  hovered_scene,
  on_scene_toggle,
  on_select_all,
  on_clear_selection,
  on_scene_hover,
}: SceneSelectorProps) {
  return (
    <>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>
          <Layers />
          <span>场景列表</span>
        </div>
        <div className={styles.sidebarActions}>
          <Button variant="ghost" size="sm" onClick={on_select_all}>
            全选
          </Button>
          <Button variant="ghost" size="sm" onClick={on_clear_selection}>
            清空
          </Button>
        </div>
      </div>

      <div className={styles.selectionInfo}>
        <div className={styles.selectionInfoLeft}>
          <div
            className={`${styles.selectionIndicator} ${selected_scene_ids.length > 0 ? styles.active : ''}`}
          />
          <span className={styles.selectionInfoLabel}>已选择</span>
        </div>
        <span className={styles.selectionCount}>{selected_scene_ids.length}/5</span>
      </div>

      <div className={styles.sceneList}>
        {scenes.map((scene) => {
          const is_selected = selected_scene_ids.includes(scene.id);
          const is_disabled = !is_selected && selected_scene_ids.length >= 5;
          const is_hovered = hovered_scene === scene.id;

          return (
            <div
              key={scene.id}
              onClick={() => !is_disabled && on_scene_toggle(scene.id)}
              onMouseEnter={() => on_scene_hover(scene.id)}
              onMouseLeave={() => on_scene_hover(null)}
              className={`${styles.sceneCard} ${is_selected ? styles.selected : ''} ${is_disabled ? styles.disabled : ''}`}
            >
              <div className={styles.sceneCardTop}>
                <div className={styles.sceneCardIcon}>
                  {is_selected ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{scene.index}</span>
                  )}
                </div>
                <div className={styles.sceneCardContent}>
                  <span className={styles.sceneCardTitle}>{scene.title}</span>
                  <p className={styles.sceneCardDescription}>
                    {scene.description || '无描述'}
                  </p>
                  <div className={styles.sceneCardMeta}>
                    <span className={styles.sceneCardMetaItem}>
                      <FileText />
                      {scene.wordCount} 字
                    </span>
                    <span className={styles.sceneCardMetaItem}>
                      <MessageSquare />
                      {scene.dialogueCount} 对话
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.wordCount}>
          <span className={styles.wordCountLabel}>总字数</span>
          <span className={styles.wordCountValue}>{total_word_count.toLocaleString()}</span>
        </div>
      </div>
    </>
  );
}
