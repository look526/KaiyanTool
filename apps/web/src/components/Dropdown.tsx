import { useState, useRef, useEffect } from 'react'

export interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  onClick?: () => void
}

interface DropdownProps {
  trigger: React.ReactNode
  options: DropdownOption[]
  align?: 'left' | 'right'
  width?: string
  disabled?: boolean
}

export function Dropdown({ trigger, options, align = 'left', width = 'w-48', disabled }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignClasses = {
    left: 'left-0',
    right: 'right-0'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 ${width} ${alignClasses[align]}
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-xl
            animate-scale-in
          `}
          role="menu"
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (!option.disabled) {
                    option.onClick?.()
                    setIsOpen(false)
                  }
                }}
                disabled={option.disabled}
                className={`
                  w-full flex items-center gap-2 px-3 py-2
                  text-sm font-medium
                  ${option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer hover:translate-x-1'
                  }
                  transition-all
                `}
                role="menuitem"
              >
                {option.icon && <div className="w-4 h-4 flex-shrink-0">{option.icon}</div>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
