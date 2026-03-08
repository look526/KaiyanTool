import React from 'react';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = '加载中...',
  size = 'md',
  variant = 'spinner',
}) => {
  const sizeStyles = {
    sm: {
      spinner: 24,
      dots: 8,
      pulse: 24,
    },
    md: {
      spinner: 40,
      dots: 12,
      pulse: 40,
    },
    lg: {
      spinner: 56,
      dots: 16,
      pulse: 56,
    },
  };

  const currentSize = sizeStyles[size];

  if (variant === 'spinner') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-8)',
      }}>
        <svg
          style={{
            width: currentSize.spinner,
            height: currentSize.spinner,
            animation: 'spin 1s linear infinite',
            color: 'var(--accent)',
          }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {message && (
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-8)',
      }}>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-2)',
          alignItems: 'center',
        }}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                width: currentSize.dots,
                height: currentSize.dots,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                animation: `bounce 1.4s infinite ease-in-out ${index * 0.16}s`,
              }}
            />
          ))}
        </div>
        {message && (
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-8)',
      }}>
        <div
          style={{
            width: currentSize.pulse,
            height: currentSize.pulse,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        {message && (
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            {message}
          </span>
        )}
      </div>
    );
  }

  return null;
};

export const InlineLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeStyles = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <svg
      style={{
        width: sizeStyles[size],
        height: sizeStyles[size],
        animation: 'spin 1s linear infinite',
        color: 'var(--accent)',
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        style={{ opacity: 0.25 }}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        style={{ opacity: 0.75 }}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};
