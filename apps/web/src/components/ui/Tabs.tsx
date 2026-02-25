import { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'segmented';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    padding: '10px 16px',
    fontSize: '13px',
    iconSize: '14px',
  },
  medium: {
    padding: '12px 20px',
    fontSize: '14px',
    iconSize: '16px',
  },
  large: {
    padding: '14px 24px',
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
            display: 'inline-flex',
            gap: '8px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
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
                gap: '8px',
                padding: sizeConfig.padding,
                fontSize: sizeConfig.fontSize,
                fontWeight: '600',
                backgroundColor: activeKey === item.key 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'transparent',
                color: activeKey === item.key ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                border: activeKey === item.key ? 'none' : '1px solid transparent',
                borderRadius: '14px',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeKey === item.key ? '0 4px 16px rgba(102, 126, 234, 0.4)' : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              {item.icon && <span style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>{item.icon}</span>}
              {item.label}
              {item.badge && (
                <span
                  style={{
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      );
    }

    if (variant === 'segmented') {
      return (
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
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
                gap: '8px',
                padding: sizeConfig.padding,
                fontSize: sizeConfig.fontSize,
                fontWeight: '600',
                backgroundColor: activeKey === item.key ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: activeKey === item.key ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                borderRadius: '12px',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
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
                gap: '8px',
                padding: sizeConfig.padding,
                paddingBottom: 'calc(' + sizeConfig.padding + ' - 4px)',
                fontSize: sizeConfig.fontSize,
                fontWeight: '600',
                color: activeKey === item.key ? '#667eea' : 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeKey === item.key ? '3px solid #667eea' : '3px solid transparent',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: '-3px',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled && activeKey !== item.key) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
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
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.disabled && onChange(item.key)}
            disabled={item.disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: sizeConfig.padding,
              paddingBottom: 'calc(' + sizeConfig.padding + ' - 3px)',
              fontSize: sizeConfig.fontSize,
              fontWeight: '600',
              color: activeKey === item.key ? '#667eea' : 'rgba(255, 255, 255, 0.6)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeKey === item.key ? '3px solid #667eea' : '3px solid transparent',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: '-3px',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled && activeKey !== item.key) {
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.disabled && activeKey !== item.key) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
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
    <div className={className} style={{ padding: '24px 0' }}>
      {children}
    </div>
  );
}
