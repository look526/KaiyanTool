import { Cpu, Layers, CheckCircle } from 'lucide-react';
import type { AIProvider } from '../../types';

interface ProviderHeaderProps {
  providers: AIProvider[];
  isMobile: boolean;
  isTablet: boolean;
  isDark?: boolean;
  colors?: {
    bgPrimary: string;
    bgSecondary: string;
    bgGlass: string;
    bgGlassHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderHover: string;
  };
  accentColor?: string;
}

export function ProviderHeader({
  providers,
  isMobile,
  colors,
  accentColor = '#8b5cf6',
}: ProviderHeaderProps) {
  const finalColors = colors || {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  };

  const stats = [
    {
      key: 'providers',
      label: '提供商',
      value: providers?.length || 0,
      color: accentColor,
      icon: Cpu,
    },
    {
      key: 'models',
      label: '模型',
      value: providers?.reduce((acc, p) => acc + (p.models?.length || 0), 0) || 0,
      color: '#06b6d4',
      icon: Layers,
    },
    {
      key: 'enabled',
      label: '已启用',
      value: providers?.filter(p => p.enabled).length || 0,
      color: '#10b981',
      icon: CheckCircle,
    },
  ];

  return (
    <div style={{
      marginBottom: '28px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
      gap: '12px',
    }}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px',
              background: finalColors.bgGlass,
              borderRadius: '12px',
              border: `1px solid ${finalColors.border}`,
              minWidth: 0,
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: finalColors.textPrimary,
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '13px',
                color: finalColors.textMuted,
                fontWeight: '600',
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
