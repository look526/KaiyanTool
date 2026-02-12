import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  MapPin,
  Clock,
  Cloud,
  Hash
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import ImageUpload from '../components/ImageUpload';
import { apiClient, Scene } from '../lib/api';

interface SceneFormData {
  location: string;
  time: string;
  atmosphere: string;
  referenceImages: string[];
}

export default function ScenesPage() {
  const { id } = useParams<{ id: string }>();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState<string | null>(null);

  const [form, setForm] = useState<SceneFormData>({
    location: '',
    time: '',
    atmosphere: '',
    referenceImages: []
  });

  const loadScenes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getScenes(id!);
      setScenes(data);
    } catch (error) {
      console.error('Failed to load scenes:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadScenes();
  }, [loadScenes]);

  const handleSave = async () => {
    if (!form.location || !form.time) {
      return;
    }

    try {
      const data = {
        location: form.location,
        time: form.time,
        atmosphere: form.atmosphere || undefined,
        referenceImages: form.referenceImages
      };

      if (editingScene) {
        await apiClient.updateScene(editingScene.id, data);
      } else {
        await apiClient.createScene(id!, data);
      }

      await loadScenes();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save scene:', error);
    }
  };

  const handleDelete = async () => {
    if (!sceneToDelete) return;

    try {
      await apiClient.deleteScene(sceneToDelete);
      await loadScenes();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete scene:', error);
    }
  };

  const handleOpenModal = (scene?: Scene) => {
    if (scene) {
      setEditingScene(scene);
      setForm({
        location: scene.location,
        time: scene.time,
        atmosphere: scene.atmosphere || '',
        referenceImages: scene.referenceImages || []
      });
    } else {
      setEditingScene(null);
      setForm({
        location: '',
        time: '',
        atmosphere: '',
        referenceImages: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingScene(null);
    setForm({
      location: '',
      time: '',
      atmosphere: '',
      referenceImages: []
    });
  };

  const handleOpenDeleteModal = (sceneId: string) => {
    setSceneToDelete(sceneId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSceneToDelete(null);
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
              }}>场景管理</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                共 {scenes.length} 个场景
              </div>
            </div>
          </div>

          <Button onClick={() => handleOpenModal()}>
            <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            添加场景
          </Button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {scenes.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}>
              <MapPin style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-tertiary)', fontSize: '16px', marginBottom: '24px' }}>
                暂无场景，点击右上角添加
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                添加场景
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
              {scenes.map((scene) => (
                <Card key={scene.id} style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: '0 0 12px 0',
                      }}>
                        {scene.location}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{scene.time}</span>
                        </div>
                        {scene.atmosphere && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Cloud style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{scene.atmosphere}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleOpenModal(scene)}
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
                        onClick={() => handleOpenDeleteModal(scene.id)}
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
                    </div>
                  </div>

                  {scene.referenceImages && scene.referenceImages.length > 0 && (
                    <div style={{
                      padding: '12px 0',
                      borderTop: '1px solid var(--border-primary)',
                      marginBottom: '12px',
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                      }}>
                        {scene.referenceImages.slice(0, 4).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`参考图 ${idx + 1}`}
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid var(--border-primary)',
                            }}
                          />
                        ))}
                        {scene.referenceImages.length > 4 && (
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            flexShrink: 0,
                            border: '1px solid var(--border-primary)',
                          }}>
                            +{scene.referenceImages.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Hash style={{ width: '12px', height: '12px' }} />
                    <span>出镜 {scene._count?.shots || 0} 次</span>
                  </div>
                </Card>
              ))}
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
                {editingScene ? '编辑场景' : '添加场景'}
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
                  场景位置 *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="例如：办公室、公园、咖啡厅"
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
                  时间段 *
                </label>
                <input
                  type="text"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="例如：早晨、白天、夜晚"
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
                  氛围描述
                </label>
                <textarea
                  value={form.atmosphere}
                  onChange={(e) => setForm({ ...form, atmosphere: e.target.value })}
                  placeholder="描述场景的氛围、光线、天气等"
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
                  参考图片
                </label>
                <ImageUpload
                  value={form.referenceImages[0] || null}
                  onChange={(url) => {
                    if (url) {
                      setForm({
                        ...form,
                        referenceImages: [...form.referenceImages, url]
                      });
                    }
                  }}
                  type="scene"
                  placeholder="添加场景参考图"
                />
                {form.referenceImages.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '8px',
                  }}>
                    {form.referenceImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={img}
                          alt={`参考图 ${idx + 1}`}
                          style={{
                            width: '100%',
                            aspectRatio: '16/9',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-primary)',
                          }}
                        />
                        <button
                          onClick={() => {
                            setForm({
                              ...form,
                              referenceImages: form.referenceImages.filter((_, i) => i !== idx)
                            });
                          }}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            border: '2px solid var(--bg-elevated)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  disabled={!form.location || !form.time}
                >
                  {editingScene ? '保存' : '添加'}
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
            }}>确认删除场景</h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              您确定要删除此场景吗？此操作不可撤销，所有相关数据将被永久删除。
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
    </div>
  );
}
