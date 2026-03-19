import type { CSSProperties, ReactNode } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { episodesApi, shotsApi } from '../core/api/modules';
import { charactersApi, type Character } from '../core/api/modules/characters';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { ShotNineGridWorkbench } from '../components/episode/ShotNineGridWorkbench';
import { ImageSelector } from '../components/ImageSelector';
import { Loader2, Film, CheckSquare, Square, Trash2, Save, Image, Clapperboard, FileText, Plus, User } from 'lucide-react';
import type { Episode } from '../types/episode';
import type { Shot, UpdateShotInput } from '../core/api/modules/shots/shots-api';
import {
  getShotDisplayNumber,
  getShotStatus,
  getShotStatusBackgroundColor,
  getShotStatusBorderColor,
  getShotStatusColor,
  getShotStatusLabel,
} from '../lib/shotUtils';

interface ShotEditorState {
  character_id: string | null;
  action_summary: string;
  camera_movement: string;
  start_prompt: string;
  end_prompt: string;
  start_image_url: string | null;
  end_image_url: string | null;
  visual_style: string;
}

/**
 * @description 分镜详情工作台，提供列表浏览、描述编辑与素材引用能力。
 */
export default function EpisodeDetailPage() {
  const { projectId, episodeId } = useParams<{ projectId: string; episodeId: string }>();

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [savingShot, setSavingShot] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editorState, setEditorState] = useState<ShotEditorState>({
    character_id: null,
    action_summary: '',
    camera_movement: '',
    start_prompt: '',
    end_prompt: '',
    start_image_url: null,
    end_image_url: null,
    visual_style: '',
  });

  const loadEpisodeData = useCallback(async () => {
    if (!episodeId || !projectId) {
      return;
    }

    try {
      setLoading(true);
      const [episodeData, shotsData, charactersData] = await Promise.all([
        episodesApi.getEpisode(episodeId),
        shotsApi.getShots(episodeId),
        charactersApi.getCharacters(projectId),
      ]);
      setEpisode(episodeData);
      setShots(shotsData);
      setCharacters(charactersData);
    } catch (error) {
      console.error('Failed to load episode data:', error);
    } finally {
      setLoading(false);
    }
  }, [episodeId, projectId]);

  useEffect(() => {
    loadEpisodeData();
  }, [loadEpisodeData]);

  useEffect(() => {
    if (shots.length === 0) {
      setActiveShotId(null);
      return;
    }

    if (!activeShotId || !shots.some(shot => shot.id === activeShotId)) {
      setActiveShotId(shots[0].id);
    }
  }, [shots, activeShotId]);

  const activeShot = useMemo(
    () => shots.find(shot => shot.id === activeShotId) || null,
    [shots, activeShotId]
  );

  useEffect(() => {
    if (!activeShot) {
      return;
    }

    setEditorState({
      character_id: activeShot.character_id || null,
      action_summary: activeShot.action_summary || activeShot.description || '',
      camera_movement: activeShot.camera_movement || '',
      start_prompt: activeShot.start_prompt || '',
      end_prompt: activeShot.end_prompt || '',
      start_image_url: activeShot.start_image_url || null,
      end_image_url: activeShot.end_image_url || null,
      visual_style: activeShot.visual_style || '',
    });
    setSaveMessage('');
  }, [activeShotId, activeShot]);

  const stats = useMemo(() => {
    return shots.reduce(
      (acc, shot) => {
        const shotStatus = getShotStatus(shot as any);
        return {
          total: acc.total + 1,
          withMaterial: acc.withMaterial + (shot.start_image_url || shot.end_image_url ? 1 : 0),
          withVideo: acc.withVideo + (shot.video_url ? 1 : 0),
          completed: acc.completed + (shotStatus.isComplete ? 1 : 0),
        };
      },
      { total: 0, withMaterial: 0, withVideo: 0, completed: 0 }
    );
  }, [shots]);

  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === editorState.character_id) || null,
    [characters, editorState.character_id]
  );

  const handleCreateShot = async () => {
    if (!episodeId) {
      return;
    }

    try {
      const newShot = await shotsApi.createShot(episodeId, {
        description: '请填写镜头描述',
        aspect_ratio: '16:9',
        resolution: '1080p',
      });
      setShots(prev => [...prev, newShot]);
      setActiveShotId(newShot.id);
    } catch (error) {
      console.error('Failed to create shot:', error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === shots.length) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(shots.map(shot => shot.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    try {
      setBatchDeleteLoading(true);
      for (const id of selectedIds) {
        await shotsApi.deleteShot(id);
      }
      setShots(prev => prev.filter(shot => !selectedIds.has(shot.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete shots:', error);
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  const handleSaveShot = async () => {
    if (!activeShot) {
      return;
    }

    try {
      setSavingShot(true);
      setSaveMessage('');

      const input: UpdateShotInput = {
        character_id: editorState.character_id || null,
        action_summary: editorState.action_summary.trim() || '未填写镜头描述',
        camera_movement: editorState.camera_movement.trim() || undefined,
        start_prompt: editorState.start_prompt.trim() || undefined,
        end_prompt: editorState.end_prompt.trim() || undefined,
        start_image_url: editorState.start_image_url,
        end_image_url: editorState.end_image_url,
        visual_style: editorState.visual_style.trim() || undefined,
        aspect_ratio: activeShot.aspect_ratio,
        resolution: activeShot.resolution,
        duration: activeShot.duration,
      };

      const updatedShot = await shotsApi.updateShot(activeShot.id, input);
      setShots(prev => prev.map(shot => (shot.id === updatedShot.id ? updatedShot : shot)));
      setSaveMessage('已保存');
    } catch (error) {
      console.error('Failed to save shot:', error);
      setSaveMessage('保存失败，请稍后重试');
    } finally {
      setSavingShot(false);
    }
  };

  const handleEditorChange = <K extends keyof ShotEditorState>(key: K, value: ShotEditorState[K]) => {
    setEditorState(prev => ({ ...prev, [key]: value }));
    setSaveMessage('');
  };

  const handleApplyPanelImage = (target: 'start' | 'end', imageUrl: string) => {
    handleEditorChange(target === 'start' ? 'start_image_url' : 'end_image_url', imageUrl);
    setSaveMessage(target === 'start' ? '已回填九宫格到开始帧，请保存分镜' : '已回填九宫格到结束帧，请保存分镜');
  };

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <StandardPageHeader
        title={episode?.title || '分镜详情'}
        subtitle={`第${episode?.episode_number}集 · 共 ${shots.length} 个分镜`}
        icon={<Film style={{ width: '24px', height: '24px', color: '#ffffff' }} />}
        iconGradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
        iconShadow="0 4px 14px rgba(139, 92, 246, 0.3)"
        actions={
          <>
            {shots.length > 0 && (
              <>
                <GlassButton
                  variant="secondary"
                  icon={selectedIds.size === shots.length ? <Square style={{ width: '16px', height: '16px' }} /> : <CheckSquare style={{ width: '16px', height: '16px' }} />}
                  isDark={false}
                  onClick={selectAll}
                >
                  {selectedIds.size > 0 ? `${selectedIds.size}/${shots.length}` : '全选'}
                </GlassButton>
                {selectedIds.size > 0 && (
                  <GlassButton
                    variant="danger"
                    icon={batchDeleteLoading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Trash2 style={{ width: '16px', height: '16px' }} />}
                    isDark={false}
                    loading={batchDeleteLoading}
                    onClick={handleBulkDelete}
                  >
                    删除 ({selectedIds.size})
                  </GlassButton>
                )}
              </>
            )}
            <GlassButton
              variant="primary"
              icon={<Plus style={{ width: '18px', height: '18px' }} />}
              isDark={false}
              onClick={handleCreateShot}
            >
              新建分镜
            </GlassButton>
          </>
        }
      />

      <main style={mainStyle}>
        <section style={statsGridStyle}>
          <StatCard title="总分镜" value={stats.total} icon={<Film style={{ width: '18px', height: '18px' }} />} />
          <StatCard title="已挂素材" value={stats.withMaterial} icon={<Image style={{ width: '18px', height: '18px' }} />} />
          <StatCard title="已有视频" value={stats.withVideo} icon={<Clapperboard style={{ width: '18px', height: '18px' }} />} />
          <StatCard title="完整成片" value={stats.completed} icon={<Save style={{ width: '18px', height: '18px' }} />} />
        </section>

        {shots.length === 0 ? (
          <EmptyState onCreate={handleCreateShot} />
        ) : (
          <section style={workbenchStyle}>
            <div style={listPanelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <h3 style={panelTitleStyle}>分镜列表</h3>
                  <p style={panelSubtitleStyle}>点击左侧分镜，在右侧编辑描述、提示词和引用素材。</p>
                </div>
              </div>

              <div style={listScrollStyle}>
                {shots.map((shot, index) => (
                  <ShotListItem
                    key={shot.id}
                    shot={shot}
                    index={index}
                    active={shot.id === activeShotId}
                    selected={selectedIds.has(shot.id)}
                    onActive={() => setActiveShotId(shot.id)}
                    onToggleSelect={() => toggleSelect(shot.id)}
                  />
                ))}
              </div>
            </div>

            <div style={detailPanelStyle}>
              {activeShot ? (
                <>
                  <div style={panelHeaderStyle}>
                    <div>
                      <h3 style={panelTitleStyle}>{getShotDisplayNumber(activeShot as any, shots.findIndex(item => item.id === activeShot.id))}</h3>
                      <p style={panelSubtitleStyle}>
                        {activeShot.Scene?.location ? `${activeShot.Scene.location}${activeShot.Scene.time ? ` · ${activeShot.Scene.time}` : ''}` : '未关联场景'}
                      </p>
                    </div>
                    <div style={detailHeaderActionsStyle}>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          color: getShotStatusColor(getShotStatus(activeShot as any)),
                          background: getShotStatusBackgroundColor(getShotStatus(activeShot as any)),
                          border: `1px solid ${getShotStatusBorderColor(getShotStatus(activeShot as any))}`,
                        }}
                      >
                        {getShotStatusLabel(getShotStatus(activeShot as any))}
                      </span>
                      <GlassButton
                        variant="primary"
                        icon={savingShot ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
                        isDark={false}
                        loading={savingShot}
                        onClick={handleSaveShot}
                      >
                        保存分镜
                      </GlassButton>
                    </div>
                  </div>

                  <div style={detailBodyStyle}>
                    <section style={editorSectionStyle}>
                      <div style={sectionTitleStyle}>
                        <FileText style={{ width: '16px', height: '16px' }} />
                        镜头描述
                      </div>
                      <textarea
                        value={editorState.action_summary}
                        onChange={(event) => handleEditorChange('action_summary', event.target.value)}
                        placeholder="填写镜头内容、表演动作、画面重点。"
                        style={textareaStyle}
                      />
                    </section>

                    <section style={editorGridStyle}>
                      <div style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>
                          <User style={{ width: '16px', height: '16px' }} />
                          角色绑定
                        </div>
                        <p style={sectionHintStyle}>为当前分镜绑定角色后，后续生成会自动带入该角色的参考信息与外观约束。</p>
                        <select
                          value={editorState.character_id || ''}
                          onChange={(event) => handleEditorChange('character_id', event.target.value || null)}
                          style={inputStyle}
                        >
                          <option value="">未绑定角色</option>
                          {characters.map((character) => (
                            <option key={character.id} value={character.id}>
                              {character.name}
                            </option>
                          ))}
                        </select>
                        <div style={characterSummaryStyle}>
                          {activeCharacter ? (
                            <>
                              <span style={metaBadgeStyle}>角色 {activeCharacter.name}</span>
                              <span style={metaBadgeStyle}>参考图 {activeCharacter.referenceImages?.length || 0} 张</span>
                              {activeCharacter.description && (
                                <div style={characterDescriptionStyle}>{activeCharacter.description}</div>
                              )}
                            </>
                          ) : (
                            <div style={characterEmptyStyle}>未绑定角色时，分镜生成只会使用镜头提示词，不会自动注入角色一致性约束。</div>
                          )}
                        </div>
                      </div>
                      <div style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>镜头运动</div>
                        <input
                          value={editorState.camera_movement}
                          onChange={(event) => handleEditorChange('camera_movement', event.target.value)}
                          placeholder="例如：缓慢推进、横移跟拍"
                          style={inputStyle}
                        />
                      </div>
                      <div style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>视觉风格</div>
                        <input
                          value={editorState.visual_style}
                          onChange={(event) => handleEditorChange('visual_style', event.target.value)}
                          placeholder="例如：冷峻写实、赛博霓虹"
                          style={inputStyle}
                        />
                      </div>
                    </section>

                    <section style={editorGridStyle}>
                      <div style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>开始提示词</div>
                        <textarea
                          value={editorState.start_prompt}
                          onChange={(event) => handleEditorChange('start_prompt', event.target.value)}
                          placeholder="填写开场帧提示词，可用于图像/视频生成。"
                          style={textareaCompactStyle}
                        />
                      </div>
                      <div style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>结束提示词</div>
                        <textarea
                          value={editorState.end_prompt}
                          onChange={(event) => handleEditorChange('end_prompt', event.target.value)}
                          placeholder="填写结束帧提示词，可用于图像/视频生成。"
                          style={textareaCompactStyle}
                        />
                      </div>
                    </section>

                    <section style={editorSectionStyle}>
                      <div style={sectionTitleStyle}>
                        <Image style={{ width: '16px', height: '16px' }} />
                        引用素材
                      </div>
                      <p style={sectionHintStyle}>可直接从项目素材库选择，或上传新素材作为分镜起止参考图。</p>
                      <div style={assetGridStyle}>
                        <div>
                          <div style={assetLabelStyle}>开始素材</div>
                          <ImageSelector
                            value={editorState.start_image_url}
                            onChange={(url) => handleEditorChange('start_image_url', url)}
                            projectId={projectId || ''}
                            type="general"
                            placeholder="选择开始素材"
                            defaultTab="library"
                          />
                        </div>
                        <div>
                          <div style={assetLabelStyle}>结束素材</div>
                          <ImageSelector
                            value={editorState.end_image_url}
                            onChange={(url) => handleEditorChange('end_image_url', url)}
                            projectId={projectId || ''}
                            type="general"
                            placeholder="选择结束素材"
                            defaultTab="library"
                          />
                        </div>
                      </div>
                    </section>

                    <ShotNineGridWorkbench
                      shotId={activeShot.id}
                      defaultPrompt={editorState.start_prompt || editorState.action_summary || activeShot.description || ''}
                      onApplyImage={handleApplyPanelImage}
                    />

                    <section style={metaBarStyle}>
                      <span style={metaBadgeStyle}>比例 {activeShot.aspect_ratio || '16:9'}</span>
                      <span style={metaBadgeStyle}>分辨率 {activeShot.resolution || '1080p'}</span>
                      <span style={metaBadgeStyle}>时长 {activeShot.duration || 8}s</span>
                      {saveMessage && <span style={saveTipStyle}>{saveMessage}</span>}
                    </section>

                    {activeShot.video_url && (
                      <section style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>
                          <Clapperboard style={{ width: '16px', height: '16px' }} />
                          成片预览
                        </div>
                        <video controls src={activeShot.video_url} style={videoStyle} />
                      </section>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * @description 顶部统计卡。
 */
function StatCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <div style={statCardStyle}>
      <div style={statIconStyle}>{icon}</div>
      <div>
        <div style={statTitleStyle}>{title}</div>
        <div style={statValueStyle}>{value}</div>
      </div>
    </div>
  );
}

/**
 * @description 空状态。
 */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={emptyStateStyle}>
      <Film style={{ width: '42px', height: '42px', color: 'var(--text-muted)' }} />
      <h3 style={emptyTitleStyle}>暂无分镜</h3>
      <p style={emptyDescStyle}>先创建第一条分镜，再进入右侧工作台完善描述与素材引用。</p>
      <GlassButton
        variant="primary"
        icon={<Plus style={{ width: '16px', height: '16px' }} />}
        isDark={false}
        onClick={onCreate}
      >
        添加分镜
      </GlassButton>
    </div>
  );
}

/**
 * @description 左侧分镜列表项。
 */
function ShotListItem({
  shot,
  index,
  active,
  selected,
  onActive,
  onToggleSelect,
}: {
  shot: Shot;
  index: number;
  active: boolean;
  selected: boolean;
  onActive: () => void;
  onToggleSelect: () => void;
}) {
  const normalizedDescription = shot.action_summary || shot.description || '未填写镜头描述';
  const shotStatus = getShotStatus(shot as any);

  return (
    <div
      style={{
        ...shotItemStyle,
        ...(active ? shotItemActiveStyle : null),
      }}
      onClick={onActive}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onToggleSelect();
        }}
        style={{
          ...checkboxStyle,
          ...(selected ? checkboxCheckedStyle : null),
        }}
      >
        {selected ? '✓' : ''}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={shotItemHeaderStyle}>
          <div style={shotCodeStyle}>{getShotDisplayNumber(shot as any, index)}</div>
          <span
            style={{
              ...statusBadgeStyle,
              color: getShotStatusColor(shotStatus),
              background: getShotStatusBackgroundColor(shotStatus),
              border: `1px solid ${getShotStatusBorderColor(shotStatus)}`,
            }}
          >
            {getShotStatusLabel(shotStatus)}
          </span>
        </div>

        <div style={shotDescStyle}>{normalizedDescription}</div>

        <div style={shotMetaRowStyle}>
          <span style={shotMetaBadgeStyle}>{shot.aspect_ratio || '16:9'}</span>
          <span style={shotMetaBadgeStyle}>{shot.resolution || '1080p'}</span>
          {shot.start_image_url && <span style={shotMetaBadgeStyle}>开始素材</span>}
          {shot.end_image_url && <span style={shotMetaBadgeStyle}>结束素材</span>}
          {shot.Character?.name && <span style={shotMetaBadgeStyle}>角色 {shot.Character.name}</span>}
          {shot.video_url && <span style={shotMetaBadgePrimaryStyle}>已有视频</span>}
        </div>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg-page)',
};

const loadingPageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-page)',
};

const mainStyle: CSSProperties = {
  maxWidth: '1600px',
  margin: '0 auto',
  padding: '24px',
};

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: '20px',
};

const statCardStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '18px 20px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '16px',
};

const statIconStyle: CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(139, 92, 246, 0.12)',
  color: '#8b5cf6',
};

const statTitleStyle: CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  marginBottom: '6px',
};

const statValueStyle: CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: 1,
  color: 'var(--text-primary)',
};

const workbenchStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '360px minmax(0, 1fr)',
  gap: '20px',
  alignItems: 'start',
};

