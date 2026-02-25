import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button-new';
import { ImageSelector } from '../components/ImageSelector';
import { apiClient } from '../lib/api-client';
import { useToast } from '../components/ui/Toast';

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
  { id: 'prop', name: '道具', icon: Box },
  { id: 'clothing', name: '服装', icon: Shirt },
  { id: 'accessory', name: '配饰', icon: Wand },
];

export default function ItemsPageSimple() {
  const { id: projectId } = useParams<{ id: string }>();
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
  const { addToast } = useToast();

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
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
    if (!projectId || generating) return;
    try {
      setGenerating(true);
      const result = await apiClient.generateItemsFromScript(projectId);
      addToast({
        type: 'success',
        title: '生成成功',
        message: result.message,
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
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await apiClient.getItems(projectId);
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
  }, [projectId, addToast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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
    if (!formData.name.trim()) {
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

  const getTypeIcon = (type: string) => {
    const typeInfo = ITEM_TYPES.find(t => t.id === type);
    return typeInfo?.icon || Box;
  };

  const getTypeName = (type: string) => {
    const typeInfo = ITEM_TYPES.find(t => t.id === type);
    return typeInfo?.name || type;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100%', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
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
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 4px 0',
            }}>物品管理</h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              共 {items.length} 个物品
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {items.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                icon={selectedIds.size === items.length ? <CheckSquare size={16} /> : <Square size={16} />}
              >
                {selectedIds.size > 0 ? `${selectedIds.size}/${items.length}` : '全选'}
              </Button>
              {selectedIds.size > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                  icon={<Trash2 size={16} />}
                >
                  删除 ({selectedIds.size})
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleGenerateFromScript}
                disabled={generating}
                icon={generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              >
                {generating ? '生成中...' : '从剧本生成'}
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleOpenModal()}
            icon={<Plus size={16} />}
          >
            添加物品
          </Button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {items.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}>
            <Package style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '16px', marginBottom: '24px' }}>
              暂无物品，点击右上角添加
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleOpenModal()}
              icon={<Plus size={20} />}
            >
              添加物品
            </Button>
          </div>
        ) : (
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {items.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <Card key={item.id} style={{ padding: '16px', overflow: 'hidden', border: selectedIds.has(item.id) ? '2px solid var(--accent)' : undefined }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div onClick={() => toggleSelect(item.id)} style={{ cursor: 'pointer', paddingTop: '4px' }}>
                      {selectedIds.has(item.id) ? (
                        <CheckSquare style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                      ) : (
                        <Square style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                  {item.image ? (
                    <div style={{
                      aspectRatio: '16/9',
                      backgroundColor: 'var(--bg-hover)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      aspectRatio: '16/9',
                      backgroundColor: 'var(--bg-hover)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}>
                      <TypeIcon style={{ width: '48px', height: '48px', color: 'var(--text-muted)' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.name}
                      </h3>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-hover)',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>
                        {getTypeName(item.type)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenModal(item)}
                        aria-label="编辑物品"
                        icon={<Edit2 size={14} />}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowDeleteConfirm(item.id)}
                        aria-label="删除物品"
                        icon={<Trash2 size={14} />}
                      />
                    </div>
                  </div>

                  {item.description && (
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.description}
                    </p>
                  )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleCloseModal}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '576px',
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
                {editingId ? '编辑物品' : '添加物品'}
              </h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCloseModal}
                aria-label="关闭"
                icon={<X size={20} />}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
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
                  物品类型
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ITEM_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={formData.type === type.id ? 'primary' : 'outline'}
                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                        icon={<Icon size={16} />}
                      >
                        {type.name}
                      </Button>
                    );
                  })}
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
                  物品图片
                </label>
                <ImageSelector
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  type="item"
                  placeholder="选择或上传物品图片"
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
                  物品描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述物品的用途、特点等..."
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
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
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1 }}
                  onClick={handleSave}
                  disabled={!formData.name.trim() || saving}
                  loading={saving}
                  icon={saving ? <Loader2 size={16} /> : editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                >
                  {saving ? '保存中...' : editingId ? '保存' : '添加'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowDeleteConfirm(null)}
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
            }}>确认删除物品</h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              您确定要删除此物品吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteConfirm(null)}
              >
                取消
              </Button>
              <Button
                variant="danger"
                style={{ flex: 1 }}
                onClick={() => handleDelete(showDeleteConfirm)}
                icon={<Trash2 size={16} />}
              >
                删除
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
