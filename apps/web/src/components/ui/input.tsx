import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'ghost';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, variant = 'default', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const variantStyles = {
      default: 'bg-[var(--input-bg)] border border-[var(--input-border)]',
      filled: 'bg-[var(--bg-secondary)] border border-transparent',
      ghost: 'bg-transparent border-b border-[var(--border-primary)] rounded-none',
    };

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] transition-colors duration-200"
            style={{ color: isFocused ? 'var(--color-primary-500)' : undefined }}
          >
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'w-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-200',
            variantStyles[variant],
            'focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20',
            'hover:border-[var(--border-focus)]',
            error
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
              : '',
            leftIcon ? 'pl-11' : 'pl-4',
            rightIcon ? 'pr-11' : 'pr-4',
            variant !== 'ghost' ? 'rounded-[var(--radius-lg)]' : '',
            'py-3',
            className,
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] transition-colors duration-200">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
