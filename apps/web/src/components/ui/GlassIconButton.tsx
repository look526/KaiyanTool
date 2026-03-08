import React, { ReactNode } from 'react';

interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'default' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassIconButton({
  icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  ...props
}: GlassIconButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const sizes = {
    sm: { width: '28px', height: '28px', iconSize: 14 },
    md: { width: '32px', height: '32px', iconSize: 16 },
    lg: { width: '40px', height: '40px', iconSize: 20 },
  };

  const currentSize = sizes[size];

  const variants: Record<string, React.CSSProperties> = {
    default: {
      background: isHovered ? 'var(--bg-hover)' : 'var(--bg-surface)',
      color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
      border: '1px solid var(--border-primary)',
    },
    danger: {
      background: isHovered ? 'var(--error-primary)' : 'var(--error-secondary)',
      color: isHovered ? '#ffffff' : 'var(--error-primary)',
      border: '1px solid var(--error-primary)',
    },
    accent: {
      background: isHovered ? 'var(--accent-hover)' : 'var(--accent-primary)',
      color: '#ffffff',
      border: '1px solid var(--accent-primary)',
    },
  };

  return (
    <button
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: currentSize.width,
        height: currentSize.height,
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        ...variants[variant],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {React.cloneElement(icon as React.ReactElement, {
        size: currentSize.iconSize,
      })}
    </button>
  );
}
