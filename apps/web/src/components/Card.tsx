import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  gradient?: boolean
  glass?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, gradient = false, glass = false, children, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-xl p-6 transition-all'

    const backgroundStyles = gradient
      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
      : glass
      ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg'
      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md'

    const hoverStyles = hover
      ? 'hover:shadow-xl hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer'
      : ''

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${backgroundStyles} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
