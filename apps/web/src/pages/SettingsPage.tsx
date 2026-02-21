import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, User, Key, Bell, Palette, Shield, ChevronRight, LogOut } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

export default function SettingsPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const settingsItems: SettingItem[] = [
    {
      icon: <User style={{ width: 24, height: 24 }} />,
      title: '个人资料',
      description: '管理您的账户信息',
      link: '/profile'
    },
    {
      icon: <Key style={{ width: 24, height: 24 }} />,
      title: 'AI 提供商',
      description: '配置 AI 模型和 API 密钥',
      link: '/settings/ai'
    },
    {
      icon: <Bell style={{ width: 24, height: 24 }} />,
      title: '通知设置',
      description: '管理通知偏好',
      link: '/settings/notifications'
    },
    {
      icon: <Palette style={{ width: 24, height: 24 }} />,
      title: '外观设置',
      description: '主题和显示选项',
      link: '/settings/appearance'
    },
    {
      icon: <Shield style={{ width: 24, height: 24 }} />,
      title: '安全设置',
      description: '密码和账户安全',
      link: '/settings/security'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </Link>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>设置</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                管理您的账户和应用设置
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {settingsItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px 24px',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-on)',
                  flexShrink: 0,
                }}>
                  {item.icon}
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
                    color: 'var(--text-muted)',
                    margin: 0,
                  }}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight style={{
                  width: '20px',
                  height: '20px',
                  color: 'var(--text-muted)',
                }} />
              </Link>
            ))}
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: '12px',
              border: '1px solid #ef444440',
              textDecoration: 'none',
              width: '100%',
              maxWidth: '800px',
              margin: '24px auto 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#ef4444',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef444410';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ef444420',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <LogOut style={{ width: 24, height: 24, color: '#ef4444' }} />
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
                color: 'var(--text-muted)',
                margin: 0,
              }}>
                退出当前账户
              </p>
            </div>
          </button>

          <div style={{
            maxWidth: '800px',
            margin: '40px auto 0',
            padding: '20px',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}>
              <Settings style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                开演AI v1.0.0
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
