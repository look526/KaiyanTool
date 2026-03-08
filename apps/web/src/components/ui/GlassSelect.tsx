import React, { useState, useRef, useEffect, forwardRef } from 'react';

export interface GlassSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface GlassSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: GlassSelectOption[];
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ 
    options,
    size = 'md',
    error = false,
    helperText,
    placeholder,
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

    const baseStyles = {
      width: '100%',
      appearance: 'none',
      outline: 'none',
      transition: 'all var(--transition-base)',
      color: 'var(--text-primary)',
      caretColor: 'var(--accent)',
      backgroundColor: 'var(--bg-input)',
      border: `1px solid ${error ? 'var(--gradient-danger)' : isFocused ? 'var(--border-hover)' : 'var(--border-primary)'}`,
      backdropFilter: 'blur(20px)',
      boxShadow: isFocused ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none',
      cursor: 'pointer',
      ...sizeStyles[size],
      ...style,
    };

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div style={{ width: '100%' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <select
            ref={ref}
            style={baseStyles as React.CSSProperties}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {placeholder && (
              <option value="" disabled style={{ color: 'var(--text-muted)' }}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div style={{
            position: 'absolute',
            right: size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: isFocused ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all var(--transition-base)',
          }}>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: isFocused ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <path 
                d="M2 4L6 8L10 4" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
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

GlassSelect.displayName = 'GlassSelect';
