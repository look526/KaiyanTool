import React, { useState, forwardRef } from 'react';

export interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'search' | 'transparent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: boolean;
  helperText?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ 
    variant = 'default',
    size = 'md',
    icon,
    iconPosition = 'left',
    error = false,
    helperText,
    style,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizeStyles = {
      sm: {
        height: '36px',
        padding: '8px 12px',
        fontSize: '14px',
        borderRadius: 'var(--radius-md)',
      },
      md: {
        height: '42px',
        padding: '10px 16px',
        fontSize: '14px',
        borderRadius: 'var(--radius-lg)',
      },
      lg: {
        height: '48px',
        padding: '12px 20px',
        fontSize: '16px',
        borderRadius: 'var(--radius-lg)',
      },
    };

    const variantStyles = {
      default: {
        background: 'var(--bg-input)',
        border: `1px solid ${error ? 'var(--gradient-danger)' : isFocused ? 'var(--border-hover)' : 'var(--border-primary)'}`,
        backdropFilter: 'blur(20px)',
      },
      search: {
        background: 'var(--bg-input)',
        border: `1px solid ${error ? 'var(--gradient-danger)' : isFocused ? 'var(--border-hover)' : 'var(--border-primary)'}`,
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-xl)',
      },
      transparent: {
        background: 'transparent',
        border: `1px solid ${error ? 'var(--gradient-danger)' : isFocused ? 'var(--border-hover)' : 'var(--border-primary)'}`,
        backdropFilter: 'none',
      },
    };

    const baseStyles = {
      width: '100%',
      outline: 'none',
      transition: 'all var(--transition-base)',
      color: 'var(--text-primary)',
      caretColor: 'var(--accent)',
      placeholder: {
        color: 'var(--text-placeholder)',
      },
      ...sizeStyles[size],
      ...variantStyles[variant],
      boxShadow: isFocused ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none',
      ...style,
    };

    const inputPaddingLeft = icon && iconPosition === 'left' 
      ? size === 'sm' ? '36px' : size === 'md' ? '40px' : '44px'
      : undefined;

    const inputPaddingRight = icon && iconPosition === 'right'
      ? size === 'sm' ? '36px' : size === 'md' ? '40px' : '44px'
      : undefined;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div style={{ width: '100%' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          {icon && iconPosition === 'left' && (
            <div style={{
              position: 'absolute',
              left: size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isFocused ? 'var(--accent)' : 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}>
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            style={{
              ...baseStyles,
              paddingLeft: inputPaddingLeft,
              paddingRight: inputPaddingRight,
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div style={{
              position: 'absolute',
              right: size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isFocused ? 'var(--accent)' : 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}>
              {icon}
            </div>
          )}
        </div>
        
        {helperText && (
          <div style={{
            marginTop: 'var(--spacing-2)',
            fontSize: '12px',
            color: error ? 'var(--gradient-danger)' : 'var(--text-muted)',
          }}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
