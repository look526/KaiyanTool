import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

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
  iconGradient = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  iconShadow = '0 4px 14px rgba(249, 115, 22, 0.3)',
  actions,
}) => {
  return (
    <div style={{
      background: 'var(--bg-header)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-primary)',
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
              <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
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
