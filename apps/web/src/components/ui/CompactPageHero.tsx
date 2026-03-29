import { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface StatItem {
  label: string;
  value: number;
}

interface CompactPageHeroProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  stats?: StatItem[];
  actions?: ReactNode;
}

export function CompactPageHero({ title, subtitle, icon, stats = [], actions }: CompactPageHeroProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const colors = isDark ? {
    textPrimary: '#dfe4fe',
    textMuted: '#a5aac2',
    accent: '#8b5cf6',
    accentDim: '#7c3aed',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
  } : {
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.5)',
    accent: '#7c3aed',
    accentDim: '#6d28d9',
    bgGlass: 'rgba(0, 0, 0, 0.04)',
  };

  const subtitleParts = [
    subtitle,
    ...stats.map(s => `${s.value}${s.label}`),
  ].filter(Boolean).join(' · ');

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
        marginBottom: '24px',
        position: 'relative',
        padding: '12px 16px',
        background: colors.bgGlass,
        borderRadius: '12px',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDim} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <h1
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: colors.textPrimary,
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '12px',
                color: colors.textMuted,
                margin: '2px 0 0 0',
              }}
            >
              {subtitleParts}
            </p>
          </div>
        </div>
        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </div>
    </div>
  );
}
