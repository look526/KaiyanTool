import { useState } from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away'
  className?: string
  onClick?: () => void
}

export function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  className = '',
  onClick
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  }

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500'
  }

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || ''

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]} ${className}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
      `}
      onClick={onClick}
      role="img"
      aria-label={alt}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold"
        >
          {initials}
        </div>
      )}

      {status && (
        <div
          className={`
            absolute bottom-0 right-0 w-2.5 h-2.5
            ${size === 'sm' ? 'w-1.5 h-1.5' : size === 'xl' ? 'w-3 h-3' : 'w-2.5 h-2.5'}
            ${statusColors[status]}
            border-2 border-white dark:border-gray-900 rounded-full
          `}
        />
      )}
    </div>
  )
}
