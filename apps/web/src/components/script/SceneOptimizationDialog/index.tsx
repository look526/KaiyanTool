import React, { useEffect } from 'react';
import { X, Sparkles, Layers, ChevronRight, Settings2, ArrowRight, RotateCcw, Check, Bookmark, AlertCircle } from 'lucide-react';
import { ParsedScene } from '../../../utils/SceneParser';
import { Button } from '../../ui/button';
import { use_optimization_state, use_scene_selection } from './hooks/use_optimization_state';
import { use_optimization_actions } from './hooks/use_optimization_actions';
import { StepIndicator } from './components/StepIndicator';
import { SceneSelector } from './components/SceneSelector';
import { DirectionSelector } from './components/DirectionSelector';
import { IntensitySelector } from './components/IntensitySelector';
import { CustomPrompt } from './components/CustomPrompt';
import { StylePreferenceSelector, STYLE_PREFERENCES } from './components/StylePreferenceSelector';
import { LoadingState } from './components/LoadingState';
import { OptimizationResultView } from './components/OptimizationResultView';
import { OptimizationTemplate } from './types';
import styles from './SceneOptimizationDialog.module.css';

export interface SceneOptimizationDialogProps {
  is_open: boolean;
  on_close: () => void;
  scenes: ParsedScene[];
  selected_scene_ids: string[];
  on_scene_select: (scene_ids: string[]) => void;
  on_optimize: (params: {
    scene_ids: string[];
    direction: string;
    custom_prompt: string;
    intensity: string;
    style_preference?: string;
  }) => Promise<any[]>;
  on_apply_optimization: (results: any[]) => void;
  templates: OptimizationTemplate[];
  on_save_template: (template: Omit<OptimizationTemplate, 'id' | 'created_at'>) => void;
}

