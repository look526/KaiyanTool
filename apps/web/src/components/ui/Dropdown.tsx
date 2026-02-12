import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: DropdownItem[];
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Dropdown({
  trigger,
  items,
  placement = 'bottom-start',
  className,
  onOpenChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setOpenSubmenus({});
      setActiveIndex(-1);
      onOpenChange?.(false);
    }, 150);
  };

  const handleSubmenuEnter = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: true }));
  };

  const handleSubmenuLeave = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: false }));
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
    }
    if (!item.children || item.children.length === 0) {
      setIsOpen(false);
      setOpenSubmenus({});
      setActiveIndex(-1);
      onOpenChange?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setOpenSubmenus({});
        setActiveIndex(-1);
        onOpenChange?.(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex >= items.length ? 0 : nextIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => {
          const prevIndex = prev - 1;
          return prevIndex < 0 ? items.length - 1 : prevIndex;
        });
        break;
      case 'Enter':
      case ' ': 
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          const item = items[activeIndex];
          handleItemClick(item);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setOpenSubmenus({});
        setActiveIndex(-1);
        onOpenChange?.(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setOpenSubmenus({});
        setActiveIndex(-1);
        onOpenChange?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  useEffect(() => {
    if (isOpen && activeIndex >= 0 && activeIndex < itemRefs.current.length) {
      const activeItem = itemRefs.current[activeIndex];
      if (activeItem) {
        activeItem.focus();
      }
    }
  }, [isOpen, activeIndex]);

  const renderMenuItems = (
    menuItems: DropdownItem[],
    level: number = 0
  ): ReactNode => {
    return menuItems.map((item, index) => {
      const hasChildren = item.children && item.children.length > 0;
      const isDisabled = item.disabled;
      const isDanger = item.danger;
      const isActive = level === 0 && index === activeIndex;

      return (
        <div
          key={item.key}
          ref={el => itemRefs.current[level === 0 ? index : -1] = el}
          onClick={() => handleItemClick(item)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: level === 0 ? '10px 16px' : '8px 12px',
            fontSize: '14px',
            color: isDisabled
              ? 'var(--text-tertiary)'
              : isDanger
              ? 'var(--error)'
              : 'var(--text-primary)',
            backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s ease',
            outline: 'none',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              if (hasChildren) {
                handleSubmenuEnter(item.key);
              }
              if (level === 0) {
                setActiveIndex(index);
              }
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            if (hasChildren) {
              handleSubmenuLeave(item.key);
            }
          }}
          onKeyDown={handleKeyDown}
          tabIndex={level === 0 ? 0 : -1}
          role={level === 0 ? 'menuitem' : 'menuitem'}
          aria-disabled={isDisabled}
          aria-haspopup={hasChildren}
          aria-expanded={hasChildren && openSubmenus[item.key]}
        >
          {item.icon && (
            <span style={{ width: '16px', height: '16px', flexShrink: 0 }}>
              {item.icon}
            </span>
          )}
          <span style={{ flex: 1 }}>{item.label}</span>
          {hasChildren && level === 0 && (
            <ChevronRight
              style={{
                width: '14px',
                height: '14px',
                color: 'var(--text-tertiary)',
              }}
            />
          )}
          {hasChildren && openSubmenus[item.key] && (
            <div
              style={{
                position: 'absolute',
                left: '100%',
                top: 0,
                marginLeft: '4px',
                minWidth: '160px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                zIndex: 1000 + level,
                animation: 'dropdown-enter 0.15s ease-out',
                padding: '4px 0',
              }}
            >
              {renderMenuItems(item.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
            onOpenChange?.(!isOpen);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
            setActiveIndex(0);
            onOpenChange?.(true);
          }
        }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            [placement.includes('bottom') ? 'top' : 'bottom']: 'calc(100% + 8px)',
            [placement.includes('start') ? 'left' : 'right']: placement.includes('end') ? undefined : 0,
            [placement.includes('end') ? 'right' : 'left']: placement.includes('end') ? 0 : undefined,
            minWidth: '180px',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'dropdown-enter 0.15s ease-out',
            padding: '4px 0',
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {renderMenuItems(items)}
        </div>
      )}
      <style>{`
        @keyframes dropdown-enter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