const listPanelStyle: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'sticky',
  top: '96px',
};

const detailPanelStyle: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '20px',
  overflow: 'hidden',
  minHeight: '720px',
};

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '20px 22px',
  borderBottom: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
};

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const panelSubtitleStyle: CSSProperties = {
  margin: '6px 0 0',
  fontSize: '13px',
  color: 'var(--text-secondary)',
};

const listScrollStyle: CSSProperties = {
  maxHeight: 'calc(100vh - 220px)',
  overflow: 'auto',
  padding: '14px',
};

const shotItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '14px',
  borderRadius: '16px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-card)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: '12px',
};

const shotItemActiveStyle: CSSProperties = {
  border: '1px solid rgba(139, 92, 246, 0.3)',
  background: 'rgba(139, 92, 246, 0.06)',
  boxShadow: '0 10px 24px rgba(139, 92, 246, 0.08)',
};

const checkboxStyle: CSSProperties = {
  width: '22px',
  height: '22px',
  flexShrink: 0,
  borderRadius: '6px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-card)',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
};

const checkboxCheckedStyle: CSSProperties = {
  background: '#8b5cf6',
  border: '1px solid #8b5cf6',
};

const shotItemHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  marginBottom: '10px',
};

const shotCodeStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: '#8b5cf6',
};

const statusBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '24px',
  padding: '0 8px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const shotDescStyle: CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.55,
  color: 'var(--text-primary)',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  marginBottom: '12px',
};

const shotMetaRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
};

const shotMetaBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '24px',
  padding: '0 8px',
  borderRadius: '999px',
  background: 'rgba(148, 163, 184, 0.1)',
  color: 'var(--text-secondary)',
  fontSize: '11px',
  fontWeight: 600,
};

const shotMetaBadgePrimaryStyle: CSSProperties = {
  ...shotMetaBadgeStyle,
  background: 'rgba(99, 102, 241, 0.1)',
  color: '#4f46e5',
};

const detailHeaderActionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const detailBodyStyle: CSSProperties = {
  padding: '22px',
  display: 'grid',
  gap: '18px',
};

const editorSectionStyle: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '16px',
  padding: '18px',
};

const editorGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '18px',
};

const sectionTitleStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '12px',
};

const sectionHintStyle: CSSProperties = {
  margin: '0 0 14px',
  fontSize: '13px',
  color: 'var(--text-secondary)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  height: '42px',
  borderRadius: '12px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-page)',
  color: 'var(--text-primary)',
  padding: '0 14px',
  fontSize: '14px',
  outline: 'none',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '140px',
  borderRadius: '14px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-page)',
  color: 'var(--text-primary)',
  padding: '14px',
  fontSize: '14px',
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
};

const textareaCompactStyle: CSSProperties = {
  ...textareaStyle,
  minHeight: '110px',
};

const assetGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '18px',
};

const assetLabelStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '10px',
};

const characterSummaryStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '12px',
};

const characterDescriptionStyle: CSSProperties = {
  width: '100%',
  fontSize: '13px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
};

const characterEmptyStyle: CSSProperties = {
  fontSize: '13px',
  lineHeight: 1.6,
  color: 'var(--text-secondary)',
};

const metaBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const metaBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '30px',
  padding: '0 12px',
  borderRadius: '999px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-secondary)',
  fontSize: '12px',
  fontWeight: 600,
};

const saveTipStyle: CSSProperties = {
  fontSize: '13px',
  color: '#10b981',
  fontWeight: 600,
};

const videoStyle: CSSProperties = {
  width: '100%',
  maxHeight: '360px',
  borderRadius: '14px',
  background: '#000000',
};

const emptyStateStyle: CSSProperties = {
  minHeight: '480px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: '10px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-primary)',
  borderRadius: '20px',
};

const emptyTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const emptyDescStyle: CSSProperties = {
  margin: '0 0 12px',
  fontSize: '14px',
  color: 'var(--text-secondary)',
};
