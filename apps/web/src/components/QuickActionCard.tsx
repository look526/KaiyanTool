import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionCardProps {
  icon: ReactNode;
  label: string;
  desc: string;
  gradient: string;
  shadow: string;
  onClick?: () => void;
  to?: string;
}

export function QuickActionCard({
  icon,
  label,
  desc,
  gradient,
  shadow,
  onClick,
  to,
}: QuickActionCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const content = (
    <div
      style={{
        padding: '22px',
        borderRadius: '18px',
        background: 'var(--bg-card)',
        border: isHovered ? '1px solid var(--accent-border)' : '1px solid var(--border-primary)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'var(--glass-blur)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 20px 40px ${shadow}` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 14px ${shadow}`,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {label}
        </div>
        <ChevronRight style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, paddingLeft: '58px' }}>
        {desc}
      </p>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}
