import React, { ReactNode } from 'react';

interface GlassActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function GlassActionButton({
  children,
  icon,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  ...props
}: GlassActionButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '13px' },
    lg: { padding: '12px 24px', fontSize: '14px' },
  };

  const currentSize = sizes[size];

  const variants: Record<string, React.CSSProperties> = {
    default: {
      background: isHovered ? 'var(--bg-hover)' : 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
    },
    primary: {
      background: isHovered ? 'var(--accent-hover)' : 'var(--accent-primary)',
      color: '#ffffff',
      border: 'none',
    },
    danger: {
      background: isHovered ? 'var(--error-primary)' : 'var(--error-secondary)',
      color: isHovered ? '#ffffff' : 'var(--error-primary)',
      border: '1px solid var(--error-primary)',
    },
    success: {
      background: isHovered ? 'var(--success-primary)' : 'var(--success-secondary)',
      color: isHovered ? '#ffffff' : 'var(--success-primary)',
      border: '1px solid var(--success-primary)',
    },
  };

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: '8px',
        fontWeight: 500,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: (disabled || loading) ? 0.6 : 1,
        ...currentSize,
        ...variants[variant],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {loading ? (
        <div style={{
          width: currentSize.fontSize === '12px' ? 12 : currentSize.fontSize === '13px' ? 14 : 16,
          height: currentSize.fontSize === '12px' ? 12 : currentSize.fontSize === '13px' ? 14 : 16,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      ) : (
        <>
          {icon && React.cloneElement(icon as React.ReactElement, {
            size: currentSize.fontSize === '12px' ? 12 : currentSize.fontSize === '13px' ? 14 : 16,
          })}
          {children}
        </>
      )}
    </button>
  );
}
