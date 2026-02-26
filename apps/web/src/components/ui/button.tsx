import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] active:bg-[var(--color-primary-700)] active:scale-[0.98]',
        primary: 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] active:bg-[var(--color-primary-700)] active:scale-[0.98]',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] active:scale-[0.98]',
        destructive: 'bg-[var(--color-error)] text-white hover:opacity-90 active:scale-[0.98]',
        success: 'bg-[var(--color-success)] text-white hover:opacity-90 active:scale-[0.98]',
        outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] active:scale-[0.98]',
        ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] active:scale-[0.98]',
        link: 'text-[var(--color-primary-500)] underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-purple)] text-white hover:opacity-90 active:scale-[0.98]',
        glass: 'bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] backdrop-blur-xl hover:bg-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.2)] hover:-translate-y-0.5 active:translate-y-0',
        glow: 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-purple)] text-white hover:shadow-[0_0_40px_rgba(102,126,234,0.6)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
        accent: {
          purple: 'bg-[var(--color-accent-purple)] text-white hover:opacity-90 active:scale-[0.98]',
          pink: 'bg-[var(--color-accent-pink)] text-white hover:opacity-90 active:scale-[0.98]',
          orange: 'bg-[var(--color-accent-orange)] text-white hover:opacity-90 active:scale-[0.98]',
          green: 'bg-[var(--color-accent-green)] text-white hover:opacity-90 active:scale-[0.98]',
          teal: 'bg-[var(--color-accent-teal)] text-white hover:opacity-90 active:scale-[0.98]',
        },
      },
      size: {
        default: 'h-11 px-6 py-2.5 text-sm rounded-[var(--radius-lg)]',
        sm: 'h-9 px-4 py-2 text-xs rounded-[var(--radius-md)]',
        md: 'h-10 px-5 py-2.5 text-sm rounded-[var(--radius-lg)]',
        lg: 'h-12 px-8 py-3 text-base rounded-[var(--radius-xl)]',
        xl: 'h-14 px-10 py-4 text-lg rounded-[var(--radius-xl)]',
        icon: 'h-10 w-10 rounded-[var(--radius-lg)]',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        size: 'lg',
        className: 'shadow-[var(--glow-blue)]',
      },
      {
        variant: 'gradient',
        size: 'lg',
        className: 'shadow-[var(--glow-purple)]',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  shimmer?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, iconPosition = 'left', children, loading, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg 
            className="animate-spin h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="3"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="mr-1.5">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="ml-1.5">{icon}</span>}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
