import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, CheckCircle, Type, Moon, Sun } from 'lucide-react';
import { SettingsLayout, SettingsCard, SettingsSection } from '../components/ui/SettingsLayout';

export default function AppearanceSettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const accentColors = [
    { name: '星芒紫', value: '#ba9eff' },
    { name: '琥珀金', value: '#f0a030' },
    { name: '海洋蓝', value: '#34b5fa' },
    { name: '翡翠绿', value: '#10b981' },
    { name: '玫瑰红', value: '#f43f5e' },
    { name: '珊瑚橙', value: '#f97316' },
    { name: '樱花粉', value: '#ec63ff' },
    { name: '薄荷青', value: '#14b8a6' },
    { name: '石墨蓝', value: '#6366f1' },
    { name: '午夜靛', value: '#8b5cf6' },
  ];

  const fontSizes = [
    { name: '小', value: '14px' },
    { name: '中', value: '16px' },
    { name: '大', value: '18px' },
  ];

  return (
    <SettingsLayout
      title="外观设置"
      subtitle="个性化您的界面体验"
      backHref="/settings"
    >
      <SettingsCard style={{ marginBottom: '24px' }}>
        <SettingsSection
          title="强调色"
          description="选择一个强调色来个性化您的界面"
          icon={<Palette size={18} />}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            {accentColors.map((color) => {
              const isSelected = accentColor === color.value;
              const isHovered = hoveredColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  onMouseEnter={() => setHoveredColor(color.value)}
                  onMouseLeave={() => setHoveredColor(null)}
                  style={{
                    width: '100%',
                    aspectRatio: '1.2',
                    backgroundColor: color.value,
                    border: isSelected ? '3px solid var(--text-primary)' : '3px solid transparent',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isSelected
                      ? `0 8px 32px ${color.value}60`
                      : isHovered
                        ? `0 4px 24px ${color.value}40`
                        : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isSelected && <CheckCircle style={{ width: '28px', height: '28px', color: '#fff' }} />}
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingsSection>
      </SettingsCard>

      <SettingsCard style={{ marginBottom: '24px' }}>
        <SettingsSection
          title="主题模式"
          description="选择适合您的主题模式"
          icon={<Moon size={18} />}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            {([
              { value: 'light' as const, label: '浅色', icon: Sun },
              { value: 'dark' as const, label: '深色', icon: Moon },
            ]).map((mode) => {
              const isSelected = theme === mode.value;
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  onClick={() => setTheme(mode.value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '20px',
                    borderRadius: '16px',
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-primary)'}`,
                    background: isSelected ? 'var(--accent-bg)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: isSelected ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isSelected ? 'var(--shadow-accent)' : 'none',
                    transition: 'all 0.25s ease',
                  }}>
                    <Icon style={{ width: '24px', height: '24px', color: isSelected ? '#fff' : 'var(--text-primary)' }} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {mode.label}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingsSection>
      </SettingsCard>

      <SettingsCard>
        <SettingsSection
          title="字体大小"
          description="调整界面的字体大小"
          icon={<Type size={18} />}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            {fontSizes.map((size) => {
              const isSelected = fontSize === size.value;
              return (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  style={{
                    flex: 1, padding: '20px', borderRadius: '16px',
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-primary)'}`,
                    background: isSelected ? 'var(--accent-bg)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span style={{
                    fontSize: size.value, fontWeight: 600,
                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  }}>
                    {size.name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{size.value}</span>
                </button>
              );
            })}
          </div>
        </SettingsSection>
      </SettingsCard>
    </SettingsLayout>
  );
}