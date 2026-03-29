import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
}

export function StatCard({ value, label }: StatCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isHovered, setIsHovered] = useState(false);

  const colors = isDark ? {
    bg: 'rgba(255, 255, 255, 0.03)',
    bgHover: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#dfe4fe',
    textMuted: '#a5aac2',
    accent: '#a78bfa',
  } : {
    bg: 'rgba(255, 255, 255, 0.8)',
    bgHover: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.6)',
    accent: '#7c3aed',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 32px',
        borderRadius: '24px',
        background: isHovered ? colors.bgHover : colors.bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
    >
      <span style={{
        fontSize: '48px',
        fontWeight: 800,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: isHovered ? colors.accent : colors.textPrimary,
        lineHeight: 1,
        marginBottom: '8px',
        transition: 'color 0.4s ease',
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '12px',
        fontWeight: 300,
        color: colors.textMuted,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  );
}
