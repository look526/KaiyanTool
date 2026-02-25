import React from 'react';
import { LucideIcon } from 'lucide-react';
import BentoCardSmall from './BentoCardSmall';

interface BentoStatsCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: number;
}

export function BentoStatsCard({
  value,
  label,
  icon: Icon,
  trend,
  trendValue,
  className = '',
  style,
  animationDelay = 0,
}: BentoStatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'var(--color-success)';
      case 'down':
        return 'var(--color-error)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  return (
    <BentoCardSmall
      className={className}
      style={style}
      animationDelay={animationDelay}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          {Icon && (
            <div style={{
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <Icon 
                size={24} 
                style={{ color: 'var(--color-primary-500)' }}
              />
            </div>
          )}
          {trend && trendValue && (
            <span style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: getTrendColor(),
            }}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
            </span>
          )}
        </div>
        <div>
          <div style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}>
            {value}
          </div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            marginTop: 'var(--spacing-1)',
          }}>
            {label}
          </div>
        </div>
      </div>
    </BentoCardSmall>
  );
}

export default BentoStatsCard;
