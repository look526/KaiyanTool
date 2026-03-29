import { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { StatCard } from './StatCard';

interface StatItem {
  value: number;
  label: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  stats?: StatItem[];
  glowColor?: string;
  actions?: ReactNode;
}

export function PageHero({ title, subtitle, icon, stats = [], glowColor, actions }: PageHeroProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const colors = isDark ? {
    textPrimary: '#dfe4fe',
    textMuted: '#a5aac2',
    glow1: glowColor || 'rgba(139, 92, 246, 0.12)',
    glow2: 'rgba(236, 99, 255, 0.08)',
  } : {
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.6)',
    glow1: glowColor || 'rgba(139, 92, 246, 0.08)',
    glow2: 'rgba(236, 99, 255, 0.05)',
  };

  return (
    <section style={{
      textAlign: 'center',
      paddingBottom: '48px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        width: '60%',
        height: '300px',
        background: `radial-gradient(ellipse at center, ${colors.glow1} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '40px',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 12px 32px rgba(139, 92, 246, 0.3)',
        }}>
          {icon}
        </div>

        <h1 style={{
          fontSize: '14px',
          fontWeight: 300,
          color: colors.textMuted,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          {title}
        </h1>

        {subtitle && (
          <p style={{
            fontSize: '14px',
            fontWeight: 300,
            color: colors.textMuted,
            letterSpacing: '0.05em',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {stats.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}>
          {stats.map((stat, idx) => (
            <StatCard key={idx} value={stat.value} label={stat.label} />
          ))}
        </div>
      )}

      {actions && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {actions}
        </div>
      )}
    </section>
  );
}
