import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  showBackButton = false,
  onBackClick,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const colors = isDark ? {
    bgHeader: 'rgba(5, 5, 10, 0.8)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgHeader: 'rgba(255, 255, 255, 0.8)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  };
  return (
    <div style={{
      background: 'colors.bgHeader',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid colors.border',
      padding: '24px 32px',
      position: 'sticky',
      top: 0,
      zIndex: '100',
    }}>
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
      }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            color: 'colors.textSecondary',
          }}>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span style={{ color: 'colors.textMuted' }}>/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    style={{
                      color: 'colors.textSecondary',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#8b5cf6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'colors.textSecondary';
                    }}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span style={{ color: 'colors.textPrimary' }}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            {showBackButton && (
              <button
                onClick={onBackClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '1px solid colors.border',
                  background: 'colors.bgGlass',
                  color: 'colors.textSecondary',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'colors.bgGlassHover';
                  e.currentTarget.style.borderColor = 'colors.borderHover';
                  e.currentTarget.style.color = 'colors.textPrimary';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'colors.bgGlass';
                  e.currentTarget.style.borderColor = 'colors.border';
                  e.currentTarget.style.color = 'colors.textSecondary';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}

            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'colors.textPrimary',
                margin: '0',
                lineHeight: '1.25',
                letterSpacing: '-0.02em',
              }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{
                  fontSize: '14px',
                  color: 'colors.textSecondary',
                  margin: '4px 0 0 0',
                  lineHeight: '1.5',
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

