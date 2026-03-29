import React, { ReactNode } from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

export function GlassButton({
  variant = 'primary',
  icon,
  children,
  size = 'md',
  loading = false,
  ...props
}: GlassButtonProps) {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '12px' },
    md: { padding: '12px 24px', fontSize: '14px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
    xl: { padding: '20px 40px', fontSize: '18px' },
  };

  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: 'var(--radius-lg)',
    border: 'none',
    fontWeight: variant === 'primary' ? '700' : '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    ...sizeStyles[size],
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-primary)',
      color: '#fff',
      boxShadow: 'var(--shadow-accent)',
    },
    secondary: {
      background: 'var(--bg-glass)',
      backdropFilter: 'var(--glass-blur)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
    },
    danger: {
      background: 'var(--gradient-danger)',
      color: '#fff',
      boxShadow: 'var(--error-shadow)',
    },
    success: {
      background: 'var(--gradient-success)',
      color: '#fff',
      boxShadow: 'var(--success-shadow)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--accent)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
    },
  };

  return (
    <button
      style={{ ...baseStyles, ...variants[variant] }}
      disabled={loading || props.disabled}
      onMouseEnter={(e) => {
        if (variant === 'primary' || variant === 'success' || variant === 'danger') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        } else if (variant === 'secondary' || variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
          e.currentTarget.style.background = 'var(--accent-bg)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' || variant === 'success' || variant === 'danger') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variants[variant].boxShadow as string;
        } else if (variant === 'secondary' || variant === 'outline') {
          e.currentTarget.style.borderColor = variant === 'outline' ? 'var(--accent)' : 'var(--border-primary)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = variant === 'secondary' ? 'var(--bg-glass)' : 'transparent';
        }
      }}
      {...props}
    >
      {loading ? <span>...</span> : icon}
      {!loading && children}
    </button>
  );
}
