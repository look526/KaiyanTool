import { GlassCard } from '../ui/GlassCard';
import { ScriptViewer } from '../episode/ScriptViewer';
import { SceneSelector } from '../episode/SceneSelector';
import type { Scene } from '../../types/episode';

interface ScriptPanelProps {
  isDark: boolean;
  scenes: Scene[];
  selectedSceneId: string;
  scriptContent: string;
  onSceneSelect: (id: string) => void;
}

export function ScriptPanel({
  isDark,
  scenes,
  selectedSceneId,
  scriptContent,
  onSceneSelect,
}: ScriptPanelProps) {
  return (
    <GlassCard style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: isDark ? '#fafafa' : '#18181b',
          margin: 0,
        }}>
          剧本
        </h3>
        <SceneSelector
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onSceneSelect={onSceneSelect}
        />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ScriptViewer
          scriptContent={scriptContent}
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onSceneSelect={onSceneSelect}
        />
      </div>
    </GlassCard>
  );
}
