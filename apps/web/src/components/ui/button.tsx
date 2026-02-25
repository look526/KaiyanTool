import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-[0_8px_25px_rgba(102,126,234,0.5)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
        primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-[0_8px_25px_rgba(102,126,234,0.5)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
        secondary: 'bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0',
        destructive: 'bg-gradient-to-r from-[#ff0844] to-[#ffb199] text-white hover:shadow-[0_8px_25px_rgba(255,8,68,0.5)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
        outline: 'bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'text-white hover:bg-[rgba(255,255,255,0.08)] hover:text-white',
        link: 'text-white underline-offset-4 hover:underline hover:text-[#667eea]',
        glass: 'bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] backdrop-blur-xl hover:bg-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.2)] hover:-translate-y-0.5 active:translate-y-0',
        glow: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-[0_0_40px_rgba(102,126,234,0.6)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
      },
      size: {
        default: 'h-12 px-7 py-3 text-sm rounded-2xl',
        sm: 'h-10 px-5 py-2.5 text-xs rounded-xl',
        lg: 'h-14 px-9 py-3.5 text-base rounded-3xl',
        xl: 'h-14 px-10 py-4 text-lg rounded-3xl',
        icon: 'h-12 w-12 rounded-2xl',
      },
    },
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
  loading?: boolean;
  shimmer?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, loading, disabled, shimmer = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
        style={{
          boxShadow: variant === 'default' || variant === 'glow' 
            ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
            : undefined,
        }}
      >
        {shimmer && (
          <span
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
        )}
        {loading ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : icon && <span className="mr-2">{icon}</span>}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
