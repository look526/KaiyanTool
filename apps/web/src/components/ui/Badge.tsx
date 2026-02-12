import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  dot?: boolean;
  className?: string;
}

const VARIANT_COLORS = {
  default: {
    bg: 'var(--bg-hover)',
    text: 'var(--text-secondary)',
    dot: 'var(--text-tertiary)',
  },
  primary: {
    bg: 'rgba(139, 92, 246, 0.15)',
    text: '#8b5cf6',
    dot: '#8b5cf6',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#10b981',
    dot: '#10b981',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#f59e0b',
    dot: '#f59e0b',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#ef4444',
    dot: '#ef4444',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#3b82f6',
    dot: '#3b82f6',
  },
};

const SIZE_CONFIG = {
  small: {
    padding: '2px 6px',
    fontSize: '11px',
    dotSize: '6px',
  },
  medium: {
    padding: '4px 10px',
    fontSize: '12px',
    dotSize: '8px',
  },
  large: {
    padding: '6px 14px',
    fontSize: '14px',
    dotSize: '10px',
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  className,
}: BadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        fontWeight: '500',
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: '9999px',
        whiteSpace: 'nowrap' as const,
        lineHeight: 1,
      }}
    >
      {dot && (
        <span
          style={{
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: '50%',
            backgroundColor: colors.dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

export interface BadgeCountProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
  className?: string;
}

export function BadgeCount({
  count,
  max = 99,
  variant = 'default',
  size = 'medium',
  showZero = false,
  className,
}: BadgeCountProps) {
  if (!showZero && count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;
  const colors = VARIANT_COLORS[variant];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: size === 'small' ? '18px' : size === 'medium' ? '22px' : '28px',
        height: size === 'small' ? '18px' : size === 'medium' ? '22px' : '28px',
        padding: `0 ${count > 9 ? '6px' : '4px'}`,
        fontSize: sizeConfig.fontSize,
        fontWeight: '600',
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: '9999px',
        lineHeight: 1,
      }}
    >
      {displayCount}
    </span>
  );
}

export interface BadgeDotProps {
  color?: string;
  size?: 'small' | 'medium' | 'large';
  pulse?: boolean;
  className?: string;
}

const DOT_SIZE_CONFIG = {
  small: '8px',
  medium: '10px',
  large: '12px',
};

export function BadgeDot({
  color = '#10b981',
  size = 'medium',
  pulse = false,
  className,
}: BadgeDotProps) {
  const dotSize = DOT_SIZE_CONFIG[size];

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {pulse && (
        <span
          style={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.5,
            animation: 'badge-dot-pulse 2s ease-in-out infinite',
          }}
        />
      )}
      <style>{`
        @keyframes badge-dot-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
