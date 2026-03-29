import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Sun,
  Moon,
  Cloud,
  Sparkles,
  Layers,
  Loader2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassSelect } from '../components/ui/GlassSelect';
import { StandardPageHeader } from '../components/ui/StandardPageHeader';
import { apiClient } from '../lib/api';

interface Scene {
  id: string;
  location: string;
  time?: string | null;
  atmosphere?: string | null;
  description?: string | null;
  referenceImages?: string[];
  _count?: { shots?: number };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const TIME_OPTIONS = [
  { value: '', label: '全部时间' },
  { value: '上午', label: '上午' },
  { value: '下午', label: '下午' },
  { value: '夜晚', label: '夜晚' },
];

const ATMOSPHERE_OPTIONS = [
  { value: '', label: '全部氛围' },
  { value: '温馨', label: '温馨' },
  { value: '严肃', label: '严肃' },
  { value: '热闹', label: '热闹' },
  { value: '安静', label: '安静' },
  { value: '浪漫', label: '浪漫' },
];

const SORT_OPTIONS = [
  { value: 'name', label: '按名称排序' },
  { value: 'shots', label: '按镜头数排序' },
  { value: 'created', label: '按创建时间排序' },
];

export default function ScenesPage() {
  const accentColor = '#ba9eff';
  const accentLight = '#d4bfff';

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterTime, setFilterTime] = useState('');
  const [filterAtmosphere, setFilterAtmosphere] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [formLocation, setFormLocation] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formAtmosphere, setFormAtmosphere] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const projectId = window.location.pathname.split('/')[2];

  useEffect(() => { loadScenes(); }, [projectId]);

  const loadScenes = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await apiClient.getScenes(projectId);
      setScenes(data);
    } catch (error) {
      console.error('加载场景失败:', error);
      setScenes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...scenes];
    if (searchQuery) {
      result = result.filter(s =>
        s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterTime) result = result.filter(s => s.time === filterTime);
    if (filterAtmosphere) result = result.filter(s => s.atmosphere === filterAtmosphere);
    switch (sortBy) {
      case 'name': result.sort((a, b) => a.location.localeCompare(b.location, 'zh-CN')); break;
      case 'shots': result.sort((a, b) => (b._count?.shots || 0) - (a._count?.shots || 0)); break;
    }
    setFilteredScenes(result);
  }, [scenes, searchQuery, sortBy, filterTime, filterAtmosphere]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredScenes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredScenes.map(s => s.id)));
    }
  }, [filteredScenes, selectedIds.size]);

  const handleDelete = useCallback((scene: Scene) => {
    setDeletingScene(scene);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = async () => {
    if (!deletingScene) return;
    try {
      await apiClient.deleteScene(deletingScene.id);
      setScenes(prev => prev.filter(s => s.id !== deletingScene.id));
    } catch (error) {
      console.error('删除场景失败:', error);
    }
    setShowDeleteConfirm(false);
    setDeletingScene(null);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setBatchDeleteLoading(true);
    try {
      for (const id of Array.from(selectedIds)) {
        await apiClient.deleteScene(id);
      }
      setScenes(prev => prev.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  const handleEdit = useCallback((scene: Scene) => {
    setEditingScene(scene);
    setFormLocation(scene.location);
    setFormTime(scene.time || '');
    setFormAtmosphere(scene.atmosphere || '');
    setFormDescription(scene.description || '');
    setShowModal(true);
  }, []);

  const handleSave = () => {
    if (!formLocation) return;
    if (editingScene) {
      setScenes(prev => prev.map(s => s.id === editingScene.id ? {
        ...s, location: formLocation, time: formTime, atmosphere: formAtmosphere, description: formDescription
      } : s));
    } else {
      setScenes(prev => [...prev, {
        id: Date.now().toString(), location: formLocation, time: formTime,
        atmosphere: formAtmosphere, description: formDescription, _count: { shots: 0 }
      }]);
    }
    setShowModal(false);
    setEditingScene(null);
    setFormLocation(''); setFormTime(''); setFormAtmosphere(''); setFormDescription('');
  };

  const handleOpenModal = () => {
    setEditingScene(null);
    setFormLocation(''); setFormTime(''); setFormAtmosphere(''); setFormDescription('');
    setShowModal(true);
  };

  const getAtmosphereIcon = (atmosphere?: string | null) => {
    if (!atmosphere) return <Cloud style={{ width: '14px', height: '14px' }} />;
    if (atmosphere === '温馨' || atmosphere === '浪漫') return <Sun style={{ width: '14px', height: '14px', color: '#f59e0b' }} />;
    if (atmosphere === '夜晚') return <Moon style={{ width: '14px', height: '14px', color: '#3b82f6' }} />;
    return <Cloud style={{ width: '14px', height: '14px' }} />;
  };

  const getTimeColor = (time?: string | null) => {
    if (time === '上午') return '#f59e0b';
    if (time === '下午') return '#f97316';
    if (time === '夜晚') return '#8b5cf6';
    return 'var(--text-muted)';
  };

  const totalShots = scenes.reduce((sum, s) => sum + (s._count?.shots || 0), 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <StandardPageHeader
        title="场景管理"
        subtitle={`共 ${scenes.length} 个场景`}
        icon={<MapPin style={{ width: '24px', height: '24px', color: 'white' }} />}
        iconGradient={`linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`}
        iconShadow={`0 4px 14px ${accentColor}40`}
        actions={
          <>
            {filteredScenes.length > 0 && (
              <>
                <button onClick={handleSelectAll} style={{
                  height: '40px', padding: '0 14px', borderRadius: '10px',
                  border: '1px solid var(--border-primary)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s ease',
                }}>
                  {selectedIds.size === filteredScenes.length ? <Square style={{ width: '16px', height: '16px' }} /> : <CheckSquare style={{ width: '16px', height: '16px' }} />}
                  {selectedIds.size > 0 ? `${selectedIds.size}/${filteredScenes.length}` : '全选'}
                </button>
                {selectedIds.size > 0 && (
                  <button onClick={handleBatchDelete} disabled={batchDeleteLoading} style={{
                    height: '40px', padding: '0 14px', borderRadius: '10px', border: 'none',
                    background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '13px',
                    fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s ease',
                  }}>
                    {batchDeleteLoading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Trash2 style={{ width: '16px', height: '16px' }} />}
                    {batchDeleteLoading ? '删除中...' : `删除 (${selectedIds.size})`}
                  </button>
                )}
              </>
            )}
            <button onClick={handleOpenModal} style={{
              height: '44px', padding: '0 20px',
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
              borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#fff',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: `0 4px 14px ${accentColor}40`, transition: 'all 0.25s ease',
            }}>
              <Plus style={{ width: '18px', height: '18px' }} />
              添加场景
            </button>
          </>
        }
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <GlassCard variant="glass" padding="lg">
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>搜索场景</label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="搜索地点或描述..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{
                    width: '100%', height: '44px', padding: '0 16px 0 42px', border: '1px solid var(--border-primary)',
                    borderRadius: '14px', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                    fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
                  }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>时间筛选</label>
                <GlassSelect options={TIME_OPTIONS} value={filterTime} onChange={(e) => setFilterTime(e.target.value)} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>氛围筛选</label>
                <GlassSelect options={ATMOSPHERE_OPTIONS} value={filterAtmosphere} onChange={(e) => setFilterAtmosphere(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>排序方式</label>
                <GlassSelect options={SORT_OPTIONS} value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
              </div>
            </GlassCard>

            <GlassCard variant="glass" padding="lg" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: accentColor, marginBottom: '4px' }}>{scenes.length}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总场景数</div>
            </GlassCard>

            <GlassCard variant="glass" padding="lg" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>{totalShots}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总镜头数</div>
            </GlassCard>
          </div>

          <GlassCard variant="glass" padding="lg" style={{ maxHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                场景列表 <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({filteredScenes.length})</span>
              </h3>
              {filteredScenes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GlassButton onClick={handleSelectAll} variant="secondary" size="sm">
                    {selectedIds.size === filteredScenes.length && filteredScenes.length > 0 ? '取消全选' : '全选'}
                  </GlassButton>
                  {selectedIds.size > 0 && (
                    <>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>已选择 {selectedIds.size} 个</span>
                      <GlassButton variant="danger" size="sm" onClick={handleBatchDelete} loading={batchDeleteLoading}>
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                        批量删除
                      </GlassButton>
                      <GlassButton variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>取消选择</GlassButton>
                    </>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', color: 'var(--text-muted)' }}>
                <Loader2 style={{ width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '16px', color: accentColor }} />
                <p style={{ fontSize: '14px' }}>加载场景中...</p>
              </div>
            ) : filteredScenes.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '24px',
                  background: 'var(--bg-glass-hover)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '20px',
                }}>
                  <MapPin style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>暂无场景</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>点击"添加场景"开始创建</p>
                <GlassButton variant="primary" onClick={handleOpenModal} accentColor={accentColor} accentLight={accentLight}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  添加第一个场景
                </GlassButton>
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '8px',
              }}>
                {filteredScenes.map(scene => {
                  const isSelected = selectedIds.has(scene.id);
                  const isHovered = hoveredCard === scene.id;
                  const timeColor = getTimeColor(scene.time);
                  return (
                    <div
                      key={scene.id}
                      onMouseEnter={() => setHoveredCard(scene.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        background: isSelected ? `linear-gradient(135deg, ${accentColor}15 0%, ${accentLight}08 100%)` : isHovered ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
                        borderRadius: '16px', padding: '20px', border: isSelected ? `2px solid ${accentColor}` : '1px solid var(--border-primary)',
                        transition: 'all 0.2s ease', cursor: 'pointer', transform: isHovered ? 'translateY(-2px)' : 'none',
                        boxShadow: isHovered ? 'var(--shadow-card-hover)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                        <button onClick={() => handleSelect(scene.id)} style={{
                          width: '22px', height: '22px', borderRadius: '6px',
                          border: isSelected ? 'none' : '2px solid var(--border-secondary)',
                          background: isSelected ? `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease', flexShrink: 0, marginTop: '2px',
                        }}>
                          {isSelected && <X style={{ width: '12px', height: '12px', color: 'white' }} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {scene.location}
                          </h4>
                          {scene.description && (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {scene.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingLeft: '36px' }}>
                        {scene.time && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: timeColor, background: `${timeColor}15`, padding: '4px 10px', borderRadius: '6px' }}>
                            <Clock style={{ width: '11px', height: '11px' }} />
                            {scene.time}
                          </span>
                        )}
                        {scene.atmosphere && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', background: 'var(--bg-glass-hover)', padding: '4px 10px', borderRadius: '6px' }}>
                            {getAtmosphereIcon(scene.atmosphere)}
                            {scene.atmosphere}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-primary)', paddingLeft: '36px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Layers style={{ width: '12px', height: '12px' }} />
                          {scene._count?.shots || 0} 个分镜
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(scene); }} style={{
                            width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                            background: 'var(--bg-glass-hover)', color: 'var(--text-muted)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <Edit2 style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(scene); }} style={{
                            width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                            background: 'transparent', color: 'var(--text-muted)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: '24px', width: '100%', maxWidth: '500px',
            border: '1px solid var(--border-primary)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 14px ${accentColor}40`,
                }}>
                  <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  {editingScene ? '编辑场景' : '添加场景'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border-primary)',
                background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>地点 *</label>
                <input type="text" placeholder="输入场景地点" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} style={{
                  width: '100%', height: '44px', padding: '0 14px', border: '1px solid var(--border-primary)',
                  borderRadius: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', transition: 'all 0.2s ease',
                }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>时间</label>
                  <GlassSelect options={TIME_OPTIONS} value={formTime} onChange={(e) => setFormTime(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>氛围</label>
                  <GlassSelect options={ATMOSPHERE_OPTIONS} value={formAtmosphere} onChange={(e) => setFormAtmosphere(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>描述</label>
                <textarea placeholder="描述场景的细节..." rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} style={{
                  width: '100%', minHeight: '100px', padding: '14px', border: '1px solid var(--border-primary)',
                  borderRadius: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: '14px', outline: 'none', resize: 'none', transition: 'all 0.2s ease',
                }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}15`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <GlassButton variant="outline" style={{ flex: 1, height: '48px' }} onClick={() => setShowModal(false)}>取消</GlassButton>
                <GlassButton variant="primary" style={{ flex: 1, height: '48px', background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` }} onClick={handleSave} disabled={!formLocation}>
                  {editingScene ? '保存' : '添加'}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px',
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: '24px', width: '100%', maxWidth: '400px',
            padding: '32px', border: '1px solid var(--border-primary)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <Trash2 style={{ width: '28px', height: '28px', color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 8px 0' }}>确认删除</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              确定要删除场景"{deletingScene?.location}"吗？此操作无法撤销。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <GlassButton variant="outline" style={{ flex: 1, height: '48px' }} onClick={() => setShowDeleteConfirm(false)}>取消</GlassButton>
              <GlassButton variant="danger" style={{ flex: 1, height: '48px' }} onClick={confirmDelete}>
                <Trash2 style={{ width: '16px', height: '16px' }} />
                删除
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
