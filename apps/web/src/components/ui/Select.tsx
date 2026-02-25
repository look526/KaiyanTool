import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface SelectGroup {
  label: string;
  options: Option[];
}

export interface SelectProps {
  options: (Option | SelectGroup)[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    height: '36px',
    fontSize: '13px',
    padding: '6px 12px',
    itemHeight: '36px',
  },
  medium: {
    height: '44px',
    fontSize: '14px',
    padding: '10px 14px',
    itemHeight: '44px',
  },
  large: {
    height: '52px',
    fontSize: '15px',
    padding: '12px 18px',
    itemHeight: '52px',
  },
};

export function Select({
  options,
  value,
  onChange,
  placeholder = '请选择',
  label,
  error,
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'medium',
  className,
}: SelectProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getDisplayValues = useCallback(() => {
    if (multiple && Array.isArray(value)) {
      const selectedOptions = options.flatMap(opt => 
        'options' in opt ? opt.options : opt
      ).filter(opt => value.includes(opt.value));
      if (selectedOptions.length === 0) return placeholder;
      return selectedOptions.map(opt => opt.label).join(', ');
    }
    
    const selectedOption = options.flatMap(opt => 
      'options' in opt ? opt.options : opt
    ).find(opt => opt.value === value);
    
    return selectedOption?.label || placeholder;
  }, [options, value, placeholder, multiple]);

  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (disabled) return;

    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(multiple ? [] : '');
    setSearchValue('');
  };

  const filteredOptions = options.map(group => {
    if ('options' in group) {
      return {
        ...group,
        options: group.options.filter(opt =>
          opt.label.toLowerCase().includes(searchValue.toLowerCase())
        ),
      };
    }
    return group;
  }).filter(group => {
    if ('options' in group) {
      return group.options.length > 0;
    }
    return group.label.toLowerCase().includes(searchValue.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={className} ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
          letterSpacing: '-0.01em',
        }}>
          {label}
        </label>
      )}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (searchable && !isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
        style={{
          height: sizeConfig.height,
          padding: sizeConfig.padding,
          fontSize: sizeConfig.fontSize,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: error ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: disabled ? 0.6 : 1,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = error ? 'var(--error)' : 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !error) {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }
        }}
      >
        <span style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: getDisplayValues() === placeholder ? 'var(--text-tertiary)' : 'var(--text-primary)',
        }}>
          {getDisplayValues()}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {clearable && value && !disabled && (
            <div
              onClick={handleClear}
              style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <X style={{ width: '12px', height: '12px' }} />
            </div>
          )}
          <ChevronDown
            style={{
              width: '20px',
              height: '20px',
              color: 'var(--text-tertiary)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>
      {error && (
        <span style={{
          fontSize: '13px',
          color: 'var(--error)',
          marginTop: '6px',
          display: 'block',
        }}>
          {error}
        </span>
      )}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            maxHeight: '280px',
            overflow: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            zIndex: 1000,
            animation: 'dropdown-enter 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {searchable && (
            <div style={{
              padding: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'sticky',
              top: 0,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <Search style={{ width: '18px', height: '18px', color: 'var(--text-tertiary)' }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="搜索..."
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          )}
          {filteredOptions.map((group, groupIndex) => (
            <div key={groupIndex}>
              {'options' in group && (
                <>
                  {groupIndex > 0 && (
                    <div style={{
                      height: '1px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      margin: '6px 0',
                    }} />
                  )}
                  <div style={{
                    padding: '10px 14px 6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {group.label}
                  </div>
                </>
              )}
              {('options' in group ? group.options : [group]).map((option) => {
                const optionValue = 'value' in option ? option.value : option;
                const optionLabel = 'label' in option ? option.label : option;
                const optionDisabled = 'disabled' in option ? option.disabled : false;
                const optionIcon = 'icon' in option ? option.icon : undefined;
                const selected = isSelected(optionValue);

                return (
                  <div
                    key={optionValue}
                    onClick={() => !optionDisabled && handleSelect(optionValue)}
                    style={{
                      height: sizeConfig.itemHeight,
                      padding: `0 ${sizeConfig.padding}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: optionDisabled ? 'not-allowed' : 'pointer',
                      color: optionDisabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      backgroundColor: selected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!optionDisabled && !selected) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {optionIcon && (
                      <span style={{ width: '20px', height: '20px' }}>{optionIcon}</span>
                    )}
                    <span style={{ flex: 1 }}>{optionLabel}</span>
                    {multiple && selected && (
                      <Check style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                    )}
                    {!multiple && selected && (
                      <Check style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '14px',
            }}>
              无匹配选项
            </div>
          )}
        </div>
      )}
      <style>{`
        @keyframes dropdown-enter {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
