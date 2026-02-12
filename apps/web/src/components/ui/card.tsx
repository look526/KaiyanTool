import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tabIndex?: number;
  role?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tabIndex, role, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: '12px',
        transition: 'all 0.15s ease',
        ...style,
      }}
      className={className}
      tabIndex={tabIndex}
      role={role}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card };
