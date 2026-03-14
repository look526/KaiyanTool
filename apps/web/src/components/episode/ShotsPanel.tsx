import { Film } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ShotItem, type Shot } from '../episode/ShotItem';

interface ShotsPanelProps {
  isDark: boolean;
  shots: Shot[];
  onUpdate: () => void;
}

export function ShotsPanel({ isDark, shots, onUpdate }: ShotsPanelProps) {
  return (
    <GlassCard style={{
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: isDark ? '#fafafa' : '#18181b',
          margin: 0,
        }}>
          分镜列表 ({shots.length})
        </h3>
      </div>
      <div style={{
        padding: '20px',
        display: 'grid',
        gap: '16px',
      }}>
        {shots.length === 0 ? (
          <EmptyState isDark />
        ) : (
          shots.map(shot => (
            <ShotItem key={shot.id} shot={shot} onUpdate={onUpdate} />
          ))
        )}
      </div>
    </GlassCard>
  );
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
    }}>
      <Film style={{
        width: '48px',
        height: '48px',
        color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
        marginBottom: '16px',
      }} />
      <p style={{
        fontSize: '14px',
        color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
      }}>
        暂无分镜，点击右上角创建
      </p>
    </div>
  );
}
