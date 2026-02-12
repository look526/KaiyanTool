interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  striped?: boolean
  animated?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  striped = false,
  animated = false
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700 dark:text-gray-300">进度</span>
          <span className="font-medium text-gray-900 dark:text-white">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700
          rounded-full overflow-hidden
          ${sizeClasses[size]}
        `}
      >
        <div
          className={`
            ${colorClasses[color]}
            ${striped ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]' : ''}
            ${animated ? 'animate-[progress-bar-stripes_1s_linear_infinite]' : ''}
            h-full transition-all duration-300 ease-out
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
