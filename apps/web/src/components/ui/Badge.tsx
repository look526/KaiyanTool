import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const VARIANT_COLORS = {
  default: {
    bg: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    dot: '#ffffff',
    border: 'rgba(255, 255, 255, 0.15)',
  },
  primary: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: '#ffffff',
    dot: '#667eea',
    border: 'transparent',
  },
  success: {
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    text: '#ffffff',
    dot: '#4facfe',
    border: 'transparent',
  },
  warning: {
    bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    text: '#ffffff',
    dot: '#fa709a',
    border: 'transparent',
  },
  error: {
    bg: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    text: '#ffffff',
    dot: '#ff0844',
    border: 'transparent',
  },
  info: {
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    text: '#ffffff',
    dot: '#f093fb',
    border: 'transparent',
  },
  gradient: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: '#ffffff',
    dot: '#667eea',
    border: 'transparent',
  },
};

const SIZE_CONFIG = {
  small: {
    padding: '4px 10px',
    fontSize: '11px',
    dotSize: '6px',
  },
  medium: {
    padding: '6px 14px',
    fontSize: '12px',
    dotSize: '8px',
  },
  large: {
    padding: '8px 18px',
    fontSize: '14px',
    dotSize: '10px',
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  pulse = false,
  className,
}: BadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const sizeConfig = SIZE_CONFIG[size];
  const isGradient = variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'error' || variant === 'info' || variant === 'gradient';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        fontWeight: '700',
        backgroundColor: colors.bg,
        color: colors.text,
        border: isGradient ? 'none' : `1px solid ${colors.border}`,
        borderRadius: '9999px',
        whiteSpace: 'nowrap' as const,
        lineHeight: 1,
        backdropFilter: isGradient ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: isGradient ? 'none' : 'blur(10px)',
        boxShadow: isGradient ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        if (isGradient) {
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        if (isGradient) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        }
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
            boxShadow: `0 0 8px ${colors.dot}60`,
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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
  pulse?: boolean;
  className?: string;
}

export function BadgeCount({
  count,
  max = 99,
  variant = 'gradient',
  size = 'medium',
  showZero = false,
  pulse = false,
  className,
}: BadgeCountProps) {
  if (!showZero && count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;
  const colors = VARIANT_COLORS[variant];
  const sizeConfig = SIZE_CONFIG[size];
  const isGradient = variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'error' || variant === 'info' || variant === 'gradient';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: size === 'small' ? '22px' : size === 'medium' ? '26px' : '32px',
        height: size === 'small' ? '22px' : size === 'medium' ? '26px' : '32px',
        padding: `0 ${count > 9 ? '8px' : '6px'}`,
        fontSize: sizeConfig.fontSize,
        fontWeight: '800',
        backgroundColor: colors.bg,
        color: colors.text,
        border: isGradient ? 'none' : `1px solid ${colors.border}`,
        borderRadius: '9999px',
        lineHeight: 1,
        backdropFilter: isGradient ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: isGradient ? 'none' : 'blur(10px)',
        boxShadow: isGradient ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: pulse ? 'pulse-badge 2s ease-in-out infinite' : 'none',
      }}
    >
      {displayCount}
      <style>{`
        @keyframes pulse-badge {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
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
  color = '#667eea',
  size = 'medium',
  pulse = false,
  className,
}: BadgeDotProps) {
  const dotSize = DOT_SIZE_CONFIG[size];

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
          boxShadow: `0 0 12px ${color}80`,
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
            animation: 'badge-dot-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
