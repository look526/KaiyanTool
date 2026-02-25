import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
  asChild?: boolean;
}

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 
          'bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] text-white ' +
          'shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-102 active:translate-y-0 active:scale-98 active:shadow-md ' +
          'rounded-[var(--radius-lg)]',
        secondary: 
          'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] ' +
          'hover:border-[var(--border-accent)] hover:bg-[var(--bg-hover)] hover:-translate-y-0.5 ' +
          'rounded-[var(--radius-lg)] shadow-md',
        outline: 
          'border-2 border-[var(--border-primary)] bg-transparent text-[var(--text-primary)] ' +
          'hover:border-[var(--border-accent)] hover:bg-[var(--color-accent)]/10 hover:text-white hover:-translate-y-0.5 ' +
          'rounded-[var(--radius-lg)]',
        ghost: 
          'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] ' +
          'hover:-translate-y-0.5 rounded-[var(--radius-lg)]',
        danger: 
          'bg-gradient-to-r from-[var(--color-error)] to-[var(--color-error-light)] text-white ' +
          'shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-102 active:translate-y-0 active:scale-98 active:shadow-md ' +
          'rounded-[var(--radius-lg)]',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm rounded-[var(--radius-md)]',
        md: 'h-10 px-5 text-sm rounded-[var(--radius-md)]',
        lg: 'h-11 px-6 text-base rounded-[var(--radius-lg)]',
        xl: 'h-14 px-8 text-base rounded-[var(--radius-xl)]',
        icon: 'h-10 w-10 rounded-[var(--radius-md)]',
        'icon-sm': 'h-8 w-8 rounded-[var(--radius-sm)]',
        'icon-lg': 'h-11 w-11 rounded-[var(--radius-md)]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      glow: {
        true: 'shadow-[var(--shadow-xl)] hover:shadow-[0_0_20px_rgba(99_102_241_0_3)]',
        false: '',
      },
    },
  },
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, icon, iconPosition = 'left', loading = false, fullWidth = false, glow = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const iconSize = size === 'sm' || size === 'icon-sm' ? 14 : size === 'lg' || size === 'icon-lg' ? 18 : 16;
    
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, glow }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            style={{ width: iconSize, height: iconSize, marginRight: children ? 6 : 0 }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 12 0 5.373 0 12 12h4z"
            />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span 
            className={children ? 'mr-2' : ''} 
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, { 
              style: { width: iconSize, height: iconSize, ...(icon as React.ReactElement<{ style?: React.CSSProperties }>).props.style } 
            }) : icon}
          </span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span 
            className={children ? 'ml-2' : ''} 
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, { 
              style: { width: iconSize, height: iconSize, ...(icon as React.ReactElement<{ style?: React.CSSProperties }>).props.style } 
            }) : icon}
          </span>
        )}
      </Comp>
    );
  },
);

Button.displayName = 'Button';
export { Button, buttonVariants };
