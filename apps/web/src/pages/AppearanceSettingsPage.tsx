import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  CheckCircle,
  Type,
  Layout,
  Sparkles,
  Check
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type ThemeMode = 'light' | 'dark' | 'system';

const themeOptions: { value: ThemeMode; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'light', label: '浅色模式', description: '始终使用浅色主题', icon: Sun },
  { value: 'dark', label: '深色模式', description: '始终使用深色主题', icon: Moon },
  { value: 'system', label: '跟随系统', description: '自动跟随系统主题设置', icon: Monitor },
];

const accentColors = [
  { name: '紫罗兰', value: '#8b5cf6' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '青色', value: '#06b6d4' },
  { name: '绿色', value: '#10b981' },
  { name: '橙色', value: '#f97316' },
  { name: '粉色', value: '#ec4899' },
];

const fontSizes = [
  { name: '小', value: '14px' },
  { name: '中', value: '16px' },
  { name: '大', value: '18px' },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);
  const [compactMode, setCompactMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kaiyan-compact-mode');
    return saved === 'true';
  });

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
  };

  const handleCompactModeChange = () => {
    const newMode = !compactMode;
    setCompactMode(newMode);
    localStorage.setItem('kaiyan-compact-mode', String(newMode));
    if (newMode) {
      document.documentElement.style.setProperty('--spacing-multiplier', '0.8');
    } else {
      document.documentElement.style.removeProperty('--spacing-multiplier');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-base)',
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <header style={{
        height: '72px',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(20px)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 4px 0',
            }}>外观设置</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              自定义应用的外观和显示
            </div>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '24px',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              }}>
                <Palette style={{ width: '22px', height: '22px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0 0 2px 0',
                }}>主题模式</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  选择您偏好的界面主题
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {themeOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = theme === option.value;
                const isHovered = hoveredTheme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    style={{
                      padding: '24px',
                      backgroundColor: isSelected ? 'var(--accent-bg)' : 'var(--bg-hover)',
                      border: `2px solid ${isSelected ? 'var(--accent)' : isHovered ? 'var(--text-muted)' : 'var(--border-primary)'}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredTheme(option.value)}
                    onMouseLeave={() => setHoveredTheme(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isSelected ? '0 4px 14px var(--accent-shadow)' : 'none',
                      }}>
                        <IconComponent style={{ width: '24px', height: '24px', color: isSelected ? '#fff' : 'var(--text-muted)' }} />
                      </div>
                      {isSelected && (
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px var(--accent-shadow)',
                        }}>
                          <Check style={{ width: '14px', height: '14px', color: '#fff' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '24px',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
              }}>
                <Sparkles style={{ width: '22px', height: '22px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0 0 2px 0',
                }}>强调色</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  选择界面的主要强调颜色
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {accentColors.map((color) => {
                const isSelected = accentColor === color.value;
                const isHovered = hoveredColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => handleAccentColorChange(color.value)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      backgroundColor: color.value,
                      border: isSelected ? '3px solid #fff' : '3px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? `0 4px 20px ${color.value}60, 0 0 0 2px ${color.value}` : isHovered ? `0 2px 12px ${color.value}40` : 'none',
                      transition: 'all 0.2s ease',
                      transform: isHovered && !isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onMouseEnter={() => setHoveredColor(color.value)}
                    onMouseLeave={() => setHoveredColor(null)}
                    title={color.name}
                  >
                    {isSelected && (
                      <CheckCircle style={{ width: '28px', height: '28px', color: '#fff' }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '16px 20px',
              background: 'var(--bg-hover)',
              borderRadius: '12px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--border-primary)',
            }}>
              <span>当前强调色：</span>
              <span style={{ 
                color: accentColor, 
                fontWeight: '600',
                padding: '4px 12px',
                background: `${accentColor}20`,
                borderRadius: '6px',
                border: `1px solid ${accentColor}40`,
              }}>
                {accentColor}
              </span>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '24px',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              }}>
                <Type style={{ width: '22px', height: '22px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0 0 2px 0',
                }}>字体大小</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  调整界面的基础字体大小
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {fontSizes.map((size) => {
                const isSelected = fontSize === size.value;
                const isHovered = hoveredFont === size.value;
                return (
                  <button
                    key={size.value}
                    onClick={() => handleFontSizeChange(size.value)}
                    style={{
                      flex: 1,
                      padding: '20px',
                      backgroundColor: isSelected ? 'var(--accent-bg)' : 'var(--bg-hover)',
                      border: `2px solid ${isSelected ? 'var(--accent)' : isHovered ? 'var(--text-muted)' : 'var(--border-primary)'}`,
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredFont(size.value)}
                    onMouseLeave={() => setHoveredFont(null)}
                  >
                    <div style={{ 
                      fontSize: size.value, 
                      fontWeight: '600', 
                      color: 'var(--text-primary)', 
                      marginBottom: '8px',
                      textAlign: 'center',
                    }}>
                      Aa
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      textAlign: 'center',
                    }}>
                      {size.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
            padding: '28px',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              }}>
                <Layout style={{ width: '22px', height: '22px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0 0 2px 0',
                }}>界面布局</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  调整界面的显示密度
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              background: 'var(--bg-hover)',
              borderRadius: '14px',
              border: '1px solid var(--border-primary)',
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  紧凑模式
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  减少界面元素的间距，显示更多内容
                </div>
              </div>
              <button
                onClick={handleCompactModeChange}
                style={{
                  width: '52px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: compactMode ? 'var(--accent)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: compactMode ? '26px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
