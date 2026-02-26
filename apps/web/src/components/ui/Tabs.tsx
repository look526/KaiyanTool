import * as React from 'react';

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  variant: 'default' | 'pills' | 'underline';
}>({
  value: '',
  onValueChange: () => {},
  variant: 'default',
});

export function Tabs({
  value,
  onValueChange,
  children,
  className = '',
  variant = 'default',
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: TabsListProps) {
  const { variant } = React.useContext(TabsContext);

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      display: 'flex',
      gap: 'var(--spacing-1)',
      padding: 'var(--spacing-1)',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
    },
    pills: {
      display: 'flex',
      gap: 'var(--spacing-2)',
    },
    underline: {
      display: 'flex',
      gap: 'var(--spacing-0)',
      borderBottom: '1px solid var(--border-primary)',
    },
  };

  return (
    <div style={variantStyles[variant]} className={className} role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = '',
  disabled = false,
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, variant } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      padding: 'var(--spacing-2) var(--spacing-4)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      border: 'none',
      background: 'transparent',
    };

    switch (variant) {
      case 'pills':
        return {
          ...baseStyles,
          borderRadius: 'var(--radius-full)',
          color: isSelected ? 'var(--color-primary-500)' : 'var(--text-secondary)',
          backgroundColor: isSelected ? 'var(--color-primary-500)/10' : 'transparent',
        };
      case 'underline':
        return {
          ...baseStyles,
          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderBottom: isSelected ? '2px solid var(--color-primary-500)' : '2px solid transparent',
          marginBottom: '-1px',
        };
      default:
        return {
          ...baseStyles,
          borderRadius: 'var(--radius-md)',
          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
          backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
        };
    }
  };

  return (
    <button
      className={className}
      style={getVariantStyles()}
      onClick={() => !disabled && onValueChange(value)}
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext);

  if (selectedValue !== value) return null;

  return (
    <div
      className={className}
      role="tabpanel"
      style={{
        padding: 'var(--spacing-4) 0',
        animation: 'fadeIn 0.2s ease forwards',
      }}
    >
      {children}
    </div>
  );
}

export default Tabs;
