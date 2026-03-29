import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, Key, Bell, Palette, Shield, ChevronRight, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [logoutHover, setLogoutHover] = useState(false);

  const handleLogout = async () => {
    await logout();
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
      icon: Key,
      title: 'AI 提供商',
      description: '配置 AI 模型和 API 密钥',
      link: '/settings/ai',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
      color: '#06b6d4',
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
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-base)',
      minHeight: '100vh',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 70%)',
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(168, 85, 247, 0.06) 40%, transparent 70%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      <header style={{
        height: '72px',
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
          }}>
            <Settings style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 4px 0',
            }}>设置</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              管理您的账户和应用设置
            </div>
          </div>
        </div>
      </header>

      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '28px 32px', 
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
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
                  backgroundColor: isHovered ? `${item.color}08` : 'var(--bg-surface)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: `1px solid ${isHovered ? `${item.color}30` : 'var(--border-primary)'}`,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
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
                    color: 'var(--text-primary)',
                    margin: '0 0 4px 0',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight style={{
                  width: '20px',
                  height: '20px',
                  color: isHovered ? item.color : 'var(--text-muted)',
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
            backgroundColor: logoutHover ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: `1px solid ${logoutHover ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-primary)'}`,
            textDecoration: 'none',
            width: '100%',
            maxWidth: '800px',
            margin: '24px auto 0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              退出当前账户
            </p>
          </div>
        </button>

        <div style={{
          maxWidth: '800px',
          margin: '32px auto 0',
          padding: '20px 24px',
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid var(--border-primary)',
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
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              开演AI v1.0.0
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            用 AI 创造无限可能
          </div>
        </div>
      </div>
    </div>
  );
}
