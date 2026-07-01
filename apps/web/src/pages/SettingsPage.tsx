import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, Bell, Palette, Shield, ChevronRight, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PageHero } from '../components/ui/PageHero';

interface SettingItem {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  gradient: string;
  color: string;
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [logoutHover, setLogoutHover] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
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

  const settingsItems: SettingItem[] = [
    {
      icon: User,
      title: '个人资料',
      description: '管理您的账户信息',
      link: '/profile',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#6366f1',
    },
    {
      icon: Bell,
      title: '通知设置',
      description: '管理通知偏好',
      link: '/settings/notifications',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: '#f59e0b',
    },
    {
      icon: Palette,
      title: '外观设置',
      description: '主题和显示选项',
      link: '/settings/appearance',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      color: '#ec4899',
    },
    {
      icon: Shield,
      title: '安全设置',
      description: '密码和账户安全',
      link: '/settings/security',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      color: '#10b981',
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark 
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.04) 40%, transparent 70%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 24px', position: 'relative', zIndex: 10 }}>
        <PageHero
          title="SETTINGS"
          subtitle="管理您的账户和应用设置"
          icon={<Settings style={{ width: '28px', height: '28px', color: 'white' }} />}
          glowColor="rgba(99, 102, 241, 0.12)"
        />

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredItem === item.link;
            return (
              <Link
                key={item.link}
                to={item.link}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '20px 24px',
                  backgroundColor: isHovered ? `${item.color}08` : colors.bgGlass,
                  backdropFilter: 'blur(20px)',
                  borderRadius: '18px',
                  border: `1px solid ${isHovered ? `${item.color}30` : colors.border}`,
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: isHovered ? `0 8px 24px ${item.color}15` : 'none',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredItem(item.link)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: item.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: `0 4px 14px ${item.color}40`,
                }}>
                  <Icon style={{ width: '24px', height: '24px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    margin: '0 0 4px 0',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: colors.textSecondary,
                    margin: 0,
                  }}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight style={{
                  width: '20px',
                  height: '20px',
                  color: isHovered ? item.color : colors.textMuted,
                  flexShrink: 0,
                  transition: 'color 0.2s ease',
                }} />
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px 24px',
            backgroundColor: logoutHover ? 'rgba(239, 68, 68, 0.08)' : colors.bgGlass,
            backdropFilter: 'blur(20px)',
            borderRadius: '18px',
            border: `1px solid ${logoutHover ? 'rgba(239, 68, 68, 0.3)' : colors.border}`,
            textDecoration: 'none',
            width: '100%',
            marginTop: '24px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            color: '#ef4444',
            boxShadow: logoutHover ? '0 8px 24px rgba(239, 68, 68, 0.15)' : 'none',
            transform: logoutHover ? 'translateY(-2px)' : 'translateY(0)',
          }}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
          }}>
            <LogOut style={{ width: 24, height: 24, color: 'white' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 4px 0',
            }}>
              退出登录
            </h3>
            <p style={{
              fontSize: '13px',
              color: colors.textSecondary,
              margin: 0,
            }}>
              退出当前账户
            </p>
          </div>
        </button>

        <div style={{
          marginTop: '32px',
          padding: '20px 24px',
          backgroundColor: colors.bgGlass,
          backdropFilter: 'blur(20px)',
          borderRadius: '18px',
          border: `1px solid ${colors.border}`,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '6px',
          }}>
            <Sparkles style={{ width: 16, height: 16, color: '#6366f1' }} />
            <span style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '600' }}>
              开演AI v1.0.0
            </span>
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            用 AI 创造无限可能
          </div>
        </div>
      </div>
    </div>
  );
}
