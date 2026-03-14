import { useTheme } from '../../contexts/ThemeContext';
import { GlassButton } from '../ui/GlassButton';

export interface Shot {
  id: string;
  shot_number: number;
  episode_id: string;
  scene_id: string | null;
  description: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  aspect_ratio: string;
  resolution: string;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ShotItemProps {
  shot: Shot;
  onUpdate: () => void;
}

export function ShotItem({ shot, onUpdate }: ShotItemProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'generating': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'generating': return '生成中';
      default: return '待生成';
    }
  };

  return (
    <div style={{
      padding: '20px',
      borderRadius: '18px',
      background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
      transition: 'all 0.25s ease',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isDark ? '#fafafa' : '#18181b',
          }}>
            分镜 #{shot.shot_number || 1}
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: `${getStatusColor(shot.status)}20`,
            color: getStatusColor(shot.status),
          }}>
            {getStatusLabel(shot.status)}
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <span style={{
            fontSize: '12px',
            color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
          }}>
            {shot.aspect_ratio} · {shot.resolution}
          </span>
        </div>
      </div>
      <p style={{
        fontSize: '14px',
        color: isDark ? 'rgba(250, 250, 250, 0.8)' : 'rgba(24, 24, 27, 0.8)',
        marginBottom: '16px',
        lineHeight: 1.6,
      }}>
        {shot.description}
      </p>
      <div style={{
        display: 'flex',
        gap: '8px',
      }}>
        <GlassButton variant="secondary" style={{ flex: 1 }}>
          编辑
        </GlassButton>
        <GlassButton variant="primary" style={{ flex: 1 }}>
          生成
        </GlassButton>
      </div>
    </div>
  );
}
