import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Grid3x3,
  Video as VideoIcon,
  Wand2,
  CheckSquare,
  Square,
  Search,
  Filter,
  SortAsc,
  Film,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
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
  const navigate = useNavigate();
  const [shots, setShots] = useState<Shot[]>([]);
  const [filteredShots, setFilteredShots] = useState<Shot[]>([]);
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
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedVideoModel, setSelectedVideoModel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'duration' | 'created'>('order');
  const [filterStatus, setFilterStatus] = useState('');
  const { addToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (shotId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(shotId)) newSet.delete(shotId);
    else newSet.add(shotId);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredShots.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredShots.map(s => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      for (const sid of selectedIds) {
        await apiClient.deleteShot(sid);
      }
      setSelectedIds(new Set());
      addToast({ type: 'success', title: '删除成功', message: `已删除 ${selectedIds.size} 个分镜` });
      await loadShots();
    } catch (error) {
      console.error('Failed to delete shots:', error);
      addToast({ type: 'error', title: '删除失败', message: '批量删除失败' });
    }
  };

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
      setFilteredShots(data);
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
    let result = [...shots];

    if (searchQuery) {
      result = result.filter(s => 
        s.actionSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.cameraMovement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.scene?.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus) {
      result = result.filter(s => getShotStatus(s) === (filterStatus as any));
    }

    switch (sortBy) {
      case 'order':
        break;
      case 'duration':
        result.sort((a, b) => b.duration - a.duration);
        break;
      case 'created':
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    setFilteredShots(result);
  }, [shots, searchQuery, sortBy, filterStatus]);

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link 
                to={`/projects/${id}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                }}>
                  <Film style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>镜头管理</h1>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>共 {filteredShots.length} 个镜头</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {filteredShots.length > 0 && (
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
                  {selectedIds.size === filteredShots.length ? <Square style={{ width: '16px', height: '16px' }} /> : <CheckSquare style={{ width: '16px', height: '16px' }} />}
                  {selectedIds.size > 0 ? `${selectedIds.size}/${filteredShots.length}` : '全选'}
                </button>
              )}
              <button
                onClick={() => setShowScriptModal(true)}
                style={{
                  height: '40px',
                  padding: '0 16px',
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
                <Wand2 style={{ width: '16px', height: '16px' }} />
                从剧本生成
              </button>
              <Button
                variant="primary"
                onClick={() => handleOpenModal()}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                添加镜头
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>搜索镜头</label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="搜索动作、场景..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px 0 36px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#8b5cf6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>状态筛选</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <option value="">全部状态</option>
                  <option value="pending">待生成</option>
                  <option value="has_images">已生成图片</option>
                  <option value="has_video">已生成视频</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>排序方式</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { value: 'order', label: '按顺序' },
                    { value: 'duration', label: '按时长' },
                    { value: 'created', label: '按创建时间' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: sortBy === option.value ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                        color: sortBy === option.value ? '#8b5cf6' : 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: sortBy === option.value ? '500' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>{shots.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>总镜头</div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#ec4899', marginBottom: '4px' }}>
                {shots.reduce((sum, s) => sum + s.duration, 0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>总时长(秒)</div>
            </div>
          </div>

          <div>
            {selectedIds.size > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>已选择 {selectedIds.size} 个镜头</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                    <Trash2 style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    批量删除
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                    取消选择
                  </Button>
                </div>
              </div>
            )}

            {filteredShots.length === 0 ? (
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
                  <Play style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>暂无镜头</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>点击右上角添加您的第一个镜头</p>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                  添加镜头
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {filteredShots.map((shot, index) => {
                  const shotStatus = getShotStatus(shot);
                  const displayNumber = getShotDisplayNumber(shot, index);

                  return (
                    <div
                      key={shot.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, shot.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, shot.id)}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        padding: '16px',
                        border: selectedIds.has(shot.id) ? '2px solid #8b5cf6' : '1px solid var(--border-primary)',
                        transition: 'all 0.2s ease',
                        cursor: 'grab',
                        opacity: draggingId === shot.id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedIds.has(shot.id)) {
                          e.currentTarget.style.borderColor = 'var(--border-hover)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedIds.has(shot.id)) {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div onClick={(e) => { e.stopPropagation(); toggleSelect(shot.id); }} style={{ cursor: 'pointer' }}>
                            {selectedIds.has(shot.id) ? (
                              <CheckSquare style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                            ) : (
                              <Square style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                            )}
                          </div>
                          <GripVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)', cursor: 'grab' }} />
                          <span style={{
                            padding: '4px 8px',
                            background: 'rgba(139, 92, 246, 0.15)',
                            color: '#8b5cf6',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                          }}>
                            {displayNumber}
                          </span>
                          <span 
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              backgroundColor: getShotStatusBackgroundColor(shotStatus),
                              border: `1px solid ${getShotStatusBorderColor(shotStatus)}`,
                              color: getShotStatusColor(shotStatus)
                            }}
                          >
                            {getShotStatusLabel(shotStatus)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleGenerateImages(shot.id)}
                            disabled={generatingImages.has(shot.id)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title="生成图片"
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
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title="优化提示词"
                          >
                            <Wand2 style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button
                            onClick={() => navigate(`/shots/${shot.id}/panels`)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title="九宫格分镜"
                          >
                            <Grid3x3 style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(shot)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title="编辑"
                          >
                            <Edit2 style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(shot.id)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            title="删除"
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </div>

                      {shot.actionSummary && (
                        <p style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.5',
                          margin: '0 0 12px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {shot.actionSummary}
                        </p>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                        {shot.scene && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <Layers style={{ width: '12px', height: '12px' }} />
                            {shot.scene.location} · {shot.scene.time}
                          </div>
                        )}
                        {shot.character && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            角色: {shot.character.name}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          时长: {shot.duration}秒
                        </div>
                      </div>

                      {(shot.startImageUrl || shot.endImageUrl) && (
                        <div style={{
                          background: 'var(--bg-secondary)',
                          borderRadius: '10px',
                          padding: '8px',
                          marginBottom: '12px',
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {shot.startImageUrl && (
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>起始帧</div>
                                <img
                                  src={shot.startImageUrl}
                                  alt="起始帧"
                                  style={{
                                    width: '100%',
                                    borderRadius: '6px',
                                    objectFit: 'cover',
                                    aspectRatio: shot.aspectRatio === '16:9' ? '16/9' : '4/3',
                                  }}
                                />
                              </div>
                            )}
                            {shot.endImageUrl && (
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>结束帧</div>
                                <img
                                  src={shot.endImageUrl}
                                  alt="结束帧"
                                  style={{
                                    width: '100%',
                                    borderRadius: '6px',
                                    objectFit: 'cover',
                                    aspectRatio: shot.aspectRatio === '16:9' ? '16/9' : '4/3',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {shot.videoUrl ? (
                        <button
                          onClick={() => handleOpenVideoModal(shot)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#8b5cf6',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Play style={{ width: '14px', height: '14px' }} />
                          播放视频
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateVideo(shot)}
                          disabled={generatingVideo.has(shot.id)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: generatingVideo.has(shot.id) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: generatingVideo.has(shot.id) ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {generatingVideo.has(shot.id) ? (
                            <>
                              <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                              生成中...
                            </>
                          ) : (
                            <>
                              <VideoIcon style={{ width: '14px', height: '14px' }} />
                              生成视频
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }} onClick={handleCloseModal}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                {editingShot ? '编辑镜头' : '添加镜头'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>场景</label>
                  <select
                    value={form.sceneId || ''}
                    onChange={(e) => setForm({ ...form, sceneId: e.target.value })}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>角色</label>
                  <select
                    value={form.characterId || ''}
                    onChange={(e) => setForm({ ...form, characterId: e.target.value })}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>动作摘要</label>
                <textarea
                  value={form.actionSummary}
                  onChange={(e) => setForm({ ...form, actionSummary: e.target.value })}
                  placeholder="描述镜头中的动作内容"
                  rows={3}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>镜头运动</label>
                  <input
                    type="text"
                    value={form.cameraMovement}
                    onChange={(e) => setForm({ ...form, cameraMovement: e.target.value })}
                    placeholder="例如：推、拉、摇、移"
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>时长（秒）</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 8 })}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button variant="outline" style={{ flex: 1, height: '44px' }} onClick={handleCloseModal}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1, height: '44px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
                  onClick={handleSave}
                >
                  {editingShot ? '保存' : '添加'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }} onClick={handleCloseDeleteModal}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Trash2 style={{ width: '28px', height: '28px', color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 8px 0' }}>
              {shotToDelete ? '删除镜头' : '批量删除'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              {shotToDelete 
                ? '您确定要删除此镜头吗？此操作不可撤销。'
                : `确定要删除选中的 ${selectedIds.size} 个镜头吗？此操作不可撤销。`
              }
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" style={{ flex: 1, height: '48px' }} onClick={handleCloseDeleteModal}>
                取消
              </Button>
              <Button
                variant="danger"
                style={{ flex: 1, height: '48px' }}
                onClick={shotToDelete ? handleDelete : handleBulkDelete}
              >
                <Trash2 style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                删除
              </Button>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && selectedShot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }} onClick={() => setShowVideoModal(false)}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '800px',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>视频预览</h2>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <video
                src={selectedShot.videoUrl!}
                controls
                autoPlay
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  background: 'black',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showScriptModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }} onClick={() => setShowScriptModal(false)}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>从剧本生成分镜</h2>
              <button
                onClick={() => setShowScriptModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>剧本内容</label>
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="输入剧本内容，AI 将自动解析并生成分镜"
                  rows={10}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '12px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>视觉风格（可选）</label>
                <input
                  type="text"
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  placeholder="例如：写实、卡通、动漫、电影感"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button variant="outline" style={{ flex: 1, height: '44px' }} onClick={() => setShowScriptModal(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1, height: '44px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
                  onClick={handleGenerateFromScript}
                  disabled={generatingFromScript}
                >
                  {generatingFromScript ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', marginRight: '6px', animation: 'spin 1s linear infinite' }} />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                      生成分镜
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOptimizeModal && optimizingShot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }} onClick={handleCloseOptimizeModal}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>优化提示词</h2>
              <button
                onClick={handleCloseOptimizeModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                AI 将根据镜头信息和参考图像，优化起始帧和结束帧的提示词，使生成效果更加精准。
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {optimizingShot.startImageUrl && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>起始帧参考</div>
                    <img
                      src={optimizingShot.startImageUrl}
                      alt="起始帧"
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        aspectRatio: optimizingShot.aspectRatio === '16:9' ? '16/9' : '4/3',
                      }}
                    />
                  </div>
                )}
                {optimizingShot.endImageUrl && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>结束帧参考</div>
                    <img
                      src={optimizingShot.endImageUrl}
                      alt="结束帧"
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        aspectRatio: optimizingShot.aspectRatio === '16:9' ? '16/9' : '4/3',
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" style={{ flex: 1, height: '44px' }} onClick={handleCloseOptimizeModal} disabled={optimizingPrompt}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1, height: '44px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                  onClick={handleOptimizePrompt}
                  disabled={optimizingPrompt}
                >
                  {optimizingPrompt ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', marginRight: '6px', animation: 'spin 1s linear infinite' }} />
                      优化中...
                    </>
                  ) : (
                    <>
                      <Wand2 style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                      开始优化
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
