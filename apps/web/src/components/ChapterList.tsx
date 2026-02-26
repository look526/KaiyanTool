import { useState, useEffect } from 'react';
import { Plus, FileText, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiClient } from '../lib/api';

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ChapterListProps {
  novelId: string;
  selectedChapterId: string | null;
  onChapterSelect: (chapter: Chapter) => void;
  onChapterDelete: (chapterId: string) => void;
  onNovelSelect: (title: string, content: string) => void;
  novelTitle: string;
  novelContent: string;
}

export default function ChapterList({
  novelId,
  selectedChapterId,
  onChapterSelect,
  onChapterDelete,
  onNovelSelect,
  novelTitle,
  novelContent,
}: ChapterListProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showParseNovel, setShowParseNovel] = useState(false);
  const [parseNovelText, setParseNovelText] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [parseResult, setParseResult] = useState<{ chapters: any[] } | null>(null);

  useEffect(() => {
    loadChapters();
  }, [novelId]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getNovelById(novelId);
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('加载章节失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    
    try {
      await apiClient.createChapter(novelId, { title: newChapterTitle });
      setNewChapterTitle('');
      setShowAddChapter(false);
      await loadChapters();
    } catch (error) {
      console.error('添加章节失败:', error);
      alert('添加章节失败');
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
    if (!parseResult) {
      alert('请先解析小说文本');
      return;
    }
    
    try {
      // 先删除所有现有章节
      for (const chapter of chapters) {
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
      await loadChapters();
      setShowParseNovel(false);
      setParseResult(null);
    } catch (error) {
      console.error('应用解析结果失败:', error);
      alert('应用解析结果失败');
    }
  };

  if (loading) {
    return <div style={{ padding: '16px', textAlign: 'center' }}>加载章节中...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddChapter(!showAddChapter)}
          style={{ flex: 1, justifyContent: 'flex-start' }}
        >
          <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          添加章节
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowParseNovel(!showParseNovel)}
          style={{ flex: 1, justifyContent: 'flex-start' }}
        >
          <FileText style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          解析小说
        </Button>
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
          />
        </div>
      )}

      {showParseNovel && (
        <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
            小说解析
          </div>
          <textarea
            placeholder="请粘贴小说文本..."
            value={parseNovelText}
            onChange={(e) => setParseNovelText(e.target.value)}
            style={{
              width: '100%',
              height: '150px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'vertical',
              fontFamily: 'monospace',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              size="sm"
              onClick={handleParseNovel}
              disabled={parseLoading || !parseNovelText.trim()}
              style={{ flex: 1 }}
            >
              {parseLoading ? '解析中...' : '开始解析'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowParseNovel(false)}
              style={{ flex: 1 }}
            >
              取消
            </Button>
          </div>
          
          {parseResult && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-secondary)' }}>
              <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                解析结果
              </div>
              <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                共识别出 <strong>{parseResult.chapters.length}</strong> 个章节
              </div>
              <div style={{ marginBottom: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                {parseResult.chapters.map((chapter, index) => (
                  <div key={index} style={{ padding: '4px 8px', fontSize: '12px', borderBottom: '1px solid var(--border-secondary)' }}>
                    {chapter.title}
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                onClick={handleApplyParseResult}
              >
                应用解析结果
              </Button>
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
          onClick={() => onNovelSelect(novelTitle, novelContent)}
        >
          <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
            {novelTitle || '未命名小说'}
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
          onClick={() => onChapterSelect(chapter)}
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
  );
}
