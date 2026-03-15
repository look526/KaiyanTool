import React, { useEffect } from 'react';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { SceneOptimizerProps } from './types';
import { use_optimizer_state, use_scene_parser, use_scene_filter } from './hooks/use_optimizer_state';
import { use_optimizer_actions } from './hooks/use_optimizer_actions';
import { DialogHeader } from './components/DialogHeader';
import { SceneList } from './components/SceneList';
import { DirectionSelector, OPTIMIZATION_DIRECTIONS } from './components/DirectionSelector';
import { OptimizationResultView } from './components/OptimizationResultView';
import styles from './SceneOptimizer.module.css';

export function SceneOptimizer({
  is_open,
  on_close,
  script_content,
  on_apply_optimization,
}: SceneOptimizerProps) {
  const { state, actions } = use_optimizer_state();
  const { parse_script_into_scenes } = use_scene_parser();
  const { filtered_scenes, total_pages, current_scenes } = use_scene_filter(
    state.scenes,
    state.search_query,
    state.current_page,
    state.items_per_page
  );

  const {
    handle_scene_toggle,
    handle_select_all,
    handle_direction_toggle,
    handle_scene_expand,
    handle_continue_to_configure,
    handle_start_optimization,
    handle_apply_all,
    handle_reset_scene,
  } = use_optimizer_actions(state, actions, {
    script_content,
    on_apply_optimization,
    on_close,
  });

  useEffect(() => {
    if (is_open && script_content) {
      const parsed_scenes = parse_script_into_scenes(script_content);
      actions.set_scenes(parsed_scenes);
    }
  }, [is_open, script_content, parse_script_into_scenes, actions]);

  useEffect(() => {
    if (!is_open) {
      actions.reset();
    }
  }, [is_open, actions]);

  if (!is_open) return null;

  return (
    <div className={styles.sceneOptimizerDialog} onClick={on_close}>
      <div className={styles.dialogContainer} onClick={(e) => e.stopPropagation()}>
        <DialogHeader
          step={state.step}
          scene_count={state.scenes.length}
          selected_count={state.selected_scene_ids.size}
          on_close={on_close}
        />

        <div className={styles.dialogBody}>
          {state.step === 'list' && (
            <>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="搜索场景..."
                  value={state.search_query}
                  onChange={(e) => actions.set_search_query(e.target.value)}
                  className={styles.searchInput}
                />
                <button
                  onClick={() => handle_select_all(current_scenes)}
                  className={styles.selectButton}
                >
                  {state.selected_scene_ids.size === current_scenes.length ? '取消全选' : '全选'}
                </button>
              </div>

              <SceneList
                scenes={current_scenes}
                selected_scene_ids={state.selected_scene_ids}
                expanded_scenes={state.expanded_scenes}
                search_query={state.search_query}
                on_scene_toggle={handle_scene_toggle}
                on_scene_expand={handle_scene_expand}
              />

              {total_pages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => actions.set_current_page(Math.max(1, state.current_page - 1))}
                    disabled={state.current_page === 1}
                    className={styles.paginationButton}
                  >
                    上一页
                  </button>
                  <span className={styles.paginationInfo}>
                    {state.current_page} / {total_pages}
                  </span>
                  <button
                    onClick={() => actions.set_current_page(Math.min(total_pages, state.current_page + 1))}
                    disabled={state.current_page === total_pages}
                    className={styles.paginationButton}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}

          {state.step === 'configure' && (
            <>
              <DirectionSelector
                directions={OPTIMIZATION_DIRECTIONS}
                selected_directions={state.selected_directions}
                on_direction_toggle={handle_direction_toggle}
              />

              <div className={styles.customPromptSection}>
                <h3 className={styles.sectionTitle}>自定义提示词（可选）</h3>
                <textarea
                  value={state.custom_prompt}
                  onChange={(e) => actions.set_custom_prompt(e.target.value)}
                  placeholder="输入自定义的优化提示词，例如：让对话更加幽默风趣，增加角色之间的互动..."
                  rows={6}
                  className={styles.customPromptTextarea}
                />
              </div>
            </>
          )}

          {state.step === 'processing' && (
            <div className={styles.processingState}>
              <div className={styles.spinner} />
              <p className={styles.processingTitle}>正在优化场景...</p>
              <p className={styles.processingProgress}>进度: {state.optimization_progress}%</p>
            </div>
          )}

          {state.step === 'result' && state.optimization_result && (
            <OptimizationResultView
              scenes={state.scenes}
              selected_scene_ids={state.selected_scene_ids}
              optimization_result={state.optimization_result}
              on_reset_scene={handle_reset_scene}
            />
          )}
        </div>

        {state.step === 'list' && (
          <div className={styles.dialogFooter}>
            <button onClick={on_close} className={styles.footerButton}>
              取消
            </button>
            <button
              onClick={handle_continue_to_configure}
              disabled={state.selected_scene_ids.size === 0}
              className={`${styles.primaryButton} ${styles.primaryButtonWithIcon} ${styles.footerButton}`}
            >
              继续
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {state.step === 'configure' && (
          <div className={styles.dialogFooter}>
            <button
              onClick={() => actions.set_step('list')}
              className={styles.footerButton}
            >
              返回
            </button>
            <button
              onClick={handle_start_optimization}
              className={`${styles.primaryButton} ${styles.primaryButtonWithIcon} ${styles.footerButton}`}
            >
              <Sparkles size={16} />
              开始优化
            </button>
          </div>
        )}

        {state.step === 'result' && (
          <div className={styles.dialogFooter}>
            <button
              onClick={() => actions.set_step('list')}
              className={styles.footerButton}
            >
              返回重新选择
            </button>
            <button
              onClick={handle_apply_all}
              className={`${styles.primaryButton} ${styles.primaryButtonWithIcon} ${styles.footerButton}`}
            >
              <Check size={16} />
              应用所有优化
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
