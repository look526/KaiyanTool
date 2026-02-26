import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'icon' | 'icon-sm' | 'icon-lg' | 'icon-xs';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const sizeConfig: Record<string, { height: number; padding?: number; fontSize: number; iconSize: number; radius: number; gap?: number; width?: number }> = {
  xs: { height: 32, padding: 14, fontSize: 12, iconSize: 14, radius: 10, gap: 6 },
  sm: { height: 36, padding: 16, fontSize: 14, iconSize: 16, radius: 12, gap: 8 },
  md: { height: 44, padding: 20, fontSize: 14, iconSize: 18, radius: 14, gap: 10 },
  lg: { height: 48, padding: 24, fontSize: 16, iconSize: 18, radius: 16, gap: 10 },
  xl: { height: 56, padding: 32, fontSize: 16, iconSize: 20, radius: 20, gap: 12 },
  '2xl': { height: 64, padding: 40, fontSize: 18, iconSize: 22, radius: 24, gap: 12 },
  icon: { height: 44, width: 44, fontSize: 14, iconSize: 20, radius: 14 },
  'icon-sm': { height: 36, width: 36, fontSize: 12, iconSize: 16, radius: 12 },
  'icon-lg': { height: 48, width: 48, fontSize: 16, iconSize: 22, radius: 16 },
  'icon-xs': { height: 32, width: 32, fontSize: 12, iconSize: 14, radius: 10 },
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 4px 14px rgba(0, 122, 255, 0.4)',
  },
  secondary: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '2px solid var(--border-primary)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '2px solid var(--border-primary)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #FF3B30 0%, #E04538 100%)',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 4px 14px rgba(255, 59, 48, 0.4)',
  },
  success: {
    background: 'linear-gradient(135deg, #34C759 0%, #2DB85A 100%)',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 4px 14px rgba(52, 199, 89, 0.4)',
  },
  link: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: 'none',
    boxShadow: 'none',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
  },
};

const hoverStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #0056CC 0%, #0044A3 100%)',
    boxShadow: '0 6px 20px rgba(0, 122, 255, 0.5)',
    transform: 'translateY(-1px)',
  },
  secondary: {
    background: 'var(--bg-hover)',
    borderColor: 'var(--border-secondary)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-1px)',
  },
  outline: {
    background: 'var(--bg-hover)',
    borderColor: 'var(--color-primary)',
    color: 'var(--color-primary)',
    transform: 'translateY(-1px)',
  },
  ghost: {
    background: 'var(--bg-hover)',
    color: 'var(--text-primary)',
  },
  danger: {
    background: 'linear-gradient(135deg, #E04538 0%, #C42B22 100%)',
    boxShadow: '0 6px 20px rgba(255, 59, 48, 0.5)',
    transform: 'translateY(-1px)',
  },
  success: {
    background: 'linear-gradient(135deg, #2DB85A 0%, #248A3D 100%)',
    boxShadow: '0 6px 20px rgba(52, 199, 89, 0.5)',
    transform: 'translateY(-1px)',
  },
  link: {
    textDecoration: 'underline',
  },
};

const activeStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #0044A3 0%, #003380 100%)',
    boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
    transform: 'translateY(0) scale(0.98)',
  },
  secondary: {
    background: 'var(--bg-active)',
    boxShadow: 'none',
    transform: 'translateY(0) scale(0.98)',
  },
  outline: {
    background: 'var(--bg-active)',
    transform: 'translateY(0) scale(0.98)',
  },
  ghost: {
    background: 'var(--bg-active)',
    transform: 'scale(0.98)',
  },
  danger: {
    background: 'linear-gradient(135deg, #C42B22 0%, #A3231C 100%)',
    boxShadow: '0 2px 8px rgba(255, 59, 48, 0.3)',
    transform: 'translateY(0) scale(0.98)',
  },
  success: {
    background: 'linear-gradient(135deg, #248A3D 0%, #1E7A34 100%)',
    boxShadow: '0 2px 8px rgba(52, 199, 89, 0.3)',
    transform: 'translateY(0) scale(0.98)',
  },
  link: {},
};

const LoadingSpinner = ({ size, color }: { size: number; color: string }) => (
  <svg
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      animation: 'spin 1s linear infinite',
    }}
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
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);
    
    const Comp = asChild ? Slot : 'button';
    const config = sizeConfig[size] || sizeConfig.md;
    const isIconOnly = size.toString().startsWith('icon');
    
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: config.gap ? `${config.gap}px` : undefined,
      height: config.height,
      width: config.width,
      padding: isIconOnly ? 0 : (config.padding ? `0 ${config.padding}px` : 0),
      fontSize: `${config.fontSize}px`,
      fontWeight: 600,
      fontFamily: 'var(--font-family-sans)',
      letterSpacing: '-0.01em',
      borderRadius: `${config.radius}px`,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden',
      outline: 'none',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      whiteSpace: 'nowrap',
      ...variantStyles[variant],
      ...style,
    };

    const currentStateStyle = isActive
      ? activeStyles[variant]
      : isHovered
      ? hoverStyles[variant]
      : {};

    const mergedStyle: React.CSSProperties = {
      ...baseStyle,
      ...currentStateStyle,
    };

    const iconElement = React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, {
          style: {
            width: config.iconSize,
            height: config.iconSize,
            flexShrink: 0,
            ...((icon as React.ReactElement<{ style?: React.CSSProperties }>).props.style || {}),
          },
        })
      : icon;

    const ariaLabel = props['aria-label'] || (isIconOnly && typeof children === 'string' ? children : undefined);

    return (
      <Comp
        ref={ref}
        style={mergedStyle}
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
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 3px ${variant === 'danger' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(0, 122, 255, 0.3)'}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = mergedStyle.boxShadow as string;
        }}
        {...props}
      >
        {loading && <LoadingSpinner size={config.iconSize} color="currentColor" />}
        
        {!loading && icon && iconPosition === 'left' && (
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {iconElement}
          </span>
        )}
        
        {!isIconOnly && children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {iconElement}
          </span>
        )}

        {variant === 'primary' && !disabled && !loading && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
              borderRadius: 'inherit',
            }}
          />
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
>(({ orientation = 'horizontal', attached = false, children, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      display: 'inline-flex',
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      gap: attached ? 0 : '12px',
      ...style,
    }}
    role="group"
    {...props}
  >
    {children}
  </div>
));

ButtonGroup.displayName = 'ButtonGroup';

export { Button, ButtonGroup };
