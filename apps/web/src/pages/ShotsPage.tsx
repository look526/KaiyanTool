import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Play,
  Clock,
  GripVertical,
  Settings2,
  Sparkles,
  Grid3x3,
  Video as VideoIcon,
  FileText,
  Wand2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { VideoPlayer } from '../components/VideoPlayer';
import { apiClient } from '../lib/api';
import { Shot, getShotDisplayNumber, getShotStatus, getShotStatusLabel, getShotStatusColor, getShotStatusBackgroundColor, getShotStatusBorderColor } from '../lib/shotUtils';
import { useToast } from '../components/ui/Toast';

interface ShotFormData {
  sceneId?: string;
  characterId?: string;
  chapterNumber?: number;
  episodeNumber?: number;
  segmentId?: number;
  cellId?: number;
  actionSummary?: string;
  cameraMovement?: string;
  startPrompt?: string;
  endPrompt?: string;
  duration?: number;
  aspectRatio?: string;
  visualStyle?: string;
}

export default function ShotsPage() {
  const { id } = useParams<{ id: string }>();
  const [shots, setShots] = useState<Shot[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shotToDelete, setShotToDelete] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
  const [generatingVideo, setGeneratingVideo] = useState<Set<string>>(new Set());
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [visualStyle, setVisualStyle] = useState('');
  const [generatingFromScript, setGeneratingFromScript] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [optimizingShot, setOptimizingShot] = useState<Shot | null>(null);
  const [optimizingPrompt, setOptimizingPrompt] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState<ShotFormData>({
    sceneId: '',
    characterId: '',
    chapterNumber: 1,
    episodeNumber: 1,
    segmentId: 1,
    cellId: 1,
    actionSummary: '',
    cameraMovement: '',
    startPrompt: '',
    endPrompt: '',
    duration: 8,
    aspectRatio: '16:9',
    visualStyle: '',
  });

  const loadShots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getShots(id!);
      setShots(data);
    } catch (error) {
      console.error('Failed to load shots:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadScenesAndCharacters = useCallback(async () => {
    try {
      const [scenesData, charactersData, providersData] = await Promise.all([
        apiClient.getScenes(id!),
        apiClient.getCharacters(id!),
        apiClient.getAIProviders(),
      ]);
      setScenes(scenesData);
      setCharacters(charactersData);
      setProviders(providersData.providers || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [id]);

  useEffect(() => {
    loadShots();
    loadScenesAndCharacters();
  }, [loadShots, loadScenesAndCharacters]);

  const handleSave = async () => {
    try {
      const data = {
        sceneId: form.sceneId || undefined,
        characterId: form.characterId || undefined,
        chapterNumber: form.chapterNumber,
        episodeNumber: form.episodeNumber,
        segmentId: form.segmentId,
        cellId: form.cellId,
        actionSummary: form.actionSummary || undefined,
        cameraMovement: form.cameraMovement || undefined,
        startPrompt: form.startPrompt || undefined,
        endPrompt: form.endPrompt || undefined,
        duration: form.duration,
        aspectRatio: form.aspectRatio,
        visualStyle: form.visualStyle || undefined,
      };

      if (editingShot) {
        await apiClient.updateShot(editingShot.id, data);
      } else {
        await apiClient.createShot(id!, data);
      }

      await loadShots();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save shot:', error);
    }
  };

  const handleDelete = async () => {
    if (!shotToDelete) return;

    try {
      await apiClient.deleteShot(shotToDelete);
      await loadShots();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete shot:', error);
    }
  };

  const handleGenerateVideo = async (shot: Shot) => {
    const provider = providers.find(p => p.enabled);
    if (!provider) {
      addToast({
        type: 'warning',
        title: '未配置提供商',
        message: '请先在 AI 提供商设置中添加并启用一个提供商。',
      });
      return;
    }

    if (!shot.startImageUrl || !shot.endImageUrl) {
      addToast({
        type: 'warning',
        title: '缺少关键帧',
        message: '请先生成起始帧和结束帧。',
      });
      return;
    }

    try {
      setGeneratingVideo(prev => new Set([...prev, shot.id]));
      await apiClient.generateShotVideo(shot.id, provider.id);
      await loadShots();
    } catch (error) {
      console.error('Failed to generate video:', error);
      addToast({
        type: 'error',
        title: '视频生成失败',
        message: '请稍后重试。',
      });
    } finally {
      setGeneratingVideo(prev => {
        const next = new Set(prev);
        next.delete(shot.id);
        return next;
      });
    }
  };

  const handleOpenVideoModal = (shot: Shot) => {
    if (shot.videoUrl) {
      setSelectedShot(shot);
      setShowVideoModal(true);
    } else {
      addToast({
        type: 'info',
        title: '暂无视频',
        message: '该镜头尚未生成视频。',
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, shotId: string) => {
    setDraggingId(shotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const shotsCopy = [...shots];
    const draggedIndex = shotsCopy.findIndex(s => s.id === draggingId);
    const targetIndex = shotsCopy.findIndex(s => s.id === targetId);

    const [draggedShot] = shotsCopy.splice(draggedIndex, 1);
    shotsCopy.splice(targetIndex, 0, draggedShot);

    const reorderedShots = shotsCopy.map((shot, index) => ({
      id: shot.id,
      chapterNumber: Math.floor(index / 1000) + 1,
      episodeNumber: (index % 1000) + 1,
      segmentId: (index % 100) + 1,
      cellId: (index % 9) + 1,
    }));

    try {
      await apiClient.reorderShots(id!, reorderedShots);
      setShots(shotsCopy);
    } catch (error) {
      console.error('Failed to reorder shots:', error);
    }

    setDraggingId(null);
  };

  const handleOpenModal = (shot?: Shot) => {
    if (shot) {
      setEditingShot(shot);
      setForm({
        sceneId: shot.sceneId || '',
        characterId: shot.characterId || '',
        chapterNumber: shot.chapterNumber,
        episodeNumber: shot.episodeNumber,
        segmentId: shot.segmentId,
        cellId: shot.cellId,
        actionSummary: shot.actionSummary || '',
        cameraMovement: shot.cameraMovement || '',
        startPrompt: shot.startPrompt || '',
        endPrompt: shot.endPrompt || '',
        duration: shot.duration,
        aspectRatio: shot.aspectRatio,
        visualStyle: shot.visualStyle || '',
      });
    } else {
      setEditingShot(null);
      setForm({
        sceneId: '',
        characterId: '',
        chapterNumber: 1,
        episodeNumber: 1,
        segmentId: 1,
        cellId: 1,
        actionSummary: '',
        cameraMovement: '',
        startPrompt: '',
        endPrompt: '',
        duration: 8,
        aspectRatio: '16:9',
        visualStyle: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShot(null);
    setForm({
      sceneId: '',
      characterId: '',
      chapterNumber: 1,
      episodeNumber: 1,
      segmentId: 1,
      cellId: 1,
      actionSummary: '',
      cameraMovement: '',
      startPrompt: '',
      endPrompt: '',
      duration: 8,
      aspectRatio: '16:9',
      visualStyle: '',
    });
  };

  const handleOpenDeleteModal = (shotId: string) => {
    setShotToDelete(shotId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setShotToDelete(null);
  };

  const handleGenerateImages = async (shotId: string) => {
    const provider = providers.find(p => p.enabled);
    if (!provider) {
      addToast({
        type: 'warning',
        title: '未配置提供商',
        message: '请先在 AI 提供商设置中添加并启用一个提供商。',
      });
      return;
    }

    try {
      setGeneratingImages(prev => new Set([...prev, shotId]));
      await apiClient.generateShotBothImages(shotId, provider.id);
      await loadShots();
    } catch (error) {
      console.error('Failed to generate images:', error);
      addToast({
        type: 'error',
        title: '图像生成失败',
        message: '请稍后重试。',
      });
    } finally {
      setGeneratingImages(prev => {
        const next = new Set(prev);
        next.delete(shotId);
        return next;
      });
    }
  };

  const handleGenerateFromScript = async () => {
    if (!scriptContent.trim()) {
      addToast({
        type: 'warning',
        title: '缺少内容',
        message: '请输入剧本内容。',
      });
      return;
    }

    try {
      setGeneratingFromScript(true);
      const result = await apiClient.generateShotsFromScript(id!, scriptContent, visualStyle);
      await loadShots();
      setShowScriptModal(false);
      setScriptContent('');
      setVisualStyle('');
      addToast({
        type: 'success',
        title: '生成成功',
        message: `成功生成 ${result.count} 个镜头。`,
      });
    } catch (error) {
      console.error('Failed to generate shots from script:', error);
      addToast({
        type: 'error',
        title: '生成失败',
        message: '生成分镜失败，请稍后重试。',
      });
    } finally {
      setGeneratingFromScript(false);
    }
  };

  const handleOpenOptimizeModal = (shot: Shot) => {
    setOptimizingShot(shot);
    setShowOptimizeModal(true);
  };

  const handleCloseOptimizeModal = () => {
    setShowOptimizeModal(false);
    setOptimizingShot(null);
  };

  const handleOptimizePrompt = async () => {
    if (!optimizingShot) return;

    const provider = providers.find(p => p.enabled);
    if (!provider) {
      addToast({
        type: 'warning',
        title: '未配置提供商',
        message: '请先在 AI 提供商设置中添加并启用一个提供商。',
      });
      return;
    }

    try {
      setOptimizingPrompt(true);
      const referenceImages: string[] = [];
      if (optimizingShot.startImageUrl) referenceImages.push(optimizingShot.startImageUrl);
      if (optimizingShot.endImageUrl) referenceImages.push(optimizingShot.endImageUrl);

      await apiClient.optimizeShotPrompt(optimizingShot.id, referenceImages);
      await loadShots();
      handleCloseOptimizeModal();
      addToast({
        type: 'success',
        title: '优化成功',
        message: '提示词已优化完成。',
      });
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
      addToast({
        type: 'error',
        title: '优化失败',
        message: '提示词优化失败，请稍后重试。',
      });
    } finally {
      setOptimizingPrompt(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to={`/projects/${id}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </Link>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>镜头管理</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                共 {shots.length} 个镜头
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to={`/projects/${id}/video-merge`}
              style={{
                height: '38px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '9px',
                cursor: 'pointer',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            >
              <VideoIcon style={{ width: '16px', height: '16px' }} />
              视频拼接
            </Link>
            <button
              onClick={() => setShowScriptModal(true)}
              style={{
                height: '38px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '9px',
                cursor: 'pointer',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            >
              <Wand2 style={{ width: '16px', height: '16px' }} />
              从剧本生成
            </button>
            <Button onClick={() => handleOpenModal()}>
              <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              添加镜头
            </Button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {shots.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}>
              <Play style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-tertiary)', fontSize: '16px', marginBottom: '24px' }}>
                暂无镜头，点击右上角添加
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                添加镜头
              </Button>
            </div>
          ) : (
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {shots.map((shot, index) => {
                const shotStatus = getShotStatus(shot);
                const displayNumber = getShotDisplayNumber(shot, index);

                return (
                <Card
                  key={shot.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, shot.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, shot.id)}
                  style={{
                    padding: '16px',
                    cursor: 'grab',
                    userSelect: 'none',
                    border: draggingId === shot.id ? '2px dashed var(--accent)' : '1px solid var(--border-primary)',
                    opacity: draggingId === shot.id ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <GripVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-hover)',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace',
                        }}>
                          {displayNumber}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: getShotStatusBackgroundColor(shotStatus),
                          border: `1px solid ${getShotStatusBorderColor(shotStatus)}`,
                          fontSize: '10px',
                          fontWeight: '600',
                          color: getShotStatusColor(shotStatus),
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {getShotStatusLabel(shotStatus)}
                        </span>
                      </div>
                      {shot.actionSummary && (
                        <p style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.5',
                          margin: '0 0 8px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {shot.actionSummary}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleGenerateImages(shot.id)}
                        disabled={generatingImages.has(shot.id)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: generatingImages.has(shot.id) ? 'var(--bg-hover)' : 'transparent',
                          color: generatingImages.has(shot.id) ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: generatingImages.has(shot.id) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!generatingImages.has(shot.id)) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            e.currentTarget.style.color = '#6366f1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = generatingImages.has(shot.id) ? 'var(--bg-hover)' : 'transparent';
                          e.currentTarget.style.color = generatingImages.has(shot.id) ? 'var(--text-muted)' : 'var(--text-primary)';
                        }}
                      >
                        {generatingImages.has(shot.id) ? (
                          <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Sparkles style={{ width: '14px', height: '14px' }} />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenOptimizeModal(shot)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = '#f59e0b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        title="优化提示词"
                      >
                        <Wand2 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(shot)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Edit2 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(shot.id)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <Link
                        to={`/shots/${shot.id}/panels`}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = '#10b981';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Grid3x3 style={{ width: '14px', height: '14px' }} />
                      </Link>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {shot.scene && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <Settings2 style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                        {shot.scene.location} · {shot.scene.time}
                      </div>
                    )}
                    {shot.character && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        角色: {shot.character.name}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <Clock style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                      时长: {shot.duration}秒
                    </div>
                    {shot.cameraMovement && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        镜头运动: {shot.cameraMovement}
                      </div>
                    )}
                  </div>

                  {(shot.startImageUrl || shot.endImageUrl) && (
                    <div style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-hover)',
                      display: 'flex',
                      gap: '8px',
                    }}>
                      {shot.startImageUrl && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>起始帧</div>
                          <img
                            src={shot.startImageUrl}
                            alt="起始帧"
                            style={{
                              width: '100%',
                              aspectRatio: shot.aspectRatio === '16:9' ? '16/9' : '4/3',
                              borderRadius: '4px',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      )}
                      {shot.endImageUrl && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>结束帧</div>
                          <img
                            src={shot.endImageUrl}
                            alt="结束帧"
                            style={{
                              width: '100%',
                              aspectRatio: shot.aspectRatio === '16:9' ? '16/9' : '4/3',
                              borderRadius: '4px',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {shot.videoUrl ? (
                    <div style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--accent-bg)',
                      border: '1px solid var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: 'var(--accent-text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleOpenVideoModal(shot)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    >
                      <Play style={{ width: '14px', height: '14px' }} />
                      <span>播放视频</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateVideo(shot)}
                      disabled={generatingVideo.has(shot.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: generatingVideo.has(shot.id) ? 'var(--bg-hover)' : '#6366f1',
                        color: 'white',
                        cursor: generatingVideo.has(shot.id) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                      onMouseEnter={(e) => {
                        if (!generatingVideo.has(shot.id)) {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = generatingVideo.has(shot.id) ? 'var(--bg-hover)' : '#6366f1';
                      }}
                    >
                      {generatingVideo.has(shot.id) ? (
                        <>
                          <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite', marginRight: '6px' }} />
                          生成中...
                        </>
                      ) : (
                        <>
                          <VideoIcon style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                          生成视频
                        </>
                      )}
                    </button>
                  )}
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleCloseModal}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            margin: '24px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                {editingShot ? '编辑镜头' : '添加镜头'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    场景
                  </label>
                  <select
                    value={form.sceneId || ''}
                    onChange={(e) => setForm({ ...form, sceneId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">选择场景</option>
                    {scenes.map((scene) => (
                      <option key={scene.id} value={scene.id}>
                        {scene.location} - {scene.time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    角色
                  </label>
                  <select
                    value={form.characterId || ''}
                    onChange={(e) => setForm({ ...form, characterId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">选择角色</option>
                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    章节
                  </label>
                  <input
                    type="number"
                    value={form.chapterNumber}
                    onChange={(e) => setForm({ ...form, chapterNumber: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    集数
                  </label>
                  <input
                    type="number"
                    value={form.episodeNumber}
                    onChange={(e) => setForm({ ...form, episodeNumber: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    段落
                  </label>
                  <input
                    type="number"
                    value={form.segmentId}
                    onChange={(e) => setForm({ ...form, segmentId: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    镜头号
                  </label>
                  <input
                    type="number"
                    value={form.cellId}
                    onChange={(e) => setForm({ ...form, cellId: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  动作摘要
                </label>
                <textarea
                  value={form.actionSummary}
                  onChange={(e) => setForm({ ...form, actionSummary: e.target.value })}
                  placeholder="描述镜头中的动作内容"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    镜头运动
                  </label>
                  <input
                    type="text"
                    value={form.cameraMovement}
                    onChange={(e) => setForm({ ...form, cameraMovement: e.target.value })}
                    placeholder="例如：推、拉、摇、移"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    时长（秒）
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 8 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    宽高比
                  </label>
                  <select
                    value={form.aspectRatio}
                    onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="9:16">9:16</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    视觉风格
                  </label>
                  <input
                    type="text"
                    value={form.visualStyle}
                    onChange={(e) => setForm({ ...form, visualStyle: e.target.value })}
                    placeholder="例如：写实、卡通、动漫"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={handleCloseModal}
                >
                  取消
                </Button>
                <Button
                  style={{ flex: 1 }}
                  onClick={handleSave}
                >
                  {editingShot ? '保存' : '添加'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleCloseDeleteModal}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '448px',
            width: '100%',
            margin: '24px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '12px',
              margin: '0 0 12px 0',
            }}>确认删除镜头</h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              您确定要删除此镜头吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={handleCloseDeleteModal}
              >
                取消
              </Button>
              <Button
                style={{
                  flex: 1,
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                }}
                onClick={handleDelete}
              >
                <Trash2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                删除
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showVideoModal && selectedShot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowVideoModal(false)}
        >
          <Card style={{
            maxWidth: '900px',
            width: '90%',
            padding: '16px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                视频预览
              </h2>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <VideoPlayer
                src={selectedShot.videoUrl!}
              />
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-hover)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>
                <Clock style={{ width: '14px', height: '14px' }} />
                <span>时长: {selectedShot.duration}秒</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showScriptModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowScriptModal(false)}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            margin: '24px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                从剧本生成分镜
              </h2>
              <button
                onClick={() => setShowScriptModal(false)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  剧本内容
                </label>
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="输入剧本内容，AI 将自动解析并生成分镜"
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  视觉风格（可选）
                </label>
                <input
                  type="text"
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  placeholder="例如：写实、卡通、动漫、电影感"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-hover)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>
                <FileText style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                剧本格式示例：
                <pre style={{
                  margin: '8px 0 0 0',
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-primary)',
                  fontSize: '12px',
                  lineHeight: '1.5',
                }}>场景1: 客厅，白天
小明: 你好，今天天气真好
小红: 是啊，我们要去哪里？
场景2: 公园，下午
小明: 我们去公园散步吧</pre>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  style={{ flex: 1, height: '38px', padding: '0 20px', fontSize: '14px', fontWeight: '500', background: 'transparent', color: 'var(--text-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '9px', cursor: 'pointer', boxShadow: 'none', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setShowScriptModal(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  取消
                </button>
                <button
                  style={{ flex: 1, height: '38px', padding: '0 20px', fontSize: '14px', fontWeight: '500', background: 'var(--accent)', color: 'var(--accent-on)', border: 'none', borderRadius: '9px', cursor: 'pointer', boxShadow: 'none', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={handleGenerateFromScript}
                  disabled={generatingFromScript}
                  onMouseEnter={(e) => {
                    if (!generatingFromScript) {
                      e.currentTarget.style.background = 'var(--accent-hover)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!generatingFromScript) {
                      e.currentTarget.style.background = 'var(--accent)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {generatingFromScript ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 style={{ width: '16px', height: '16px' }} />
                      生成分镜
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showOptimizeModal && optimizingShot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }}
        onClick={handleCloseOptimizeModal}
        >
          <div style={{
            backgroundColor: 'var(--bg-base)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-primary)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseOptimizeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f59e0b15',
              marginBottom: '16px',
            }}>
              <Wand2 style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 8px 0',
            }}>
              优化提示词
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: '0 0 24px 0',
              lineHeight: 1.6,
            }}>
              AI 将根据镜头信息和参考图像，优化起始帧和结束帧的提示词，使生成效果更加精准。
            </p>

            {optimizingShot.startImageUrl && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>起始帧参考</div>
                <img
                  src={optimizingShot.startImageUrl}
                  alt="起始帧"
                  style={{
                    width: '100%',
                    aspectRatio: optimizingShot.aspectRatio === '16:9' ? '16/9' : '4/3',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {optimizingShot.endImageUrl && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>结束帧参考</div>
                <img
                  src={optimizingShot.endImageUrl}
                  alt="结束帧"
                  style={{
                    width: '100%',
                    aspectRatio: optimizingShot.aspectRatio === '16:9' ? '16/9' : '4/3',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-hover)',
              marginBottom: '24px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>镜头:</span>
                <span>{optimizingShot.actionSummary || '未填写动作摘要'}</span>
              </div>
              {optimizingShot.cameraMovement && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600' }}>镜头运动:</span>
                  <span>{optimizingShot.cameraMovement}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCloseOptimizeModal}
                disabled={optimizingPrompt}
                style={{
                  flex: 1,
                  height: '44px',
                  padding: '0 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  cursor: optimizingPrompt ? 'not-allowed' : 'pointer',
                  opacity: optimizingPrompt ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!optimizingPrompt) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                取消
              </button>
              <button
                onClick={handleOptimizePrompt}
                disabled={optimizingPrompt}
                style={{
                  flex: 1,
                  height: '44px',
                  padding: '0 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: optimizingPrompt ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: optimizingPrompt ? 0.7 : 1,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!optimizingPrompt) {
                    e.currentTarget.style.background = '#d97706';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!optimizingPrompt) {
                    e.currentTarget.style.background = '#f59e0b';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {optimizingPrompt ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    优化中...
                  </>
                ) : (
                  <>
                    <Wand2 style={{ width: '16px', height: '16px' }} />
                    开始优化
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
