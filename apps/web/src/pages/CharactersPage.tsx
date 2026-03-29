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

import { ImageSelector } from '../components/ImageSelector';
import { apiClient, Character } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { useTheme } from '../contexts/ThemeContext';
import { CharacterCard } from '../components/CharacterCard';
import { PageHeader } from '../components/ui/PageHeader';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassDropdown } from '../components/ui/GlassDropdown';

interface CharacterFormData {
  name: string;
  age: string;
  gender: string;
  appearance: string | undefined;
  reference_images: string[];
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
  const [selectAllHover, setSelectAllHover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'shots'>('name');
  const [filterGender, setFilterGender] = useState<string>('');
  const { addToast } = useToast();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const accentColor = '#8b5cf6';
  const accentLight = '#a78bfa';
  const accentGlow = '#c4b5fd';

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  };

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
    reference_images: []
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
        reference_images: characterForm.reference_images
      };

      if (editingCharacter) {
        await apiClient.updateCharacter(editingCharacter.id, data);
        addToast({ type: 'success', title: '更新成功', message: '角色信息已更新' });
      } else {
        await apiClient.createCharacter(id!, data);
        addToast({ type: 'success', title: '创建成功', message: '角色已添加' });
      }

      await loadCharacters();
      handleCloseCharacterModal();
    } catch (error) {
      console.error('Failed to save character:', error);
      const errorMessage = error instanceof Error ? error.message : '保存角色失败，请稍后重试';
      addToast({ type: 'error', title: '保存失败', message: errorMessage });
    }
  };

  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return;

    try {
      await apiClient.deleteCharacter(characterToDelete);
      addToast({ type: 'success', title: '删除成功', message: '角色已删除' });
      await loadCharacters();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete character:', error);
      const errorMessage = error instanceof Error ? error.message : '删除角色失败，请稍后重试';
      addToast({ type: 'error', title: '删除失败', message: errorMessage });
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
      addToast({ type: 'success', title: '添加成功', message: '服装已添加' });

      await loadCharacters();
      handleCloseWardrobeModal();
    } catch (error) {
      console.error('Failed to add wardrobe:', error);
      const errorMessage = error instanceof Error ? error.message : '添加服装失败，请稍后重试';
      addToast({ type: 'error', title: '添加失败', message: errorMessage });
    }
  };

  const handleDeleteWardrobe = async (_characterId: string, wardrobeId: string) => {
    try {
      await apiClient.deleteWardrobe(wardrobeId);
      addToast({ type: 'success', title: '删除成功', message: '服装已删除' });
      await loadCharacters();
    } catch (error) {
      console.error('Failed to delete wardrobe:', error);
      const errorMessage = error instanceof Error ? error.message : '删除服装失败，请稍后重试';
      addToast({ type: 'error', title: '删除失败', message: errorMessage });
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
        reference_images: character.reference_images || []
      });
    } else {
      setEditingCharacter(null);
      setCharacterForm({
        name: '',
        age: '',
        gender: '',
        appearance: '',
        reference_images: []
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
      reference_images: []
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
        background: isDark 
          ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: accentColor }} />
      </div>
    );
  }

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
        background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      
      <PageHeader
        title="角色管理"
        subtitle="管理项目中的所有角色和服装"
        actions={
          <GlassButton
            variant="primary"
            icon={<Plus style={{ width: '18px', height: '18px' }} />}
            onClick={() => handleOpenCharacterModal()}
          >
            添加角色
          </GlassButton>
        }
      />
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '24px', 
        position: 'relative',
        height: 'calc(100vh - 72px)',
        overflow: 'auto',
      }}>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: 0 }}>
            <div style={{
              background: colors.bgGlass,
              borderRadius: '24px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>搜索角色</label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="输入角色名称或描述..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px 0 42px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '14px',
                      background: colors.bgSecondary,
                      color: colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.25s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = accentColor;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>性别筛选</label>
                <GlassDropdown
                  options={[
                    { value: '', label: '全部' },
                    { value: '男', label: '男' },
                    { value: '女', label: '女' },
                    { value: '其他', label: '其他' },
                  ]}
                  value={filterGender}
                  onChange={setFilterGender}
                  colors={colors}
                 
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>排序方式</label>
                <GlassDropdown
                  options={[
                    { value: 'name', label: '按名称' },
                    { value: 'shots', label: '按出镜次数' },
                    { value: 'created', label: '按创建时间' },
                  ]}
                  value={sortBy}
                  onChange={(val) => setSortBy(val as 'name' | 'created' | 'shots')}
                  colors={colors}
                 
                />
              </div>

              <button
                onClick={() => handleOpenCharacterModal()}
                style={{
                  width: '100%',
                  height: '48px',
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 14px ${accentColor}40`,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 14px ${accentColor}40`;
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                添加角色
              </button>
            </div>

            <div style={{
              background: colors.bgGlass,
              borderRadius: '24px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: accentColor, marginBottom: '4px' }}>{characters.length}</div>
              <div style={{ fontSize: '13px', color: colors.textMuted }}>总角色数</div>
            </div>

            <div style={{
              background: colors.bgGlass,
              borderRadius: '24px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: accentLight, marginBottom: '4px' }}>
                {characters.reduce((sum, c) => sum + (c._count?.shots || 0), 0)}
              </div>
              <div style={{ fontSize: '13px', color: colors.textMuted }}>总出镜次数</div>
            </div>
          </div>

          <div style={{
            background: colors.bgGlass,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${colors.border}`,
            backdropFilter: 'blur(20px)',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  角色列表 <span style={{ color: colors.textMuted, fontWeight: '400' }}>({filteredCharacters.length})</span>
                </h3>
                {filteredCharacters.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedIds.size === filteredCharacters.length) {
                        setSelectedIds(new Set());
                      } else {
                        setSelectedIds(new Set(filteredCharacters.map(c => c.id)));
                      }
                    }}
                    onMouseEnter={() => setSelectAllHover(true)}
                    onMouseLeave={() => setSelectAllHover(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: selectAllHover ? '#fff' : colors.textPrimary,
                      border: selectedIds.size === filteredCharacters.length
                        ? 'none'
                        : `1px solid ${colors.border}`,
                      background: selectedIds.size === filteredCharacters.length
                        ? selectAllHover
                          ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                          : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                        : selectAllHover
                          ? `${accentColor}15`
                          : colors.bgSecondary,
                      boxShadow: selectedIds.size === filteredCharacters.length
                        ? selectAllHover
                          ? '0 8px 24px rgba(139, 92, 246, 0.5)'
                          : '0 4px 14px rgba(139, 92, 246, 0.3)'
                        : selectAllHover
                          ? '0 4px 14px rgba(139, 92, 246, 0.15)'
                          : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      transform: selectAllHover ? 'translateY(-1px)' : 'translateY(0)',
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: selectedIds.size === filteredCharacters.length
                        ? 'none'
                        : `2px solid ${colors.borderHover}`,
                      background: selectedIds.size === filteredCharacters.length
                        ? 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)'
                        : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}>
                      {selectedIds.size === filteredCharacters.length && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {selectedIds.size === filteredCharacters.length ? '取消全选' : '全选'}
                  </button>
                )}
              </div>
              {selectedIds.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: colors.textMuted }}>已选择 {selectedIds.size} 个</span>
                  <button
                    onClick={handleBulkDelete}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    批量删除
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'transparent',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accentColor;
                      e.currentTarget.style.color = accentColor;
                      e.currentTarget.style.background = `${accentColor}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.color = colors.textPrimary;
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    取消选择
                  </button>
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
                color: colors.textMuted,
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: colors.bgSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <User style={{ width: '36px', height: '36px', opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: colors.textPrimary, marginBottom: '8px' }}>暂无角色</p>
                <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '24px' }}>点击"添加角色"开始创建</p>
                <button
                  onClick={() => handleOpenCharacterModal()}
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
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                    boxShadow: `0 4px 14px ${accentColor}40`,
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 14px ${accentColor}40`;
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  添加第一个角色
                </button>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '16px',
                overflow: 'auto',
              }}>
                {filteredCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isSelected={selectedIds.has(character.id)}
                    onSelect={toggleSelect}
                    onEdit={handleOpenCharacterModal}
                    onDelete={handleOpenDeleteModal}
                    onAddWardrobe={handleOpenWardrobeModal}
                    onDeleteWardrobe={handleDeleteWardrobe}
                   
                    colors={colors}
                   
                   
                  />
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
            background: colors.bgPrimary,
            borderRadius: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${accentColor}40`,
                }}>
                  <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  {editingCharacter ? '编辑角色' : '添加角色'}
                </h2>
              </div>
              <button
                onClick={handleCloseCharacterModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.textMuted,
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
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textMuted;
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>角色名称 *</label>
                <input
                  type="text"
                  value={characterForm.name}
                  onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                  placeholder="输入角色名称"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    background: colors.bgSecondary,
                    color: colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>年龄</label>
                  <input
                    type="number"
                    value={characterForm.age}
                    onChange={(e) => setCharacterForm({ ...characterForm, age: e.target.value })}
                    placeholder="例如：25"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      background: colors.bgSecondary,
                      color: colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = accentColor;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>性别</label>
                  <GlassDropdown
                    options={[
                      { value: '', label: '请选择' },
                      { value: '男', label: '男' },
                      { value: '女', label: '女' },
                      { value: '其他', label: '其他' },
                    ]}
                    value={characterForm.gender}
                    onChange={(val) => setCharacterForm({ ...characterForm, gender: val })}
                    colors={colors}
                   
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>外貌描述 *</label>
                <textarea
                  value={characterForm.appearance}
                  onChange={(e) => setCharacterForm({ ...characterForm, appearance: e.target.value })}
                  placeholder="描述角色的外貌特征、发型、着装风格等"
                  rows={4}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '14px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    background: colors.bgSecondary,
                    color: colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>参考图片</label>
                <ImageSelector
                  value={characterForm.reference_images[0] || null}
                  onChange={(url) => {
                    if (url) {
                      setCharacterForm({
                        ...characterForm,
                        reference_images: [url]
                      });
                    } else {
                      setCharacterForm({
                        ...characterForm,
                        reference_images: []
                      });
                    }
                  }}
                  projectId={id!}
                  type="character"
                  placeholder="添加角色参考图"
                  characterDescription={characterForm.appearance || ''}
                  characterGender={characterForm.gender || ''}
                  characterAge={characterForm.age ? parseInt(characterForm.age) : undefined}
                  enableReferenceImage={true}
                  enableMultipleGeneration={true}
                  enableThreeViews={true}
                  threeViewsMode="combined"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={handleCloseCharacterModal}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    background: 'transparent',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.color = accentColor;
                    e.currentTarget.style.background = `${accentColor}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.textPrimary;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCharacter}
                  disabled={!characterForm.name || !characterForm.appearance}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                    border: 'none',
                    cursor: !characterForm.name || !characterForm.appearance ? 'not-allowed' : 'pointer',
                    opacity: !characterForm.name || !characterForm.appearance ? 0.5 : 1,
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                    boxShadow: `0 4px 14px ${accentColor}40`,
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (characterForm.name && characterForm.appearance) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}60`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 14px ${accentColor}40`;
                  }}
                >
                  {editingCharacter ? '保存' : '添加'}
                </button>
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
            background: colors.bgPrimary,
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 4px 0' }}>添加服装</h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>角色：{selectedCharacter.name}</p>
              </div>
              <button
                onClick={handleCloseWardrobeModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.textMuted,
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
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textMuted;
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>服装名称 *</label>
                <input
                  type="text"
                  value={wardrobeForm.name}
                  onChange={(e) => setWardrobeForm({ ...wardrobeForm, name: e.target.value })}
                  placeholder="例如：商务正装"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    background: colors.bgSecondary,
                    color: colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>描述</label>
                <textarea
                  value={wardrobeForm.description}
                  onChange={(e) => setWardrobeForm({ ...wardrobeForm, description: e.target.value })}
                  placeholder="描述服装的样式、颜色、材质等"
                  rows={3}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '14px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    background: colors.bgSecondary,
                    color: colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '8px' }}>参考图片</label>
                <div
                  style={{
                    padding: '32px',
                    border: `2px dashed ${colors.border}`,
                    borderRadius: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => document.getElementById('wardrobe-image-input')?.click()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.background = `${accentColor}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <User style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: colors.textMuted }} />
                  <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>点击上传参考图片</p>
                  <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>支持 JPG、PNG、WebP、GIF 格式</p>
                </div>
                <input
                  id="wardrobe-image-input"
                  type="file"
                  accept="image/*"
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
                <button
                  onClick={handleCloseWardrobeModal}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    background: 'transparent',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.color = accentColor;
                    e.currentTarget.style.background = `${accentColor}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.textPrimary;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleAddWardrobe}
                  disabled={!wardrobeForm.name}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                    border: 'none',
                    cursor: !wardrobeForm.name ? 'not-allowed' : 'pointer',
                    opacity: !wardrobeForm.name ? 0.5 : 1,
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                    boxShadow: `0 4px 14px ${accentColor}40`,
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (wardrobeForm.name) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}60`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 14px ${accentColor}40`;
                  }}
                >
                  添加
                </button>
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
            background: colors.bgPrimary,
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            border: `1px solid ${colors.border}`,
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: colors.textPrimary, textAlign: 'center', margin: '0 0 8px 0' }}>确认删除角色</h2>
            <p style={{ fontSize: '14px', color: colors.textMuted, textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              您确定要删除此角色吗？此操作不可撤销，所有相关数据将被永久删除。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCloseDeleteModal}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  background: 'transparent',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.color = accentColor;
                  e.currentTarget.style.background = `${accentColor}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textPrimary;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                取消
              </button>
              <button
                onClick={handleDeleteCharacter}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.3)';
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                删除
              </button>
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
          
          /* 自定义滚动条样式 */
          div::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          div::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'};
            border-radius: 10px;
          }
          
          div::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            border-radius: 10px;
            transition: background 0.2s ease;
          }
          
          div::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'};
          }
        `}
      </style>
    </div>
  );
}
