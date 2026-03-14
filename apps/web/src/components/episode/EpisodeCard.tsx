import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Edit2, Trash2 } from 'lucide-react';
import { Episode } from '../../core/api/modules/episodes';

interface EpisodeCardProps {
  episode: Episode;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EpisodeCard({ episode, onClick, onEdit, onDelete }: EpisodeCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <GlassCard
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
      hoverEffect
    >
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: isDark ? '#fafafa' : '#18181b',
              marginBottom: '4px',
            }}>
              第{episode.episode_number}集：{episode.title}
            </h3>
            {episode.description && (
              <p style={{
                fontSize: '14px',
                color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
                margin: 0,
              }}>
                {episode.description}
              </p>
            )}
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Edit2 style={{
              width: '18px',
              height: '18px',
              color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
            }} />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
          }}>
            <div style={{
              fontSize: '12px',
              color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
              marginBottom: '4px',
            }}>
              场景
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: isDark ? '#fafafa' : '#18181b',
            }}>
              {episode.scene_count || 0}
            </div>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
          }}>
            <div style={{
              fontSize: '12px',
              color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
              marginBottom: '4px',
            }}>
              分镜
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: isDark ? '#fafafa' : '#18181b',
            }}>
              {episode.shot_count || 0}
            </div>
          </div>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            gap: '8px',
            paddingTop: '16px',
            borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}
        >
          <GlassButton
            variant="secondary"
            onClick={onEdit}
            style={{ flex: 1 }}
          >
            编辑
          </GlassButton>
          <GlassButton
            variant="secondary"
            onClick={onDelete}
            style={{
              flex: 1,
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
            删除
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}
