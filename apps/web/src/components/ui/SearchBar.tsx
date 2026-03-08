import React, { useState } from 'react';
import { GlassInput } from './GlassInput';
import { GlassSelect, GlassSelectOption } from './GlassSelect';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: GlassSelectOption[];
    value: string;
    onChange: (value: string) => void;
  }>;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = '搜索...',
  filters,
  actions,
  size = 'md',
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-4)',
      padding: 'var(--spacing-6) var(--spacing-8)',
      background: 'var(--bg-header)',
      backdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
        maxWidth: '800px',
      }}>
        <div style={{ flex: 1 }}>
          <GlassInput
            variant="search"
            size={size}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            icon={
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            }
          />
        </div>

        {filters && filters.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-3)',
          }}>
            {filters.map((filter) => (
              <div key={filter.key} style={{ minWidth: '160px' }}>
                <GlassSelect
                  size={size}
                  options={filter.options}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  placeholder={filter.label}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {actions && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
        }}>
          {actions}
        </div>
      )}
    </div>
  );
};
