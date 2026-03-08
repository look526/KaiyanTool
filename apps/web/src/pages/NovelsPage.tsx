import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button-new';
import MonacoEditor from '../components/MonacoEditor';
import { apiClient } from '../lib/api';
import { Plus, Edit, Trash2, FileText, PlusCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';

interface Novel {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export default function NovelsPage() {
  const { id } = useParams();
  const { theme } = useTheme();

  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [showNovelModal, setShowNovelModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadNovels();
  }, [id]);

  const loadNovels = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getNovels(id!);
      setNovels(response.novels);
    } catch (error) {
      console.error('Failed to load novels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNovel = async () => {
    try {
      await apiClient.createNovel(id!, { title: '未命名小说', description: '' });
      await loadNovels();
      setShowNovelModal(false);
    } catch (error) {
      console.error('Failed to create novel:', error);
      addToast({
        type: 'error',
        title: '创建小说失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleUpdateNovel = async () => {
    if (!editingNovel) return;
    try {
      await apiClient.updateNovel(editingNovel.id, { title: editingNovel.title, description: editingNovel.description });
      await loadNovels();
      setShowNovelModal(false);
      setEditingNovel(null);
    } catch (error) {
      console.error('Failed to update novel:', error);
      addToast({
        type: 'error',
        title: '更新小说失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleDeleteNovel = async (novelId: string) => {
    if (!confirm('确定要删除这个小说吗？')) return;
    try {
      await apiClient.deleteNovel(novelId);
      await loadNovels();
      if (selectedNovel?.id === novelId) {
        setSelectedNovel(null);
        setSelectedChapter(null);
      }
    } catch (error) {
      console.error('Failed to delete novel:', error);
      addToast({
        type: 'error',
        title: '删除小说失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleCreateChapter = async () => {
    if (!selectedNovel) return;
    try {
      await apiClient.createChapter(selectedNovel.id, { title: '未命名章节', content: '' });
      await loadNovels();
      setShowChapterModal(false);
    } catch (error) {
      console.error('Failed to create chapter:', error);
      addToast({
        type: 'error',
        title: '创建章节失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter) return;
    try {
      await apiClient.updateChapter(editingChapter.id, { title: editingChapter.title, content: editingChapter.content });
      await loadNovels();
      setShowChapterModal(false);
      setEditingChapter(null);
    } catch (error) {
      console.error('Failed to update chapter:', error);
      addToast({
        type: 'error',
        title: '更新章节失败',
        message: '请稍后重试。',
      });
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('确定要删除这个章节吗？')) return;
    try {
      await apiClient.deleteChapter(chapterId);
      await loadNovels();
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(null);
      }
    } catch (error) {
      console.error('Failed to delete chapter:', error);
      addToast({
        type: 'error',
        title: '删除章节失败',
        message: '请稍后重试。',
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-light)',
          gap: '16px',
        }}>
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
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>小说管理</h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              共 {novels.length} 部小说
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowNovelModal(true)} icon={<Plus size={16} />}>
            新建小说
          </Button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{
            width: '300px',
            borderRight: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-hover)',
            overflowY: 'auto',
            padding: '12px',
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                加载中...
              </div>
            ) : novels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <FileText style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
                <p style={{ margin: '0', color: 'var(--text-secondary)' }}>暂无小说</p>
                <Button variant="primary" onClick={() => setShowNovelModal(true)} style={{ width: '100%' }} icon={<Plus size={16} />}>
                  创建第一部小说
                </Button>
              </div>
            ) : (
              novels.map((novel) => (
                <div
                  key={novel.id}
                  onClick={() => setSelectedNovel(novel)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedNovel?.id === novel.id ? 'var(--accent)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedNovel?.id !== novel.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedNovel?.id !== novel.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontWeight: '500',
                      color: selectedNovel?.id === novel.id ? 'var(--text-on-accent)' : 'var(--text-primary)',
                    }}>
                      {novel.title}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNovel(novel);
                          setShowNovelModal(true);
                        }}
                        style={{
                          padding: '4px',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'transparent',
                          color: selectedNovel?.id === novel.id ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNovel(novel.id);
                        }}
                        style={{
                          padding: '4px',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'transparent',
                          color: selectedNovel?.id === novel.id ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>
                  {selectedNovel?.id === novel.id && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-primary)',
                    }}>
                      {novel.chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          onClick={() => setSelectedChapter(chapter)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            marginBottom: '4px',
                            cursor: 'pointer',
                            backgroundColor: selectedChapter?.id === chapter.id ? 'var(--bg-deep)' : 'transparent',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedChapter?.id !== chapter.id) {
                              e.currentTarget.style.backgroundColor = 'var(--bg-deep)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedChapter?.id !== chapter.id) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span style={{
                            fontSize: '13px',
                            color: selectedChapter?.id === chapter.id ? 'var(--accent)' : 'var(--text-primary)',
                          }}>
                            {chapter.order}. {chapter.title}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChapter(chapter);
                                setShowChapterModal(true);
                              }}
                              style={{
                                padding: '4px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit style={{ width: '12px', height: '12px' }} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChapter(chapter.id);
                              }}
                              style={{
                                padding: '4px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChapter(null);
                          setShowChapterModal(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px dashed var(--border-light)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          marginTop: '8px',
                        }}
                      >
                        <PlusCircle style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
                        添加章节
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {selectedChapter ? (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                borderRadius: '20px',
                padding: '24px',
                height: '100%',
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>{selectedChapter.title}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    第 {selectedChapter.order} 章
                  </span>
                </div>
                <div style={{ height: 'calc(100% - 80px)' }}>
                  <MonacoEditor
                    value={selectedChapter.content}
                    onChange={(value) => {
                      setEditingChapter({ ...selectedChapter, content: value || '' });
                    }}
                    onSave={async () => {
                      if (editingChapter) {
                        await handleUpdateChapter();
                      } else {
                        await apiClient.updateChapter(selectedChapter.id, { content: selectedChapter.content || '' });
                        await loadNovels();
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)',
              }}>
                <FileText style={{ width: '64px', height: '64px', marginBottom: '16px', color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '16px', margin: '0' }}>选择一个章节开始编辑</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNovelModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowNovelModal(false)}
        >
          <div style={{
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
              {editingNovel ? '编辑小说' : '新建小说'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  标题
                </label>
                <input
                  type="text"
                  value={editingNovel?.title || ''}
                  onChange={(e) => setEditingNovel({ ...editingNovel!, title: e.target.value })}
                  placeholder="输入小说标题"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  描述（可选）
                </label>
                <textarea
                  value={editingNovel?.description || ''}
                  onChange={(e) => setEditingNovel({ ...editingNovel!, description: e.target.value })}
                  placeholder="输入小说描述"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowNovelModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={editingNovel ? handleUpdateNovel : handleCreateNovel}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'var(--accent-on)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {editingNovel ? '更新' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChapterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowChapterModal(false)}
        >
          <div style={{
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
              {editingChapter ? '编辑章节' : '新建章节'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  标题
                </label>
                <input
                  type="text"
                  value={editingChapter?.title || ''}
                  onChange={(e) => setEditingChapter({ ...editingChapter!, title: e.target.value })}
                  placeholder="输入章节标题"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowChapterModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={editingChapter ? handleUpdateChapter : handleCreateChapter}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'var(--accent-on)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {editingChapter ? '更新' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
