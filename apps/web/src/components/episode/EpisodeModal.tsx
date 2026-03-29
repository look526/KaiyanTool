import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { episodesApi, Episode, CreateEpisodeInput, UpdateEpisodeInput } from '../../core/api/modules/episodes';
import { X, Film, AlertCircle } from 'lucide-react';

interface EpisodeModalProps {
  projectId: string;
  episode?: Episode | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EpisodeModal({ projectId, episode, onClose, onSaved }: EpisodeModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [title, setTitle] = useState(episode?.title || '');
  const [description, setDescription] = useState(episode?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请输入剧集名称');
      return;
    }

    try {
      setSaving(true);
      const input: CreateEpisodeInput | UpdateEpisodeInput = { title, description };
      
      console.log('[EpisodeModal] Creating episode with data:', input);
      console.log('[EpisodeModal] Project ID:', projectId);
      
      if (episode) {
        await episodesApi.updateEpisode(episode.id, input);
      } else {
        const result = await episodesApi.createEpisode(projectId, input as CreateEpisodeInput);
        console.log('[EpisodeModal] Episode created successfully:', result);
      }
      
      onSaved();
    } catch (error) {
      console.error('[EpisodeModal] Failed to save episode:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const errorDetails = error as any;
      console.error('[EpisodeModal] Error details:', {
        message: errorMessage,
        code: errorDetails?.code,
        statusCode: errorDetails?.statusCode,
        details: errorDetails?.details,
      });
      setError(`保存失败：${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const accentColor = '#8b5cf6';
  const accentLight = '#a78bfa';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          margin: '20px',
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        <GlassCard style={{
          padding: '0',
          overflow: 'hidden',
          boxShadow: isDark 
            ? `0 24px 48px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(255, 255, 255, 0.08)`
            : `0 18px 40px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)`,
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark 
              ? `linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.04) 100%)`
              : `linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 20px ${accentColor}40`,
              }}>
                <Film style={{ width: '22px', height: '22px', color: '#ffffff' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: isDark ? '#fafafa' : '#18181b',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  {episode ? '编辑剧集' : '新建剧集'}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: isDark ? 'rgba(250, 250, 250, 0.5)' : 'rgba(24, 24, 27, 0.5)',
                  margin: '4px 0 0 0',
                }}>
                  {episode ? '修改剧集信息' : '创建新的剧集内容'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget;
                t.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';
                t.style.color = isDark ? '#fafafa' : '#18181b';
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget;
                t.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                t.style.color = isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)';
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                marginBottom: '10px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: accentColor,
                  display: 'inline-block',
                }} />
                剧集名称
                <span style={{ color: '#ef4444', fontWeight: 400 }}> *</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                placeholder="例如：第一季 第 1 集"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: `2px solid ${error ? '#ef4444' : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                  color: isDark ? '#fafafa' : '#18181b',
                  fontSize: '15px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: error ? `0 0 0 4px rgba(239, 68, 68, 0.1)` : 'none',
                }}
                onFocus={(e) => {
                  if (!error) {
                    const t = e.currentTarget;
                    t.style.borderColor = accentColor;
                    t.style.boxShadow = `0 0 0 4px ${accentColor}15`;
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    const t = e.currentTarget;
                    t.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
                    t.style.boxShadow = 'none';
                  }
                }}
              />
              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid rgba(239, 68, 68, 0.2)`,
                }}>
                  <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                  <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>{error}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                marginBottom: '10px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  display: 'inline-block',
                }} />
                描述
                <span style={{ color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)', fontWeight: 400 }}>（可选）</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述这一集的主要内容..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
                  color: isDark ? '#fafafa' : '#18181b',
                  fontSize: '15px',
                  fontWeight: 500,
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  const t = e.currentTarget;
                  t.style.borderColor = accentColor;
                  t.style.boxShadow = `0 0 0 4px ${accentColor}15`;
                }}
                onBlur={(e) => {
                  const t = e.currentTarget;
                  t.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
                  t.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '18px',
              borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            }}>
              <GlassButton
                variant="secondary"
                type="button"
                onClick={onClose}
                disabled={saving}
                style={{
                  minWidth: '100px',
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                取消
              </GlassButton>
              <GlassButton
                variant="primary"
                type="submit"
                disabled={saving}
                style={{
                  minWidth: '120px',
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    保存中...
                  </span>
                ) : (
                  episode ? '更新剧集' : '创建剧集'
                )}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
