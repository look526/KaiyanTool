import React, { ReactNode } from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  icon?: ReactNode;
  children: ReactNode;
  accentColor?: string;
  accentLight?: string;
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

export function GlassButton({
  variant = 'primary',
  icon,
  children,
  accentColor = '#8b5cf6',
  accentLight = '#a78bfa',
  isDark = true,
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
    borderRadius: '14px',
    border: 'none',
    fontWeight: variant === 'primary' ? '600' : '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s ease',
    ...sizeStyles[size],
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
      color: '#fff',
      boxShadow: `0 4px 14px ${accentColor}40`,
    },
    secondary: {
      background: 'transparent',
      color: isDark ? '#fafafa' : '#18181b',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
    },
    outline: {
      background: 'transparent',
      color: isDark ? '#fafafa' : '#18181b',
      border: `1px solid ${accentColor}`,
    },
    ghost: {
      background: 'transparent',
      color: isDark ? '#fafafa' : '#18181b',
    },
  };

  return (
    <button
      style={{ ...baseStyles, ...variants[variant] }}
      disabled={loading || props.disabled}
      onMouseEnter={(e) => {
        if (variant === 'primary' || variant === 'success' || variant === 'danger') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          const shadowColor = variant === 'primary' ? accentColor : variant === 'success' ? '#10b981' : '#ef4444';
          e.currentTarget.style.boxShadow = `0 8px 24px ${shadowColor}60`;
        } else if (variant === 'secondary' || variant === 'outline') {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.color = accentColor;
          e.currentTarget.style.background = `${accentColor}08`;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' || variant === 'success' || variant === 'danger') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variants[variant].boxShadow as string;
        } else if (variant === 'secondary' || variant === 'outline') {
          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.color = isDark ? '#fafafa' : '#18181b';
          e.currentTarget.style.background = 'transparent';
        }
      }}
      {...props}
    >
      {loading ? <span>...</span> : icon}
      {!loading && children}
    </button>
  );
}
