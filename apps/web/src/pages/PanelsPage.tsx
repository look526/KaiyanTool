import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Sparkles,
  GripVertical,
  Download,
  ImagePlus,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button-new';
import { Card } from '../components/ui/card';
import { apiClient } from '../lib/api';
import { Panel, PanelEditForm, getPanelStatus, getPanelStatusLabel, getPanelStatusColor, getPanelStatusBackgroundColor, getPanelStatusBorderColor, createDefaultPanelFormData, createBatchPanelFormData } from '../lib/panelUtils';
import { useToast } from '../components/ui/Toast';

interface PanelFormData {
  prompt: string;
  imageUrl?: string;
  position?: number;
}

export default function PanelsPage() {
  const { id: shotId } = useParams<{ id: string }>();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [shot, setShot] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [panelToDelete, setPanelToDelete] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState<PanelFormData>({
    prompt: '',
    imageUrl: '',
    position: 1,
  });

  const [batchForm, setBatchForm] = useState<{ panels: PanelEditForm[] }>(createBatchPanelFormData(9));

  const loadPanels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPanels(shotId!);
      setPanels(data);
      const shotData = await apiClient.getShot(shotId!);
      setShot(shotData);
    } catch (error) {
      console.error('Failed to load panels:', error);
    } finally {
      setLoading(false);
    }
  }, [shotId]);

  const loadProviders = useCallback(async () => {
    try {
      const data = await apiClient.getAIProviders();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  }, []);

  useEffect(() => {
    loadPanels();
    loadProviders();
  }, [loadPanels, loadProviders]);

  const handleSave = async () => {
    try {
      if (editingPanel) {
        await apiClient.updatePanel(editingPanel.id, form);
      } else {
        await apiClient.createPanel(shotId!, form);
      }
      await loadPanels();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save panel:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleBatchCreate = async () => {
    const validPanels = batchForm.panels.filter(p => p.prompt.trim() !== '');
    if (validPanels.length === 0) {
      addToast({
        type: 'warning',
        title: '无法创建',
        message: '请至少填写一个提示词。',
      });
      return;
    }

    try {
      const panelsToCreate = validPanels.map(p => ({ prompt: p.prompt, position: p.position || 0 }));
      await apiClient.createBatchPanels(shotId!, panelsToCreate);
      await loadPanels();
      handleCloseBatchModal();
    } catch (error) {
      console.error('Failed to create panels:', error);
      addToast({
        type: 'error',
        title: '创建失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleDelete = async () => {
    if (!panelToDelete) return;

    try {
      await apiClient.deletePanel(panelToDelete);
      await loadPanels();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete panel:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, panelId: string) => {
    setDraggingId(panelId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const panelsCopy = [...panels];
    const draggedIndex = panelsCopy.findIndex(p => p.id === draggingId);
    const targetIndex = panelsCopy.findIndex(p => p.id === targetId);

    const [draggedPanel] = panelsCopy.splice(draggedIndex, 1);
    panelsCopy.splice(targetIndex, 0, draggedPanel);

    const reorderedPanels = panelsCopy.map((panel, index) => ({
      id: panel.id,
      position: index + 1,
    }));

    try {
      await apiClient.reorderPanels(shotId!, reorderedPanels);
      setPanels(panelsCopy);
    } catch (error) {
      console.error('Failed to reorder panels:', error);
    }

    setDraggingId(null);
  };

  const handleGenerateImage = async (panel: Panel) => {
    const provider = providers.find(p => p.enabled);
    if (!provider) {
      addToast({
        type: 'warning',
        title: '未配置提供商',
        message: '请联系管理员在后台添加并启用 AI 提供商。',
      });
      return;
    }

    try {
      setGeneratingImages(prev => new Set([...prev, panel.id]));
      const result = await apiClient.generatePanelImage(panel.id, provider.id);
      await apiClient.updatePanel(panel.id, {
        prompt: panel.prompt,
        imageUrl: result.imageUrl,
      });
      await loadPanels();
    } catch (error) {
      console.error('Failed to generate image:', error);
      addToast({
        type: 'error',
        title: '生成失败',
        message: '图像生成失败，请重试。',
      });
    } finally {
      setGeneratingImages(prev => {
        const next = new Set(prev);
        next.delete(panel.id);
        return next;
      });
    }
  };

  const handleGenerateAll = async () => {
    const provider = providers.find(p => p.enabled);
    if (!provider) {
      addToast({
        type: 'warning',
        title: '未配置提供商',
        message: '请联系管理员在后台添加并启用 AI 提供商。',
      });
      return;
    }

    if (panels.length === 0) {
      addToast({
        type: 'warning',
        title: '暂无面板',
        message: '请先添加面板。',
      });
      return;
    }

    try {
      setGeneratingAll(true);
      await apiClient.generateBatchPanels(shotId!, provider.id);
      await loadPanels();
    } catch (error) {
      console.error('Failed to generate batch images:', error);
      addToast({
        type: 'error',
        title: '批量生成失败',
        message: '请稍后重试。',
      });
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportNineGrid(shotId!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nine-grid-${shotId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
      addToast({
        type: 'info',
        title: '暂未实现',
        message: '导出功能暂未实现。',
      });
    }
  };

  const handleOpenModal = (panel?: Panel) => {
    if (panel) {
      setEditingPanel(panel);
      setForm({
        prompt: panel.prompt,
        imageUrl: panel.imageUrl || '',
        position: panel.position,
      });
    } else {
      setEditingPanel(null);
      setForm({
        ...createDefaultPanelFormData(),
        position: panels.length + 1,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPanel(null);
    setForm(createDefaultPanelFormData());
  };

  const handleOpenDeleteModal = (panelId: string) => {
    setPanelToDelete(panelId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setPanelToDelete(null);
  };

  const handleCloseBatchModal = () => {
    setShowBatchModal(false);
    setBatchForm(createBatchPanelFormData(9));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
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
            <Link to={`/projects/${shot?.projectId}/shots`} style={{
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
              }}>九宫格面板</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                共 {panels.length} 个面板
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleGenerateAll} disabled={generatingAll || panels.length === 0}>
              <Zap style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              {generatingAll ? '生成中...' : '批量生成'}
            </Button>
            <Button onClick={() => setShowBatchModal(true)}>
              <ImagePlus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              批量创建
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              导出
            </Button>
            <Button onClick={() => handleOpenModal()}>
              <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              添加面板
            </Button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {panels.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}>
              <ImagePlus style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-tertiary)', fontSize: '16px', marginBottom: '24px' }}>
                暂无面板，点击右上角添加
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                添加面板
              </Button>
            </div>
          ) : (
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '20px'
            }}>
              {panels.map((panel) => {
                const panelStatus = getPanelStatus(panel, generatingImages);

                return (
                <Card
                  key={panel.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, panel.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, panel.id)}
                  style={{
                    padding: '16px',
                    cursor: 'grab',
                    userSelect: 'none',
                    border: draggingId === panel.id ? '2px dashed var(--accent)' : '1px solid var(--border-primary)',
                    opacity: draggingId === panel.id ? 0.5 : 1,
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
                          #{String(panel.position).padStart(2, '0')}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: getPanelStatusBackgroundColor(panelStatus),
                          border: `1px solid ${getPanelStatusBorderColor(panelStatus)}`,
                          fontSize: '10px',
                          fontWeight: '600',
                          color: getPanelStatusColor(panelStatus),
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {getPanelStatusLabel(panelStatus)}
                        </span>
                      </div>
                      {panel.prompt && (
                        <p style={{
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.5',
                          margin: '0',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {panel.prompt}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleGenerateImage(panel)}
                        disabled={generatingImages.has(panel.id)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: generatingImages.has(panel.id) ? 'var(--bg-hover)' : 'transparent',
                          color: generatingImages.has(panel.id) ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: generatingImages.has(panel.id) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!generatingImages.has(panel.id)) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--accent)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = generatingImages.has(panel.id) ? 'var(--bg-hover)' : 'transparent';
                          e.currentTarget.style.color = generatingImages.has(panel.id) ? 'var(--text-muted)' : 'var(--text-primary)';
                        }}
                      >
                        {generatingImages.has(panel.id) ? (
                          <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Sparkles style={{ width: '14px', height: '14px' }} />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenModal(panel)}
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
                        onClick={() => handleOpenDeleteModal(panel.id)}
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
                          e.currentTarget.style.color = 'var(--error)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>

                  {panel.imageUrl && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-hover)',
                      marginBottom: '12px',
                    }}>
                      <img
                        src={panel.imageUrl}
                        alt={`Panel ${panel.position}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          borderRadius: '6px',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}

                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--accent-bg)',
                    border: '1px solid var(--accent)',
                    fontSize: '13px',
                    color: 'var(--accent-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Download style={{ width: '14px', height: '14px' }} />
                    <span>导出九宫格</span>
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
            maxWidth: '600px',
            width: '100%',
            margin: '24px',
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
                {editingPanel ? '编辑面板' : '添加面板'}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  提示词 *
                </label>
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  placeholder="描述面板内容..."
                  rows={4}
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
                  位置
                </label>
                <input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="9"
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
                >
                  取消
                </Button>
                <Button
                  style={{ flex: 1 }}
                  onClick={handleSave}
                  disabled={!form.prompt}
                >
                  {editingPanel ? '保存' : '添加'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showBatchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleCloseBatchModal}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '800px',
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
                批量创建面板
              </h2>
              <button
                onClick={handleCloseBatchModal}
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
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}>
              {batchForm.panels.map((panel, index) => (
                <div key={index} style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-hover)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                    marginBottom: '12px',
                    fontSize: '14px',
                  }}>
                    {panel.position}
                  </div>
                  <textarea
                    value={panel.prompt}
                    onChange={(e) => {
                      const newPanels = [...batchForm.panels];
                      newPanels[index] = { ...newPanels[index], prompt: e.target.value };
                      setBatchForm({ panels: newPanels });
                    }}
                    placeholder={`面板 ${panel.position}...`}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={handleCloseBatchModal}
              >
                取消
              </Button>
              <Button
                style={{ flex: 1 }}
                onClick={handleBatchCreate}
              >
                批量创建
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
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
            }}>确认删除面板</h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              您确定要删除此面板吗？此操作不可撤销。
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
                  backgroundColor: 'var(--error)',
                  borderColor: 'var(--error)',
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
    </div>
  );
}
