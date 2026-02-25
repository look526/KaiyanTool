import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption<T> {
  value: T;
  label: string;
  color?: string;
  icon?: React.ElementType;
}

export interface DropdownMenuProps<T> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export default function DropdownMenu<T>({
  options,
  value,
  onChange,
  placeholder = '请选择',
  className = '',
  size = 'medium',
  disabled = false,
}: DropdownMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const SelectedIcon = selectedOption?.icon;

  const sizeConfig = {
    small: {
      button: 'h-9 px-3 text-sm',
      option: 'px-3 py-2 text-sm',
    },
    medium: {
      button: 'h-10 px-4 text-base',
      option: 'px-4 py-2.5 text-base',
    },
    large: {
      button: 'h-11 px-5 text-base',
      option: 'px-5 py-3 text-base',
    },
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: size === 'small' ? '8px 12px' : size === 'medium' ? '12px 16px' : '14px 20px',
          borderRadius: '16px',
          border: `1px solid ${disabled ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.15)'}`,
          background: disabled
            ? 'rgba(139, 92, 246, 0.05)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)',
          color: disabled ? 'var(--text-tertiary)' : selectedOption?.color || 'var(--text-primary)',
          fontSize: size === 'small' ? '13px' : size === 'medium' ? '14px' : '15px',
          fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {SelectedIcon && <SelectedIcon style={{ width: '16px', height: '16px' }} />}
          <span>{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown
          style={{
            width: '16px',
            height: '16px',
            color: disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            width: '100%',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {options.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = value === option.value;
            return (
              <button
                key={String(option.value)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: size === 'small' ? '10px 12px' : size === 'medium' ? '14px 16px' : '16px 20px',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                    : 'transparent',
                  border: 'none',
                  color: option.color || 'var(--text-primary)',
                  fontSize: size === 'small' ? '13px' : size === 'medium' ? '14px' : '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                {OptionIcon && <OptionIcon style={{ width: '16px', height: '16px' }} />}
                <span>{option.label}</span>
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '12px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                      boxShadow: '0 0 4px rgba(139, 92, 246, 0.5)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
