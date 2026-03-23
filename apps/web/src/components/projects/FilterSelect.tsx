import React, { useState } from 'react';

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        height: '40px',
        padding: '0 40px 0 16px',
        fontSize: '14px',
        fontWeight: 500,
        backgroundColor: 'var(--surface-container-low)',
        border: isFocused ? '1px solid var(--primary)' : '1px solid rgba(65, 71, 91, 0.15)',
        borderRadius: '14px',
        color: 'var(--on-surface)',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a5aac2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        transition: 'all 0.3s ease',
        boxShadow: isFocused ? '0 0 20px rgba(186, 158, 255, 0.2)' : 'none',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
