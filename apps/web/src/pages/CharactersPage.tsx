import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  User,
  Shirt,
  Calendar,
  Search,
  Hash,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
import { ImageSelector } from '../components/ImageSelector';
import { apiClient, Character } from '../lib/api';
import { useToast } from '../components/ui/Toast';

interface CharacterFormData {
  name: string;
  age: string;
  gender: string;
  appearance: string | undefined;
  referenceImages: string[];
}

interface WardrobeFormData {
  name: string;
  description: string;
  referenceImage: string;
}

export default function CharactersPage() {
  const { id } = useParams<{ id: string }>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'shots'>('name');
  const [filterGender, setFilterGender] = useState<string>('');
  const { addToast } = useToast();

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCharacters(id!);
      setCharacters(data);
      setFilteredCharacters(data);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  useEffect(() => {
    let result = characters;

    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.appearance?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterGender) {
      result = result.filter(c => c.gender === filterGender);
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        break;
      case 'shots':
        result.sort((a, b) => (b._count?.shots || 0) - (a._count?.shots || 0));
        break;
      case 'created':
      default:
        break;
    }

    setFilteredCharacters(result);
  }, [characters, searchQuery, sortBy, filterGender]);

  const toggleSelect = (characterId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(characterId)) newSet.delete(characterId);
    else newSet.add(characterId);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      for (const cid of selectedIds) {
        await apiClient.deleteCharacter(cid);
      }
      setSelectedIds(new Set());
      addToast({ type: 'success', title: '删除成功', message: `已删除 ${selectedIds.size} 个角色` });
      await loadCharacters();
    } catch (error) {
      console.error('Failed to delete characters:', error);
      addToast({ type: 'error', title: '删除失败', message: '批量删除失败' });
    }
  };

  const [characterForm, setCharacterForm] = useState<CharacterFormData>({
    name: '',
    age: '',
    gender: '',
    appearance: '',
    referenceImages: []
  });

  const [wardrobeForm, setWardrobeForm] = useState<WardrobeFormData>({
    name: '',
    description: '',
    referenceImage: ''
  });

  const handleSaveCharacter = async () => {
    if (!characterForm.name || !characterForm.appearance) {
      return;
    }

    try {
      const data = {
        name: characterForm.name,
        age: characterForm.age ? parseInt(characterForm.age) : undefined,
        gender: characterForm.gender || undefined,
        appearance: characterForm.appearance,
        referenceImages: characterForm.referenceImages
      };

      if (editingCharacter) {
        await apiClient.updateCharacter(editingCharacter.id, data);
      } else {
        await apiClient.createCharacter(id!, data);
      }

      await loadCharacters();
      handleCloseCharacterModal();
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return;

    try {
      await apiClient.deleteCharacter(characterToDelete);
      await loadCharacters();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  };

  const handleAddWardrobe = async () => {
    if (!selectedCharacter || !wardrobeForm.name) {
      return;
    }

    try {
      await apiClient.createWardrobe(selectedCharacter.id, {
        name: wardrobeForm.name,
        description: wardrobeForm.description || undefined,
        images: wardrobeForm.referenceImage ? [wardrobeForm.referenceImage] : undefined
      });

      await loadCharacters();
      handleCloseWardrobeModal();
    } catch (error) {
      console.error('Failed to add wardrobe:', error);
    }
  };

  const handleDeleteWardrobe = async (_characterId: string, wardrobeId: string) => {
    try {
      await apiClient.deleteWardrobe(wardrobeId);
      await loadCharacters();
    } catch (error) {
      console.error('Failed to delete wardrobe:', error);
    }
  };

  const handleOpenCharacterModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setCharacterForm({
        name: character.name,
        age: character.age?.toString() || '',
        gender: character.gender || '',
        appearance: character.appearance,
        referenceImages: character.referenceImages || []
      });
    } else {
      setEditingCharacter(null);
      setCharacterForm({
        name: '',
        age: '',
        gender: '',
        appearance: '',
        referenceImages: []
      });
    }
    setShowCharacterModal(true);
  };

  const handleCloseCharacterModal = () => {
    setShowCharacterModal(false);
    setEditingCharacter(null);
    setCharacterForm({
      name: '',
      age: '',
      gender: '',
      appearance: '',
      referenceImages: []
    });
  };

  const handleOpenWardrobeModal = (character: Character) => {
    setSelectedCharacter(character);
    setWardrobeForm({
      name: '',
      description: '',
      referenceImage: ''
    });
    setShowWardrobeModal(true);
  };

  const handleCloseWardrobeModal = () => {
    setShowWardrobeModal(false);
    setSelectedCharacter(null);
    setWardrobeForm({
      name: '',
      description: '',
      referenceImage: ''
    });
  };

  const handleOpenDeleteModal = (characterId: string) => {
    setCharacterToDelete(characterId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCharacterToDelete(null);
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
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: 'var(--success)' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          }}>
            <Users style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>角色管理</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>管理项目中的所有角色和服装</p>
          </div>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>搜索角色</label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="输入角色名称或描述..."
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
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>性别筛选</label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
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
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  <option value="">全部</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
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
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  <option value="name">按名称</option>
                  <option value="shots">按出镜次数</option>
                  <option value="created">按创建时间</option>
                </select>
              </div>

              <Button
                variant="primary"
                onClick={() => handleOpenCharacterModal()}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                添加角色
              </Button>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '4px' }}>{characters.length}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总角色数</div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--info)', marginBottom: '4px' }}>
                {characters.reduce((sum, c) => sum + (c._count?.shots || 0), 0)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总出镜次数</div>
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
                角色列表 <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({filteredCharacters.length})</span>
              </h3>
              {selectedIds.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>已选择 {selectedIds.size} 个</span>
                  <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                    <Trash2 style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    批量删除
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                    取消选择
                  </Button>
                </div>
              )}
            </div>

            {filteredCharacters.length === 0 ? (
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
                  <User style={{ width: '36px', height: '36px', opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>暂无角色</p>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>点击"添加角色"开始创建</p>
                <Button variant="primary" onClick={() => handleOpenCharacterModal()}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                  添加第一个角色
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredCharacters.map((character) => (
                  <div
                    key={character.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: selectedIds.has(character.id) ? '2px solid var(--accent-green)' : '1px solid var(--border-primary)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedIds.has(character.id)) {
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedIds.has(character.id)) {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                        <button
                          onClick={() => toggleSelect(character.id)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: selectedIds.has(character.id) ? 'none' : '2px solid var(--border-secondary)',
                            background: selectedIds.has(character.id) ? 'var(--accent-green)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          {selectedIds.has(character.id) && <X style={{ width: '12px', height: '12px', color: 'white' }} />}
                        </button>
                        {character.referenceImages && character.referenceImages.length > 0 ? (
                          <img
                            src={character.referenceImages[0]}
                            alt={character.name}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '12px',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <User style={{ width: '28px', height: '28px', color: 'white' }} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{character.name}</h4>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {character.age && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar style={{ width: '12px', height: '12px' }} />
                                {character.age}岁
                              </span>
                            )}
                            {character.gender && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{character.gender}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenCharacterModal(character)}
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
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }}
                        >
                          <Edit2 style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(character.id)}
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
                      {character.appearance}
                    </p>

                    {character.referenceImages && character.referenceImages.length > 1 && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
                        {character.referenceImages.slice(1, 4).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`参考图 ${idx + 1}`}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              flexShrink: 0,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-primary)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Shirt style={{ width: '14px', height: '14px' }} />
                        <span>服装 ({character.wardrobes?.length || 0})</span>
                      </div>
                      <button
                        onClick={() => handleOpenWardrobeModal(character)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-primary)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-green)';
                          e.currentTarget.style.color = 'var(--accent-green)';
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        添加
                      </button>
                    </div>

                    {character.wardrobes && character.wardrobes.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {character.wardrobes.slice(0, 2).map((wardrobe) => (
                          <div
                            key={wardrobe.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              background: 'var(--bg-hover)',
                              borderRadius: '10px',
                            }}
                          >
                            {wardrobe.referenceImage ? (
                              <img
                                src={wardrobe.referenceImage}
                                alt={wardrobe.name}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Shirt style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                              </div>
                            )}
                            <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wardrobe.name}</span>
                            <button
                              onClick={() => handleDeleteWardrobe(character.id, wardrobe.id)}
                              style={{
                                width: '24px',
                                height: '24px',
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
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                              }}
                            >
                              <X style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        ))}
                        {character.wardrobes.length > 2 && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            还有 {character.wardrobes.length - 2} 套服装
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <Hash style={{ width: '12px', height: '12px' }} />
                      <span>出镜 {character._count?.shots || 0} 次</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCharacterModal && (
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
        }} onClick={handleCloseCharacterModal}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}>
                  <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  {editingCharacter ? '编辑角色' : '添加角色'}
                </h2>
              </div>
              <button
                onClick={handleCloseCharacterModal}
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>角色名称 *</label>
                <input
                  type="text"
                  value={characterForm.name}
                  onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                  placeholder="输入角色名称"
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
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>年龄</label>
                  <input
                    type="number"
                    value={characterForm.age}
                    onChange={(e) => setCharacterForm({ ...characterForm, age: e.target.value })}
                    placeholder="例如：25"
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
                      e.currentTarget.style.borderColor = 'var(--accent-green)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>性别</label>
                  <select
                    value={characterForm.gender}
                    onChange={(e) => setCharacterForm({ ...characterForm, gender: e.target.value })}
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
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-green)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }}
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>外貌描述 *</label>
                <textarea
                  value={characterForm.appearance}
                  onChange={(e) => setCharacterForm({ ...characterForm, appearance: e.target.value })}
                  placeholder="描述角色的外貌特征、发型、着装风格等"
                  rows={4}
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
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>参考图片</label>
                <ImageSelector
                  value={characterForm.referenceImages[0] || null}
                  onChange={(url) => {
                    if (url) {
                      setCharacterForm({
                        ...characterForm,
                        referenceImages: [url]
                      });
                    } else {
                      setCharacterForm({
                        ...characterForm,
                        referenceImages: []
                      });
                    }
                  }}
                  projectId={id!}
                  type="character"
                  placeholder="添加角色参考图"
                  characterDescription={characterForm.appearance || ''}
                  enableReferenceImage={true}
                  enableMultipleGeneration={false}
                  enableThreeViews={false}
                  threeViewsMode="combined"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button variant="outline" style={{ flex: 1, height: '48px' }} onClick={handleCloseCharacterModal}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1, height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  onClick={handleSaveCharacter}
                  disabled={!characterForm.name || !characterForm.appearance}
                >
                  {editingCharacter ? '保存' : '添加'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWardrobeModal && selectedCharacter && (
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
        }} onClick={handleCloseWardrobeModal}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
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
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>添加服装</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>角色：{selectedCharacter.name}</p>
              </div>
              <button
                onClick={handleCloseWardrobeModal}
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>服装名称 *</label>
                <input
                  type="text"
                  value={wardrobeForm.name}
                  onChange={(e) => setWardrobeForm({ ...wardrobeForm, name: e.target.value })}
                  placeholder="例如：商务正装"
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
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>描述</label>
                <textarea
                  value={wardrobeForm.description}
                  onChange={(e) => setWardrobeForm({ ...wardrobeForm, description: e.target.value })}
                  placeholder="描述服装的样式、颜色、材质等"
                  rows={3}
                  style={{
                    width: '100%',
                    minHeight: '80px',
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
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>参考图片</label>
                <div
                  style={{
                    padding: '32px',
                    border: '2px dashed var(--border-secondary)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => document.getElementById('wardrobe-image-input')?.click()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <User style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>点击上传参考图片</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>支持 JPG、PNG、WebP 格式</p>
                </div>
                <input
                  id="wardrobe-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const result = await apiClient.uploadImage(file);
                        setWardrobeForm({
                          ...wardrobeForm,
                          referenceImage: result.url
                        });
                      } catch (error) {
                        console.error('上传失败:', error);
                        addToast({
                          type: 'error',
                          title: '上传失败',
                          message: '请稍后重试。',
                        });
                      }
                    }
                  }}
                />
                {wardrobeForm.referenceImage && (
                  <div style={{ marginTop: '16px', position: 'relative', display: 'inline-block' }}>
                    <img
                      src={wardrobeForm.referenceImage}
                      alt="服装参考图"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '16px',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      onClick={() => setWardrobeForm({ ...wardrobeForm, referenceImage: '' })}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#ef4444',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button variant="outline" style={{ flex: 1, height: '48px' }} onClick={handleCloseWardrobeModal}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1, height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  onClick={handleAddWardrobe}
                  disabled={!wardrobeForm.name}
                >
                  添加
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 8px 0' }}>确认删除角色</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              您确定要删除此角色吗？此操作不可撤销，所有相关数据将被永久删除。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" style={{ flex: 1, height: '48px' }} onClick={handleCloseDeleteModal}>
                取消
              </Button>
              <Button
                variant="danger"
                style={{ flex: 1, height: '48px' }}
                onClick={handleDeleteCharacter}
              >
                <Trash2 style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                删除
              </Button>
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
