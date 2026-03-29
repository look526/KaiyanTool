import React, { useState } from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({
    variant = 'default',
    interactive = false,
    padding = 'md',
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    const paddingStyles = {
      none: '0',
      sm: 'var(--spacing-4)',
      md: 'var(--spacing-6)',
      lg: 'var(--spacing-8)',
      xl: 'var(--spacing-10)',
    };

    const variantStyles = {
      default: {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-card)',
      },
      elevated: {
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-lg)',
      },
      outlined: {
        background: 'transparent',
        border: '1px solid var(--border-primary)',
        boxShadow: 'none',
      },
      glass: {
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-primary)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--shadow-card)',
      },
    };

    const baseStyles: React.CSSProperties = {
      borderRadius: 'var(--radius-xl)',
      padding: paddingStyles[padding],
      transition: 'all var(--transition-slow)',
      cursor: interactive ? 'pointer' : 'default',
      ...variantStyles[variant],
      ...style,
    };

    const interactiveStyles: React.CSSProperties = interactive ? {
      transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
      boxShadow: isHovered ? 'var(--shadow-card-hover)' : variantStyles[variant].boxShadow,
      borderColor: isHovered ? 'var(--border-hover)' : 'var(--border-primary)',
    } : {};

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactive) setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactive) setIsHovered(false);
      onMouseLeave?.(e);
    };

    return (
      <div
        ref={ref}
        style={{ ...baseStyles, ...interactiveStyles }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
