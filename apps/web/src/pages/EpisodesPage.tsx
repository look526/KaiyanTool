import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { episodesApi, Episode } from '../core/api/modules/episodes';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBar } from '../components/ui/SearchBar';
import { Film, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { EpisodeCard } from '../components/episode/EpisodeCard';
import { EpisodeModal } from '../components/episode/EpisodeModal';
import { GlassCard } from '../components/ui/GlassCard';

export default function EpisodesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const loadEpisodes = useCallback(async () => {
    console.log('[EpisodesPage] loadEpisodes called, projectId:', projectId);
    if (!projectId) {
      console.error('[EpisodesPage] No projectId provided');
      return;
    }
    try {
      setLoading(true);
      console.log('[EpisodesPage] Calling episodesApi.getEpisodes with projectId:', projectId);
      const data = await episodesApi.getEpisodes(projectId, { search });
      console.log('[EpisodesPage] Episodes loaded:', data);
      setEpisodes(data);
    } catch (error) {
      console.error('[EpisodesPage] Failed to load episodes:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, search]);

  useEffect(() => {
    loadEpisodes();
  }, [loadEpisodes]);

  const handleCreateEpisode = () => {
    setEditingEpisode(null);
    setShowModal(true);
  };

  const handleEditEpisode = (episode: Episode) => {
    setEditingEpisode(episode);
    setShowModal(true);
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm('确定要删除这个剧集吗？这将级联删除所有关联的场景和分镜。')) return;
    try {
      await episodesApi.deleteEpisode(episodeId);
      setEpisodes(prev => prev.filter(e => e.id !== episodeId));
    } catch (error) {
      console.error('Failed to delete episode:', error);
    }
  };

  const handleEpisodeSaved = () => {
    setShowModal(false);
    loadEpisodes();
  };

  const handleEpisodeClick = (episodeId: string) => {
    navigate(`/projects/${projectId}/episodes/${episodeId}`);
  };

  return (
    <div style={getPageStyle(isDark)}>
      <div style={getDecorationStyle()} />
      
      <PageHeader
        title="分镜管理"
        subtitle="剧集 - 场景 - 分镜三层管理"
        backAction={
          <GlassButton
            variant="secondary"
            icon={<ArrowLeft style={{ width: '18px', height: '18px' }} />}
            onClick={handleBack}
          >
            返回
          </GlassButton>
        }
        action={
          <GlassButton
            variant="primary"
            icon={<Plus style={{ width: '18px', height: '18px' }} />}
            onClick={handleCreateEpisode}
          >
            新建剧集
          </GlassButton>
        }
      />

      <main style={{ padding: '32px 48px' }}>
        <SearchBar
          placeholder="搜索剧集..."
          value={search}
          onChange={setSearch}
          style={{ marginBottom: '32px' }}
        />

        {loading ? (
          <LoadingState />
        ) : episodes.length === 0 ? (
          <EmptyState onCreate={handleCreateEpisode} isDark={isDark} />
        ) : (
          <div style={getGridStyle()}>
            {episodes.map(episode => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                onClick={() => handleEpisodeClick(episode.id)}
                onEdit={() => handleEditEpisode(episode)}
                onDelete={() => handleDeleteEpisode(episode.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <EpisodeModal
          projectId={projectId!}
          episode={editingEpisode}
          onClose={() => setShowModal(false)}
          onSaved={handleEpisodeSaved}
        />
      )}
    </div>
  );
}

const getPageStyle = (isDark: boolean) => ({
  minHeight: '100vh',
  background: isDark
    ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
    : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
  position: 'relative',
  overflow: 'hidden',
});

const getDecorationStyle = () => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
  pointerEvents: 'none' as const,
});

const getGridStyle = () => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '24px',
});

const LoadingState = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
  }}>
    <Loader2 style={{
      width: '48px',
      height: '48px',
      color: '#8b5cf6',
      animation: 'spin 1s linear infinite',
    }} />
  </div>
);

interface EmptyStateProps {
  onCreate: () => void;
  isDark: boolean;
}

const EmptyState = ({ onCreate, isDark }: EmptyStateProps) => (
  <GlassCard>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      textAlign: 'center',
    }}>
      <Film style={{
        width: '64px',
        height: '64px',
        color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
        marginBottom: '24px',
      }} />
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: isDark ? '#fafafa' : '#18181b',
        marginBottom: '8px',
      }}>
        还没有剧集
      </h3>
      <p style={{
        fontSize: '14px',
        color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
        marginBottom: '24px',
      }}>
        点击"新建剧集"创建第一个剧集
      </p>
      <GlassButton
        variant="primary"
        icon={<Plus style={{ width: '18px', height: '18px' }} />}
        onClick={onCreate}
      >
        新建剧集
      </GlassButton>
    </div>
  </GlassCard>
);
