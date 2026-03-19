import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { episodesApi, scenesApi, shotsApi } from '../core/api/modules';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Loader2, Film, CheckSquare, Square, Trash2 } from 'lucide-react';
import type { Episode, Scene } from '../types/episode';
import type { Shot } from '../components/episode/ShotItem';
import { VoiceProfilePanel } from '../components/ai/VoiceProfilePanel';
import { apiClient } from '../lib/api-client';

export default function EpisodeDetailPage() {
  const { id: projectId, episodeId } = useParams<{ id: string; episodeId: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [ttsProviderId, setTtsProviderId] = useState<string>('')
  const [batchTtsLoading, setBatchTtsLoading] = useState(false)

  const loadEpisodeData = useCallback(async () => {
    if (!episodeId) return;
    try {
      setLoading(true);
      const [episodeData, shotsData] = await Promise.all([
        episodesApi.getEpisode(episodeId),
        shotsApi.getShots(episodeId),
      ]);
      setEpisode(episodeData);
      setShots(shotsData);
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

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === shots.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(shots.map(s => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBatchDeleteLoading(true);
      for (const id of selectedIds) {
        await shotsApi.deleteShot(id);
      }
      setShots(shots.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete shots:', error);
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  const handleBatchSynthesizeTTS = async () => {
    if (!episodeId || !projectId || !ttsProviderId) return
    try {
      setBatchTtsLoading(true)
      await apiClient.batchSynthesizeTTS(projectId, {
        episode_id: episodeId,
        provider_id: ttsProviderId,
      })
      await loadEpisodeData()
    } catch (error) {
      console.error('批量配音失败:', error)
    } finally {
      setBatchTtsLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
      }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      <StandardPageHeader
        title={episode?.title || '分镜详情'}
        subtitle={`第${episode?.episode_number}集 · 共 ${shots.length} 个分镜`}
        icon={<Film style={{ width: '24px', height: '24px', color: 'white' }} />}
        iconGradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
        iconShadow="0 4px 14px rgba(139, 92, 246, 0.3)"
        actions={
          <>
            {shots.length > 0 && (
              <>
                <button
                  onClick={selectAll}
                  style={{
                    height: '40px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  {selectedIds.size === shots.length ? <Square style={{ width: '16px', height: '16px' }} /> : <CheckSquare style={{ width: '16px', height: '16px' }} />}
                  {selectedIds.size > 0 ? `${selectedIds.size}/${shots.length}` : '全选'}
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={batchDeleteLoading}
                    style={{
                      height: '40px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {batchDeleteLoading ? (
                      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    )}
                    {batchDeleteLoading ? '删除中...' : `删除 (${selectedIds.size})`}
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleCreateShot}
              style={{
                height: '44px',
                padding: '0 20px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.3)';
              }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              新建分镜
            </button>
            {ttsProviderId && (
              <button
                onClick={handleBatchSynthesizeTTS}
                disabled={batchTtsLoading}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  border: 'none',
                  cursor: batchTtsLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.25s ease',
                }}
              >
                {batchTtsLoading ? '生成配音中...' : '生成配音'}
              </button>
            )}
          </>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          <VoiceProfilePanel project_id={projectId!} onProviderChange={setTtsProviderId} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Film style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>总分镜</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>{shots.length}</div>
          </div>
        </div>

          {shots.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            padding: '64px 32px',
            border: '1px solid var(--border-primary)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Film style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
              暂无分镜
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              点击右上角添加您的第一个分镜
            </p>
            <button
              onClick={handleCreateShot}
              style={{
                padding: '12px 24px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.3)';
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              添加分镜
            </button>
          </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              {shots.map((shot) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  isSelected={selectedIds.has(shot.id)}
                  onSelect={toggleSelect}
                  onUpdate={loadEpisodeData}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ShotCard({
  shot,
  isSelected,
  onSelect,
  onUpdate,
}: {
  shot: Shot;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: () => void;
}) {
  return (
    <div style={{
      background: isSelected
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.06) 100%)'
        : 'var(--bg-card)',
      borderRadius: '16px',
      padding: '20px',
      border: isSelected
        ? '2px solid #8b5cf6'
        : '1px solid var(--border-primary)',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }}
      onClick={() => onSelect(shot.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(shot.id);
          }}
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            border: isSelected ? 'none' : '2px solid var(--border-secondary)',
            background: isSelected ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 6px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {shot.description || '分镜'}
          </h4>
          {shot.aspect_ratio && (
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {shot.aspect_ratio} · {shot.resolution || '1080p'}
            </p>
          )}
          {shot.audio_url && (
            <div style={{ marginTop: '10px' }}>
              <audio
                controls
                src={shot.audio_url}
                style={{ width: '100%' }}
              />
              {typeof shot.audio_duration === 'number' && (
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                  音频时长：{(shot.audio_duration / 1000).toFixed(2)}s
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
