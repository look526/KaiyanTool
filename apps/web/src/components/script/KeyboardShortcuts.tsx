import { X, Keyboard, Save, Sparkles, RotateCw, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  icon: any;
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const { theme } = useTheme();

  const shortcuts: Shortcut[] = [
    { key: 'Ctrl + S', description: '保存脚本', icon: Save },
    { key: 'Ctrl + K', description: 'AI续写', icon: Sparkles },
    { key: 'Ctrl + R', description: 'AI重写', icon: RotateCw },
    { key: 'Ctrl + O', description: 'AI优化', icon: Zap },
    { key: 'Ctrl + /', description: '显示/隐藏快捷键', icon: Keyboard },
  ];

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
        maxWidth: '600px',
        width: '100%',
        backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)',
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
            <Keyboard style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              快捷键
            </h3>
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

        <div style={{ padding: '24px 32px' }}>
          {shortcuts.map((shortcut, idx) => {
            const Icon = shortcut.icon;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f9fafb',
                  marginBottom: idx < shortcuts.length - 1 ? '12px' : 0,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f9fafb';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: `${idx % 2 === 0 ? '#8B5CF6' : '#3B82F6'}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: idx % 2 === 0 ? '#8B5CF6' : '#3B82F6' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}>
                    {shortcut.description}
                  </div>
                  <kbd style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-tertiary)',
                    backgroundColor: theme === 'dark' ? '#0d0d0d' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
                    borderRadius: '6px',
                  }}>
                    {shortcut.key}
                  </kbd>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
