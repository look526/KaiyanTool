import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glass?: boolean;
  floating?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, glass = true, floating = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 transition-colors duration-300">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'w-full text-sm text-white placeholder:text-white/40 outline-none transition-all duration-300',
            glass
              ? 'bg-white/5 border border-white/10 backdrop-blur-xl'
              : 'bg-white/3 border border-white/8',
            'focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.2)]',
            'hover:border-white/15',
            error
              ? 'border-[#ff0844] focus:border-[#ff0844] focus:shadow-[0_0_0_3px_rgba(255,8,68,0.2)]'
              : '',
            leftIcon ? 'pl-12' : '',
            rightIcon ? 'pr-12' : '',
            floating ? 'pt-6 pb-2' : 'py-3.5',
            'rounded-2xl',
            className,
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={{
            borderRadius: '16px',
            padding: floating ? '22px 18px 10px' : '14px 18px',
          }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 transition-colors duration-300">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
