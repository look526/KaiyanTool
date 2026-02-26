import * as React from 'react';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles = {
  sm: { height: '4px' },
  md: { height: '8px' },
  lg: { height: '12px' },
};

const variantStyles = {
  default: 'var(--color-primary-500)',
  gradient: 'linear-gradient(90deg, var(--color-primary-500), var(--color-accent-purple))',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  className = '',
  style,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className} style={style}>
      {showValue && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          ...sizeStyles[size],
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: variantStyles[variant],
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s var(--ease-out)',
          }}
        />
      </div>
    </div>
  );
}

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  variant = 'default',
  showValue = false,
  className = '',
  style,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    switch (variant) {
      case 'success':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-error)';
      default:
        return 'var(--color-primary-500)';
    }
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        ...style,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s var(--ease-out)',
          }}
        />
      </svg>
      {showValue && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export default Progress;
