import React from 'react';
import { cn } from '../../utilities';

// Button 变体类型
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link';

// Button 尺寸类型
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Button 属性接口
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否为全宽 */
  fullWidth?: boolean;
  /** 是否为圆角 */
  rounded?: boolean;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * Button 组件 - 用于用户操作
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   提交
 * </Button>
 * 
 * <Button variant="secondary" loading>
 *   加载中
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  rounded = false,
  children,
  className,
  disabled,
  ...props
}) => {
  // 变体样式
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm hover:shadow-md',
    accent: 'bg-accent-pink-500 text-white hover:bg-accent-pink-600 shadow-sm hover:shadow-md',
    outline: 'bg-transparent text-primary-500 border border-primary-400 hover:bg-primary-50',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50',
    link: 'bg-transparent text-primary-500 underline hover:text-primary-600',
  };

  // 尺寸样式
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  // 基础样式
  const baseStyles = [
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    loading && 'cursor-not-allowed',
    rounded && 'rounded-full',
    !rounded && 'rounded-md',
    fullWidth && 'w-full',
    variantStyles[variant],
    sizeStyles[size],
  ];

  return (
    <button
      className={cn(baseStyles, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;