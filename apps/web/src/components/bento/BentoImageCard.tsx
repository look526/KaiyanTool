import React from 'react';
import BentoCard, { BentoCardProps } from './BentoCard';

interface BentoImageCardProps extends Omit<BentoCardProps, 'children'> {
  src: string;
  alt: string;
  overlay?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait';
  className?: string;
  style?: React.CSSProperties;
}

const aspectRatios = {
  square: '100%',
  video: '56.25%',
  portrait: '150%',
};

export function BentoImageCard({
  src,
  alt,
  overlay,
  aspectRatio = 'square',
  size = 'small',
  className = '',
  style,
  ...props
}: BentoImageCardProps) {
  return (
    <BentoCard
      size={size}
      className={className}
      style={{
        padding: 0,
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: aspectRatios[aspectRatio],
      }}>
        <img
          src={src}
          alt={alt}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {overlay && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 'var(--spacing-4)',
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
            color: 'white',
          }}>
            {overlay}
          </div>
        )}
      </div>
    </BentoCard>
  );
}

export default BentoImageCard;
