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
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/button-new';

interface Scene {
  id: string;
  location: string;
  time?: string;
  atmosphere?: string;
  description?: string;
  referenceImages?: string[];
  _count?: {
    shots?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

const MOCK_SCENES: Scene[] = [
  {
    id: '1',
    location: '咖啡厅',
    time: '下午',
    atmosphere: '温馨',
    description: '午后阳光透过落地窗洒进来，咖啡的香气弥漫在空气中',
    referenceImages: [],
    _count: { shots: 5 },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    location: '办公室',
    time: '上午',
    atmosphere: '严肃',
    description: '现代化的开放式办公室，整洁有序',
    referenceImages: [],
    _count: { shots: 8 },
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    location: '城市街道',
    time: '夜晚',
    atmosphere: '热闹',
    description: '繁华的都市夜景，霓虹灯闪烁',
    referenceImages: [],
    _count: { shots: 3 },
    createdAt: '2024-01-17T10:00:00Z'
  }
];

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
  const [scenes, setScenes] = useState<Scene[]>(MOCK_SCENES);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>(MOCK_SCENES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'shots' | 'created'>('name');
  const [filterTime, setFilterTime] = useState('');
  const [filterAtmosphere, setFilterAtmosphere] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null);

  const [formLocation, setFormLocation] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formAtmosphere, setFormAtmosphere] = useState('');
  const [formDescription, setFormDescription] = useState('');

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

  const confirmDelete = () => {
    if (deletingScene) {
      setScenes(scenes.filter(s => s.id !== deletingScene.id));
      setShowDeleteConfirm(false);
      setDeletingScene(null);
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

  const getTimeColor = (time?: string) => {
    if (time === '上午') return '#f59e0b';
    if (time === '下午') return '#f97316';
    if (time === '夜晚') return '#8b5cf6';
    return 'var(--text-muted)';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)',
            }}>
              <Layers style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>场景管理</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>管理项目中的所有场景</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenModal}
            style={{
              height: '48px',
              padding: '0 24px',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            添加场景
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>搜索场景</label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="搜索地点或描述..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px 0 42px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '14px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>时间筛选</label>
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '14px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  {TIME_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>氛围筛选</label>
                <select
                  value={filterAtmosphere}
                  onChange={(e) => setFilterAtmosphere(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '14px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  {ATMOSPHERE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>排序方式</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '14px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  <option value="name">按名称排序</option>
                  <option value="shots">按镜头数排序</option>
                  <option value="created">按创建时间排序</option>
                </select>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ec4899', marginBottom: '4px' }}>{scenes.length}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总场景数</div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '4px' }}>
                {scenes.reduce((sum, s) => sum + (s._count?.shots || 0), 0)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总镜头数</div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                场景列表 <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({filteredScenes.length})</span>
              </h3>
              {selectedIds.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>已选择 {selectedIds.size} 个</span>
                  <Button variant="danger" size="sm" onClick={() => {}}>
                    <Trash2 style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    批量删除
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                    取消选择
                  </Button>
                </div>
              )}
            </div>

            {filteredScenes.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 32px',
                color: 'var(--text-muted)',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <MapPin style={{ width: '36px', height: '36px', opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>暂无场景</p>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>点击"添加场景"开始创建</p>
                <Button variant="primary" onClick={handleOpenModal}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                  添加第一个场景
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredScenes.map(scene => (
                  <div
                    key={scene.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: selectedIds.has(scene.id) ? '2px solid #ec4899' : '1px solid var(--border-primary)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedIds.has(scene.id)) {
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedIds.has(scene.id)) {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                        <button
                          onClick={() => handleSelect(scene.id)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: selectedIds.has(scene.id) ? 'none' : '2px solid var(--border-secondary)',
                            background: selectedIds.has(scene.id) ? '#ec4899' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          {selectedIds.has(scene.id) && <X style={{ width: '12px', height: '12px', color: 'white' }} />}
                        </button>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${getTimeColor(scene.time)}20 0%, ${getTimeColor(scene.time)}10 100%)`,
                          border: `1px solid ${getTimeColor(scene.time)}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <MapPin style={{ width: '22px', height: '22px', color: getTimeColor(scene.time) }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scene.location}</h4>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(scene)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--accent-blue)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }}
                        >
                          <Edit2 style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(scene)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      {scene.time && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: getTimeColor(scene.time),
                          background: `${getTimeColor(scene.time)}15`,
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          {scene.time}
                        </span>
                      )}
                      {scene.atmosphere && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-hover)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}>
                          {getAtmosphereIcon(scene.atmosphere)}
                          {scene.atmosphere}
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {scene.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-primary)',
                    }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {scene._count?.shots || 0} 个镜头
                      </span>
                    </div>
                  </div>
                ))}
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
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
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
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  {editingScene ? '编辑场景' : '添加场景'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>地点 *</label>
                <input
                  type="text"
                  placeholder="输入场景地点"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ec4899';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>时间</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>氛围</label>
                  <select
                    value={formAtmosphere}
                    onChange={(e) => setFormAtmosphere(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>描述</label>
                <textarea
                  placeholder="描述场景的细节..."
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '14px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
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
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button variant="outline" style={{ flex: 1, height: '48px' }} onClick={() => setShowModal(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1, height: '48px', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}
                  onClick={handleSave}
                  disabled={!formLocation}
                >
                  {editingScene ? '保存' : '添加'}
                </Button>
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 8px 0' }}>确认删除</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              确定要删除场景"{deletingScene?.location}"吗？此操作无法撤销。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" style={{ flex: 1, height: '48px' }} onClick={() => setShowDeleteConfirm(false)}>
                取消
              </Button>
              <Button
                variant="danger"
                style={{ flex: 1, height: '48px' }}
                onClick={confirmDelete}
              >
                <Trash2 style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
