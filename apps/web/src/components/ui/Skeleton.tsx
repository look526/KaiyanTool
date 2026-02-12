import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ 
  width = '100%', 
  height = '100%', 
  borderRadius = '4px', 
  className,
  style
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-tertiary)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transform: 'translateX(-100%)',
          animation: 'skeleton-shimmer 1.5s ease-in-out infinite'
        }}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '20px',
      border: '2px solid var(--border-primary)',
      overflow: 'hidden',
      padding: '24px'
    }}>
      <div style={{ height: '5px', background: 'linear-gradient(90deg, var(--bg-tertiary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)' }} />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Skeleton width="64px" height="64px" borderRadius="12px" />
        <Skeleton width="36px" height="36px" borderRadius="8px" />
      </div>
      
      <Skeleton height="24px" borderRadius="4px" style={{ marginBottom: '12px' }} />
      <Skeleton height="16px" borderRadius="4px" style={{ marginBottom: '8px' }} />
      <Skeleton height="16px" borderRadius="4px" style={{ marginBottom: '24px' }} />
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <Skeleton width="80px" height="32px" borderRadius="8px" />
        <Skeleton width="100px" height="32px" borderRadius="8px" />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Skeleton width="120px" height="20px" borderRadius="4px" />
          <Skeleton width="80px" height="20px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '24px',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '16px',
      border: '2px solid var(--border-primary)'
    }}>
      <Skeleton width="72px" height="72px" borderRadius="12px" />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <Skeleton height="20px" borderRadius="4px" style={{ flex: 1, maxWidth: '200px' }} />
          <Skeleton width="80px" height="32px" borderRadius="8px" />
        </div>
        <Skeleton height="16px" borderRadius="4px" style={{ marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '24px' }}>
          <Skeleton width="100px" height="20px" borderRadius="4px" />
          <Skeleton width="80px" height="20px" borderRadius="4px" />
          <Skeleton width="100px" height="32px" borderRadius="6px" />
        </div>
      </div>
      
      <Skeleton width="40px" height="40px" borderRadius="8px" />
    </div>
  );
}

// 添加骨架屏动画到全局样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes skeleton-loading {
      0% {
        opacity: 0.6;
      }
      50% {
        opacity: 0.8;
      }
      100% {
        opacity: 0.6;
      }
    }
    
    @keyframes skeleton-shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
}
