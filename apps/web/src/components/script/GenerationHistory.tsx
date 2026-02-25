import { History, Check, X, Copy, Trash2, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../ui/Toast';

export interface HistoryItem {
  id: string;
  type: 'continue' | 'rewrite' | 'optimize';
  content: string;
  timestamp: Date;
  model?: string;
}

interface GenerationHistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const TYPE_CONFIG = {
  continue: { label: 'AI续写', color: '#8B5CF6', icon: '✨' },
  rewrite: { label: 'AI重写', color: '#3B82F6', icon: '🔄' },
  optimize: { label: 'AI优化', color: '#10B981', icon: '⚡' },
} as const;

export function GenerationHistory({ items, onSelect, onDelete, onClose }: GenerationHistoryProps) {
  const { theme } = useTheme();
  const { addToast } = useToast();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      addToast({
        type: 'success',
        title: '复制成功',
        message: '内容已复制到剪贴板',
      });
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条历史记录吗？')) {
      onDelete(id);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        maxHeight: '80vh',
        backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              生成历史
            </h3>
            <span style={{
              padding: '4px 10px',
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
            }}>
              {items.length} 条记录
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f3f4f6';
            }}
          >
            <X style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f9fafb',
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-tertiary)',
            }}>
              <History style={{ 
                width: '64px', 
                height: '64px', 
                marginBottom: '20px',
                opacity: 0.3,
              }} />
              <p style={{ fontSize: '15px', margin: 0 }}>
                暂无生成历史
              </p>
              <p style={{ fontSize: '14px', marginTop: '8px', margin: '8px 0 0 0' }}>
                使用 AI 续写、重写或优化功能后，历史记录会显示在这里
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => {
                const config = TYPE_CONFIG[item.type];
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    style={{
                      padding: '20px',
                      backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
                      border: `2px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = config.color;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 32px ${config.color}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${config.color} 0%, ${config.color}80 100%)`,
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px' }}>{config.icon}</span>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: config.color,
                        }}>
                          {config.label}
                        </span>
                        {item.model && (
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: `${config.color}15`,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: config.color,
                          }}>
                            {item.model}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          {formatTime(item.timestamp)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.content);
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f3f4f6';
                          }}
                        >
                          <Copy style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f3f4f6';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>

                    <div style={{
                      padding: '16px',
                      backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f9fafb',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      maxHeight: '150px',
                      overflowY: 'auto',
                      wordBreak: 'break-word',
                    }}>
                      {item.content.length > 200 
                        ? item.content.substring(0, 200) + '...' 
                        : item.content}
                    </div>

                    <button
                      onClick={() => onSelect(item)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginTop: '12px',
                        borderRadius: '10px',
                        backgroundColor: 'transparent',
                        border: `2px solid ${config.color}`,
                        color: config.color,
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${config.color}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Check style={{ width: '16px', height: '16px' }} />
                      使用此版本
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
