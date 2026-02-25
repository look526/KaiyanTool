import { Sparkles, RotateCw, History, Keyboard, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ModelSelector } from '../ui/ModelSelector';

interface AIControlsProps {
  onContinue: () => void;
  onRewrite: () => void;
  onOptimize: () => void;
  onShowHistory: () => void;
  onShowShortcuts: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isContinuing: boolean;
  isRewriting: boolean;
  isOptimizing: boolean;
  disabled: boolean;
  showShortcutHint?: boolean;
}

export function AIControls({
  onContinue,
  onRewrite,
  onOptimize,
  onShowHistory,
  onShowShortcuts,
  selectedModel,
  onModelChange,
  isContinuing,
  isRewriting,
  isOptimizing,
  disabled,
  showShortcutHint = true,
}: AIControlsProps) {
  const { theme } = useTheme();

  const ControlButton = ({
    onClick,
    icon: Icon,
    label,
    loading,
    color = '#8B5CF6',
    shortcut,
  }: {
    onClick: () => void;
    icon: any;
    label: string;
    loading?: boolean;
    color?: string;
    shortcut?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
        borderRadius: '12px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.backgroundColor = `${color}08`;
          e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
          e.currentTarget.style.transform = 'translateX(0)';
        }
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <RotateCw style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite', color }} />
        </div>
      )}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: '20px', height: '20px', color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '2px',
        }}>
          {label}
        </div>
        {shortcut && showShortcutHint && (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            marginTop: '2px',
          }}>
            <Keyboard style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            {shortcut}
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
      borderRadius: '16px',
      border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
      }}>
        <Zap style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          AI 助手
        </h3>
      </div>

      <ModelSelector
        contentType="script"
        value={selectedModel}
        onChange={onModelChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <ControlButton
          onClick={onContinue}
          icon={Sparkles}
          label="AI续写"
          loading={isContinuing}
          color="#8B5CF6"
          shortcut="Ctrl + K"
        />

        <ControlButton
          onClick={onRewrite}
          icon={RotateCw}
          label="AI重写"
          loading={isRewriting}
          color="#3B82F6"
          shortcut="Ctrl + R"
        />

        <ControlButton
          onClick={onOptimize}
          icon={Zap}
          label="AI优化"
          loading={isOptimizing}
          color="#10B981"
          shortcut="Ctrl + O"
        />
      </div>

      <div style={{
        marginTop: '8px',
        paddingTop: '16px',
        borderTop: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
        display: 'flex',
        gap: '8px',
      }}>
        <button
          onClick={onShowHistory}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.backgroundColor = 'rgba(181, 147, 107, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
          }}
        >
          <History style={{ width: '16px', height: '16px' }} />
          <span>生成历史</span>
        </button>

        <button
          onClick={onShowShortcuts}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e7eb'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.backgroundColor = 'rgba(181, 147, 107, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e5e7eb';
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
          }}
        >
          <Keyboard style={{ width: '16px', height: '16px' }} />
          <span>快捷键</span>
        </button>
      </div>
    </div>
  );
}
