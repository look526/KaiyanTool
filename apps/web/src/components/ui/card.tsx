import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tabIndex?: number;
  role?: string;
  glass?: boolean;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tabIndex, role, style, glass = true, hover = true, glow = false, gradient = false, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        backgroundColor: glass ? 'rgba(255, 255, 255, 0.05)' : gradient ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: glass ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(20px) saturate(180%)' : 'none',
        boxShadow: glow ? '0 8px 32px rgba(102, 126, 234, 0.2)' : '0 4px 24px rgba(0, 0, 0, 0.08)',
        ...style,
      }}
      className={className}
      tabIndex={tabIndex}
      role={role}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
          e.currentTarget.style.boxShadow = glow 
            ? '0 16px 48px rgba(102, 126, 234, 0.3)' 
            : '0 20px 60px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.backgroundColor = glass 
            ? 'rgba(255, 255, 255, 0.08)' 
            : gradient 
              ? 'rgba(102, 126, 234, 0.15)' 
              : 'rgba(255, 255, 255, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = glow 
            ? '0 8px 32px rgba(102, 126, 234, 0.2)' 
            : '0 4px 24px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.backgroundColor = glass 
            ? 'rgba(255, 255, 255, 0.05)' 
            : gradient 
              ? 'rgba(102, 126, 234, 0.1)' 
              : 'rgba(255, 255, 255, 0.03)';
        }
      }}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card };
