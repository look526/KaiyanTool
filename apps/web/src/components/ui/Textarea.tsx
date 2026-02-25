import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  glass?: boolean;
}

export function Textarea({ label, error, glass = true, className = '', ...props }: TextareaProps) {
  return (
    <div className="textarea-wrapper" style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          letterSpacing: '-0.01em',
        }}>
          {label}
        </label>
      )}
      <textarea
        className={`textarea ${className}`}
        style={{
          width: '100%',
          minHeight: '140px',
          padding: '14px 16px',
          border: `1px solid ${error ? 'var(--error)' : glass ? 'rgba(255, 255, 255, 0.1)' : 'var(--border-primary)'}`,
          borderRadius: '14px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          backgroundColor: glass ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-secondary)',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: glass ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: glass ? 'blur(20px)' : 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--accent)';
          e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(99, 102, 241, 0.1)';
          e.currentTarget.style.backgroundColor = glass ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-secondary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--error)' : glass ? 'rgba(255, 255, 255, 0.1)' : 'var(--border-primary)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.backgroundColor = glass ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-secondary)';
        }}
        {...props}
      />
      {error && (
        <span style={{
          display: 'block',
          marginTop: '6px',
          fontSize: '13px',
          color: 'var(--error)',
        }}>
          {error}
        </span>
      )}
    </div>
  );
}
