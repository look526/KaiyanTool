import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { episodesApi, scenesApi, shotsApi } from '../core/api/modules';
import { ScriptPanel } from '../components/episode/ScriptPanel';
import { ShotsPanel } from '../components/episode/ShotsPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Loader2 } from 'lucide-react';
import type { Episode, Scene } from '../types/episode';
import type { Shot } from '../components/episode/ShotItem';

export default function EpisodeDetailPage() {
  const { id: projectId, episodeId } = useParams<{ id: string; episodeId: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const [scriptContent, setScriptContent] = useState('');

  const loadEpisodeData = useCallback(async () => {
    if (!episodeId) return;
    try {
      setLoading(true);
      const [episodeData, scenesData, shotsData] = await Promise.all([
        episodesApi.getEpisode(episodeId),
        scenesApi.getScenes(episodeId),
        shotsApi.getShots(episodeId),
      ]);
      setEpisode(episodeData);
      setScenes(scenesData);
      setShots(shotsData);
      if (episodeData.Script) {
        setScriptContent(episodeData.Script.content);
      }
    } catch (error) {
      console.error('Failed to load episode data:', error);
    } finally {
      setLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    loadEpisodeData();
  }, [loadEpisodeData]);

  const handleCreateShot = async () => {
    if (!episodeId) return;
    try {
      const newShot = await shotsApi.createShot(episodeId, {
        description: '新分镜',
        aspect_ratio: '16:9',
        resolution: '1080p',
      });
      setShots(prev => [...prev, newShot]);
    } catch (error) {
      console.error('Failed to create shot:', error);
    }
  };

  const filteredShots = selectedSceneId
    ? shots.filter(shot => shot.scene_id === selectedSceneId)
    : shots;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div style={getPageStyle(isDark)}>
      <DecorationOverlay />
      <PageHeader
        title={episode?.title || '分镜详情'}
        subtitle={`第${episode?.episode_number}集`}
        action={
          <GlassButton
            variant="primary"
            icon={<Plus style={{ width: '18px', height: '18px' }} />}
            onClick={handleCreateShot}
          >
            新建分镜
          </GlassButton>
        }
      />
      <MainContent
        isDark={isDark}
        scenes={scenes}
        shots={filteredShots}
        selectedSceneId={selectedSceneId}
        scriptContent={scriptContent}
        onSceneSelect={setSelectedSceneId}
        onUpdate={loadEpisodeData}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <Loader2 style={{
        width: '48px',
        height: '48px',
        color: '#8b5cf6',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  );
}

function DecorationOverlay() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
      pointerEvents: 'none',
    }} />
  );
}

function MainContent({
  isDark,
  scenes,
  shots,
  selectedSceneId,
  scriptContent,
  onSceneSelect,
  onUpdate,
}: {
  isDark: boolean;
  scenes: Scene[];
  shots: Shot[];
  selectedSceneId: string;
  scriptContent: string;
  onSceneSelect: (id: string) => void;
  onUpdate: () => void;
}) {
  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: '30% 70%',
      gap: '24px',
      padding: '24px 48px',
      height: 'calc(100vh - 140px)',
    }}>
      <ScriptPanel
        isDark={isDark}
        scenes={scenes}
        selectedSceneId={selectedSceneId}
        scriptContent={scriptContent}
        onSceneSelect={onSceneSelect}
      />
      <ShotsPanel
        isDark={isDark}
        shots={shots}
        onUpdate={onUpdate}
      />
    </main>
  );
}

function getPageStyle(isDark: boolean) {
  return {
    minHeight: '100vh',
    background: isDark
      ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
      : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };
}
