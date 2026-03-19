import type { CSSProperties, ReactNode } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { episodesApi, Episode } from '../core/api/modules/episodes';
import { GlassButton } from '../components/ui/GlassButton';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { Film, Plus, Loader2, ArrowLeft, Rows3, Clapperboard, Search } from 'lucide-react';
import { EpisodeCard } from '../components/episode/EpisodeCard';
import { EpisodeModal } from '../components/episode/EpisodeModal';

/**
 * @description 分镜管理页，使用工作台式表格布局展示剧集列表。
 */
export default function EpisodesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  const loadEpisodes = useCallback(async () => {
    if (!projectId) {
      return;
    }

    try {
      setLoading(true);
      const data = await episodesApi.getEpisodes(projectId, { search });
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

  const summary = useMemo(() => {
    return episodes.reduce(
      (acc, episode) => ({
        totalEpisodes: acc.totalEpisodes + 1,
        totalScenes: acc.totalScenes + (episode.scene_count || 0),
        totalShots: acc.totalShots + (episode.shot_count || 0),
        totalGenerated: acc.totalGenerated + (episode.generated_count || 0),
        totalPending: acc.totalPending + (episode.pending_count || 0),
      }),
      {
        totalEpisodes: 0,
        totalScenes: 0,
        totalShots: 0,
        totalGenerated: 0,
        totalPending: 0,
      }
    );
  }, [episodes]);

  const handleCreateEpisode = () => {
    setEditingEpisode(null);
    setShowModal(true);
  };

  const handleEditEpisode = (episode: Episode) => {
    setEditingEpisode(episode);
    setShowModal(true);
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm('确定要删除这个剧集吗？这将级联删除所有关联的场景和分镜。')) {
      return;
    }

    try {
      await episodesApi.deleteEpisode(episodeId);
      setEpisodes(prev => prev.filter(item => item.id !== episodeId));
    } catch (error) {
      console.error('[EpisodesPage] Failed to delete episode:', error);
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
    <div style={pageStyle}>
      <StandardPageHeader
        title="分镜管理"
        subtitle="以剧集为单位管理场景和分镜，适合长项目批量运营。"
        icon={<Film style={{ width: '22px', height: '22px', color: '#fff' }} />}
        iconGradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
        iconShadow="0 8px 24px rgba(139, 92, 246, 0.28)"
        actions={
          <>
            <GlassButton
              variant="secondary"
              icon={<ArrowLeft style={{ width: '16px', height: '16px' }} />}
              isDark={false}
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              返回项目
            </GlassButton>
            <GlassButton
              variant="primary"
              icon={<Plus style={{ width: '16px', height: '16px' }} />}
              isDark={false}
              onClick={handleCreateEpisode}
            >
              新建剧集
            </GlassButton>
          </>
        }
      />

      <main style={mainStyle}>
        <section style={summaryGridStyle}>
          <SummaryCard
            title="剧集总数"
            value={summary.totalEpisodes}
            hint="当前项目的分集数量"
            icon={<Rows3 style={{ width: '18px', height: '18px' }} />}
          />
          <SummaryCard
            title="场景总数"
            value={summary.totalScenes}
            hint="已关联到各剧集的场景"
            icon={<Film style={{ width: '18px', height: '18px' }} />}
          />
          <SummaryCard
            title="分镜总数"
            value={summary.totalShots}
            hint="项目当前累计分镜条目"
            icon={<Clapperboard style={{ width: '18px', height: '18px' }} />}
          />
        </section>

        <section style={panelStyle}>
          <div style={toolbarStyle}>
            <div style={searchWrapStyle}>
              <Search style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索剧集标题或描述..."
                style={searchInputStyle}
              />
            </div>

            <div style={toolbarMetaStyle}>
              <span style={metaBadgeStyle}>
                共 {episodes.length} 个剧集
              </span>
              <span style={metaBadgeStyle}>
                已生成 {summary.totalGenerated} 条
              </span>
              <span style={metaBadgeStyle}>
                待处理 {summary.totalPending} 条
              </span>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : episodes.length === 0 ? (
            <EmptyState onCreate={handleCreateEpisode} />
          ) : (
            <div style={tableShellStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>集数</th>
                    <th style={headerCellStyle}>标题</th>
                    <th style={headerCellStyle}>描述</th>
                    <th style={headerCellRightStyle}>场景</th>
                    <th style={headerCellRightStyle}>分镜</th>
                    <th style={headerCellStyle}>更新时间</th>
                    <th style={headerCellRightStyle}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {episodes.map(episode => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                      onClick={() => handleEpisodeClick(episode.id)}
                      onEdit={() => handleEditEpisode(episode)}
                      onDelete={() => handleDeleteEpisode(episode.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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

/**
 * @description 工作台顶部统计卡。
 */
function SummaryCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: number;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryIconStyle}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={summaryTitleStyle}>{title}</div>
        <div style={summaryValueStyle}>{value}</div>
        <div style={summaryHintStyle}>{hint}</div>
      </div>
    </div>
  );
}

/**
 * @description 加载中的表格骨架状态。
 */
function LoadingState() {
  return (
    <div style={loadingStyle}>
      <Loader2 style={{ width: '36px', height: '36px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>正在加载剧集数据...</span>
    </div>
  );
}

/**
 * @description 空状态占位。
 */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={emptyStateStyle}>
      <div style={emptyIconStyle}>
        <Rows3 style={{ width: '28px', height: '28px', color: 'var(--accent)' }} />
      </div>
      <h3 style={emptyTitleStyle}>还没有剧集数据</h3>
      <p style={emptyDescStyle}>先创建剧集，再逐层进入场景和分镜的生产管理。</p>
      <GlassButton
        variant="primary"
        icon={<Plus style={{ width: '16px', height: '16px' }} />}
        isDark={false}
        onClick={onCreate}
      >
        新建剧集
      </GlassButton>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg-page)',
};

const mainStyle: CSSProperties = {
  maxWidth: '1440px',
  margin: '0 auto',
  padding: '24px',
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  marginBottom: '20px',
};

const summaryCardStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '14px',
  padding: '18px 20px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-sm)',
};

const summaryIconStyle: CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(139, 92, 246, 0.12)',
  color: 'var(--accent)',
  flexShrink: 0,
};

const summaryTitleStyle: CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  marginBottom: '8px',
};

const summaryValueStyle: CSSProperties = {
  fontSize: '28px',
  lineHeight: 1,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: '8px',
};

const summaryHintStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
};

const panelStyle: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-md)',
  overflow: 'hidden',
};

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '18px 20px',
  borderBottom: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
};

const searchWrapStyle: CSSProperties = {
  flex: 1,
  maxWidth: '520px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0 14px',
  height: '44px',
  borderRadius: '12px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-card)',
};

const searchInputStyle: CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '14px',
};

const toolbarMetaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const metaBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-secondary)',
  fontSize: '13px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

const tableShellStyle: CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '980px',
};

const headerCellStyle: CSSProperties = {
  padding: '14px 20px',
  textAlign: 'left',
  fontSize: '12px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
  whiteSpace: 'nowrap',
};

const headerCellRightStyle: CSSProperties = {
  ...headerCellStyle,
  textAlign: 'right',
};

const loadingStyle: CSSProperties = {
  minHeight: '320px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
};

const emptyStateStyle: CSSProperties = {
  minHeight: '320px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '32px',
};

const emptyIconStyle: CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(139, 92, 246, 0.12)',
  marginBottom: '18px',
};

const emptyTitleStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const emptyDescStyle: CSSProperties = {
  margin: '0 0 20px',
  fontSize: '14px',
  color: 'var(--text-secondary)',
};
