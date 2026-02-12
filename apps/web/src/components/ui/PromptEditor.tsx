import { Save, X } from 'lucide-react';

export interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  autoResize?: boolean;
  maxLength?: number;
  disabled?: boolean;
  saving?: boolean;
}

const SIZE_CONFIG = {
  small: {
    minHeight: '60px',
    padding: '8px 12px',
    fontSize: '13px',
  },
  medium: {
    minHeight: '80px',
    padding: '10px 14px',
    fontSize: '14px',
  },
  large: {
    minHeight: '120px',
    padding: '12px 16px',
    fontSize: '14px',
  },
};

export function PromptEditor({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = '输入提示词...',
  size = 'medium',
  autoResize = false,
  maxLength,
  disabled = false,
  saving = false,
}: PromptEditorProps) {
  const sizeConfig = SIZE_CONFIG[size];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSave();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={autoResize ? 1 : size === 'small' ? 2 : size === 'medium' ? 4 : 6}
        style={{
          width: '100%',
          minHeight: sizeConfig.minHeight,
          padding: sizeConfig.padding,
          fontSize: sizeConfig.fontSize,
          lineHeight: '1.5',
          borderRadius: '8px',
          border: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-hover)',
          color: 'var(--text-primary)',
          resize: autoResize ? 'none' : 'vertical',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.backgroundColor = 'var(--bg-base)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        }}
      />
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          disabled={saving || disabled}
          style={{
            height: '32px',
            padding: '0 16px',
            fontSize: '13px',
            fontWeight: '500',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            cursor: saving || disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            if (!saving && !disabled) {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving && !disabled) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }
          }}
        >
          <X style={{ width: '12px', height: '12px' }} />
          取消
        </button>
        <button
          onClick={onSave}
          disabled={saving || disabled || !value.trim()}
          style={{
            height: '32px',
            padding: '0 16px',
            fontSize: '13px',
            fontWeight: '500',
            background: saving || disabled || !value.trim() ? 'transparent' : 'var(--accent)',
            color: saving || disabled || !value.trim() ? 'var(--text-tertiary)' : 'var(--accent-on)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            cursor: saving || disabled || !value.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            if (!saving && !disabled && value.trim()) {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving && !disabled && value.trim()) {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <Save style={{ width: '12px', height: '12px' }} />
          保存
        </button>
      </div>
    </div>
  );
}
