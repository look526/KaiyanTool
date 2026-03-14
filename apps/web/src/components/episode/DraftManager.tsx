import { useState, useEffect } from 'react';
import { shotDraftsApi, ShotDraft } from '../core/api/modules/shot-drafts';
import { useTheme } from '../contexts/ThemeContext';
import { Clock, Trash2, RotateCcw } from 'lucide-react';

interface DraftManagerProps {
  episodeId: string;
  onRestore: (draft: ShotDraft) => void;
}

export function DraftManager({ episodeId, onRestore }: DraftManagerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [drafts, setDrafts] = useState<ShotDraft[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, [episodeId]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const data = await shotDraftsApi.getDrafts(episodeId);
      setDrafts(data);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (draft: ShotDraft) => {
    onRestore(draft);
  };

  const handleDelete = async (draftId: string) => {
    try {
      await shotDraftsApi.deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: isDark ? '#fafafa' : '#18181b',
        marginBottom: '12px',
      }}>
        草稿历史
      </h3>
      {loading ? (
        <p style={{ color: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(24,24,27,0.6)' }}>加载中...</p>
      ) : drafts.length === 0 ? (
        <p style={{ color: isDark ? 'rgba(250,250,250,0.4)' : 'rgba(24,24,27,0.4)' }}>暂无草稿</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {drafts.map(draft => (
            <div
              key={draft.id}
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                <span style={{ fontSize: '13px', color: isDark ? '#fafafa' : '#18181b' }}>
                  {new Date(draft.created_at).toLocaleString('zh-CN')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleRestore(draft)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  <RotateCcw style={{ width: '14px', height: '14px' }} />
                </button>
                <button
                  onClick={() => handleDelete(draft.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
