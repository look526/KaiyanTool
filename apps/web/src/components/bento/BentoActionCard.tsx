import React from 'react';
import { LucideIcon } from 'lucide-react';
import BentoCardSmall from './BentoCardSmall';

interface BentoActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  accentColor?: 'purple' | 'pink' | 'orange' | 'green' | 'blue' | 'teal';
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: number;
}

const accentColors = {
  purple: {
    bg: 'rgba(175, 82, 222, 0.15)',
    color: 'var(--color-accent-purple)',
  },
  pink: {
    bg: 'rgba(255, 45, 85, 0.15)',
    color: 'var(--color-accent-pink)',
  },
  orange: {
    bg: 'rgba(255, 149, 0, 0.15)',
    color: 'var(--color-accent-orange)',
  },
  green: {
    bg: 'rgba(52, 199, 89, 0.15)',
    color: 'var(--color-accent-green)',
  },
  blue: {
    bg: 'rgba(0, 122, 255, 0.15)',
    color: 'var(--color-primary-500)',
  },
  teal: {
    bg: 'rgba(90, 200, 250, 0.15)',
    color: 'var(--color-accent-teal)',
  },
};

export function BentoActionCard({
  title,
  description,
  icon: Icon,
  accentColor = 'blue',
  onClick,
  className = '',
  style,
  animationDelay = 0,
}: BentoActionCardProps) {
  const colors = accentColors[accentColor];

  return (
    <BentoCardSmall
      interactive
      onClick={onClick}
      className={className}
      style={style}
      animationDelay={animationDelay}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 'var(--spacing-4)',
      }}>
        <div style={{
          padding: 'var(--spacing-3)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: colors.bg,
          width: 'fit-content',
        }}>
          <Icon size={24} style={{ color: colors.color }} />
        </div>
        <div>
          <div style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {title}
          </div>
          {description && (
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginTop: 'var(--spacing-1)',
            }}>
              {description}
            </div>
          )}
        </div>
      </div>
    </BentoCardSmall>
  );
}

export default BentoActionCard;
