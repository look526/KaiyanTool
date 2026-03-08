import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Palette, CheckCircle, Type, Moon, Sun, Layout } from 'lucide-react';

export default function AppearanceSettingsPage() {
  const navigate = useNavigate();
  const { resolvedTheme, theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const accentColors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#10b981' },
  ];

  const fontSizes = [
    { name: '小', value: '14px' },
    { name: '中', value: '16px' },
    { name: '大', value: '18px' },
  ];

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60vh',
        background: isDark 
          ? 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: isDark ? 'rgba(5, 5, 10, 0.95)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(40px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
        padding: '20px 48px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: isDark ? '#fafafa' : '#18181b',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 24px ${accentColor}40`,
              }}>
                <Palette style={{ width: '24px', height: '24px', color: '#ffffff' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: isDark ? '#fafafa' : '#18181b',
                  margin: 0,
                }}>
                  外观设置
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
                  margin: '4px 0 0 0',
                }}>
                  个性化您的界面体验
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ padding: '32px 48px', position: 'relative' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Palette style={{ width: '20px', height: '20px', color: accentColor }} />
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                margin: 0,
              }}>
                强调色
              </h2>
            </div>
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
              marginBottom: '24px',
            }}>
              选择一个强调色来个性化您的界面
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
            }}>
              {accentColors.map((color) => {
                const isSelected = accentColor === color.value;
                const isHovered = hoveredColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => handleAccentColorChange(color.value)}
                    onMouseEnter={() => setHoveredColor(color.value)}
                    onMouseLeave={() => setHoveredColor(null)}
                    style={{
                      width: '100%',
                      height: '88px',
                      backgroundColor: color.value,
                      border: isSelected ? '3px solid #fff' : '3px solid transparent',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: isSelected 
                        ? `0 8px 32px ${color.value}60` 
                        : isHovered 
                        ? `0 4px 24px ${color.value}40` 
                        : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <CheckCircle style={{ width: '32px', height: '32px', color: '#fff' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Moon style={{ width: '20px', height: '20px', color: accentColor }} />
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                margin: 0,
              }}>
                主题模式
              </h2>
            </div>
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
              marginBottom: '24px',
            }}>
              选择适合您的主题模式
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { value: 'light' as const, label: '浅色', icon: Sun },
                { value: 'dark' as const, label: '深色', icon: Moon },
              ].map((mode) => {
                const isSelected = theme === mode.value;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => handleThemeChange(mode.value)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '24px',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? accentColor : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)';
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                      }
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: isSelected 
                        ? `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`
                        : isDark 
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? `0 8px 24px ${accentColor}40` : 'none',
                    }}>
                      <Icon style={{ width: '24px', height: '24px', color: isSelected ? '#fff' : isDark ? '#fafafa' : '#18181b' }} />
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isDark ? '#fafafa' : '#18181b',
                    }}>
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Type style={{ width: '20px', height: '20px', color: accentColor }} />
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                margin: 0,
              }}>
                字体大小
              </h2>
            </div>
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)',
              marginBottom: '24px',
            }}>
              调整界面的字体大小
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {fontSizes.map((size) => {
                const isSelected = fontSize === size.value;
                return (
                  <button
                    key={size.value}
                    onClick={() => handleFontSizeChange(size.value)}
                    style={{
                      flex: 1,
                      padding: '20px',
                      borderRadius: '16px',
                      border: `2px solid ${isSelected ? accentColor : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)';
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                      }
                    }}
                  >
                    <span style={{
                      fontSize: size.value,
                      fontWeight: 600,
                      color: isSelected ? accentColor : isDark ? '#fafafa' : '#18181b',
                    }}>
                      {size.name}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: isDark ? 'rgba(250, 250, 250, 0.5)' : 'rgba(24, 24, 27, 0.5)',
                    }}>
                      {size.value}
                    </span>
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
