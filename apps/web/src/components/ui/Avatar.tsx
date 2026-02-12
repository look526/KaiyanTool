import { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    size: '32px',
    fontSize: '12px',
    iconSize: '14px',
  },
  medium: {
    size: '40px',
    fontSize: '14px',
    iconSize: '16px',
  },
  large: {
    size: '56px',
    fontSize: '18px',
    iconSize: '20px',
  },
  xlarge: {
    size: '80px',
    fontSize: '24px',
    iconSize: '28px',
  },
};

const STATUS_COLORS = {
  online: '#10b981',
  offline: '#6b7280',
  busy: '#ef4444',
  away: '#f59e0b',
};

const STATUS_SIZE = {
  small: { offset: '0px', size: '8px' },
  medium: { offset: '0px', size: '10px' },
  large: { offset: '2px', size: '12px' },
  xlarge: { offset: '4px', size: '16px' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt = '',
  name,
  size = 'medium',
  shape = 'circle',
  status,
  className,
}: AvatarProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const statusSize = STATUS_SIZE[size];
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const radius = shape === 'circle' ? '50%' : '12px';
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : 'var(--bg-hover)';

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onLoad={() => setIsLoading(false)}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: radius,
            display: 'block',
          }}
        />
      );
    }

    if (name) {
      return (
        <span
          style={{
            fontSize: sizeConfig.fontSize,
            fontWeight: '600',
            color: '#ffffff',
            lineHeight: sizeConfig.size,
            textAlign: 'center' as const,
            display: 'block',
          }}
        >
          {initials}
        </span>
      );
    }

    return (
      <span
        style={{
          fontSize: sizeConfig.iconSize,
          color: 'var(--text-tertiary)',
          lineHeight: sizeConfig.size,
          display: 'block',
          textAlign: 'center' as const,
        }}
      >
        ?
      </span>
    );
  };

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          width: sizeConfig.size,
          height: sizeConfig.size,
          backgroundColor: src && !imageError ? 'transparent' : bgColor,
          borderRadius: radius,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--bg-base)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
        }}
      >
        {isLoading && src && !imageError ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--bg-hover)',
              animation: 'avatar-loading 1.5s ease-in-out infinite',
            }}
          />
        ) : (
          renderContent()
        )}
      </div>
      {status && (
        <div
          style={{
            position: 'absolute',
            bottom: statusSize.offset,
            right: statusSize.offset,
            width: statusSize.size,
            height: statusSize.size,
            backgroundColor: STATUS_COLORS[status],
            borderRadius: '50%',
            border: '2px solid var(--bg-base)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />
      )}
      <style>{`
        @keyframes avatar-loading {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function AvatarGroup({ avatars, max = 5, size = 'medium', className }: AvatarGroupProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlap = size === 'small' ? '12px' : size === 'medium' ? '16px' : '24px';

  return (
    <div className={className} style={{ display: 'flex' }}>
      {displayed.map((avatar, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? `-${overlap}` : '0',
            border: '2px solid var(--bg-base)',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease',
            zIndex: displayed.length - index,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.zIndex = String(displayed.length + 1);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.zIndex = String(displayed.length - index);
          }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: `-${overlap}`,
            width: sizeConfig.size,
            height: sizeConfig.size,
            backgroundColor: 'var(--bg-hover)',
            borderRadius: '50%',
            border: '2px solid var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
