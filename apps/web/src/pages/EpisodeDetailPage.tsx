import type { CSSProperties, ReactNode } from 'react';
import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useParams } from 'react-router-dom';
import { episodesApi, shotsApi } from '../core/api/modules';
import { aiProvidersApi } from '../core/api/modules/ai-providers';
import { charactersApi, type Character } from '../core/api/modules/characters';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { useToast } from '../components/ui/Toast';
import { ShotNineGridWorkbench } from '../components/episode/ShotNineGridWorkbench';
import { EpisodeStoryboardOverviewPanel } from '../components/episode/EpisodeStoryboardOverviewPanel';
import { generationPromptFromShot } from '@shared/generation-prompt';
import { ImageSelector } from '../components/ImageSelector';
import { MentionInput } from '../components/ui/MentionInput';
import { Loader2, Film, CheckSquare, Square, Trash2, Save, Image, Clapperboard, FileText, Plus, User, Video, Play, RefreshCw, AlertCircle, XCircle, Layers, Sparkles, Filter, Undo2, Redo2, Clock, Mic } from 'lucide-react';
import type { AIProvider } from '../types';
import type { Episode } from '../types/episode';
import type { Shot, UpdateShotInput, VideoGenerationMode, VideoPromptFlags } from '../core/api/modules/shots/shots-api';
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

function defaultVideoPromptFlags(): VideoPromptFlags {
  return {
    include_action: true,
    include_dialogue: false,
    include_camera: true,
    include_style: true,
  };
}

function parseVideoPromptFlags(raw: unknown): VideoPromptFlags {
  const d = defaultVideoPromptFlags();
  if (!raw || typeof raw !== 'object') return d;
  const o = raw as Record<string, unknown>;
  return {
    include_action: o.include_action !== false,
    include_dialogue: o.include_dialogue === true,
    include_camera: o.include_camera !== false,
    include_style: o.include_style !== false,
  };
}

function buildUpdateShotInputFromState(shot: Shot, state: ShotEditorState): UpdateShotInput {
  const mergedForPrompt = {
    ...shot,
    action_summary: state.action_summary.trim() || '未填写镜头描述',
    camera_movement: state.camera_movement,
    visual_style: state.visual_style,
    subtitle_text: state.subtitle_text,
    character_id: state.character_id,
  };
  const generation_prompt_json = generationPromptFromShot(mergedForPrompt as any) as unknown as Record<
    string,
    unknown
  >;
  return {
    character_id: state.character_id || null,
    action_summary: state.action_summary.trim() || '未填写镜头描述',
    camera_movement: state.camera_movement.trim() || undefined,
    start_prompt: state.start_prompt.trim() || undefined,
    end_prompt: state.end_prompt.trim() || undefined,
    start_image_url: state.start_image_url,
    end_image_url: state.end_image_url,
    visual_style: state.visual_style.trim() || undefined,
    subtitle_text: state.subtitle_text.trim() || null,
    aspect_ratio: shot.aspect_ratio,
    resolution: shot.resolution,
    duration: shot.duration,
    video_generation_mode: state.video_generation_mode,
    video_prompt_flags: state.video_prompt_flags,
    generation_prompt_json,
  };
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
  /** 对白/口播，用于音画同出时并入视频提示 */
  subtitle_text: string;
  video_generation_mode: VideoGenerationMode;
  video_prompt_flags: VideoPromptFlags;
}

const MAX_EDITOR_HISTORY = 50;

