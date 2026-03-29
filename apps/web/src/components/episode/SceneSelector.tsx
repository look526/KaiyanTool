import { useTheme } from '../../contexts/ThemeContext';
import type { Scene } from '../../types/episode';

interface SceneSelectorProps {
  scenes: Scene[];
  selectedSceneId?: string;
  onSceneSelect: (sceneId: string) => void;
}

export function SceneSelector({ scenes, selectedSceneId, onSceneSelect }: SceneSelectorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <select
      value={selectedSceneId || ''}
      onChange={(e) => onSceneSelect(e.target.value)}
      style={{
        padding: '10px 16px',
        borderRadius: '14px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
        color: isDark ? '#fafafa' : '#18181b',
        fontSize: '14px',
        outline: 'none',
        cursor: 'pointer',
        minWidth: '200px',
      }}
    >
      <option value="">全部场景</option>
      {scenes.map(scene => (
        <option key={scene.id} value={scene.id}>
          {scene.location} ({scene.time_of_day ?? ''})
        </option>
      ))}
    </select>
  );
}
