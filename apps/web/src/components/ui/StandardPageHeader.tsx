import React from 'react';

export interface StandardPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconGradient?: string;
  iconShadow?: string;
  actions?: React.ReactNode;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconGradient = 'linear-gradient(135deg, #ba9eff 0%, #ec63ff 100%)',
  iconShadow = '0 4px 14px rgba(186, 158, 255, 0.3)',
  actions,
}) => {
  return (
    <div style={{
      background: 'rgba(7, 13, 31, 0.6)',
      backdropFilter: 'blur(48px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 50px rgba(139, 92, 246, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {icon && (
              <div style={{
                padding: '12px',
                borderRadius: '14px',
                background: iconGradient,
                boxShadow: iconShadow,
              }}>
                {icon}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#dfe4fe', margin: 0, fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif" }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '13px', color: '#a5aac2', margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
