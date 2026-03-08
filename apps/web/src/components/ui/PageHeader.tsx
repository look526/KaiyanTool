import React from 'react';

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
  return (
    <div style={{
      background: 'var(--bg-header)',
      backdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-primary)',
      padding: 'var(--spacing-6) var(--spacing-8)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)',
    }}>
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
      }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            marginBottom: 'var(--spacing-4)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span style={{ color: 'var(--text-muted)' }}>/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-primary)' }}>
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
          gap: 'var(--spacing-6)',
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-4)',
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
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-glass)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-glass-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-glass)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
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
                color: 'var(--text-primary)',
                margin: '0',
                lineHeight: 'var(--line-height-tight)',
                letterSpacing: 'var(--letter-spacing-tight)',
              }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  margin: 'var(--spacing-1) 0 0 0',
                  lineHeight: 'var(--line-height-normal)',
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
              gap: 'var(--spacing-3)',
            }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
