import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Package,
  Box,
  Shirt,
  Wand,
  Square,
  CheckSquare,
  Sparkles,
  Search,
  Filter,
  Grid3x3,
  List,
  PackageOpen,
} from 'lucide-react';

import { ImageSelector } from '../components/ImageSelector';
import { CompactPageHero } from '../components/ui/CompactPageHero';
import { apiClient } from '../lib/api-client';
import { useToast } from '../components/ui/Toast';
import { ItemCard } from '../components/ItemCard';

interface Item {
  id: string;
  projectId: string;
  name: string;
  type: 'prop' | 'clothing' | 'accessory';
  image?: string;
  description?: string;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
}

const ITEM_TYPES = [
  { id: 'prop', name: '道具', icon: Box, color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)', borderColor: 'rgba(249, 115, 22, 0.3)' },
  { id: 'clothing', name: '服装', icon: Shirt, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)' },
  { id: 'accessory', name: '配饰', icon: Wand, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)', borderColor: 'rgba(236, 72, 153, 0.3)' },
];

export default function ItemsPageSimple() {
  const { id: projectId = '' } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'prop' as 'prop' | 'clothing' | 'accessory',
    image: '',
    description: '',
    prompt: '',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { addToast } = useToast();

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || !user) return;
    try {
      for (const iid of selectedIds) {
        await apiClient.deleteItem(iid);
      }
      addToast({ type: 'success', title: '删除成功', message: `已删除 ${selectedIds.size} 个物品` });
      setSelectedIds(new Set());
      await loadItems();
    } catch (error) {
      console.error('Failed to delete items:', error);
      addToast({ type: 'error', title: '删除失败', message: '部分物品删除失败' });
    }
  };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateFromScript = async () => {
    if (!projectId || generating || !user) return;
    try {
      setGenerating(true);
      const result = await apiClient.generateItemsFromScript(projectId) as { message?: string };
      addToast({
        type: 'success',
        title: '生成成功',
        message: result?.message || '生成成功',
      });
      await loadItems();
    } catch (error: any) {
      console.error('Failed to generate items:', error);
      addToast({
        type: 'error',
        title: '生成失败',
        message: error?.response?.data?.error || '无法从剧本生成物品',
      });
    } finally {
      setGenerating(false);
    }
  };

  const loadItems = useCallback(async () => {
    if (!projectId || authLoading || !user) return;
    try {
      setLoading(true);
      const data = await apiClient.getItems(projectId) as Item[];
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
      addToast({
        type: 'error',
        title: '加载失败',
        message: '无法加载物品列表',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, addToast, authLoading, user]);

  useEffect(() => {
    loadItems();
  }, [loadItems, authLoading, user]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: items.length,
    props: items.filter(i => i.type === 'prop').length,
    clothing: items.filter(i => i.type === 'clothing').length,
    accessories: items.filter(i => i.type === 'accessory').length,
  };

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        type: item.type,
        image: item.image || '',
        description: item.description || '',
        prompt: item.prompt || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        type: 'prop',
        image: '',
        description: '',
        prompt: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      type: 'prop',
      image: '',
      description: '',
      prompt: '',
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !user) {
      addToast({
        type: 'error',
        title: '请填写物品名称',
        message: '物品名称不能为空',
      });
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.updateItem(editingId, {
          name: formData.name,
          type: formData.type,
          image: formData.image || undefined,
          description: formData.description || undefined,
          prompt: formData.prompt || undefined,
        });
        addToast({
          type: 'success',
          title: '保存成功',
          message: '物品已更新',
        });
      } else {
        await apiClient.createItem(projectId!, {
          name: formData.name,
          type: formData.type,
          image: formData.image || undefined,
          description: formData.description || undefined,
          prompt: formData.prompt || undefined,
        });
        addToast({
          type: 'success',
          title: '添加成功',
          message: '物品已添加',
        });
      }

      await loadItems();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save item:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        message: '无法保存物品',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!user) {
      addToast({
        type: 'error',
        title: '删除失败',
        message: '请先登录',
      });
      setShowDeleteConfirm(null);
      return;
    }

    try {
      await apiClient.deleteItem(itemId);
      addToast({
        type: 'success',
        title: '删除成功',
        message: '物品已删除',
      });
      await loadItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        message: '无法删除物品',
      });
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const getTypeInfo = (type: string) => {
    return ITEM_TYPES.find(t => t.id === type) || ITEM_TYPES[0];
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
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite', color: '#f97316' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <CompactPageHero
        title="ITEMS"
        subtitle="物品管理"
        icon={<Package style={{ width: '20px', height: '20px', color: 'white' }} />}
        stats={[
          { value: items.length, label: '物品' },
          { value: 0, label: '道具' },
          { value: 0, label: '服装' },
        ]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {items.length > 0 && (
              <>
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
                  {selectedIds.size === filteredItems.length ? <Square style={{ width: '16px', height: '16px' }} /> : <CheckSquare style={{ width: '16px', height: '16px' }} />}
                    {selectedIds.size > 0 ? `${selectedIds.size}/${filteredItems.length}` : '全选'}
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    style={{
                      height: '40px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                    删除 ({selectedIds.size})
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleGenerateFromScript}
              disabled={generating}
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: generating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: generating ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {generating ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: '16px', height: '16px' }} />}
              {generating ? '生成中...' : '从剧本生成'}
            </button>
            <button
              onClick={() => handleOpenModal()}
              style={{
                height: '44px',
                padding: '0 20px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                transition: 'all 0.25s ease',
              }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              添加物品
            </button>
          </div>
        }
      />
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(249, 115, 22, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Package style={{ width: '20px', height: '20px', color: '#f97316' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>总物品</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.total}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(249, 115, 22, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Box style={{ width: '20px', height: '20px', color: '#f97316' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>道具</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f97316' }}>{stats.props}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shirt style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>服装</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>{stats.clothing}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Wand style={{ width: '20px', height: '20px', color: '#ec4899' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>配饰</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ec4899' }}>{stats.accessories}</div>
          </div>
        </div>

        {items.length > 0 && (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="text"
                  placeholder="搜索物品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '240px',
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
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {ITEM_TYPES.map(type => {
                  const Icon = type.icon;
                  const isActive = filterType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFilterType(type.id)}
                      style={{
                        height: '40px',
                        padding: '0 14px',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: isActive ? type.color : 'var(--border-primary)',
                        background: isActive ? type.bgColor : 'transparent',
                        color: isActive ? type.color : 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon style={{ width: '16px', height: '16px' }} />
                      {type.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => setFilterType('all')}
                  style={{
                    height: '40px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: filterType === 'all' ? '#f97316' : 'var(--border-primary)',
                    background: filterType === 'all' ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    color: filterType === 'all' ? '#f97316' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  全部
                </button>
              </div>

              <span style={{
                marginLeft: 'auto',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}>
                显示 {filteredItems.length} / {items.length} 个物品
              </span>
            </div>
          </div>
        )}

        {filteredItems.length === 0 ? (
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
              <PackageOpen style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {searchQuery || filterType !== 'all' ? '未找到匹配的物品' : '暂无物品'}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {searchQuery || filterType !== 'all' ? '尝试调整搜索条件或筛选器' : '点击右上角添加您的第一个物品'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <button
                onClick={() => handleOpenModal()}
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
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(249, 115, 22, 0.3)';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                添加物品
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onSelect={toggleSelect}
                onEdit={handleOpenModal}
                onDelete={setShowDeleteConfirm}
                getTypeInfo={getTypeInfo}
              />
            ))}
          </div>
        )}
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
        }}
          onClick={handleCloseModal}
        >
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Package style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  {editingId ? '编辑物品' : '添加物品'}
                </h2>
              </div>
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
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}>
                  物品名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入物品名称"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}>
                  物品类型
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ITEM_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = formData.type === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                        style={{
                          flex: 1,
                          height: '44px',
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: isActive ? type.color : 'var(--border-primary)',
                          background: isActive ? type.bgColor : 'transparent',
                          color: isActive ? type.color : 'var(--text-secondary)',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px' }} />
                        {type.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}>
                  物品图片
                </label>
                <ImageSelector
                  projectId={projectId}
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url || '' })}
                  type="general"
                  placeholder="选择或上传物品图片"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}>
                  物品描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述物品的用途、特点等..."
                  rows={3}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}>
                  AI 提示词
                </label>
                <input
                  type="text"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="用于 AI 生成的提示词（可选）"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  style={{
                    flex: 1,
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                    opacity: !formData.name.trim() || saving ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={handleSave}
                  disabled={!formData.name.trim() || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      保存中...
                    </>
                  ) : editingId ? (
                    <>
                      <Edit2 style={{ width: '16px', height: '16px' }} />
                      保存
                    </>
                  ) : (
                    <>
                      <Plus style={{ width: '16px', height: '16px' }} />
                      添加
                    </>
                  )}
                </button>
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
        }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
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
              确认删除
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              您确定要删除此物品吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  flex: 1,
                  height: '48px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setShowDeleteConfirm(null)}
              >
                取消
              </button>
              <button
                style={{
                  flex: 1,
                  height: '48px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleDelete(showDeleteConfirm)}
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
        `}
      </style>
    </div>
  );
}
