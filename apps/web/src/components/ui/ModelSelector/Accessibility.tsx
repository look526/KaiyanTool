import React, { useEffect, useRef, useCallback, useState } from 'react'

export interface AccessibilityOptions {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'normal' | 'large' | 'extra-large'
  screenReaderMode: boolean
}

export interface AccessibilityContextType {
  options: AccessibilityOptions
  setOptions: (options: Partial<AccessibilityOptions>) => void
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

const defaultOptions: AccessibilityOptions = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'normal',
  screenReaderMode: false,
}

export function useAccessibility() {
  const [options, setOptionsState] = useState<AccessibilityOptions>(() => {
    const stored = localStorage.getItem('accessibility-options')
    if (stored) {
      try {
        return { ...defaultOptions, ...JSON.parse(stored) }
      } catch {
        return defaultOptions
      }
    }
    return defaultOptions
  })

  const announcementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    localStorage.setItem('accessibility-options', JSON.stringify(options))

    const root = document.documentElement
    root.classList.toggle('high-contrast', options.highContrast)
    root.classList.toggle('reduced-motion', options.reducedMotion)
    root.classList.toggle('screen-reader-mode', options.screenReaderMode)
    
    root.setAttribute('data-font-size', options.fontSize)
  }, [options])

  const setOptions = useCallback((newOptions: Partial<AccessibilityOptions>) => {
    setOptionsState(prev => ({ ...prev, ...newOptions }))
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      const announcer = document.createElement('div')
      announcer.setAttribute('role', 'status')
      announcer.setAttribute('aria-live', priority)
      announcer.setAttribute('aria-atomic', 'true')
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `
      document.body.appendChild(announcer)
      announcementRef.current = announcer
    }

    announcementRef.current.setAttribute('aria-live', priority)
    announcementRef.current.textContent = ''
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message
      }
    }, 100)
  }, [])

  return { options, setOptions, announce }
}

export function useKeyboardNavigation({
  items,
  onSelect,
  onEscape,
  loop = true,
}: {
  items: string[]
  onSelect: (id: string) => void
  onEscape?: () => void
  loop?: boolean
}) {
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => {
          const next = prev + 1
          if (next >= items.length) {
            return loop ? 0 : prev
          }
          return next
        })
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => {
          const next = prev - 1
          if (next < 0) {
            return loop ? items.length - 1 : 0
          }
          return next
        })
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelect(items[focusedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        event.preventDefault()
        setFocusedIndex(items.length - 1)
        break
    }
  }, [items, focusedIndex, onSelect, onEscape, loop])

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    focusedId: focusedIndex >= 0 ? items[focusedIndex] : null,
  }
}

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    previousFocusRef.current = document.activeElement as HTMLElement

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (firstElement) {
      firstElement.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [isActive, containerRef])
}

export function useAnnouncement() {
  const { announce } = useAccessibility()
  return announce
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { options, setOptions, announce } = useAccessibility()

  return (
    <AccessibilityContext.Provider value={{ options, setOptions, announce }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

import { createContext, useContext } from 'react'

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider')
  }
  return context
}

export function SkipLink({ targetId, label }: { targetId: string; label: string }) {
  return (
    <a
      href={`#${targetId}`}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '0',
        padding: '8px 16px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        textDecoration: 'none',
        zIndex: 10000,
        borderRadius: '4px',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '8px'
        e.currentTarget.style.top = '8px'
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px'
      }}
    >
      {label}
    </a>
  )
}

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </span>
  )
}

export function LiveRegion({ 
  message, 
  priority = 'polite' 
}: { 
  message: string
  priority?: 'polite' | 'assertive' 
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {message}
    </div>
  )
}

export function FocusIndicator({ 
  children, 
  isActive 
}: { 
  children: React.ReactNode
  isActive?: boolean 
}) {
  return (
    <div
      style={{
        outline: isActive ? '2px solid var(--accent)' : 'none',
        outlineOffset: '2px',
        borderRadius: '4px',
      }}
    >
      {children}
    </div>
  )
}

export function getA11yProps(type: 'button' | 'link' | 'input', props: Record<string, any> = {}) {
  const baseProps = {
    tabIndex: props.disabled ? -1 : 0,
    role: type === 'button' ? 'button' : undefined,
    'aria-disabled': props.disabled ? 'true' : undefined,
  }

  switch (type) {
    case 'button':
      return {
        ...baseProps,
        role: 'button',
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            props.onClick?.(e)
          }
        },
      }
    case 'input':
      return {
        ...baseProps,
        'aria-label': props.label,
        'aria-describedby': props.description ? `${props.id}-description` : undefined,
        'aria-invalid': props.error ? 'true' : undefined,
        'aria-required': props.required ? 'true' : undefined,
      }
    default:
      return baseProps
  }
}
