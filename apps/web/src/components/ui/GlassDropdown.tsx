import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface GlassDropdownOption {
  value: string;
  label: string;
}

interface GlassDropdownProps {
  options: GlassDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  colors: {
    bgSecondary: string;
    border: string;
    borderHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };
  accentColor: string;
  size?: 'sm' | 'md';
}

export function GlassDropdown({
  options,
  value,
  onChange,
  placeholder = '请选择',
  colors,
  accentColor,
  size = 'md',
}: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const height = size === 'sm' ? '40px' : '44px';
  const fontSize = size === 'sm' ? '13px' : '14px';
  const padding = size === 'sm' ? '0 12px' : '0 14px';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height,
          padding,
          border: `1px solid ${colors.border}`,
          borderRadius: '14px',
          background: colors.bgSecondary,
          color: selectedOption ? colors.textPrimary : colors.textMuted,
          fontSize,
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.25s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = accentColor;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.border;
        }}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          style={{
            width: '16px',
            height: '16px',
            color: colors.textMuted,
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            borderRadius: '14px',
            background: colors.bgSecondary,
            border: `1px solid ${colors.border}`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.2), 0 0 20px ${accentColor}10`,
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.2s ease',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: isSelected ? `${accentColor}15` : 'transparent',
                  border: 'none',
                  color: isSelected ? accentColor : colors.textPrimary,
                  fontSize,
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = `${accentColor}08`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {option.label}
                {isSelected && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: accentColor,
                      marginLeft: 'auto',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}