function cloneEditorState(s: ShotEditorState): ShotEditorState {
  return JSON.parse(JSON.stringify(s)) as ShotEditorState;
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
  const [imageProviderId, setImageProviderId] = useLocalStorageState<string | null>('episode_image_provider_id', null);
  const [batchConcurrency, setBatchConcurrency] = useLocalStorageState<number>('episode_batch_concurrency', 2);
  const [autoAdvanceAfterVideo, setAutoAdvanceAfterVideo] = useLocalStorageState<boolean>('episode_auto_advance_after_video', true);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [listFilterRaw, setListFilterRaw] = useLocalStorageState<string>('episode_shot_list_filter', 'all');
  const listFilter: 'all' | 'ready' | 'video' | 'failed' =
    listFilterRaw === 'all' || listFilterRaw === 'ready' || listFilterRaw === 'video' || listFilterRaw === 'failed'
      ? listFilterRaw
      : 'all';
  const setListFilter = (v: 'all' | 'ready' | 'video' | 'failed') => setListFilterRaw(v);
  const [generatingFrame, setGeneratingFrame] = useState<null | 'start' | 'end' | 'both'>(null);
  const [videoGenElapsedSec, setVideoGenElapsedSec] = useState(0);
  const [videoGenProgress, setVideoGenProgress] = useState(0);
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
  const { addToast } = useToast();
  const undoStackRef = useRef<ShotEditorState[]>([]);
  const redoStackRef = useRef<ShotEditorState[]>([]);
  const undoBurstTimerRef = useRef<number | null>(null);
  const undoBurstStartRef = useRef<ShotEditorState | null>(null);
  const skipHistoryRef = useRef(false);
  const [historyTick, setHistoryTick] = useState(0);
  const listScrollParentRef = useRef<HTMLDivElement>(null);
  const shotsRef = useRef(shots);
  const activeShotIdRef = useRef(activeShotId);
  const handleSaveShotRef = useRef<() => Promise<void>>(async () => {});
  const handleUndoRef = useRef<() => void>(() => {});
  const handleRedoRef = useRef<() => void>(() => {});
  const [editorState, setEditorState] = useState<ShotEditorState>({
    character_id: null,
    action_summary: '',
    camera_movement: '',
    start_prompt: '',
    end_prompt: '',
    start_image_url: null,
    end_image_url: null,
    visual_style: '',
    subtitle_text: '',
    video_generation_mode: 'end_frame',
    video_prompt_flags: defaultVideoPromptFlags(),
  });

  useEffect(() => {
    editorStateRef.current = editorState;
  }, [editorState]);

  const bumpHistory = useCallback(() => setHistoryTick((t) => t + 1), []);

  const discardBurst = useCallback(() => {
    if (undoBurstTimerRef.current) {
      window.clearTimeout(undoBurstTimerRef.current);
      undoBurstTimerRef.current = null;
    }
    undoBurstStartRef.current = null;
  }, []);

  const flushBurstToUndo = useCallback(() => {
    if (undoBurstTimerRef.current) {
      window.clearTimeout(undoBurstTimerRef.current);
      undoBurstTimerRef.current = null;
    }
    const start = undoBurstStartRef.current;
    if (!start) return;
    undoBurstStartRef.current = null;
    undoStackRef.current = [...undoStackRef.current, cloneEditorState(start)].slice(-MAX_EDITOR_HISTORY);
    redoStackRef.current = [];
    bumpHistory();
  }, [bumpHistory]);

  const handleUndo = useCallback(() => {
    flushBurstToUndo();
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop()!;
    const cur = cloneEditorState(editorStateRef.current!);
    redoStackRef.current.push(cur);
    skipHistoryRef.current = true;
    setEditorState(prev);
    isDirtyRef.current = true;
    setIsDirty(true);
    setSaveMessage('');
    window.setTimeout(() => {
      skipHistoryRef.current = false;
    }, 0);
    bumpHistory();
  }, [flushBurstToUndo, bumpHistory]);

  const handleRedo = useCallback(() => {
    flushBurstToUndo();
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    const cur = cloneEditorState(editorStateRef.current!);
    undoStackRef.current.push(cur);
    skipHistoryRef.current = true;
    setEditorState(next);
    isDirtyRef.current = true;
    setIsDirty(true);
    setSaveMessage('');
    window.setTimeout(() => {
      skipHistoryRef.current = false;
    }, 0);
    bumpHistory();
  }, [flushBurstToUndo, bumpHistory]);

  shotsRef.current = shots;
  activeShotIdRef.current = activeShotId;
  const generatingVideoRef = useRef(false);
  const batchGeneratingRef = useRef(false);
  generatingVideoRef.current = generatingVideo;
  batchGeneratingRef.current = batchGenerating;

  useEffect(() => {
    if (!generatingVideo) {
      setVideoGenElapsedSec(0);
      return;
    }
    setVideoGenElapsedSec(0);
    const t = window.setInterval(() => {
      setVideoGenElapsedSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [generatingVideo]);

  useEffect(() => {
    if (!generatingVideo) {
      setVideoGenProgress(0);
      return;
    }
    setVideoGenProgress(6);
    const t = window.setInterval(() => {
      setVideoGenProgress((p) => (p >= 94 ? p : p + Math.min(5, 93 - p)));
    }, 850);
    return () => clearInterval(t);
  }, [generatingVideo]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current || generatingVideoRef.current || batchGeneratingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void handleSaveShotRef.current();
        return;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const inField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;
      if (inField) return;

      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedoRef.current();
        else handleUndoRef.current();
        return;
      }
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedoRef.current();
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const s = shotsRef.current;
        const curId = activeShotIdRef.current;
        if (s.length === 0 || !curId) return;
        const idx = s.findIndex((x) => x.id === curId);
        if (idx < 0) return;
        e.preventDefault();
        const delta = e.key === 'ArrowUp' ? -1 : 1;
        const next = s[idx + delta];
        if (next) setActiveShotId(next.id);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

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

  /** 左侧选择场景后，若当前分镜不在该场景，自动跳到该场景第一个分镜 */
  useEffect(() => {
    if (!selectedSceneId) return;
    const inScene = shots.filter((s) => s.scene_id === selectedSceneId);
    if (inScene.length === 0) return;
    setActiveShotId((prev) => {
      if (prev && inScene.some((s) => s.id === prev)) return prev;
      return inScene[0].id;
    });
  }, [selectedSceneId, shots]);

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
    discardBurst();
    undoStackRef.current = [];
    redoStackRef.current = [];
    bumpHistory();
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
      subtitle_text: activeShot.subtitle_text || '',
      video_generation_mode:
        activeShot.video_generation_mode === 'nine_grid' ? 'nine_grid' : 'end_frame',
      video_prompt_flags: parseVideoPromptFlags(activeShot.video_prompt_flags),
    });
    setSaveMessage('');
    setSaveMessageTone('success');
  }, [activeShot, discardBurst, bumpHistory]);

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

  const enabledProviders = useMemo(
    () => videoProviders.filter((p) => p.enabled !== false),
    [videoProviders]
  );

  const activeVideoProvider = useMemo(() => {
    if (selectedProviderId) {
      const selected = enabledProviders.find((p) => p.id === selectedProviderId);
      if (selected) return selected;
    }
    return enabledProviders[0] || null;
  }, [enabledProviders, selectedProviderId]);

  /** 视频生成 API 使用 provider 数据库主键 */
  const activeVideoProviderId = activeVideoProvider?.id ?? null;

  const activeImageProvider = useMemo(() => {
    if (imageProviderId) {
      const selected = enabledProviders.find((p) => p.id === imageProviderId);
      if (selected) return selected;
    }
    return activeVideoProvider || enabledProviders[0] || null;
  }, [enabledProviders, imageProviderId, activeVideoProvider]);

  const activeImageProviderId = activeImageProvider?.id ?? null;

  const filteredShots = useMemo(() => {
    const base = shots.filter((shot) => {
      if (selectedSceneId && shot.scene_id !== selectedSceneId) {
        return false;
      }
      if (listFilter === 'ready') {
        return !!(shot.start_image_url && shot.end_image_url && !shot.video_url);
      }
      if (listFilter === 'video') {
        return !!shot.video_url;
      }
      if (listFilter === 'failed') {
        return !!shotErrors[shot.id];
      }
      return true;
    });
    if (activeShotId && !base.some((s) => s.id === activeShotId)) {
      const cur = shots.find((s) => s.id === activeShotId);
      if (cur) return [cur, ...base];
    }
    return base;
  }, [shots, listFilter, shotErrors, activeShotId, selectedSceneId]);

  void historyTick;
  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const rowVirtualizer = useVirtualizer({
    count: filteredShots.length,
    getScrollElement: () => listScrollParentRef.current,
    estimateSize: () => 148,
    overscan: 8,
  });

  const virtualActiveIndex = useMemo(
    () => filteredShots.findIndex((s) => s.id === activeShotId),
    [filteredShots, activeShotId]
  );

  useLayoutEffect(() => {
    if (virtualActiveIndex < 0) return;
    rowVirtualizer.scrollToIndex(virtualActiveIndex, { align: 'center', behavior: 'smooth' });
  }, [virtualActiveIndex, listFilter, rowVirtualizer]);

  const getGenerateButtonDisabledReason = useMemo(() => {
    if (!activeShot) return '请先选择一个分镜';
    if (generatingVideo) return '当前正在生成中，请勿重复点击';
    if (!activeVideoProviderId) return '暂无可用视频 Provider';
    if (editorState.video_generation_mode === 'end_frame') {
      if (!editorState.start_image_url) return '缺少开始帧';
      if (!editorState.end_image_url) return '缺少结束帧';
    }
    if (editorState.video_prompt_flags.include_dialogue && !editorState.subtitle_text?.trim()) {
      return '已开启对白并入视频提示，请填写对白/口播';
    }
    return null;
  }, [
    activeShot,
    generatingVideo,
    editorState.start_image_url,
    editorState.end_image_url,
    editorState.subtitle_text,
    editorState.video_generation_mode,
    editorState.video_prompt_flags.include_dialogue,
    activeVideoProviderId,
  ]);

  const canGenerateVideo = useMemo(() => {
    const framesOk =
      editorState.video_generation_mode === 'end_frame'
        ? !!(editorState.start_image_url && editorState.end_image_url)
        : true;
    return Boolean(
      activeShot &&
      framesOk &&
      activeVideoProviderId &&
      !savingShot &&
      !autoSaving &&
      !generatingVideo &&
      !(
        editorState.video_prompt_flags.include_dialogue && !editorState.subtitle_text?.trim()
      )
    );
  }, [
    activeShot,
    activeVideoProviderId,
    editorState.end_image_url,
    editorState.start_image_url,
    editorState.subtitle_text,
    editorState.video_generation_mode,
    editorState.video_prompt_flags.include_dialogue,
    generatingVideo,
    savingShot,
    autoSaving,
  ]);

  const syncShot = useCallback((nextShot: Shot) => {
    setShots((prev) => prev.map((shot) => (shot.id === nextShot.id ? nextShot : shot)));
  }, []);

  const buildShotUpdateInput = useCallback(
    (shot: Shot): UpdateShotInput => buildUpdateShotInputFromState(shot, editorState),
    [editorState]
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
      addToast({ type: 'success', title: '已新建分镜', duration: 2400 });
    } catch (error) {
      console.error('Failed to create shot:', error);
      addToast({ type: 'error', title: '新建分镜失败', message: '请稍后重试', duration: 5000 });
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
      addToast({ type: 'success', title: '已删除所选分镜', duration: 2800 });
    } catch (error) {
      console.error('Failed to delete shots:', error);
      addToast({ type: 'error', title: '删除失败', message: '请稍后重试', duration: 5000 });
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
      addToast({ type: 'success', title: '分镜已保存', duration: 2800 });
    } catch (error) {
      console.error('Failed to save shot:', error);
      setSaveMessage('保存失败，请稍后重试');
      setSaveMessageTone('error');
      addToast({ type: 'error', title: '保存失败', message: '请稍后重试', duration: 5000 });
    } finally {
      setSavingShot(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!activeShot || !activeVideoProviderId) return;
    if (
      editorState.video_generation_mode === 'end_frame' &&
      (!editorState.start_image_url || !editorState.end_image_url)
    ) {
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
        video_generation_mode: editorState.video_generation_mode,
        include_action_in_prompt: editorState.video_prompt_flags.include_action,
        include_dialogue_in_prompt: editorState.video_prompt_flags.include_dialogue,
        include_camera_in_prompt: editorState.video_prompt_flags.include_camera,
        include_style_in_prompt: editorState.video_prompt_flags.include_style,
        subtitle_text: editorState.subtitle_text.trim() || undefined,
      });

      setVideoGenProgress(100);

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
      const toastDuration = typeof document !== 'undefined' && document.hidden ? 8000 : 3200;
      addToast({ type: 'success', title: '视频已生成', duration: toastDuration });

      const currentIndex = shots.findIndex(s => s.id === activeShot.id);
      const nextShotItem = shots[currentIndex + 1];
      if (nextShotItem && autoAdvanceAfterVideo) {
        setTimeout(() => setActiveShotId(nextShotItem.id), 800);
      }
    } catch (error: any) {
      console.error('Failed to generate video:', error);
      const errorMsg = error?.message || '视频生成失败，请稍后重试';
      setSaveMessage(errorMsg);
      setSaveMessageTone('error');
      addToast({ type: 'error', title: '视频生成失败', message: errorMsg, duration: 6000 });
      setShotErrors(prev => ({ ...prev, [activeShot.id]: errorMsg }));
    } finally {
      setGeneratingVideo(false);
      setGeneratingShotId(null);
    }
  };

  const handleBatchGenerate = async () => {
    if (!activeVideoProviderId || batchGenerating) return;

    const readyShotIds = Array.from(selectedIds).filter((id) => {
      const shot = shots.find((s) => s.id === id);
      if (!shot) return false;
      const mode = shot.video_generation_mode === 'nine_grid' ? 'nine_grid' : 'end_frame';
      if (mode === 'nine_grid') {
        return !!shot.nine_grid_image_url;
      }
      return !!(shot.start_image_url && shot.end_image_url);
    });

    if (readyShotIds.length === 0) {
      setSaveMessage('所选分镜中没有就绪的双帧分镜');
      setSaveMessageTone('error');
      addToast({
        type: 'warning',
        title: '无法批量生成',
        message: '所选分镜需满足：收尾帧模式双帧就绪，或九宫格模式已有合成图',
        duration: 4000,
      });
      return;
    }

    const concurrency = Math.max(1, Math.min(4, batchConcurrency || 2));
    let successCount = 0;
    let failedCount = 0;
    let completed = 0;

    try {
      setBatchGenerating(true);
      setBatchProgress({ current: 0, total: readyShotIds.length, success: 0, failed: 0 });
      setBatchResults([]);
      setSaveMessage('');
      setSaveMessageTone('success');

      const processOne = async (shotId: string) => {
        const shot = shots.find((s) => s.id === shotId);
        if (!shot) return;
        const mode = shot.video_generation_mode === 'nine_grid' ? 'nine_grid' : 'end_frame';
        if (mode === 'nine_grid' && !shot.nine_grid_image_url) return;
        if (mode === 'end_frame' && (!shot.start_image_url || !shot.end_image_url)) return;

        setGeneratingShotId(shotId);
        try {
          const pf = parseVideoPromptFlags(shot.video_prompt_flags);
          if (pf.include_dialogue && !(shot.subtitle_text?.trim())) {
            const errorMsg = '对白并入视频提示已开启：请先填写对白/口播并保存后再批量生成';
            setShotErrors((prev) => ({ ...prev, [shotId]: errorMsg }));
            failedCount += 1;
            setBatchProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
            setBatchResults((prev) => [...prev, { shotId, success: false, error: errorMsg }]);
            return;
          }

          const batchEditor: ShotEditorState = {
            character_id: shot.character_id || null,
            action_summary: shot.action_summary || shot.description || '未填写镜头描述',
            camera_movement: shot.camera_movement || '',
            start_prompt: shot.start_prompt || '',
            end_prompt: shot.end_prompt || '',
            start_image_url: shot.start_image_url ?? null,
            end_image_url: shot.end_image_url ?? null,
            visual_style: shot.visual_style || '',
            subtitle_text: shot.subtitle_text || '',
            video_generation_mode: mode,
            video_prompt_flags: pf,
          };
          await shotsApi.updateShot(shotId, buildUpdateShotInputFromState(shot, batchEditor));

          const result = await shotsApi.generateShot(shotId, {
            provider_id: activeVideoProviderId,
            video_generation_mode: mode,
            include_action_in_prompt: pf.include_action,
            include_dialogue_in_prompt: pf.include_dialogue,
            include_camera_in_prompt: pf.include_camera,
            include_style_in_prompt: pf.include_style,
          });

          const updatedShot = result.shot || {
            ...shot,
            video_url: result.video_url || shot.video_url,
            duration: result.duration || shot.duration,
            resolution: result.resolution || shot.resolution,
          };
          syncShot(updatedShot);
          setShotErrors((prev) => {
            const next = { ...prev };
            delete next[shotId];
            return next;
          });
          successCount += 1;
          setBatchProgress((prev) => ({ ...prev, success: prev.success + 1 }));
          setBatchResults((prev) => [...prev, { shotId, success: true }]);
        } catch (error: any) {
          const errorMsg = error?.message || '生成失败';
          setShotErrors((prev) => ({ ...prev, [shotId]: errorMsg }));
          failedCount += 1;
          setBatchProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
          setBatchResults((prev) => [...prev, { shotId, success: false, error: errorMsg }]);
        } finally {
          completed += 1;
          setBatchProgress((prev) => ({ ...prev, current: completed }));
        }
      };

      let cursor = 0;
      const workers = Array.from({ length: Math.min(concurrency, readyShotIds.length) }, async () => {
        while (true) {
          const i = cursor++;
          if (i >= readyShotIds.length) break;
          await processOne(readyShotIds[i]);
        }
      });
      await Promise.all(workers);

      setSaveMessage(`批量生成完成：成功 ${successCount}，失败 ${failedCount}`);
      setSaveMessageTone(failedCount > 0 ? 'error' : 'success');
      addToast({
        type: failedCount > 0 ? 'warning' : 'success',
        title: '批量生成完成',
        message: `成功 ${successCount}，失败 ${failedCount}`,
        duration: 5000,
      });
    } finally {
      setBatchGenerating(false);
      setGeneratingShotId(null);
      setBatchProgress({ current: 0, total: 0, success: 0, failed: 0 });
    }
  };

  const handleEditorChange = <K extends keyof ShotEditorState>(key: K, value: ShotEditorState[K]) => {
    if (!skipHistoryRef.current) {
      if (!undoBurstStartRef.current) {
        const snap = editorStateRef.current;
        if (snap) undoBurstStartRef.current = cloneEditorState(snap);
      }
      if (undoBurstTimerRef.current) window.clearTimeout(undoBurstTimerRef.current);
      undoBurstTimerRef.current = window.setTimeout(() => {
        flushBurstToUndo();
        undoBurstTimerRef.current = null;
      }, 450);
    }

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

          const input = buildUpdateShotInputFromState(shot, stateToSave);

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

  const persistEditorToServer = async (): Promise<Shot | null> => {
    const shot = activeShotRef.current;
    const state = editorStateRef.current;
    if (!shot || !state) return null;
    if (!isDirtyRef.current) return shot;
    const updated = await shotsApi.updateShot(shot.id, buildUpdateShotInputFromState(shot, state));
    syncShot(updated);
    isDirtyRef.current = false;
    setIsDirty(false);
    return updated;
  };

  const handleGenerateStartFrame = async () => {
    if (!activeShot || !activeImageProviderId) {
      setSaveMessage('请先配置出图模型（输出设置）');
      setSaveMessageTone('error');
      return;
    }
    if (!editorState.start_prompt?.trim()) {
      setSaveMessage('请填写开始提示词');
      setSaveMessageTone('error');
      return;
    }
    try {
      setGeneratingFrame('start');
      setSaveMessage('');
      await persistEditorToServer();
      const res = await shotsApi.generateStartFrame(activeShot.id, {
        provider_id: activeImageProviderId,
        prompt: editorState.start_prompt.trim(),
      });
      const url = res.shot?.start_image_url || (res as any).imageUrl;
      if (url) {
        handleEditorChange('start_image_url', url);
        if (res.shot) syncShot(res.shot);
        setSaveMessage('开始帧已生成');
        setSaveMessageTone('success');
        addToast({ type: 'success', title: '开始帧已生成', duration: 2800 });
      }
    } catch (e: any) {
      setSaveMessage(e?.message || '生成开始帧失败');
      setSaveMessageTone('error');
      addToast({ type: 'error', title: '生成开始帧失败', message: e?.message || '请稍后重试', duration: 5000 });
    } finally {
      setGeneratingFrame(null);
    }
  };

  const handleGenerateEndFrame = async () => {
    if (!activeShot || !activeImageProviderId) {
      setSaveMessage('请先配置出图模型（输出设置）');
      setSaveMessageTone('error');
      return;
    }
    if (!editorState.end_prompt?.trim()) {
      setSaveMessage('请填写结束提示词');
      setSaveMessageTone('error');
      return;
    }
    try {
      setGeneratingFrame('end');
      setSaveMessage('');
      await persistEditorToServer();
      const res = await shotsApi.generateEndFrame(activeShot.id, {
        provider_id: activeImageProviderId,
        prompt: editorState.end_prompt.trim(),
      });
      const url = res.shot?.end_image_url || (res as any).imageUrl;
      if (url) {
        handleEditorChange('end_image_url', url);
        if (res.shot) syncShot(res.shot);
        setSaveMessage('结束帧已生成');
        setSaveMessageTone('success');
        addToast({ type: 'success', title: '结束帧已生成', duration: 2800 });
      }
    } catch (e: any) {
      setSaveMessage(e?.message || '生成结束帧失败');
      setSaveMessageTone('error');
      addToast({ type: 'error', title: '生成结束帧失败', message: e?.message || '请稍后重试', duration: 5000 });
    } finally {
      setGeneratingFrame(null);
    }
  };

  const handleGenerateBothFrames = async () => {
    if (!activeShot || !activeImageProviderId) {
      setSaveMessage('请先配置出图模型（输出设置）');
      setSaveMessageTone('error');
      return;
    }
    try {
      setGeneratingFrame('both');
      setSaveMessage('');
      await persistEditorToServer();
      const res = await shotsApi.generateBothFrames(activeShot.id, {
        provider_id: activeImageProviderId,
      });
      if (res.shot) {
        syncShot(res.shot);
        skipHistoryRef.current = true;
        setEditorState((prev) => ({
          ...prev,
          start_image_url: res.shot!.start_image_url ?? prev.start_image_url,
          end_image_url: res.shot!.end_image_url ?? prev.end_image_url,
        }));
        window.setTimeout(() => {
          skipHistoryRef.current = false;
        }, 0);
      }
      setSaveMessage('首尾帧已生成');
      setSaveMessageTone('success');
      addToast({ type: 'success', title: '首尾帧已生成', duration: 2800 });
    } catch (e: any) {
      setSaveMessage(e?.message || '生成首尾帧失败');
      setSaveMessageTone('error');
      addToast({ type: 'error', title: '生成首尾帧失败', message: e?.message || '请稍后重试', duration: 5000 });
    } finally {
      setGeneratingFrame(null);
    }
  };

  handleSaveShotRef.current = handleSaveShot;
  handleUndoRef.current = handleUndo;
  handleRedoRef.current = handleRedo;

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
      </div>
    );
  }

  const batchProgressRatio =
    batchGenerating && batchProgress.total > 0 ? Math.min(1, batchProgress.current / batchProgress.total) : 0;

  return (
    <div style={pageStyle}>
      {batchGenerating && batchProgress.total > 0 && (
        <div style={batchProgressTrackStyle} role="progressbar" aria-valuenow={batchProgress.current} aria-valuemin={0} aria-valuemax={batchProgress.total}>
          <div style={{ ...batchProgressFillStyle, width: `${batchProgressRatio * 100}%` }} />
        </div>
      )}
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
                 
                  onClick={selectAll}
                >
                  {selectedIds.size > 0 ? `${selectedIds.size}/${shots.length}` : '全选'}
                </GlassButton>
                {selectedIds.size > 0 && (
                  <>
                    <GlassButton
                      variant="danger"
                      icon={batchDeleteLoading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Trash2 style={{ width: '16px', height: '16px' }} />}
                     
                      loading={batchDeleteLoading}
                      onClick={handleBulkDelete}
                    >
                      删除 ({selectedIds.size})
                    </GlassButton>
                    <label style={batchConcurrencyLabelStyle}>
                      <span>并发</span>
                      <select
                        value={Math.max(1, Math.min(4, batchConcurrency || 2))}
                        onChange={(e) => setBatchConcurrency(parseInt(e.target.value, 10))}
                        style={batchConcurrencySelectStyle}
                        disabled={batchGenerating}
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <GlassButton
                      variant="primary"
                      icon={batchGenerating ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Layers style={{ width: '16px', height: '16px' }} />}
                     
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
            <EpisodeStoryboardOverviewPanel
              scriptContent={episode?.Script?.content}
              scenes={episode?.Scene ?? []}
              shots={shots}
              selectedSceneId={selectedSceneId}
              onSelectScene={setSelectedSceneId}
            />
            <div style={listPanelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <h3 style={panelTitleStyle}>分镜列表</h3>
                  <p style={panelSubtitleStyle}>
                    点击分镜在右侧编辑；未聚焦输入框时 Alt+↑/↓ 切换分镜，Ctrl+S 保存，Ctrl+Alt+Z 撤销、Ctrl+Alt+Shift+Z 或 Ctrl+Alt+Y 重做编辑。
                  </p>
                </div>
              </div>

              <div style={listFilterBarStyle}>
                <Filter style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                {(
                  [
                    { key: 'all' as const, label: '全部', title: '显示本集全部分镜' },
                    { key: 'ready' as const, label: '可生成', title: '双帧已齐、尚无成片的分镜' },
                    { key: 'video' as const, label: '已有视频', title: '已生成视频成片的分镜' },
                    { key: 'failed' as const, label: '失败', title: '上次生成失败的分镜' },
                  ] as const
                ).map(({ key, label, title }) => (
                  <button
                    key={key}
                    type="button"
                    title={title}
                    aria-pressed={listFilter === key}
                    onClick={() => setListFilter(key)}
                    style={{
                      ...listFilterChipStyle,
                      ...(listFilter === key ? listFilterChipActiveStyle : null),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div ref={listScrollParentRef} style={listScrollStyle} role="list" aria-label="分镜列表">
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const shot = filteredShots[virtualRow.index];
                    if (!shot) return null;
                    return (
                      <div
                        key={shot.id}
                        role="presentation"
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <ShotListItem
                          shot={shot}
                          index={shots.findIndex((s) => s.id === shot.id)}
                          active={shot.id === activeShotId}
                          selected={selectedIds.has(shot.id)}
                          isGenerating={generatingShotId === shot.id}
                          hasError={!!shotErrors[shot.id]}
                          errorMessage={shotErrors[shot.id]}
                          onActive={() => setActiveShotId(shot.id)}
                          onToggleSelect={() => toggleSelect(shot.id)}
                        />
                      </div>
                    );
                  })}
                </div>
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <GlassButton
                          variant="secondary"
                          icon={generatingVideo ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Video style={{ width: '16px', height: '16px' }} />}
                         
                          loading={generatingVideo}
                          disabled={!canGenerateVideo}
                          onClick={handleGenerateVideo}
                          title="云端渲染耗时因模型、分辨率与时长而异，通常需数分钟"
                        >
                          生成视频
                        </GlassButton>
                        <label style={autoAdvanceLabelStyle}>
                          <input
                            type="checkbox"
                            checked={autoAdvanceAfterVideo}
                            onChange={(e) => setAutoAdvanceAfterVideo(e.target.checked)}
                            disabled={generatingVideo}
                          />
                          生成成功后自动切到下一镜
                        </label>
                        {!canGenerateVideo && getGenerateButtonDisabledReason && (
                          <span style={disabledReasonStyle}>
                            <AlertCircle style={{ width: '10px', height: '10px' }} />
                            {getGenerateButtonDisabledReason}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <GlassButton
                          variant="secondary"
                          icon={<Undo2 style={{ width: '16px', height: '16px' }} />}
                         
                          disabled={!canUndo || savingShot || generatingVideo}
                          onClick={handleUndo}
                          title="撤销（Ctrl+Alt+Z）"
                        >
                          撤销
                        </GlassButton>
                        <GlassButton
                          variant="secondary"
                          icon={<Redo2 style={{ width: '16px', height: '16px' }} />}
                         
                          disabled={!canRedo || savingShot || generatingVideo}
                          onClick={handleRedo}
                          title="重做（Ctrl+Alt+Shift+Z 或 Ctrl+Alt+Y）"
                        >
                          重做
                        </GlassButton>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <GlassButton
                          variant="primary"
                          icon={savingShot || autoSaving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
                         
                          loading={savingShot}
                          onClick={handleSaveShot}
                          title="快捷键 Ctrl+S"
                        >
                          保存分镜
                        </GlassButton>
                        {(isDirty || autoSaving) && (
                          <span style={dirtyHintStyle}>{autoSaving ? '自动保存中…' : '有未保存的修改'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={outputStripStyle}>
                    <div style={outputStripTitleRowStyle}>
                      <Video style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                      <span style={outputStripTitleTextStyle}>输出设置</span>
                      <span style={outputStripHintStyle}>视频模型、出图模型与成片规格（本镜生效）</span>
                    </div>
                    <div style={outputStripGridStyle}>
                      <label style={outputFieldLabelStyle}>
                        视频生成模式
                        <select
                          value={editorState.video_generation_mode}
                          onChange={(e) => {
                            const v = e.target.value === 'nine_grid' ? 'nine_grid' : 'end_frame';
                            handleEditorChange('video_generation_mode', v);
                          }}
                          style={outputSelectStyle}
                        >
                          <option value="end_frame">收尾帧（首尾帧）</option>
                          <option value="nine_grid">九宫格参考</option>
                        </select>
                      </label>
                      <label style={outputFieldLabelStyle}>
                        视频模型
                        <select
                          value={selectedProviderId || activeVideoProvider?.id || ''}
                          onChange={(e) => setSelectedProviderId(e.target.value || null)}
                          style={outputSelectStyle}
                        >
                          {enabledProviders.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name || provider.type || 'Provider'}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={outputFieldLabelStyle}>
                        出图模型（首尾帧）
                        <select
                          value={imageProviderId || activeImageProvider?.id || ''}
                          onChange={(e) => setImageProviderId(e.target.value || null)}
                          style={outputSelectStyle}
                        >
                          {enabledProviders.map((provider) => (
                            <option key={`img-${provider.id}`} value={provider.id}>
                              {provider.name || provider.type || 'Provider'}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={outputFieldLabelStyle}>
                        画幅
                        <select
                          value={activeShot.aspect_ratio || '16:9'}
                          onChange={(e) => {
                            const shot = activeShot;
                            const v = e.target.value;
                            const updated = { ...shot, aspect_ratio: v };
                            syncShot(updated);
                            shotsApi.updateShot(shot.id, { aspect_ratio: v }).catch(console.error);
                          }}
                          style={outputSelectStyle}
                        >
                          <option value="16:9">16:9</option>
                          <option value="9:16">9:16</option>
                          <option value="1:1">1:1</option>
                          <option value="4:3">4:3</option>
                        </select>
                      </label>
                      <label style={outputFieldLabelStyle}>
                        分辨率
                        <select
                          value={activeShot.resolution || '1080p'}
                          onChange={(e) => {
                            const shot = activeShot;
                            const v = e.target.value;
                            const updated = { ...shot, resolution: v };
                            syncShot(updated);
                            shotsApi.updateShot(shot.id, { resolution: v }).catch(console.error);
                          }}
                          style={outputSelectStyle}
                        >
                          <option value="480p">480p</option>
                          <option value="720p">720p</option>
                          <option value="1080p">1080p</option>
                          <option value="2k">2K</option>
                          <option value="4k">4K</option>
                        </select>
                      </label>
                      <label style={outputFieldLabelStyle}>
                        时长
                        <select
                          value={activeShot.duration || 8}
                          onChange={(e) => {
                            const shot = activeShot;
                            const d = parseInt(e.target.value, 10);
                            const updated = { ...shot, duration: d };
                            syncShot(updated);
                            shotsApi.updateShot(shot.id, { duration: d }).catch(console.error);
                          }}
                          style={outputSelectStyle}
                        >
                          <option value="4">4s</option>
                          <option value="6">6s</option>
                          <option value="8">8s</option>
                          <option value="10">10s</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div style={detailBodyStyle}>
                    <section style={editorSectionStyle}>
                      <div style={sectionTitleStyle}>
                        <FileText style={{ width: '16px', height: '16px' }} />
                        镜头与音画
                      </div>
                      <p style={sectionHintStyle}>
                        下方开关控制生成视频时是否把对应文案写入提示词；对白并入后实际是否有声画取决于模型能力。
                      </p>
                      <div style={toggleGridStyle}>
                        <label style={toggleRowStyle}>
                          <input
                            type="checkbox"
                            checked={editorState.video_prompt_flags.include_action}
                            onChange={(e) =>
                              handleEditorChange('video_prompt_flags', {
                                ...editorState.video_prompt_flags,
                                include_action: e.target.checked,
                              })
                            }
                          />
                          镜头描述并入视频提示
                        </label>
                        <label style={toggleRowStyle}>
                          <input
                            type="checkbox"
                            checked={editorState.video_prompt_flags.include_camera}
                            onChange={(e) =>
                              handleEditorChange('video_prompt_flags', {
                                ...editorState.video_prompt_flags,
                                include_camera: e.target.checked,
                              })
                            }
                          />
                          镜头运动并入视频提示
                        </label>
                        <label style={toggleRowStyle}>
                          <input
                            type="checkbox"
                            checked={editorState.video_prompt_flags.include_style}
                            onChange={(e) =>
                              handleEditorChange('video_prompt_flags', {
                                ...editorState.video_prompt_flags,
                                include_style: e.target.checked,
                              })
                            }
                          />
                          视觉风格并入视频提示
                        </label>
                        <label style={toggleRowStyle}>
                          <input
                            type="checkbox"
                            checked={editorState.video_prompt_flags.include_dialogue}
                            onChange={(e) =>
                              handleEditorChange('video_prompt_flags', {
                                ...editorState.video_prompt_flags,
                                include_dialogue: e.target.checked,
                              })
                            }
                          />
                          对白 / 口播并入视频提示
                        </label>
                      </div>
                      <div style={sectionTitleStyle}>
                        <FileText style={{ width: '14px', height: '14px' }} />
                        镜头描述
                      </div>
                      <MentionInput
                        value={editorState.action_summary}
                        onChange={(val) => handleEditorChange('action_summary', val)}
                        placeholder="填写镜头内容、表演动作、画面重点。使用 @ 角色 · # 场景 · $ 物品 · * 图片素材"
                        projectId={projectId || ''}
                        rows={6}
                      />
                      <div style={{ ...sectionTitleStyle, marginTop: '14px' }}>
                        <Mic style={{ width: '14px', height: '14px' }} />
                        对白 / 口播
                      </div>
                      <textarea
                        value={editorState.subtitle_text}
                        onChange={(e) => handleEditorChange('subtitle_text', e.target.value)}
                        placeholder="例如：角色台词、旁白（与镜头描述配合使用）"
                        style={textareaCompactStyle}
                        rows={3}
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
                          placeholder="开始提示词。@ 角色 · # 场景 · $ 物品 · * 图片素材"
                          projectId={projectId || ''}
                          rows={4}
                        />
                      </div>
                      <div style={editorSectionStyle}>
                        <div style={sectionTitleStyle}>结束提示词</div>
                        <MentionInput
                          value={editorState.end_prompt}
                          onChange={(val) => handleEditorChange('end_prompt', val)}
                          placeholder="结束提示词。@ 角色 · # 场景 · $ 物品 · * 图片素材"
                          projectId={projectId || ''}
                          rows={4}
                        />
                      </div>
                    </section>

                    {editorState.video_generation_mode === 'end_frame' && (
                      <>
                        <section style={editorSectionStyle}>
                          <div style={sectionTitleStyle}>
                            <Sparkles style={{ width: '16px', height: '16px' }} />
                            由提示词生成首尾帧
                          </div>
                          <p style={sectionHintStyle}>
                            使用上方开始/结束提示词与「输出设置」中的出图模型。生成后会自动填入引用素材。
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                            <GlassButton
                              variant="secondary"
                              icon={
                                generatingFrame === 'start' ? (
                                  <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  <Sparkles style={{ width: '14px', height: '14px' }} />
                                )
                              }
                             
                              loading={generatingFrame === 'start'}
                              disabled={!!generatingFrame || !activeImageProviderId}
                              onClick={() => void handleGenerateStartFrame()}
                            >
                              生成开始帧
                            </GlassButton>
                            <GlassButton
                              variant="secondary"
                              icon={
                                generatingFrame === 'end' ? (
                                  <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  <Sparkles style={{ width: '14px', height: '14px' }} />
                                )
                              }
                             
                              loading={generatingFrame === 'end'}
                              disabled={!!generatingFrame || !activeImageProviderId}
                              onClick={() => void handleGenerateEndFrame()}
                            >
                              生成结束帧
                            </GlassButton>
                            <GlassButton
                              variant="primary"
                              icon={
                                generatingFrame === 'both' ? (
                                  <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  <Layers style={{ width: '14px', height: '14px' }} />
                                )
                              }
                             
                              loading={generatingFrame === 'both'}
                              disabled={!!generatingFrame || !activeImageProviderId}
                              onClick={() => void handleGenerateBothFrames()}
                            >
                              同时生成首尾帧
                            </GlassButton>
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
                      </>
                    )}

                    {editorState.video_generation_mode === 'nine_grid' && (
                      <ShotNineGridWorkbench
                        shotId={activeShot.id}
                        defaultPrompt={editorState.start_prompt || editorState.action_summary || activeShot.description || ''}
                        onApplyImage={handleApplyPanelImage}
                        imageProviderId={activeImageProviderId}
                        onRemoteShotChange={async () => {
                          try {
                            const s = await shotsApi.getShot(activeShot.id);
                            syncShot(s);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      />
                    )}

                    {generatingVideo && (
                      <section style={videoGeneratingPanelStyle}>
                        <div style={videoGeneratingIconWrapStyle}>
                          <Loader2 style={{ width: '28px', height: '28px', animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={videoGeneratingTitleStyle}>正在生成视频</div>
                          <div style={videoGeneratingMetaStyle}>
                            <Clock style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                            已等待 {videoGenElapsedSec} 秒
                            <span style={{ opacity: 0.7 }}>·</span>
                            {activeShot.resolution || '1080p'} · {activeShot.duration ?? 8}s · {activeVideoProvider?.name || '当前模型'}
                            {editorState.video_prompt_flags.include_dialogue ? ' · 对白并入提示' : ''}
                          </div>
                          <div style={videoGenProgressTrackStyle}>
                            <div style={{ ...videoGenProgressFillStyle, width: `${videoGenProgress}%` }} />
                          </div>
                          <p style={videoGeneratingHintStyle}>
                            下方为估算进度（非云端真实百分比）。云端排队与渲染可能需要数分钟；请勿关闭或刷新本页。切换标签后完成时仍会弹出提示。
                          </p>
                        </div>
                      </section>
                    )}

                    <section style={metaBarStyle}>
                      <span style={metaBadgeStyle}>视频 {activeVideoProvider?.name || '未配置'}</span>
                      <span style={metaBadgeStyle}>出图 {activeImageProvider?.name || '未配置'}</span>
                      <span style={metaBadgeStyle}>
                        {editorState.video_generation_mode === 'nine_grid'
                          ? activeShot.nine_grid_image_url
                            ? '九宫格合成已就绪'
                            : '九宫格参考待准备'
                          : editorState.start_image_url && editorState.end_image_url
                            ? '双帧已就绪'
                            : '缺少起止帧'}
                      </span>
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
      role="listitem"
      aria-current={active ? 'true' : undefined}
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

      <div style={shotThumbWrapStyle} aria-hidden>
        {shot.start_image_url || shot.end_image_url ? (
          <img
            src={(shot.start_image_url || shot.end_image_url) as string}
            alt=""
            style={shotThumbStyle}
          />
        ) : shot.video_url ? (
          <div style={{ ...shotThumbPlaceholderStyle, color: '#8b5cf6' }} title="已有成片">
            <Clapperboard style={{ width: '18px', height: '18px' }} />
          </div>
        ) : (
          <div style={shotThumbPlaceholderStyle}>
            <Image style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>

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
  position: 'relative',
};

const batchProgressTrackStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  height: '3px',
  width: '100%',
  background: 'var(--border-primary)',
};

const batchProgressFillStyle: CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
  transition: 'width 0.25s ease',
};

const dirtyHintStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#f59e0b',
  maxWidth: '140px',
  textAlign: 'right',
};

const autoAdvanceLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  cursor: 'pointer',
  userSelect: 'none',
  maxWidth: '200px',
  lineHeight: 1.35,
};

const videoGeneratingPanelStyle: CSSProperties = {
  padding: '16px 18px',
  borderRadius: '16px',
  border: '1px solid rgba(139, 92, 246, 0.35)',
  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
  display: 'flex',
  gap: '14px',
  alignItems: 'flex-start',
};

const videoGeneratingIconWrapStyle: CSSProperties = {
  flexShrink: 0,
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'rgba(139, 92, 246, 0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const videoGeneratingTitleStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: '6px',
};

const videoGeneratingMetaStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '8px',
};

const videoGeneratingHintStyle: CSSProperties = {
  margin: 0,
  fontSize: '12px',
  lineHeight: 1.55,
  color: 'var(--text-muted)',
};

const toggleGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '10px 16px',
  marginBottom: '14px',
};

const toggleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};

const syncAudioVideoRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  marginTop: '12px',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  userSelect: 'none',
  lineHeight: 1.45,
};

const videoGenProgressTrackStyle: CSSProperties = {
  width: '100%',
  height: '6px',
  borderRadius: '999px',
  background: 'var(--border-primary)',
  overflow: 'hidden',
  marginBottom: '10px',
};

const videoGenProgressFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: '999px',
  background: 'linear-gradient(90deg, #8b5cf6, #c4b5fd)',
  transition: 'width 0.35s ease',
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
  gridTemplateColumns: 'minmax(220px, 1fr) minmax(280px, 1.1fr) minmax(0, 2.2fr)',
  gap: '16px',
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

const listFilterBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  padding: '0 14px 12px',
  borderBottom: '1px solid var(--border-primary)',
};

const listFilterChipStyle: CSSProperties = {
  padding: '6px 12px',
  borderRadius: '999px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-page)',
  color: 'var(--text-secondary)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};

const listFilterChipActiveStyle: CSSProperties = {
  border: '1px solid rgba(139, 92, 246, 0.45)',
  background: 'rgba(139, 92, 246, 0.12)',
  color: 'var(--text-primary)',
};

const outputStripStyle: CSSProperties = {
  padding: '16px 22px',
  borderBottom: '1px solid var(--border-primary)',
  background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.06) 0%, transparent 100%)',
};

const outputStripTitleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  marginBottom: '12px',
};

const outputStripTitleTextStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const outputStripHintStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: 500,
};

const outputStripGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '12px 16px',
};

const outputFieldLabelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
};

const outputSelectStyle: CSSProperties = {
  width: '100%',
  height: '38px',
  borderRadius: '10px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-page)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 600,
  padding: '0 10px',
  cursor: 'pointer',
  outline: 'none',
};

const shotThumbWrapStyle: CSSProperties = {
  width: '56px',
  height: '56px',
  flexShrink: 0,
  borderRadius: '10px',
  overflow: 'hidden',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const shotThumbStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const shotThumbPlaceholderStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-page)',
};

const batchConcurrencyLabelStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
};

const batchConcurrencySelectStyle: CSSProperties = {
  height: '36px',
  minWidth: '52px',
  padding: '0 10px',
  borderRadius: '10px',
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
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
