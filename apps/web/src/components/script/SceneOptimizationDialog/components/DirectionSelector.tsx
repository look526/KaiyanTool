import React from 'react';
import { Zap, Users, MessageSquare, FileText, Sparkles, Star, Wand2, Target, Bookmark } from 'lucide-react';
import { Button } from '../../../ui/button';
import { OptimizationDirection, OptimizationTemplate } from '../types';
import styles from '../SceneOptimizationDialog.module.css';

export interface DirectionConfig {
  label: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
  bg_gradient: string;
}

export interface DirectionSelectorProps {
  direction: OptimizationDirection;
  on_direction_change: (direction: OptimizationDirection) => void;
  templates: OptimizationTemplate[];
  show_template_menu: boolean;
  on_template_toggle: () => void;
  on_template_apply: (template: OptimizationTemplate) => void;
}

const OPTIMIZATION_DIRECTIONS: Record<OptimizationDirection, DirectionConfig> = {
  plot_pacing: {
    label: '剧情节奏',
    icon: Zap,
    description: '优化场景节奏，增强紧张感',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    bg_gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
  },
  character_development: {
    label: '角色塑造',
    icon: Users,
    description: '深化角色性格，增强立体感',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    bg_gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 100%)',
  },
  dialogue_quality: {
    label: '对话质量',
    icon: MessageSquare,
    description: '提升对话自然度和表现力',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    bg_gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)',
  },
  scene_description: {
    label: '场景描述',
    icon: FileText,
    description: '丰富场景细节，增强画面感',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    bg_gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',
  },
  conflict_design: {
    label: '冲突设计',
    icon: Sparkles,
    description: '强化戏剧冲突，提升张力',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    bg_gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)',
  },
  emotional_depth: {
    label: '情感深度',
    icon: Star,
    description: '增强情感表达，触动观众',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    bg_gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%)',
  },
  visual_imagery: {
    label: '视觉意象',
    icon: Wand2,
    description: '增强视觉表现力和画面感',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    bg_gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.08) 100%)',
  },
};

export function DirectionSelector({
  direction,
  on_direction_change,
  templates,
  show_template_menu,
  on_template_toggle,
  on_template_apply,
}: DirectionSelectorProps) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <Target />
          <h3 className={styles.sectionHeaderTitle}>优化方向</h3>
        </div>
        <div style={{ position: 'relative' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={on_template_toggle}
            icon={<Bookmark className={styles.icon} />}
          >
            模板
          </Button>
          {show_template_menu && templates.length > 0 && (
            <div className={styles.templateMenu}>
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => on_template_apply(template)}
                  className={styles.templateMenuItem}
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.directionGrid}>
        {Object.entries(OPTIMIZATION_DIRECTIONS).map(([key, config]) => {
          const Icon = config.icon;
          const is_active = direction === key;

          return (
            <button
              key={key}
              onClick={() => on_direction_change(key as OptimizationDirection)}
              className={`${styles.directionCard} ${is_active ? styles.active : ''}`}
              style={{
                background: is_active ? config.bg_gradient : 'var(--bg-surface)',
                borderColor: is_active ? config.gradient.split(' ')[0] : 'var(--border-primary)',
              }}
            >
              {is_active && (
                <div
                  className={styles.directionCardActiveBar}
                  style={{ background: config.gradient }}
                />
              )}
              <div className={styles.directionCardTop}>
                <div
                  className={`${styles.directionCardIcon} ${is_active ? styles.active : ''}`}
                  style={{ background: is_active ? config.gradient : 'var(--bg-hover)' }}
                >
                  <Icon className={styles.icon} />
                </div>
                <span className={styles.directionCardLabel}>{config.label}</span>
              </div>
              <p className={styles.directionCardDescription}>{config.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