export function SceneOptimizationDialog({
  is_open,
  on_close,
  scenes,
  selected_scene_ids,
  on_scene_select,
  on_optimize,
  on_apply_optimization,
  templates,
  on_save_template,
}: SceneOptimizationDialogProps) {
  const { state, actions } = use_optimization_state();

  const {
    selected_scenes,
    total_word_count,
    handle_scene_toggle,
    handle_select_all,
    handle_clear_selection,
  } = use_scene_selection(scenes, selected_scene_ids, on_scene_select);

  const {
    handle_start_optimize,
    handle_apply_all,
    handle_save_as_template,
    handle_apply_template,
    handle_copy_result,
    handle_retry,
  } = use_optimization_actions(state, actions, {
    selected_scene_ids,
    on_optimize,
    on_apply_optimization,
    templates,
    on_save_template,
    on_close,
  });

  useEffect(() => {
    if (is_open) {
      actions.reset();
    }
  }, [is_open, actions]);

  useEffect(() => {
    const handle_key_down = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O' && is_open) {
        e.preventDefault();
        if (state.step === 'select' && selected_scene_ids.length > 0) {
          actions.set_step('configure');
        }
      }
      if (e.key === 'Escape' && is_open) {
        on_close();
      }
    };

    window.addEventListener('keydown', handle_key_down);
    return () => window.removeEventListener('keydown', handle_key_down);
  }, [is_open, state.step, selected_scene_ids, on_close, actions]);

  if (!is_open) return null;

  return (
    <div className={styles.sceneOptimizationDialog}>
      <div className={styles.dialogContainer}>
        <div className={styles.dialogHeader}>
          <div className={styles.headerTop}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                <Sparkles />
              </div>
              <div>
                <h2 className={styles.headerTitle}>场景优化</h2>
                <p className={styles.headerSubtitle}>AI 智能优化您的剧本场景</p>
              </div>
            </div>
            <Button variant="ghost" size="default" onClick={on_close} icon={<X className={styles.icon} />} />
          </div>

          <StepIndicator current_step={state.step} />
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.sidebar}>
            <SceneSelector
              scenes={scenes}
              selected_scene_ids={selected_scene_ids}
              selected_scenes={selected_scenes}
              total_word_count={total_word_count}
              hovered_scene={state.hovered_scene}
              on_scene_toggle={handle_scene_toggle}
              on_select_all={handle_select_all}
              on_clear_selection={handle_clear_selection}
              on_scene_hover={actions.set_hovered_scene}
            />
          </div>

          <div className={styles.mainContent}>
            {state.step === 'select' && (
              <div className={styles.selectStep}>
                <div className={styles.selectStepIcon}>
                  <Layers />
                </div>
                <h3 className={styles.selectStepTitle}>选择要优化的场景</h3>
                <p className={styles.selectStepDescription}>
                  从左侧列表中选择最多 5 个场景进行优化<br />支持批量处理，提升创作效率
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={selected_scene_ids.length === 0}
                  onClick={() => actions.set_step('configure')}
                  icon={<ArrowRight className={styles.icon} />}
                  icon_position="right"
                >
                  下一步：配置优化选项
                </Button>
              </div>
            )}

            {state.step === 'configure' && (
              <div className={styles.configureStep}>
                <DirectionSelector
                  direction={state.direction}
                  on_direction_change={actions.set_direction}
                  templates={templates}
                  show_template_menu={state.show_template_menu}
                  on_template_toggle={actions.toggle_template_menu}
                  on_template_apply={handle_apply_template}
                />

                <CustomPrompt
                  value={state.custom_prompt}
                  on_change={actions.set_custom_prompt}
                  max_length={500}
                />

                <Button
                  variant="ghost"
                  size="default"
                  onClick={actions.toggle_advanced}
                  icon={<Settings2 className={styles.icon} />}
                  icon_position="left"
                  className={styles.advancedOptionsToggle}
                >
                  高级选项
                  <ChevronRight
                    className={styles.icon}
                    style={{
                      transform: state.show_advanced ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      marginLeft: '8px',
                    }}
                  />
                </Button>

                {state.show_advanced && (
                  <div className={styles.advancedOptions}>
                    <div className={styles.advancedSection}>
                      <IntensitySelector
                        intensity={state.intensity}
                        on_intensity_change={actions.set_intensity}
                      />
                    </div>

                    <div className={styles.advancedSection}>
                      <StylePreferenceSelector
                        preferences={STYLE_PREFERENCES}
                        selected_preference={state.style_preference}
                        on_preference_select={actions.set_style_preference}
                      />
                    </div>
                  </div>
                )}

                {state.error && (
                  <div className={styles.errorBanner}>
                    <AlertCircle />
                    <span className={styles.errorBannerText}>{state.error}</span>
                  </div>
                )}
              </div>
            )}

            {state.step === 'processing' && (
              <LoadingState scene_count={selected_scenes.length} />
            )}

            {state.step === 'result' && state.results.length > 0 && (
              <OptimizationResultView
                results={state.results}
                active_index={state.active_result_index}
                on_index_change={actions.set_active_result_index}
                on_copy={handle_copy_result}
              />
            )}
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <div className={styles.footerLeft}>
            {state.step === 'configure' && (
              <>
                <Button variant="secondary" size="default" onClick={() => actions.set_step('select')}>
                  返回
                </Button>
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handle_save_as_template}
                  icon={<Bookmark className={styles.icon} />}
                >
                  保存为模板
                </Button>
              </>
            )}
            {state.step === 'result' && (
              <Button
                variant="secondary"
                size="default"
                onClick={handle_retry}
                icon={<RotateCcw className={styles.icon} />}
              >
                重新生成
              </Button>
            )}
          </div>

          <div className={styles.footerRight}>
            <Button variant="ghost" size="default" onClick={on_close}>
              取消
            </Button>
            {state.step === 'configure' && (
              <Button
                variant="primary"
                size="lg"
                disabled={selected_scene_ids.length === 0}
                onClick={handle_start_optimize}
                icon={<Sparkles className={styles.icon} />}
              >
                获取 AI 建议
              </Button>
            )}
            {state.step === 'result' && (
              <Button
                variant="success"
                size="lg"
                onClick={handle_apply_all}
                icon={<Check className={styles.icon} />}
              >
                应用全部优化
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
