import React from 'react';
import { LucideIcon } from 'lucide-react';
import BentoCard, { BentoCardProps } from './BentoCard';

type AccentColor = 'purple' | 'pink' | 'orange' | 'green' | 'blue' | 'teal' | 'indigo';

interface BentoGradientCardProps extends Omit<BentoCardProps, 'children' | 'variant'> {
  accent?: AccentColor;
  gradient?: string;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const accentGradients: Record<AccentColor, string> = {
  purple: 'linear-gradient(135deg, #AF52DE 0%, #8B3DB3 100%)',
  pink: 'linear-gradient(135deg, #FF2D55 0%, #D92349 100%)',
  orange: 'linear-gradient(135deg, #FF9500 0%, #CC7700 100%)',
  green: 'linear-gradient(135deg, #34C759 0%, #2AA147 100%)',
  blue: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
  teal: 'linear-gradient(135deg, #5AC8FA 0%, #4AA0C8 100%)',
  indigo: 'linear-gradient(135deg, #5856D6 0%, #4644AB 100%)',
};

const glowEffects: Record<AccentColor, string> = {
  purple: 'var(--glow-purple)',
  pink: 'var(--glow-pink)',
  orange: 'var(--glow-orange)',
  green: 'var(--glow-green)',
  blue: 'var(--glow-blue)',
  teal: 'var(--glow-teal)',
  indigo: 'var(--glow-purple)',
};

export function BentoGradientCard({
  accent = 'blue',
  gradient,
  icon: Icon,
  title,
  description,
  children,
  size = 'small',
  interactive,
  onClick,
  className = '',
  style,
  animationDelay = 0,
}: BentoGradientCardProps) {
  const bgGradient = gradient || accentGradients[accent];
  const glow = glowEffects[accent];

  return (
    <BentoCard
      size={size}
      interactive={interactive}
      onClick={onClick}
      className={className}
      style={{
        background: bgGradient,
        border: 'none',
        boxShadow: glow,
        color: 'white',
        ...style,
      }}
      animationDelay={animationDelay}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 'var(--spacing-4)',
      }}>
        {Icon && (
          <div style={{
            padding: 'var(--spacing-3)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            width: 'fit-content',
          }}>
            <Icon size={24} color="white" />
          </div>
        )}
        {(title || description) && (
          <div>
            {title && (
              <div style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
              }}>
                {title}
              </div>
            )}
            {description && (
              <div style={{
                fontSize: 'var(--font-size-sm)',
                opacity: 0.9,
                marginTop: 'var(--spacing-1)',
              }}>
                {description}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </BentoCard>
  );
}

export default BentoGradientCard;
