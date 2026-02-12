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
    height: '32px',
    fontSize: '13px',
    padding: '4px 10px',
    itemHeight: '32px',
  },
  medium: {
    height: '40px',
    fontSize: '14px',
    padding: '8px 12px',
    itemHeight: '40px',
  },
  large: {
    height: '48px',
    fontSize: '15px',
    padding: '12px 16px',
    itemHeight: '48px',
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
          fontWeight: '500',
          color: 'var(--text-secondary)',
          marginBottom: '6px',
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
          backgroundColor: 'var(--bg-base)',
          border: error ? '1px solid var(--error)' : '1px solid var(--border-primary)',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !error) {
            e.currentTarget.style.borderColor = 'var(--border-primary)';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {clearable && value && !disabled && (
            <div
              onClick={handleClear}
              style={{
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'var(--bg-hover)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '12px', height: '12px' }} />
            </div>
          )}
          <ChevronDown
            style={{
              width: '18px',
              height: '18px',
              color: 'var(--text-tertiary)',
              transition: 'transform 0.15s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>
      {error && (
        <span style={{
          fontSize: '12px',
          color: 'var(--error)',
          marginTop: '4px',
          display: 'block',
        }}>
          {error}
        </span>
      )}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '240px',
            overflow: 'auto',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'dropdown-enter 0.15s ease-out',
          }}
        >
          {searchable && (
            <div style={{
              padding: '8px',
              borderBottom: '1px solid var(--border-primary)',
              position: 'sticky',
              top: 0,
              background: 'var(--bg-base)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                background: 'var(--bg-hover)',
                borderRadius: '6px',
              }}>
                <Search style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />
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
                      background: 'var(--border-primary)',
                      margin: '4px 0',
                    }} />
                  )}
                  <div style={{
                    padding: '8px 12px 4px',
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
                      gap: '10px',
                      cursor: optionDisabled ? 'not-allowed' : 'pointer',
                      color: optionDisabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      backgroundColor: selected ? 'var(--accent-bg)' : 'transparent',
                      transition: 'all 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!optionDisabled && !selected) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {optionIcon && (
                      <span style={{ width: '18px', height: '18px' }}>{optionIcon}</span>
                    )}
                    <span style={{ flex: 1 }}>{optionLabel}</span>
                    {multiple && selected && (
                      <Check style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                    )}
                    {!multiple && selected && (
                      <Check style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div style={{
              padding: '16px',
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
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
