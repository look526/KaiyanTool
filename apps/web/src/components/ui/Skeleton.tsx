import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ 
  width = '100%', 
  height = '100%', 
  borderRadius = '8px',
  variant = 'rectangular',
  className,
  style
}: SkeletonProps) {
  const radius = variant === 'circular' ? '50%' : variant === 'text' ? '4px' : borderRadius;
  
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
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
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
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
      borderRadius: '16px',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Skeleton width="56px" height="56px" borderRadius="12px" />
        <Skeleton width="32px" height="32px" borderRadius="8px" />
      </div>
      
      <Skeleton height="20px" borderRadius="6px" style={{ marginBottom: '10px', width: '70%' }} />
      <Skeleton height="14px" borderRadius="4px" style={{ marginBottom: '6px', width: '90%' }} />
      <Skeleton height="14px" borderRadius="4px" style={{ marginBottom: '16px', width: '60%' }} />
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Skeleton width="72px" height="28px" borderRadius="6px" />
        <Skeleton width="88px" height="28px" borderRadius="6px" />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Skeleton width="100px" height="14px" borderRadius="4px" />
          <Skeleton width="64px" height="14px" borderRadius="4px" />
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
      gap: '20px',
      padding: '20px',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '16px',
      border: '1px solid var(--border-subtle)'
    }}>
      <Skeleton width="64px" height="64px" borderRadius="12px" />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Skeleton height="18px" borderRadius="4px" style={{ flex: 1, maxWidth: '180px' }} />
          <Skeleton width="72px" height="28px" borderRadius="6px" />
        </div>
        <Skeleton height="12px" borderRadius="4px" style={{ marginBottom: '10px', width: '80%' }} />
        <div style={{ display: 'flex', gap: '20px' }}>
          <Skeleton width="80px" height="14px" borderRadius="4px" />
          <Skeleton width="64px" height="14px" borderRadius="4px" />
          <Skeleton width="80px" height="28px" borderRadius="6px" />
        </div>
      </div>
      
      <Skeleton width="36px" height="36px" borderRadius="8px" />
    </div>
  );
}

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes skeleton-loading {
      0% { opacity: 0.6; }
      50% { opacity: 0.85; }
      100% { opacity: 0.6; }
    }
    
    @keyframes skeleton-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}
