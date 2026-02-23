import React from 'react';
import { Button } from './ui/button';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconColor?: string;
  iconBgColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  iconColor = 'var(--text-muted)',
  iconBgColor = 'var(--bg-surface)',
}) => {
  const isGradient = iconBgColor.includes('gradient');
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: iconBgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      }}>
        <Icon style={{ width: '40px', height: '40px', color: iconColor }} />
      </div>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '12px',
        margin: '0 0 12px 0',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
          margin: '0 0 32px 0',
          maxWidth: '400px',
          lineHeight: '1.6',
        }}>
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          style={{
            height: '48px',
            padding: '0 28px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            boxShadow: '0 4px 16px rgba(181, 147, 107, 0.3)',
            border: 'none',
          }}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
