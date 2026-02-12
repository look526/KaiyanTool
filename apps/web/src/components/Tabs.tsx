import { useState } from 'react'

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
  badge?: number | string
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  onChange?: (tabId: string) => void
}

export function Tabs({ tabs, defaultTab, variant = 'default', size = 'md', onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5'
  }

  const variantClasses = {
    default: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: (isActive: boolean) =>
        `border-b-2 transition-colors duration-200 ${isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`,
      icon: 'w-4 h-4'
    },
    pills: {
      container: 'gap-2',
      tab: (isActive: boolean) =>
        `rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`,
      icon: 'w-4 h-4'
    },
    underline: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: (isActive: boolean) =>
        `relative transition-colors duration-200 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`,
      icon: 'w-4 h-4'
    }
  }

  const classes = variantClasses[variant]

  return (
    <div className="w-full">
      <div
        className={`flex ${variant === 'pills' ? 'flex-row' : 'items-start'} ${classes.container}`}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-disabled={tab.disabled}
            className={`
              flex items-center gap-2 font-medium
              ${sizeClasses[size]}
              ${classes.tab(activeTab === tab.id)}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            `}
          >
            {tab.icon && <div className={classes.icon}>{tab.icon}</div>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`
                  flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded-full
                  ${activeTab === tab.id ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'}
                `}
              >
                {tab.badge}
              </span>
            )}
            {variant === 'underline' && activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel">
        {activeTabData?.content}
      </div>
    </div>
  )
}
