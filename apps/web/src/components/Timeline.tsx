import { useState } from 'react'

export interface TimelineItem {
  id: string
  date: string
  title: string
  description?: string
  icon?: React.ReactNode
  status?: 'default' | 'success' | 'warning' | 'error'
}

interface TimelineProps {
  items: TimelineItem[]
  align?: 'left' | 'right' | 'center'
  showDate?: boolean
}

export function Timeline({ items, align = 'left', showDate = true }: TimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const alignClasses = {
    left: 'items-start',
    right: 'items-end',
    center: 'items-center'
  }

  const statusColors = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  }

  return (
    <div className={`flex flex-col gap-4 ${alignClasses[align]}`}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${statusColors[item.status || 'default']}
                flex-shrink-0
              `}
            >
              {item.icon || (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[2rem]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {showDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.date}</p>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>

            {item.description && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {expandedItems.has(item.id) ? '收起' : '展开详情'}
              </button>
            )}

            {item.description && expandedItems.has(item.id) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
