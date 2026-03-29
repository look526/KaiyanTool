import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Palette, CheckCircle, Type, Moon, Sun } from 'lucide-react';

export default function AppearanceSettingsPage() {
  const navigate = useNavigate();
  const { resolvedTheme, theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
  const isDark = resolvedTheme === 'dark';
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

  const sectionStyle: React.CSSProperties = {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(40px)',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid var(--border-primary)',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  };

  const descStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '24px',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60vh',
        background: `radial-gradient(ellipse at 20% 20%, var(--accent-bg) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-header)',
        backdropFilter: 'blur(48px)',
        borderBottom: '1px solid var(--border-primary)',
        padding: '20px 48px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/settings')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'var(--bg-glass)', border: '1px solid var(--border-primary)',
              cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--text-primary)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-glass)'}
            >
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </button>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>外观设置</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>个性化您的界面体验</p>
            </div>
          </div>
        </div>
      </header>

      <main style={{ padding: '32px 48px', position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Accent Color Section */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Palette style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
              <h2 style={headingStyle}>强调色</h2>
            </div>
            <p style={descStyle}>选择一个强调色来个性化您的界面</p>
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
          </div>

          {/* Theme Mode Section */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Moon style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
              <h2 style={headingStyle}>主题模式</h2>
            </div>
            <p style={descStyle}>选择适合您的主题模式</p>
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
                      background: isSelected ? 'var(--accent-bg)' : 'var(--bg-glass)',
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
          </div>

          {/* Font Size Section */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Type style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
              <h2 style={headingStyle}>字体大小</h2>
            </div>
            <p style={descStyle}>调整界面的字体大小</p>
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
                      background: isSelected ? 'var(--accent-bg)' : 'var(--bg-glass)',
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
          </div>

        </div>
      </main>
    </div>
  );
}
