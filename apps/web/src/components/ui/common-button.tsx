import React from 'react';
import { Button as BaseButton } from './button';

export interface CommonButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CommonButton: React.FC<CommonButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  disabled = false,
  className = '',
  style = {},
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '13px',
          height: '36px',
          iconSize: '14px',
        };
      case 'lg':
        return {
          padding: '14px 28px',
          fontSize: '16px',
          height: '52px',
          iconSize: '20px',
        };
      case 'md':
      default:
        return {
          padding: '12px 24px',
          fontSize: '14px',
          height: '44px',
          iconSize: '16px',
        };
    }
  };

  const sizeConfig = getSizeConfig();

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...sizeConfig,
    width: fullWidth ? '100%' : 'auto',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
    },
    secondary: {
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent)',
      border: '1px solid var(--accent)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
    },
  };

  const finalStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <BaseButton
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      style={finalStyles}
      aria-disabled={disabled}
      aria-label={typeof children === 'string' ? children : 'Button'}
    >
      {icon && React.cloneElement(icon as React.ReactElement, {
        style: {
          width: sizeConfig.iconSize,
          height: sizeConfig.iconSize,
        },
      })}
      {children}
    </BaseButton>
  );
};