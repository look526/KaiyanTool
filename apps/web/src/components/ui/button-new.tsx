import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../design-system';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'icon' | 'icon-sm' | 'icon-lg' | 'icon-xs';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const sizeClasses: Record<string, string> = {
  xs: 'h-8 px-3.5 text-xs gap-1.5',
  sm: 'h-9 px-4 text-sm gap-2',
  md: 'h-11 px-5 text-sm gap-2.5',
  lg: 'h-12 px-6 text-base gap-2.5',
  xl: 'h-14 px-8 text-base gap-3',
  '2xl': 'h-16 px-10 text-lg gap-3',
  icon: 'h-11 w-11 p-0',
  'icon-sm': 'h-9 w-9 p-0',
  'icon-lg': 'h-12 w-12 p-0',
  'icon-xs': 'h-8 w-8 p-0',
};

const variantClasses: Record<string, string> = {
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 border-none',
  secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 shadow-sm',
  outline: 'bg-transparent text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 shadow-none',
  ghost: 'bg-transparent text-gray-600 dark:text-gray-400 border-none shadow-none',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40 border-none',
  success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/40 border-none',
  link: 'bg-transparent text-blue-500 border-none shadow-none underline underline-offset-4',
};

const hoverClasses: Record<string, string> = {
  primary: 'from-blue-600 to-blue-700 shadow-xl shadow-blue-500/50 -translate-y-0.5',
  secondary: 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 shadow-md -translate-y-0.5',
  outline: 'bg-gray-50 dark:bg-gray-900 border-blue-500 text-blue-500 -translate-y-0.5',
  ghost: 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100',
  danger: 'from-red-600 to-red-700 shadow-xl shadow-red-500/50 -translate-y-0.5',
  success: 'from-green-600 to-green-700 shadow-xl shadow-green-500/50 -translate-y-0.5',
  link: 'underline',
};

const activeClasses: Record<string, string> = {
  primary: 'from-blue-700 to-blue-800 shadow-md shadow-blue-500/30 translate-y-0 scale-98',
  secondary: 'bg-gray-300 dark:bg-gray-600 shadow-none translate-y-0 scale-98',
  outline: 'bg-gray-100 dark:bg-gray-800 translate-y-0 scale-98',
  ghost: 'bg-gray-200 dark:bg-gray-700 scale-98',
  danger: 'from-red-700 to-red-800 shadow-md shadow-red-500/30 translate-y-0 scale-98',
  success: 'from-green-700 to-green-800 shadow-md shadow-green-500/30 translate-y-0 scale-98',
  link: '',
};

const radiusClasses: Record<string, string> = {
  xs: 'rounded-md',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-4xl',
  icon: 'rounded-xl',
  'icon-sm': 'rounded-lg',
  'icon-lg': 'rounded-2xl',
  'icon-xs': 'rounded-md',
};

const LoadingSpinner = ({ size }: { size: number }) => (
  <svg
    className="animate-spin flex-shrink-0"
    style={{ width: size, height: size }}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="10"
      opacity="0.25"
    />
    <path
      d="M12 2C6.477 2 2 6.477 2 12"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      asChild = false,
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);
    
    const Comp = asChild ? Slot : 'button';
    const isIconOnly = size.toString().startsWith('icon');
    
    const baseClasses = cn(
      'inline-flex items-center justify-center font-semibold font-sans tracking-tight user-select-none relative overflow-hidden outline-none transition-all duration-200 whitespace-nowrap',
      sizeClasses[size],
      variantClasses[variant],
      radiusClasses[size],
      fullWidth && 'w-full',
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      isHovered && !disabled && !loading && hoverClasses[variant],
      isActive && !disabled && !loading && activeClasses[variant],
      className
    );

    const ariaLabel = props['aria-label'] || (isIconOnly && typeof children === 'string' ? children : undefined);

    return (
      <Comp
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        aria-label={ariaLabel}
        onMouseEnter={() => !disabled && !loading && setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => !disabled && !loading && setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        {...props}
      >
        {loading && <LoadingSpinner size={size === 'xs' || size === 'icon-xs' ? 14 : size === 'sm' || size === 'icon-sm' ? 16 : size === 'md' || size === 'icon' ? 18 : size === 'lg' || size === 'icon-lg' ? 22 : 20} />}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex items-center flex-shrink-0">
            {icon}
          </span>
        )}
        
        {!isIconOnly && children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex items-center flex-shrink-0">
            {icon}
          </span>
        )}

        {variant === 'primary' && !disabled && !loading && (
          <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded-inherit" />
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    attached?: boolean;
  }
>(({ orientation = 'horizontal', attached = false, children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex',
      orientation === 'vertical' ? 'flex-col' : 'flex-row',
      attached ? 'gap-0' : 'gap-3',
      className
    )}
    role="group"
    {...props}
  >
    {children}
  </div>
));

ButtonGroup.displayName = 'ButtonGroup';

export { Button, ButtonGroup };
