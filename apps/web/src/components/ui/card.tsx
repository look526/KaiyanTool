import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tabIndex?: number;
  role?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    tabIndex, 
    role, 
    style, 
    variant = 'default', 
    interactive = false,
    padding = 'md',
    ...props 
  }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'none',
      },
      elevated: {
        backgroundColor: 'var(--bg-elevated)',
        border: 'none',
        boxShadow: 'var(--shadow-lg)',
      },
      outlined: {
        backgroundColor: 'transparent',
        border: '1px solid var(--border-primary)',
        boxShadow: 'none',
      },
      filled: {
        backgroundColor: 'var(--bg-secondary)',
        border: 'none',
        boxShadow: 'none',
      },
    };

    const paddingStyles: Record<string, string> = {
      none: '0',
      sm: 'var(--spacing-4)',
      md: 'var(--spacing-6)',
      lg: 'var(--spacing-8)',
    };

    return (
      <div
        ref={ref}
        style={{
          borderRadius: 'var(--radius-xl)',
          transition: 'transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)',
          cursor: interactive ? 'pointer' : 'default',
          padding: paddingStyles[padding],
          ...variantStyles[variant],
          ...style,
        }}
        className={className}
        tabIndex={tabIndex}
        role={role}
        onMouseEnter={(e) => {
          if (interactive) {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }
        }}
        onMouseLeave={(e) => {
          if (interactive) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow as string;
          }
        }}
        onMouseDown={(e) => {
          if (interactive) {
            e.currentTarget.style.transform = 'translateY(-2px) scale(0.99)';
          }
        }}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';

export { Card };
