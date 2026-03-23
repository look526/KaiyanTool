import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  gradient: string;
  iconColor: string;
  hoverGlow: string;
}

export function StatCard({ icon, value, label, gradient, iconColor, hoverGlow }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const textColors = isDark ? {
    secondary: '#a5aac2',
    primary: '#dfe4fe',
    glassBg: 'rgba(28, 37, 62, 0.4)',
    border: 'rgba(65, 71, 91, 0.15)',
  } : {
    secondary: 'rgba(24, 24, 27, 0.6)',
    primary: '#18181b',
    glassBg: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 0, 0, 0.06)',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: '24px',
        borderRadius: '24px',
        background: textColors.glassBg,
        backdropFilter: 'blur(30px)',
        border: `1px solid ${textColors.border}`,
        overflow: 'hidden',
        transition: 'all 0.5s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div style={{
        position: 'absolute',
        right: '-16px',
        top: '-16px',
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        background: hoverGlow,
        filter: 'blur(40px)',
        transition: 'all 0.5s ease',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{
            fontSize: '28px',
            color: 'white',
            fontVariationSettings: "'FILL' 1, 'wght' 500",
          }}>{icon}</span>
        </div>
        <div>
          <p style={{ fontSize: '14px', color: textColors.secondary, fontWeight: 500, marginBottom: '4px', margin: '0 0 4px 0' }}>{label}</p>
          <h3 style={{
            fontSize: '36px',
            fontWeight: 800,
            color: textColors.primary,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1,
            margin: 0,
          }}>{value}</h3>
        </div>
      </div>
    </div>
  );
}
