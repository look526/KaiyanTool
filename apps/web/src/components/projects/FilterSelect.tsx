import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colors = isDark ? {
    bg: 'rgba(255, 255, 255, 0.04)',
    bgHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.06)',
    text: '#dfe4fe',
    textMuted: '#a5aac2',
    dropdownBg: 'rgba(17, 25, 46, 0.95)',
    accent: '#8b5cf6',
  } : {
    bg: 'rgba(0, 0, 0, 0.04)',
    bgHover: 'rgba(0, 0, 0, 0.08)',
    border: 'rgba(0, 0, 0, 0.06)',
    text: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.6)',
    dropdownBg: 'rgba(255, 255, 255, 0.98)',
    accent: '#7c3aed',
  };

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          borderRadius: '14px',
          border: `1px solid ${colors.border}`,
          background: colors.bg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: selectedLabel ? colors.text : colors.textMuted,
          fontSize: '14px',
          fontWeight: 500,
          fontFamily: "'Manrope', sans-serif",
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        <span>{selectedLabel}</span>
        <span className="material-symbols-outlined" style={{
          fontSize: '18px',
          color: colors.textMuted,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>expand_more</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          minWidth: '140px',
          padding: '6px',
          borderRadius: '16px',
          background: colors.dropdownBg,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.2), 0 0 60px ${colors.accent}10`,
          zIndex: 100,
          animation: 'dropdownFadeIn 0.2s ease',
        }}>
          {options.map((opt, idx) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: opt.value === value ? 600 : 400,
                color: opt.value === value ? colors.accent : (hoverIdx === idx ? (isDark ? '#dfe4fe' : '#18181b') : colors.textMuted),
                background: hoverIdx === idx ? colors.bgHover : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {opt.label}
              {opt.value === value && (
                <span className="material-symbols-outlined" style={{
                  marginLeft: 'auto',
                  fontSize: '16px',
                  color: colors.accent,
                }}>check</span>
              )}
            </div>
          ))}
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
