import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { PageHeader } from '../components/ui/PageHeader';
import { apiClient } from '../lib/api';

interface Scene {
  id: string;
  location: string;
  time?: string | null;
  atmosphere?: string | null;
  description?: string | null;
  referenceImages?: string[];
  _count?: {
    shots?: number;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const TIME_OPTIONS = [
  { value: '', label: '全部时间' },
  { value: '上午', label: '上午' },
  { value: '下午', label: '下午' },
  { value: '夜晚', label: '夜晚' }
];

const ATMOSPHERE_OPTIONS = [
  { value: '', label: '全部氛围' },
  { value: '温馨', label: '温馨' },
  { value: '严肃', label: '严肃' },
  { value: '热闹', label: '热闹' },
  { value: '安静', label: '安静' },
  { value: '浪漫', label: '浪漫' }
];

export default function ScenesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const accentColor = '#ec4899';
  const accentLight = '#f472b6';
  
  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(236, 72, 153, 0.25)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(236, 72, 153, 0.25)',
  };

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'shots' | 'created'>('name');
  const [filterTime, setFilterTime] = useState('');
  const [filterAtmosphere, setFilterAtmosphere] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = useState<{ id: string; action: 'edit' | 'delete' } | null>(null);

  const [formLocation, setFormLocation] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formAtmosphere, setFormAtmosphere] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const projectId = window.location.pathname.split('/')[2];

  useEffect(() => {
    loadScenes();
  }, [projectId]);

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

    if (filterTime) {
      result = result.filter(s => s.time === filterTime);
    }

    if (filterAtmosphere) {
      result = result.filter(s => s.atmosphere === filterAtmosphere);
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.location.localeCompare(b.location, 'zh-CN'));
        break;
      case 'shots':
        result.sort((a, b) => (b._count?.shots || 0) - (a._count?.shots || 0));
        break;
      case 'created':
      default:
        break;
    }

    setFilteredScenes(result);
  }, [scenes, searchQuery, sortBy, filterTime, filterAtmosphere]);

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDelete = (scene: Scene) => {
    setDeletingScene(scene);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingScene) {
      try {
        await apiClient.deleteScene(deletingScene.id);
        setScenes(scenes.filter(s => s.id !== deletingScene.id));
      } catch (error) {
        console.error('删除场景失败:', error);
      }
      setShowDeleteConfirm(false);
      setDeletingScene(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setBatchDeleteLoading(true);
    try {
      const idsArray = Array.from(selectedIds);
      for (const id of idsArray) {
        await apiClient.deleteScene(id);
      }
      setScenes(scenes.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  const handleEdit = (scene: Scene) => {
    setEditingScene(scene);
    setFormLocation(scene.location);
    setFormTime(scene.time || '');
    setFormAtmosphere(scene.atmosphere || '');
    setFormDescription(scene.description || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formLocation) return;
    
    if (editingScene) {
      setScenes(scenes.map(s => s.id === editingScene.id ? {
        ...s,
        location: formLocation,
        time: formTime,
        atmosphere: formAtmosphere,
        description: formDescription
      } : s));
    } else {
      setScenes([...scenes, { 
        id: Date.now().toString(),
        location: formLocation,
        time: formTime,
        atmosphere: formAtmosphere,
        description: formDescription,
        _count: { shots: 0 }
      }]);
    }
    setShowModal(false);
    setEditingScene(null);
    setFormLocation('');
    setFormTime('');
    setFormAtmosphere('');
    setFormDescription('');
  };

  const handleOpenModal = () => {
    setEditingScene(null);
    setFormLocation('');
    setFormTime('');
    setFormAtmosphere('');
    setFormDescription('');
    setShowModal(true);
  };

  const getAtmosphereIcon = (atmosphere?: string) => {
    if (!atmosphere) return <Cloud style={{ width: '14px', height: '14px' }} />;
    if (atmosphere === '温馨' || atmosphere === '浪漫') return <Sun style={{ width: '14px', height: '14px', color: '#f59e0b' }} />;
    if (atmosphere === '夜晚') return <Moon style={{ width: '14px', height: '14px', color: '#3b82f6' }} />;
    return <Cloud style={{ width: '14px', height: '14px' }} />;
  };

  const getTimeColor = (time?: string | null) => {
    if (time === '上午') return '#f59e0b';
    if (time === '下午') return '#f97316';
    if (time === '夜晚') return '#8b5cf6';
    return 'colors.textMuted';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      
      <PageHeader
        title="场景管理"
        subtitle="管理项目中的所有场景"
        actions={
          <GlassButton
            variant="primary"
            icon={<Plus style={{ width: '18px', height: '18px' }} />}
            onClick={handleOpenModal}
          >
            添加场景
          </GlassButton>
        }
      />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', position: 'relative' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'colors.bgGlass',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid colors.border',
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>搜索场景</label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'colors.textMuted' }} />
                  <input
                    type="text"
                    placeholder="搜索地点或描述?.."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px 0 42px',
                      border: '1px solid colors.border',
                      borderRadius: '14px',
                      background: 'colors.bgSecondary',
                      color: 'colors.textPrimary',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'colors.border';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>时间筛选?/label>
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid colors.border',
                    borderRadius: '14px',
                    background: 'colors.bgSecondary',
                    color: 'colors.textPrimary',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'colors.border';
                  }}
                >
                  {TIME_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>氛围筛选?/label>
                <select
                  value={filterAtmosphere}
                  onChange={(e) => setFilterAtmosphere(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid colors.border',
                    borderRadius: '14px',
                    background: 'colors.bgSecondary',
                    color: 'colors.textPrimary',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'colors.border';
                  }}
                >
                  {ATMOSPHERE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>排序方式</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid colors.border',
                    borderRadius: '14px',
                    background: 'colors.bgSecondary',
                    color: 'colors.textPrimary',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'colors.border';
                  }}
                >
                  <option value="name">按名称排�?/option>
                  <option value="shots">按镜头数排序</option>
                  <option value="created">按创建时间排�?/option>
                </select>
              </div>
            </div>

            <div style={{
              background: 'colors.bgGlass',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid colors.border',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ec4899', marginBottom: '4px' }}>{scenes.length}</div>
              <div style={{ fontSize: '13px', color: 'colors.textMuted' }}>总场景数</div>
            </div>

            <div style={{
              background: 'colors.bgGlass',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid colors.border',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '4px' }}>
                {scenes.reduce((sum, s) => sum + (s._count?.shots || 0), 0)}
              </div>
              <div style={{ fontSize: '13px', color: 'colors.textMuted' }}>总镜头数</div>
            </div>
          </div>

          <div style={{
            background: 'colors.bgGlass',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid colors.border',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 200px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'colors.textPrimary', margin: 0 }}>
                场景列表 <span style={{ color: 'colors.textMuted', fontWeight: '400' }}>({filteredScenes.length})</span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {filteredScenes.length > 0 && (
                  <GlassButton onClick={() => {
                      if (selectedIds.size === filteredScenes.length) {
                        setSelectedIds(new Set());
                      } else {
                        setSelectedIds(new Set(filteredScenes.map(s => s.id)));
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid colors.border',
                      background: 'transparent',
                      color: 'colors.textSecondary',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {selectedIds.size === filteredScenes.length && filteredScenes.length > 0 ? '取消全�? : '全�?}
                  </GlassButton>
                )}
                {selectedIds.size > 0 && (
                  <>
                    <span style={{ fontSize: '13px', color: 'colors.textMuted' }}>已选择 {selectedIds.size} �?/span>
                    <GlassButton variant="danger" 
                      size="sm" 
                      onClick={handleBatchDelete}
                      disabled={batchDeleteLoading}
                      style={{
                        opacity: batchDeleteLoading ? 0.7 : 1,
                      }}
                    >
                      {batchDeleteLoading ? (
                        <Loader2 style={{ width: '14px', height: '14px', marginRight: '6px', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Trash2 style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                      )}
                      {batchDeleteLoading ? '删除�?..' : '批量删除'}
                    </GlassButton>
                    <GlassButton variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                      取消选择
                    </GlassButton>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 32px',
                color: 'colors.textMuted',
              }}>
                <Loader2 style={{ width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '16px', color: '#ec4899' }} />
                <p style={{ fontSize: '14px' }}>加载场景�?..</p>
              </div>
            ) : filteredScenes.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 32px',
                color: 'colors.textMuted',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: 'colors.bgGlassHover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <MapPin style={{ width: '36px', height: '36px', opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>暂无场景</p>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>点击"添加场景"开始创�?/p>
                <GlassButton variant="primary" onClick={handleOpenModal}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                  添加第一个场�?
                </GlassButton>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '16px',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '8px',
              }}>
                {filteredScenes.map(scene => {
                  const isSelected = selectedIds.has(scene.id);
                  const isHovered = hoveredCard === scene.id;
                  const isEditHovered = hoveredAction?.id === scene.id && hoveredAction?.action === 'edit';
                  const isDeleteHovered = hoveredAction?.id === scene.id && hoveredAction?.action === 'delete';
                  const timeColor = getTimeColor(scene.time);
                  
                  return (
                  <div
                    key={scene.id}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(219, 39, 119, 0.06) 100%)'
                        : isHovered 
                          ? 'colors.bgGlassHover' 
                          : 'colors.bgGlass',
                      borderRadius: '16px',
                      padding: '20px',
                      border: isSelected 
                        ? '2px solid #ec4899' 
                        : '1px solid colors.border',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      transform: isHovered ? 'translateY(-2px)' : 'none',
                      boxShadow: isHovered 
                        ? '0 8px 24px rgba(0, 0, 0, 0.1)' 
                        : 'none',
                    }}
                    onMouseEnter={() => setHoveredCard(scene.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                      <GlassButton onClick={() => handleSelect(scene.id)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          border: isSelected ? 'none' : '2px solid var(--border-secondary)',
                          background: isSelected ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {isSelected && <X style={{ width: '12px', height: '12px', color: 'white' }} />}
                      </GlassButton>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: 'colors.textPrimary', 
                          margin: '0 0 6px 0', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {scene.location}
                        </h4>
                        {scene.description && (
                          <p style={{ 
                            fontSize: '13px', 
                            color: 'colors.textMuted', 
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {scene.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingLeft: '36px' }}>
                      {scene.time && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: timeColor,
                          background: `${timeColor}15`,
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}>
                          <Clock style={{ width: '11px', height: '11px' }} />
                          {scene.time}
                        </span>
                      )}
                      {scene.atmosphere && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: 'colors.textSecondary',
                          background: 'colors.bgGlassHover',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}>
                          {getAtmosphereIcon(scene.atmosphere)}
                          {scene.atmosphere}
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid colors.border',
                      paddingLeft: '36px',
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: 'colors.textMuted',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <Layers style={{ width: '12px', height: '12px' }} />
                        {scene._count?.shots || 0} 个分�?
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <GlassButton onClick={(e) => { e.stopPropagation(); handleEdit(scene); }}
                          onMouseEnter={() => setHoveredAction({ id: scene.id, action: 'edit' })}
                          onMouseLeave={() => setHoveredAction(null)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isEditHovered ? 'var(--accent-blue)' : 'colors.bgGlassHover',
                            color: isEditHovered ? '#fff' : 'colors.textMuted',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Edit2 style={{ width: '14px', height: '14px' }} />
                        </GlassButton>
                        <GlassButton onClick={(e) => { e.stopPropagation(); handleDelete(scene); }}
                          onMouseEnter={() => setHoveredAction({ id: scene.id, action: 'delete' })}
                          onMouseLeave={() => setHoveredAction(null)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isDeleteHovered ? '#ef4444' : 'transparent',
                            color: isDeleteHovered ? '#fff' : 'colors.textMuted',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                )})}
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
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'colors.bgGlass',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            border: '1px solid colors.border',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid colors.border',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
                }}>
                  <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'colors.textPrimary', margin: 0 }}>
                  {editingScene ? '编辑场景' : '添加场景'}
                </h2>
              </div>
              <GlassButton onClick={() => setShowModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid colors.border',
                  background: 'transparent',
                  color: 'colors.textMuted',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'colors.border';
                  e.currentTarget.style.color = 'colors.textMuted';
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </GlassButton>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>地点 *</label>
                <input
                  type="text"
                  placeholder="输入场景地点"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid colors.border',
                    borderRadius: '12px',
                    background: 'colors.bgSecondary',
                    color: 'colors.textPrimary',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'colors.border';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>时间</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      border: '1px solid colors.border',
                      borderRadius: '12px',
                      background: 'colors.bgSecondary',
                      color: 'colors.textPrimary',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {TIME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>氛围</label>
                  <select
                    value={formAtmosphere}
                    onChange={(e) => setFormAtmosphere(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      border: '1px solid colors.border',
                      borderRadius: '12px',
                      background: 'colors.bgSecondary',
                      color: 'colors.textPrimary',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {ATMOSPHERE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'colors.textSecondary', marginBottom: '8px' }}>描述</label>
                <textarea
                  placeholder="描述场景的细�?.."
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '14px',
                    border: '1px solid colors.border',
                    borderRadius: '12px',
                    background: 'colors.bgSecondary',
                    color: 'colors.textPrimary',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'colors.border';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <GlassButton variant="outline" style={{ flex: 1, height: '48px' }} onClick={() => setShowModal(false)}>
                  取消
                </GlassButton>
                <GlassButton variant="primary"
                  style={{ flex: 1, height: '48px', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}
                  onClick={handleSave}
                  disabled={!formLocation}
                >
                  {editingScene ? '保存' : '添加'}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
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
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: 'colors.bgGlass',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            border: '1px solid colors.border',
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'colors.textPrimary', textAlign: 'center', margin: '0 0 8px 0' }}>确认删除</h2>
            <p style={{ fontSize: '14px', color: 'colors.textMuted', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              确定要删除场�?{deletingScene?.location}"吗？此操作无法撤销�?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <GlassButton variant="outline" style={{ flex: 1, height: '48px' }} onClick={() => setShowDeleteConfirm(false)}>
                取消
              </GlassButton>
              <GlassButton variant="danger"
                style={{ flex: 1, height: '48px' }}
                onClick={confirmDelete}
              >
                <Trash2 style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                删除
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


