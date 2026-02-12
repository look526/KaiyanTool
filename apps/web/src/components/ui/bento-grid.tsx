import { ReactNode } from 'react';

export interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    gap: '24px',
  };

  return (
    <div style={gridStyle} className={className}>
      {children}
    </div>
  );
};

export interface BentoCardProps {
  name: string;
  description: string;
  Icon: any;
  background?: ReactNode;
  href?: string;
  cta?: string;
  className?: string;
}

export const BentoCard = ({
  name,
  description,
  Icon,
  href,
  cta,
  className,
}: BentoCardProps) => {
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px',
    background: '#0a0a0f',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    minHeight: '280px',
    cursor: 'pointer',
    overflow: 'hidden',
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: '-0.3px',
    marginBottom: '12px',
    transition: 'all 0.3s ease',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#8b949e',
    lineHeight: '1.6',
    margin: 0,
    transition: 'all 0.3s ease',
  };

  const ctaStyle: React.CSSProperties = {
    marginTop: 'auto',
    paddingTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#8b949e',
    transition: 'all 0.3s ease',
  };

  const gradientBorderStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '16px',
    padding: '1px',
    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(238, 90, 111, 0.3) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none' as const,
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 107, 107, 0.15) 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
    pointerEvents: 'none' as const,
  };

  return (
    <a
      href={href || '#'}
      style={cardStyle}
      className={className}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(-4px)';
        target.style.boxShadow = '0 0 0 1px rgba(255, 107, 107, 0.3), 0 12px 20px -2px rgba(0, 0, 0, 0.5)';
        target.style.borderColor = 'rgba(255, 107, 107, 0.5)';
        const gradientBorder = target.querySelector('.gradient-border') as HTMLElement;
        const glow = target.querySelector('.glow-effect') as HTMLElement;
        if (gradientBorder) gradientBorder.style.opacity = '1';
        if (glow) glow.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(0)';
        target.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.3)';
        target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        const gradientBorder = target.querySelector('.gradient-border') as HTMLElement;
        const glow = target.querySelector('.glow-effect') as HTMLElement;
        if (gradientBorder) gradientBorder.style.opacity = '0';
        if (glow) glow.style.opacity = '0';
      }}
    >
      <div style={gradientBorderStyle} className="gradient-border" />
      <div style={glowStyle} className="glow-effect" />
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div 
          style={iconContainerStyle}
          className="icon-container"
        >
          <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'auto' }}>
          <h3 style={titleStyle} className="card-title">
            {name}
          </h3>
          <p style={descriptionStyle} className="card-description">
            {description}
          </p>
        </div>

        {cta && (
          <div style={ctaStyle} className="card-cta">
            <span>{cta}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </a>
  );
};
