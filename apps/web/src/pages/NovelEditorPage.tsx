import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, GripVertical, FileText } from 'lucide-react';
import { Input } from '../components/ui/input';
import { ModelSelector } from '../components/ui/ModelSelector';
import { apiClient } from '../lib/api';

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Novel {
  id: string;
  projectId: string;
  title: string;
  content: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export default function NovelEditorPage() {
  const { projectId, novelId } = useParams<{ projectId: string; novelId: string }>();
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({});

  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showParseNovel, setShowParseNovel] = useState(false);
  const [parseNovelText, setParseNovelText] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [parseResult, setParseResult] = useState<{ chapters: any[]; characters: string[] } | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    loadNovel();
  }, [novelId, projectId]);

  const loadNovel = async () => {
    if (!novelId) return;
    
    try {
      setLoading(true);
      const data = await apiClient.getNovelById(novelId);
      setNovel(data);
      setChapters(data.chapters || []);
      
      if (data.chapters && data.chapters.length > 0) {
        const firstChapter = data.chapters[0];
        setSelectedChapterId(firstChapter.id);
        setEditingTitle(firstChapter.title);
        setEditingContent(firstChapter.content);
      } else {
        setSelectedChapterId(null);
        setEditingTitle(data.title || '');
        setEditingContent(data.content || '');
      }
    } catch (error) {
      console.error('加载小说失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!novelId) return;
    
    try {
      setSaving(true);
      
      if (selectedChapterId) {
        await apiClient.updateChapter(selectedChapterId, {
          title: editingTitle,
          content: editingContent,
        });
      } else {
        await apiClient.updateNovel(novelId, {
          title: editingTitle,
        });
      }
      
      alert('保存成功');
      await loadNovel();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChapter = async () => {
    if (!novelId || !newChapterTitle.trim()) return;
    
    try {
      await apiClient.createChapter(novelId, { title: newChapterTitle });
      setNewChapterTitle('');
      setShowAddChapter(false);
      await loadNovel();
    } catch (error) {
      console.error('添加章节失败:', error);
      alert('添加章节失败');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!novelId || !confirm('确定删除此章节？')) return;
    
    try {
      await apiClient.deleteChapter(chapterId);
      if (selectedChapterId === chapterId) {
        setSelectedChapterId(null);
      }
      await loadNovel();
    } catch (error) {
      console.error('删除章节失败:', error);
      alert('删除章节失败');
    }
  };

  const handleParseNovel = async () => {
    if (!parseNovelText.trim()) {
      alert('请输入小说文本');
      return;
    }
    
    try {
      setParseLoading(true);
      const result = await apiClient.parseNovel(parseNovelText);
      setParseResult(result);
      alert(`解析成功，共识别出 ${result.chapters.length} 个章节`);
    } catch (error) {
      console.error('解析小说失败:', error);
      alert('解析小说失败');
    } finally {
      setParseLoading(false);
    }
  };

  const handleApplyParseResult = async () => {
    if (!novelId || !parseResult) {
      alert('请先解析小说文本');
      return;
    }
    
    try {
      setSaving(true);
      
      // 先删除所有现有章节
      const existingChapters = chapters.filter(chapter => chapter.id);
      for (const chapter of existingChapters) {
        await apiClient.deleteChapter(chapter.id);
      }
      
      // 创建新章节
      for (const chapter of parseResult.chapters) {
        await apiClient.createChapter(novelId, {
          title: chapter.title,
          content: chapter.content
        });
      }
      
      alert('应用解析结果成功');
      await loadNovel();
      setShowParseNovel(false);
      setParseResult(null);
    } catch (error) {
      console.error('应用解析结果失败:', error);
      alert('应用解析结果失败');
    } finally {
      setSaving(false);
    }
  };

  const selectChapter = (chapter: Chapter) => {
    setSelectedChapterId(chapter.id);
    setEditingTitle(chapter.title);
    setEditingContent(chapter.content);
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
            <Link to={`/projects/${projectId}/novels`} style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
            }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              返回
            </Link>
            {novel && (
              <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {novel.title}
              </span>
            )}
            <ModelSelector
              contentType="novel"
              value={selectedModel}
              onChange={setSelectedModel}
              placeholder="选择AI模型"
              style={{ width: '240px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedChapterId && (
              <button
                onClick={() => handleDeleteChapter(selectedChapterId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  background: hoverStates['delete'] ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={() => setHoverStates(s => ({ ...s, delete: true }))}
                onMouseLeave={() => setHoverStates(s => ({ ...s, delete: false }))}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                删除章节
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !editingTitle.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: saving || !editingTitle.trim()
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : hoverStates['save']
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: saving || !editingTitle.trim() ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: hoverStates['save'] ? '0 4px 12px rgba(99, 102, 241, 0.4)' : '0 2px 8px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHoverStates(s => ({ ...s, save: true }))}
              onMouseLeave={() => setHoverStates(s => ({ ...s, save: false }))}
            >
              {saving ? '保存中...' : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  保存
                </>
              )}
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ 
            width: '300px', 
            borderRight: '1px solid var(--border-primary)',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-hover)',
          }}>
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAddChapter(!showAddChapter)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    justifyContent: 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  添加章节
                </button>
                <button
                  onClick={() => setShowParseNovel(!showParseNovel)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    justifyContent: 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  解析小说
                </button>
              </div>

              {showAddChapter && (
                <div style={{ marginBottom: '16px' }}>
                  <Input
                    placeholder="章节标题"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddChapter();
                      }
                    }}
                    style={{ marginBottom: '8px' }}
                  />
                  </div>
              )}

              {showParseNovel && (
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                  <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    小说解析
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <textarea
                      placeholder="请粘贴小说文本..."
                      value={parseNovelText}
                      onChange={(e) => setParseNovelText(e.target.value)}
                      style={{
                        width: '100%',
                        height: '200px',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        resize: 'vertical',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleParseNovel}
                      disabled={parseLoading || !parseNovelText.trim()}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: parseLoading || !parseNovelText.trim()
                          ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: parseLoading || !parseNovelText.trim() ? 'not-allowed' : 'pointer',
                        opacity: parseLoading ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {parseLoading ? '解析中...' : (
                        <>
                          <FileText style={{ width: '16px', height: '16px' }} />
                          开始解析
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowParseNovel(false)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      取消
                    </button>
                  </div>
                  
                  {parseResult && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-secondary)' }}>
                      <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                        解析结果
                      </div>
                      <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                        共识别出 <strong>{parseResult.chapters.length}</strong> 个章节
                      </div>
                      <div style={{ marginBottom: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                        {parseResult.chapters.map((chapter, index) => (
                          <div key={index} style={{ padding: '4px 8px', fontSize: '12px', borderBottom: '1px solid var(--border-secondary)' }}>
                            {chapter.title}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleApplyParseResult}
                        disabled={saving}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: saving 
                            ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.7 : 1,
                          transition: 'all 0.2s ease',
                          marginTop: '12px',
                          width: '100%',
                        }}
                      >
                        {saving ? '应用中...' : '应用解析结果'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                章节列表
              </div>

              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-secondary)' }}>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: !selectedChapterId ? 'var(--bg-base)' : 'transparent',
                  }}
                  onClick={() => {
                    setSelectedChapterId(null);
                    setEditingTitle(novel?.title || '');
                    setEditingContent(novel?.content || '');
                  }}
                >
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {novel?.title || '未命名小说'}
                  </div>
                </div>
              </div>

              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: selectedChapterId === chapter.id ? 'var(--bg-base)' : 'transparent',
                    border: selectedChapterId === chapter.id ? '1px solid var(--accent)' : 'none',
                  }}
                  onClick={() => selectChapter(chapter)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {chapter.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      第 {chapter.order + 1} 章
                    </div>
                  </div>
                  {selectedChapterId === chapter.id && (
                    <GripVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-base)' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              padding: '24px',
              height: '100%',
              minHeight: '500px',
            }}>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  placeholder={selectedChapterId ? '章节标题' : '小说标题'}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{ fontSize: '18px', fontWeight: '600', padding: '12px' }}
                />
              </div>
              <textarea
                placeholder={selectedChapterId ? '章节内容...' : '小说内容...'}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                style={{
                  width: '100%',
                  height: 'calc(100% - 80px)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  lineHeight: '1.8',
                  resize: 'none',
                  fontFamily: 'Georgia, serif',
                }}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
