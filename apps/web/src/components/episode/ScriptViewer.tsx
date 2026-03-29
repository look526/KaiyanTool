import { useTheme } from '../../contexts/ThemeContext';
import { Film } from 'lucide-react';
import type { Scene } from '../../types/episode';

interface ScriptViewerProps {
  scriptContent: string;
  scenes: Scene[];
  selectedSceneId?: string;
  onSceneSelect: (sceneId: string) => void;
}

export function ScriptViewer({ scriptContent, scenes, selectedSceneId, onSceneSelect }: ScriptViewerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: '20px',
    }}>
      <div style={{
        fontSize: '14px',
        lineHeight: '1.8',
        color: isDark ? '#fafafa' : '#18181b',
        whiteSpace: 'pre-wrap',
      }}>
        {scriptContent || (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
          }}>
            <Film style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
            <p>暂无剧本内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
