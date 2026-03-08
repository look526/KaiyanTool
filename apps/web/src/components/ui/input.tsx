import * as React from 'react';
import { cn } from '../../design-system';

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
      default: 'bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700',
      filled: 'bg-gray-100 dark:bg-gray-900 border border-transparent',
      ghost: 'bg-transparent border-b border-gray-300 dark:border-gray-700 rounded-none',
    };

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-colors duration-200"
          >
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'w-full text-sm text-primary-900 dark:text-primary-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none transition-all duration-200',
            variantStyles[variant],
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            'hover:border-gray-400 dark:hover:border-gray-600',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : '',
            leftIcon ? 'pl-11' : 'pl-4',
            rightIcon ? 'pr-11' : 'pr-4',
            variant !== 'ghost' ? 'rounded-md' : '',
            'py-3',
            className,
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
