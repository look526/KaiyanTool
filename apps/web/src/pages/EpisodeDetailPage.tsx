import type { CSSProperties, ReactNode } from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { episodesApi, shotsApi } from '../core/api/modules';
import { aiProvidersApi } from '../core/api/modules/ai-providers';
import { charactersApi, type Character } from '../core/api/modules/characters';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { ShotNineGridWorkbench } from '../components/episode/ShotNineGridWorkbench';
import { ImageSelector } from '../components/ImageSelector';
import { MentionInput } from '../components/ui/MentionInput';
import { Loader2, Film, CheckSquare, Square, Trash2, Save, Image, Clapperboard, FileText, Plus, User, Video, ChevronDown, Play, RefreshCw, AlertCircle, XCircle, Layers } from 'lucide-react';
import type { AIProvider } from '../types';
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

function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

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
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatingShotId, setGeneratingShotId] = useState<string | null>(null);
  const [videoProviders, setVideoProviders] = useState<AIProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useLocalStorageState<string | null>('episode_selected_provider', null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageTone, setSaveMessageTone] = useState<'success' | 'error' | 'info'>('success');
  const previousActiveShotIdRef = useRef<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<number | null>(null);
  const editorStateRef = useRef<ShotEditorState | null>(null);
  const activeShotRef = useRef<Shot | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastPlayedShotId, setLastPlayedShotId] = useLocalStorageState<string | null>('episode_last_played_shot', null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [batchResults, setBatchResults] = useState<{ shotId: string; success: boolean; error?: string }[]>([]);
  const [shotErrors, setShotErrors] = useState<Record<string, string>>({});
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

  useEffect(() => {
    editorStateRef.current = editorState;
  }, [editorState]);

  const loadEpisodeData = useCallback(async () => {
    if (!episodeId || !projectId) {
      return;
    }

    try {
      setLoading(true);

      const episodeData = await episodesApi.getEpisode(episodeId).catch((error) => {
        console.error('Failed to load episode:', error);
        return null;
      });

      const shotsData = await shotsApi.getShots(episodeId).catch((error) => {
        console.error('Failed to load shots:', error);
        return [] as Shot[];
      });

      const charactersData = await charactersApi.getCharacters(projectId).catch((error) => {
        console.error('Failed to load characters:', error);
        return [] as Character[];
      });

      const providersData = await aiProvidersApi.getAIProviders().catch((error) => {
        console.error('Failed to load AI providers:', error);
        return [] as AIProvider[];
      });

      const providersList = Array.isArray(providersData)
        ? providersData
        : (providersData as { providers?: AIProvider[] })?.providers ?? [];

      setEpisode(episodeData);
      setShots(shotsData);
      setCharacters(charactersData);
      setVideoProviders(providersList);
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
      previousActiveShotIdRef.current = null;
      return;
    }

    if (previousActiveShotIdRef.current === activeShot.id) {
      return;
    }

    previousActiveShotIdRef.current = activeShot.id;
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    isDirtyRef.current = false;
    setIsDirty(false);
    activeShotRef.current = activeShot;
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
    setSaveMessageTone('success');
  }, [activeShot]);

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

  const activeVideoProvider = useMemo(() => {
    const enabledProviders = videoProviders.filter((provider) => provider.enabled !== false);
    if (selectedProviderId) {
      const selected = enabledProviders.find(p => (p.type || p.id) === selectedProviderId);
      if (selected) return selected;
    }
    return enabledProviders[0] || videoProviders[0] || null;
  }, [videoProviders, selectedProviderId]);

  const activeVideoProviderId = useMemo(() => {
    if (!activeVideoProvider) {
      return null;
    }
    return activeVideoProvider.type || activeVideoProvider.id;
  }, [activeVideoProvider]);

  const getGenerateButtonDisabledReason = useMemo(() => {
    if (!activeShot) return '请先选择一个分镜';
    if (generatingVideo) return '当前正在生成中，请勿重复点击';
    if (!editorState.start_image_url) return '缺少开始帧';
    if (!editorState.end_image_url) return '缺少结束帧';
    if (!activeVideoProviderId) return '暂无可用视频 Provider';
    return null;
  }, [activeShot, generatingVideo, editorState.start_image_url, editorState.end_image_url, activeVideoProviderId]);

  const canGenerateVideo = useMemo(() => {
    return Boolean(
      activeShot &&
      editorState.start_image_url &&
      editorState.end_image_url &&
      activeVideoProviderId &&
      !savingShot &&
      !autoSaving &&
      !generatingVideo
    );
  }, [activeShot, activeVideoProviderId, editorState.end_image_url, editorState.start_image_url, generatingVideo, savingShot, autoSaving]);

  const syncShot = useCallback((nextShot: Shot) => {
    setShots((prev) => prev.map((shot) => (shot.id === nextShot.id ? nextShot : shot)));
  }, []);

  const buildShotUpdateInput = useCallback((shot: Shot): UpdateShotInput => {
    return {
      character_id: editorState.character_id || null,
      action_summary: editorState.action_summary.trim() || '未填写镜头描述',
      camera_movement: editorState.camera_movement.trim() || undefined,
      start_prompt: editorState.start_prompt.trim() || undefined,
      end_prompt: editorState.end_prompt.trim() || undefined,
      start_image_url: editorState.start_image_url,
      end_image_url: editorState.end_image_url,
      visual_style: editorState.visual_style.trim() || undefined,
      aspect_ratio: shot.aspect_ratio,
      resolution: shot.resolution,
      duration: shot.duration,
    };
  }, [editorState]);

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

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    try {
      setSavingShot(true);
      setSaveMessage('');
      setSaveMessageTone('success');

      const updatedShot = await shotsApi.updateShot(activeShot.id, buildShotUpdateInput(activeShot));
      syncShot(updatedShot);

      isDirtyRef.current = false;
      setIsDirty(false);

      setSaveMessage('已保存');
    } catch (error) {
      console.error('Failed to save shot:', error);
      setSaveMessage('保存失败，请稍后重试');
      setSaveMessageTone('error');
    } finally {
      setSavingShot(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!activeShot || !activeVideoProviderId || !editorState.start_image_url || !editorState.end_image_url) {
      return;
    }

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    try {
      setGeneratingVideo(true);
      setGeneratingShotId(activeShot.id);
      setSaveMessage('');
      setSaveMessageTone('success');

      let persistedShot: Shot = activeShot;

      if (isDirtyRef.current) {
        persistedShot = await shotsApi.updateShot(activeShot.id, buildShotUpdateInput(activeShot));
        syncShot(persistedShot);

        isDirtyRef.current = false;
        setIsDirty(false);
      }

      const result = await shotsApi.generateShot(activeShot.id, {
        provider_id: activeVideoProviderId,
      });

      const nextShot: Shot = result.shot
        ? result.shot
        : {
            ...persistedShot,
            video_url: result.video_url || persistedShot.video_url,
            duration: result.duration || persistedShot.duration,
            resolution: result.resolution || persistedShot.resolution,
          };

      syncShot(nextShot);
      setShotErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[activeShot.id];
        return newErrors;
      });
      isDirtyRef.current = false;
      setIsDirty(false);
      setSaveMessage('视频已生成');
      setSaveMessageTone('success');

      const currentIndex = shots.findIndex(s => s.id === activeShot.id);
      const nextShotItem = shots[currentIndex + 1];
      if (nextShotItem) {
        setTimeout(() => setActiveShotId(nextShotItem.id), 800);
      }
    } catch (error: any) {
      console.error('Failed to generate video:', error);
      const errorMsg = error?.message || '视频生成失败，请稍后重试';
      setSaveMessage(errorMsg);
      setSaveMessageTone('error');
      setShotErrors(prev => ({ ...prev, [activeShot.id]: errorMsg }));
    } finally {
      setGeneratingVideo(false);
      setGeneratingShotId(null);
    }
  };

  const handleBatchGenerate = async () => {
    if (!activeVideoProviderId || batchGenerating) return;

    const readyShotIds = Array.from(selectedIds).filter(id => {
      const shot = shots.find(s => s.id === id);
      return shot?.start_image_url && shot?.end_image_url;
    });

    if (readyShotIds.length === 0) {
      setSaveMessage('所选分镜中没有就绪的双帧分镜');
      setSaveMessageTone('error');
      return;
    }

    try {
      setBatchGenerating(true);
      setBatchProgress({ current: 0, total: readyShotIds.length, success: 0, failed: 0 });
      setBatchResults([]);
      setSaveMessage('');
      setSaveMessageTone('success');

      for (const shotId of readyShotIds) {
        const shot = shots.find(s => s.id === shotId);
        if (!shot) continue;

        setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));
        setGeneratingShotId(shotId);

        try {
          if (shot.start_image_url && shot.end_image_url) {
            await shotsApi.updateShot(shotId, {
              character_id: shot.character_id || null,
              action_summary: shot.action_summary || shot.description || '未填写镜头描述',
              camera_movement: shot.camera_movement || undefined,
              start_prompt: shot.start_prompt || undefined,
              end_prompt: shot.end_prompt || undefined,
              start_image_url: shot.start_image_url,
              end_image_url: shot.end_image_url,
              visual_style: shot.visual_style || undefined,
              aspect_ratio: shot.aspect_ratio,
              resolution: shot.resolution,
              duration: shot.duration,
            });

            const result = await shotsApi.generateShot(shotId, {
              provider_id: activeVideoProviderId,
            });

            const updatedShot = result.shot || {
              ...shot,
              video_url: result.video_url || shot.video_url,
              duration: result.duration || shot.duration,
              resolution: result.resolution || shot.resolution,
            };
            syncShot(updatedShot);
            setShotErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[shotId];
              return newErrors;
            });
            setBatchProgress(prev => ({ ...prev, success: prev.success + 1 }));
            setBatchResults(prev => [...prev, { shotId, success: true }]);
          }
        } catch (error: any) {
          const errorMsg = error?.message || '生成失败';
          setShotErrors(prev => ({ ...prev, [shotId]: errorMsg }));
          setBatchProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          setBatchResults(prev => [...prev, { shotId, success: false, error: errorMsg }]);
        }
      }

      setSaveMessage(`批量生成完成：成功 ${batchProgress.success}，失败 ${batchProgress.failed}`);
      setSaveMessageTone(batchProgress.failed > 0 ? 'error' : 'success');
    } finally {
      setBatchGenerating(false);
      setGeneratingShotId(null);
      setBatchProgress({ current: 0, total: 0, success: 0, failed: 0 });
    }
  };

  const handleEditorChange = <K extends keyof ShotEditorState>(key: K, value: ShotEditorState[K]) => {
    setEditorState(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
    isDirtyRef.current = true;
    setSaveMessage('');
    setSaveMessageTone('success');

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        const shot = activeShotRef.current;
        const stateToSave = editorStateRef.current;

        if (!shot || !stateToSave) return;
        if (!isDirtyRef.current) return;
        if (savingShot || generatingVideo) return;

        try {
          setAutoSaving(true);

          const input: UpdateShotInput = {
            character_id: stateToSave.character_id || null,
            action_summary: stateToSave.action_summary.trim() || '未填写镜头描述',
            camera_movement: stateToSave.camera_movement.trim() || undefined,
            start_prompt: stateToSave.start_prompt.trim() || undefined,
            end_prompt: stateToSave.end_prompt.trim() || undefined,
            start_image_url: stateToSave.start_image_url,
            end_image_url: stateToSave.end_image_url,
            visual_style: stateToSave.visual_style.trim() || undefined,
            aspect_ratio: shot.aspect_ratio,
            resolution: shot.resolution,
            duration: shot.duration,
          };

          const updatedShot = await shotsApi.updateShot(shot.id, input);
          syncShot(updatedShot);

          isDirtyRef.current = false;
          setIsDirty(false);
          setSaveMessage('已自动保存');
          setSaveMessageTone('success');
        } catch (error) {
          console.error('Auto save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      })();
    }, 900);
  };

  const handleApplyPanelImage = (target: 'start' | 'end', imageUrl: string) => {
    handleEditorChange(target === 'start' ? 'start_image_url' : 'end_image_url', imageUrl);
    setSaveMessageTone('info');
    setSaveMessage(
      target === 'start'
        ? '已回填九宫格到开始帧，请保存分镜'
        : '已回填九宫格到结束帧，请保存分镜'
    );
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
                  <>
                    <GlassButton
                      variant="danger"
                      icon={batchDeleteLoading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Trash2 style={{ width: '16px', height: '16px' }} />}
                      isDark={false}
                      loading={batchDeleteLoading}
                      onClick={handleBulkDelete}
                    >
                      删除 ({selectedIds.size})
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      icon={batchGenerating ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Layers style={{ width: '16px', height: '16px' }} />}
                      isDark={false}
                      loading={batchGenerating}
                      disabled={batchGenerating}
                      onClick={handleBatchGenerate}
                    >
                      {batchGenerating ? `批量生成 ${batchProgress.current}/${batchProgress.total}` : `批量生成 (${selectedIds.size})`}
                    </GlassButton>
                  </>
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
                    isGenerating={generatingShotId === shot.id}
                    hasError={!!shotErrors[shot.id]}
                    errorMessage={shotErrors[shot.id]}
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
                      <div style={providerSelectorStyle}>
                        <select
                          value={selectedProviderId || activeVideoProvider?.id || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedProviderId(value || null);
                          }}
                          style={providerSelectStyle}
                        >
                          {videoProviders.filter(p => p.enabled !== false).map(provider => (
                            <option key={provider.id} value={provider.type || provider.id}>
                              {provider.name || provider.type || 'Provider'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown style={{ width: '14px', height: '14px', pointerEvents: 'none' }} />
                      </div>
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <GlassButton
                          variant="secondary"
                          icon={generatingVideo ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Video style={{ width: '16px', height: '16px' }} />}
                          isDark={false}
                          loading={generatingVideo}
                          disabled={!canGenerateVideo}
                          onClick={handleGenerateVideo}
                        >
                          生成视频
                        </GlassButton>
                        {!canGenerateVideo && getGenerateButtonDisabledReason && (
                          <span style={disabledReasonStyle}>
                            <AlertCircle style={{ width: '10px', height: '10px' }} />
                            {getGenerateButtonDisabledReason}
                          </span>
                        )}
                      </div>
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
                      <MentionInput
                        value={editorState.action_summary}
                        onChange={(val) => handleEditorChange('action_summary', val)}
                        placeholder="填写镜头内容、表演动作、画面重点，使用 @ 提及角色、场景或物品..."
                        projectId={projectId || ''}
                        rows={6}
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
                        <MentionInput
                          value={editorState.start_prompt}
                          onChange={(val) => handleEditorChange('start_prompt', val)}
                          placeholder="输入提示词，使用 @ 提及角色、场景或物品..."
                          projectId={projectId || ''}
                          rows={4}
                        />
                      </div>
                      <div style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>结束提示词</div>
                        <MentionInput
                          value={editorState.end_prompt}
                          onChange={(val) => handleEditorChange('end_prompt', val)}
                          placeholder="输入提示词，使用 @ 提及角色、场景或物品..."
                          projectId={projectId || ''}
                          rows={4}
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
                      <div style={metaBadgeStyle}>
                        <span style={{ marginRight: '4px', color: 'var(--text-muted)' }}>比例</span>
                        <select
                          value={activeShot.aspect_ratio || '16:9'}
                          onChange={(e) => {
                            const shot = activeShot;
                            if (!shot) return;
                            const updated = { ...shot, aspect_ratio: e.target.value };
                            syncShot(updated);
                            shotsApi.updateShot(shot.id, { aspect_ratio: e.target.value }).catch(console.error);
                          }}
                          style={metaSelectStyle}
                        >
                          <option value="16:9">16:9</option>
                          <option value="9:16">9:16</option>
                          <option value="1:1">1:1</option>
                          <option value="4:3">4:3</option>
                        </select>
                      </div>
                      <div style={metaBadgeStyle}>
                        <span style={{ marginRight: '4px', color: 'var(--text-muted)' }}>分辨率</span>
                        <select
                          value={activeShot.resolution || '1080p'}
                          onChange={(e) => {
                            const shot = activeShot;
                            if (!shot) return;
                            const updated = { ...shot, resolution: e.target.value };
                            syncShot(updated);
                            shotsApi.updateShot(shot.id, { resolution: e.target.value }).catch(console.error);
                          }}
                          style={metaSelectStyle}
                        >
                          <option value="480p">480p</option>
                          <option value="720p">720p</option>
                          <option value="1080p">1080p</option>
                          <option value="2k">2k</option>
                          <option value="4k">4k</option>
                        </select>
                      </div>
                      <div style={metaBadgeStyle}>
                        <span style={{ marginRight: '4px', color: 'var(--text-muted)' }}>时长</span>
                        <select
                          value={activeShot.duration || 8}
                          onChange={(e) => {
                            const shot = activeShot;
                            if (!shot) return;
                            const updated = { ...shot, duration: parseInt(e.target.value) };
                            syncShot(updated);
                            shotsApi.updateShot(shot.id, { duration: parseInt(e.target.value) }).catch(console.error);
                          }}
                          style={metaSelectStyle}
                        >
                          <option value="4">4s</option>
                          <option value="6">6s</option>
                          <option value="8">8s</option>
                          <option value="10">10s</option>
                        </select>
                      </div>
                      <span style={metaBadgeStyle}>视频引擎 {activeVideoProvider?.name || '未配置'}</span>
                      <span style={metaBadgeStyle}>{editorState.start_image_url && editorState.end_image_url ? '双帧已就绪' : '缺少起止帧'}</span>
                      {saveMessage && (
                        <span
                          style={{
                            ...saveTipStyle,
                            color: saveMessageTone === 'error' ? '#ef4444' : saveMessageTone === 'info' ? '#6366f1' : '#10b981',
                          }}
                        >
                          {saveMessage}
                        </span>
                      )}
                    </section>

                    {activeShot.video_url && (
                      <section style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>
                          <Clapperboard style={{ width: '16px', height: '16px' }} />
                          成片预览
                          {lastPlayedShotId === activeShot.id && (
                            <span style={playingIndicatorStyle}>
                              <Play style={{ width: '10px', height: '10px' }} />
                              播放位置已保存
                            </span>
                          )}
                        </div>
                        <video
                          ref={videoRef}
                          controls
                          src={activeShot.video_url}
                          style={videoStyle}
                          onPlay={() => setLastPlayedShotId(activeShot.id)}
                        />
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

function ShotListItem({
  shot,
  index,
  active,
  selected,
  isGenerating,
  hasError,
  errorMessage,
  onActive,
  onToggleSelect,
}: {
  shot: Shot;
  index: number;
  active: boolean;
  selected: boolean;
  isGenerating?: boolean;
  hasError?: boolean;
  errorMessage?: string;
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
        ...(isGenerating ? shotItemGeneratingStyle : null),
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isGenerating && (
              <span style={generatingBadgeStyle}>
                <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} />
                生成中
              </span>
            )}
            {hasError && !isGenerating && (
              <span style={errorBadgeStyle}>
                <XCircle style={{ width: '10px', height: '10px' }} />
                失败
              </span>
            )}
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
        </div>

        <div style={shotDescStyle}>{normalizedDescription}</div>

        {hasError && errorMessage && (
          <div style={errorMessageStyle}>
            <AlertCircle style={{ width: '12px', height: '12px', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{errorMessage}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActive();
              }}
              style={retryButtonStyle}
            >
              <RefreshCw style={{ width: '10px', height: '10px' }} />
              重试
            </button>
          </div>
        )}

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
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  background: 'var(--bg-page)',
};

const loadingPageStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflowY: 'auto',
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

const shotItemGeneratingStyle: CSSProperties = {
  border: '1px solid rgba(99, 102, 241, 0.4)',
  background: 'rgba(99, 102, 241, 0.08)',
};

const generatingBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  height: '22px',
  padding: '0 8px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 600,
  background: 'rgba(99, 102, 241, 0.15)',
  color: '#6366f1',
  border: '1px solid rgba(99, 102, 241, 0.3)',
};

const errorBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  height: '22px',
  padding: '0 8px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: 600,
  background: 'rgba(239, 68, 68, 0.12)',
  color: '#ef4444',
  border: '1px solid rgba(239, 68, 68, 0.25)',
};

const errorMessageStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  marginBottom: '10px',
  borderRadius: '8px',
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  fontSize: '11px',
  color: '#ef4444',
};

const retryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  borderRadius: '6px',
  border: 'none',
  background: 'rgba(239, 68, 68, 0.15)',
  color: '#ef4444',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const providerSelectorStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
};

const providerSelectStyle: CSSProperties = {
  appearance: 'none',
  height: '36px',
  padding: '0 32px 0 12px',
  borderRadius: '10px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
};

const disabledReasonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  color: '#f59e0b',
  fontWeight: 500,
};

const metaSelectStyle: CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  padding: '0',
};

const playingIndicatorStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  marginLeft: '8px',
  padding: '2px 8px',
  borderRadius: '999px',
  background: 'rgba(99, 102, 241, 0.12)',
  color: '#6366f1',
  fontSize: '10px',
  fontWeight: 600,
};
