import * as React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
  className = '',
  style,
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        backgroundColor: 'var(--bg-tertiary)',
        background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lineHeight = 16,
  gap = 8,
  className = '',
}: SkeletonTextProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div
      className={className}
      style={{
        padding: 'var(--spacing-6)',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--card-border)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
        <Skeleton width={40} height={40} borderRadius="var(--radius-lg)" />
        <div style={{ flex: 1 }}>
          <Skeleton height={16} width="60%" style={{ marginBottom: 'var(--spacing-2)' }} />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} lineHeight={14} gap={6} />
    </div>
  );
}

export default Skeleton;
