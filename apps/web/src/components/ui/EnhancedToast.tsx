import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X, ChevronDown, ChevronUp, RefreshCw, ExternalLink, Copy, MessageSquare } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ErrorInfo, getSeverityColor, getSeverityIcon } from '../../utils/errorHandling';

export interface EnhancedToastProps {
  error: ErrorInfo;
  onClose: () => void;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function EnhancedToast({ error, onClose, onRetry, onDismiss }: EnhancedToastProps) {
  const { theme } = useTheme();
  const [showSolution, setShowSolution] = useState(true);
  const severityColor = getSeverityColor(error.severity);
  const severityIcon = getSeverityIcon(error.severity);

  const handleCopy = async () => {
    try {
      const errorText = `错误: ${error.title}\n信息: ${error.message}${error.code ? `\n错误代码: ${error.code}` : ''}`;
      await navigator.clipboard.writeText(errorText);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const SuggestionButton = ({ suggestion, index }: { suggestion: any; index: number }) => {
    const isPrimary = index === 0;

    return (
      <button
        key={index}
        onClick={() => {
          if (suggestion.action) {
            suggestion.action();
          } else if (suggestion.link) {
            if (suggestion.link.startsWith('/')) {
              window.location.pathname = suggestion.link;
            } else {
              window.open(suggestion.link, '_blank');
            }
          }
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: isPrimary ? '14px 20px' : '12px 16px',
          backgroundColor: isPrimary ? `${severityColor}15` : (theme === 'dark' ? '#1a1a1a' : '#ffffff'),
          border: `2px solid ${isPrimary ? severityColor : (theme === 'dark' ? '#2a2a2a' : '#e5e7eb')}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '14px',
          fontWeight: '600',
          color: isPrimary ? severityColor : 'var(--text-secondary)',
          justifyContent: 'flex-start',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = severityColor;
          e.currentTarget.style.backgroundColor = `${severityColor}10`;
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isPrimary ? severityColor : (theme === 'dark' ? '#2a2a2a' : '#e5e7eb');
          e.currentTarget.style.backgroundColor = isPrimary ? `${severityColor}15` : (theme === 'dark' ? '#1a1a1a' : '#ffffff');
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: `${severityColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {suggestion.action ? (
            <RefreshCw style={{ width: '16px', height: '16px', color: severityColor }} />
          ) : suggestion.link ? (
            <ExternalLink style={{ width: '16px', height: '16px', color: severityColor }} />
          ) : null}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            {suggestion.label}
          </div>
          {suggestion.linkText && (
            <div style={{
              fontSize: '12px',
              color: 'var(--text-tertiary)',
            }}>
              {suggestion.linkText}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      maxWidth: '480px',
      width: 'calc(100% - 48px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      animation: 'slideIn 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={{
        padding: '20px',
        backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
        border: `2px solid ${severityColor}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${severityColor} 0%, ${severityColor}80 100%)`,
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: `${severityColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: '20px' }}>{severityIcon}</span>
            </div>
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                margin: '0 0 6px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {error.title}
                {error.code && (
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: `${severityColor}15`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: severityColor,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {error.code}
                  </span>
                )}
              </h4>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: '0',
                lineHeight: '1.6',
              }}>
                {error.message}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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
            <X style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <button
          onClick={() => setShowSolution(!showSolution)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f9fafb',
            border: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = severityColor;
            e.currentTarget.style.backgroundColor = `${severityColor}08`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#0d0d0d' : '#f9fafb';
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            解决方案
            {error.solution && (
              <span style={{
                padding: '2px 8px',
                backgroundColor: `${severityColor}15`,
                borderRadius: '6px',
                fontSize: '12px',
              }}>
                {error.solution.steps.length} 个步骤
              </span>
            )}
          </span>
          {showSolution ? (
            <ChevronUp style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />
          ) : (
            <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />
          )}
        </button>

        {showSolution && error.solution && (
          <div style={{
            padding: '16px',
            backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f9fafb',
            borderRadius: '10px',
            animation: 'expand 0.3s ease-out',
          }}>
            <style>{`
              @keyframes expand {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>

            <h5 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 12px 0',
            }}>
              {error.solution.title}
            </h5>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: '0 0 16px 0',
              lineHeight: '1.6',
            }}>
              {error.solution.description}
            </p>

            <div style={{
              marginBottom: '16px',
            }}>
              <h6 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 8px 0',
              }}>
                解决步骤：
              </h6>
              <ol style={{
                paddingLeft: '20px',
                margin: 0,
                color: 'var(--text-secondary)',
                lineHeight: '1.8',
                fontSize: '14px',
              }}>
                {error.solution.steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ol>
            </div>

            {error.solution.suggestions.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <h6 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}>
                  快捷操作：
                </h6>
                {error.solution.suggestions.map((suggestion, idx) => (
                  <SuggestionButton key={idx} suggestion={suggestion} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}

        {error.details && (
          <details style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f9fafb',
            borderRadius: '8px',
            border: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
          }}>
            <summary style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              userSelect: 'none',
            }}>
              查看详细信息
              <ChevronDown style={{ width: '14px', height: '14px' }} />
            </summary>
            <pre style={{
              margin: '12px 0 0 0',
              padding: '12px',
              backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {typeof error.details === 'object' 
                ? JSON.stringify(error.details, null, 2) 
                : error.details}
            </pre>
          </details>
        )}

        <div style={{
          display: 'flex',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
          marginTop: '12px',
        }}>
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: `${severityColor}15`,
                border: `2px solid ${severityColor}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '700',
                color: severityColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${severityColor}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${severityColor}15`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              <span>重试</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              border: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = severityColor;
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
            }}
          >
            <Copy style={{ width: '16px', height: '16px' }} />
            <span>复制</span>
          </button>

          {error.dismissible !== false && (
            <button
              onClick={onDismiss || onClose}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                border: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-tertiary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = severityColor;
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
              }}
            >
            <X style={{ width: '16px', height: '16px' }} />
            <span>关闭</span>
          </button>
          )}

          <button
            onClick={() => {
              const feedbackUrl = `mailto:support@kaiyan.com?subject=错误反馈&body=${encodeURIComponent(
                `错误标题: ${error.title}\n错误信息: ${error.message}\n错误代码: ${error.code || 'N/A'}\n时间: ${new Date().toISOString()}`
              )}`;
              window.open(feedbackUrl, '_blank');
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              border: '1px solid ' + (theme === 'dark' ? '#2a2a2a' : '#e5e7eb'),
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = severityColor;
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
            }}
          >
            <MessageSquare style={{ width: '16px', height: '16px' }} />
            <span>反馈</span>
          </button>
        </div>
      </div>
    </div>
  );
}
