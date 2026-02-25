import React, { useState, useMemo } from 'react';
import { Check, X, Eye, EyeOff, Copy, RotateCw, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../ui/Toast';

interface DiffViewProps {
  originalContent: string;
  generatedContent: string;
  onAccept: (content: string) => void;
  onReject: () => void;
  onRegenerate: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function DiffView({
  originalContent,
  generatedContent,
  onAccept,
  onReject,
  onRegenerate,
  onClose,
  loading = false,
}: DiffViewProps) {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [showOriginal, setShowOriginal] = useState(false);
  const [showGenerated, setShowGenerated] = useState(true);

  const diffLines = useMemo(() => {
    const originalLines = originalContent.split('\n');
    const generatedLines = generatedContent.split('\n');
    const diff = generatedLines.map((line, idx) => {
      const originalLine = originalLines[idx];
      return {
        content: line,
        isNew: !originalLine || originalLine !== line,
        lineNumber: idx + 1,
      };
    });
    return diff;
  }, [originalContent, generatedContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    addToast({
      type: 'success',
      title: '复制成功',
      message: '生成内容已复制到剪贴板',
    });
  };

  const handleAcceptAll = () => {
    onAccept(generatedContent);
  };

  const handleAcceptPartial = () => {
    const mergedContent = [...diffLines]
      .filter(line => !line.isNew || line.content.trim())
      .map(line => line.content)
      .join('\n');
    onAccept(mergedContent);
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
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
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
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 8px 0',
            }}>
              AI 生成内容预览
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-tertiary)',
              margin: 0,
            }}>
              <span style={{ color: '#10b981' }}>绿色</span> 为新增内容，
              <span style={{ color: 'var(--text-secondary)' }}>灰色</span> 为原内容
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
        </div>

        <div style={{
          padding: '24px 32px',
          flex: 1,
          overflowY: 'auto',
          backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f9fafb',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            lineHeight: 1.8,
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            {diffLines.map((line, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '4px 0',
                  backgroundColor: line.isNew ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                }}
              >
                <span style={{
                  width: '40px',
                  textAlign: 'right',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                  flexShrink: 0,
                  userSelect: 'none',
                }}>
                  {line.lineNumber}
                </span>
                <span style={{
                  flex: 1,
                  color: line.isNew ? '#10b981' : 'var(--text-secondary)',
                  fontWeight: line.isNew ? '500' : '400',
                }}>
                  {line.content || '\u00A0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '20px 32px',
          borderTop: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
          backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
        }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCopy}
              style={{
                height: '48px',
                padding: '0 20px',
                borderRadius: '12px',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
                border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                color: 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f3f4f6';
              }}
            >
              <Copy style={{ width: '18px', height: '18px' }} />
              <span>复制</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={loading}
              style={{
                height: '48px',
                padding: '0 20px',
                borderRadius: '12px',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
                border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                color: 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f3f4f6';
              }}
            >
              {loading ? (
                <>
                  <RotateCw style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  <span>重新生成中...</span>
                </>
              ) : (
                <>
                  <RotateCw style={{ width: '18px', height: '18px' }} />
                  <span>重新生成</span>
                </>
              )}
            </button>

            <button
              onClick={handleAcceptPartial}
              style={{
                height: '48px',
                padding: '0 24px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                border: `2px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.backgroundColor = 'rgba(181, 147, 107, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>部分接受</span>
            </button>

            <button
              onClick={onReject}
              style={{
                height: '48px',
                padding: '0 24px',
                borderRadius: '12px',
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f3f4f6',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#3a3a3a' : '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
              <span>拒绝</span>
            </button>

            <button
              onClick={handleAcceptAll}
              style={{
                height: '48px',
                padding: '0 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: 'white',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              <Check style={{ width: '18px', height: '18px' }} />
              <span>全部接受</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
