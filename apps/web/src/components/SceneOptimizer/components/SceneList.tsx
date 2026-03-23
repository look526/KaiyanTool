import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Scene } from '../types';
import styles from '../SceneOptimizer.module.css';

export interface SceneListProps {
  scenes: Scene[];
  selected_scene_ids: Set<number>;
  expanded_scenes: Set<number>;
  search_query: string;
  on_scene_toggle: (scene_id: number) => void;
  on_scene_expand: (scene_id: number) => void;
}

export function SceneList({
  scenes,
  selected_scene_ids,
  expanded_scenes,
  search_query,
  on_scene_toggle,
  on_scene_expand,
}: SceneListProps) {
  return (
    <div className={styles.sceneList}>
      {scenes.map((scene) => (
        <div
          key={scene.id}
          className={`${styles.sceneCard} ${selected_scene_ids.has(scene.id) ? styles.selected : ''}`}
          onClick={() => on_scene_toggle(scene.id)}
        >
          <div className={styles.sceneCardTop}>
            <div className={styles.sceneCheckbox}>
              <input
                type="checkbox"
                checked={selected_scene_ids.has(scene.id)}
                onChange={() => on_scene_toggle(scene.id)}
                onClick={(e) => e.stopPropagation()}
                className={styles.checkbox}
              />
            </div>
            <div className={styles.sceneCardContent}>
              <div className={styles.sceneCardHeader}>
                <h3 className={styles.sceneCardTitle}>{scene.heading}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    on_scene_expand(scene.id);
                  }}
                  className={styles.expandButton}
                >
                  <ChevronDown
                    size={16}
                    className={`${styles.chevron} ${expanded_scenes.has(scene.id) ? styles.expanded : ''}`}
                  />
                </button>
              </div>
              {expanded_scenes.has(scene.id) && (
                <p className={styles.sceneContent}>{scene.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
