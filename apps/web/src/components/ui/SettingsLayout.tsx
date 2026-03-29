import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title,
  subtitle,
  backHref = '/settings',
  actions,
  children,
  maxWidth = 800,
}) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 35%, transparent 70%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(186, 158, 255, 0.1) 0%, rgba(186, 158, 255, 0.05) 40%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <header style={{
        height: '72px',
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to={backHref}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 2px 0',
              letterSpacing: '-0.01em',
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                margin: 0,
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            {actions}
          </div>
        )}
      </header>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '32px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: `${maxWidth}px`,
          margin: '0 auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const SettingsCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(30px)',
      borderRadius: '20px',
      border: '1px solid var(--border-primary)',
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  );
};

export const SettingsSection: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => {
  return (
    <div style={{
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: description ? '8px' : '16px',
      }}>
        {icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--accent-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            {icon}
          </div>
        )}
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          {title}
        </h2>
      </div>
      {description && (
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};