interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'success' | 'warning' | 'error'
  className?: string
}

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-3',
    lg: 'w-8 h-8 border-4',
    xl: 'w-12 h-12 border-4'
  }

  const colorClasses = {
    primary: 'border-indigo-500 border-t-transparent',
    success: 'border-emerald-500 border-t-transparent',
    warning: 'border-amber-500 border-t-transparent',
    error: 'border-red-500 border-t-transparent'
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} ${colorClasses[color]}
        ${className}
        rounded-full animate-spin
      `}
      role="status"
      aria-label="Loading"
    />
  )
}
