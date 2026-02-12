import { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    padding: '6px 12px',
    fontSize: '13px',
    iconSize: '14px',
  },
  medium: {
    padding: '8px 16px',
    fontSize: '14px',
    iconSize: '16px',
  },
  large: {
    padding: '10px 20px',
    fontSize: '15px',
    iconSize: '18px',
  },
};

export function Tabs({
  items,
  activeKey,
  onChange,
  variant = 'default',
  size = 'medium',
  className,
}: TabsProps) {
  const sizeConfig = SIZE_CONFIG[size];

  const renderTabs = () => {
    if (variant === 'pills') {
      return (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '4px',
            backgroundColor: 'var(--bg-hover)',
            borderRadius: '10px',
          }}
        >
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => !item.disabled && onChange(item.key)}
              disabled={item.disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: sizeConfig.padding,
                fontSize: sizeConfig.fontSize,
                fontWeight: '500',
                backgroundColor: activeKey === item.key ? 'var(--bg-base)' : 'transparent',
                color: activeKey === item.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: 'none',
                borderRadius: '8px',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: activeKey === item.key ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-base)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.icon && <span style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      );
    }

    if (variant === 'underline') {
      return (
        <div style={{ display: 'flex', gap: '0' }}>
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => !item.disabled && onChange(item.key)}
              disabled={item.disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: sizeConfig.padding,
                paddingBottom: 'calc(' + sizeConfig.padding + ' - 2px)',
                fontSize: sizeConfig.fontSize,
                fontWeight: '500',
                color: activeKey === item.key ? 'var(--accent)' : 'var(--text-tertiary)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeKey === item.key ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: '-2px',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }
              }}
            >
              {item.icon && <span style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-primary)' }}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.disabled && onChange(item.key)}
            disabled={item.disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: sizeConfig.padding,
              paddingBottom: 'calc(' + sizeConfig.padding + ' - 1px)',
              fontSize: sizeConfig.fontSize,
              fontWeight: '500',
              color: activeKey === item.key ? 'var(--accent)' : 'var(--text-tertiary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeKey === item.key ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: '-1px',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled && activeKey !== item.key) {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.disabled && activeKey !== item.key) {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            {item.icon && <span style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      {renderTabs()}
    </div>
  );
}

export interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <div className={className} style={{ padding: '16px 0' }}>
      {children}
    </div>
  );
}
