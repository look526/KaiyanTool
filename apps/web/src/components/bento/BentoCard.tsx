import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

type BentoCardSize = 'small' | 'medium' | 'large' | 'wide' | 'tall';

export interface BentoCardProps {
  children: React.ReactNode;
  size?: BentoCardSize;
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: number;
  draggable?: boolean;
  hoverable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const sizeStyles: Record<BentoCardSize, React.CSSProperties> = {
  small: {
    gridColumn: 'span 1',
    gridRow: 'span 1',
    minHeight: '180px',
  },
  medium: {
    gridColumn: 'span 1',
    gridRow: 'span 2',
    minHeight: '380px',
  },
  large: {
    gridColumn: 'span 2',
    gridRow: 'span 2',
    minHeight: '380px',
  },
  wide: {
    gridColumn: 'span 2',
    gridRow: 'span 1',
    minHeight: '180px',
  },
  tall: {
    gridColumn: 'span 1',
    gridRow: 'span 2',
    minHeight: '380px',
  },
};

export function BentoCard({
  children,
  size = 'small',
  variant = 'default',
  interactive = false,
  onClick,
  className = '',
  style,
  animationDelay = 0,
}: BentoCardProps) {
  const { theme } = useTheme();

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'elevated':
        return {
          boxShadow: theme === 'dark' 
            ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
            : '0 8px 24px rgba(0, 0, 0, 0.12)',
        };
      case 'outlined':
        return {
          boxShadow: 'none',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-primary)',
        };
      default:
        return {
          boxShadow: 'var(--card-shadow)',
        };
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-6)',
    border: '1px solid var(--card-border)',
    transition: 'transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)',
    cursor: interactive || onClick ? 'pointer' : 'default',
    animation: `fadeInUp 0.5s var(--ease-out) forwards`,
    animationDelay: `${animationDelay}ms`,
    opacity: 0,
    ...sizeStyles[size],
    ...getVariantStyles(),
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive || onClick) {
      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
      e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive || onClick) {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = variant === 'elevated' 
        ? (theme === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(0, 0, 0, 0.12)')
        : 'var(--card-shadow)';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive || onClick) {
      e.currentTarget.style.transform = 'translateY(-2px) scale(0.99)';
    }
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export default BentoCard;
