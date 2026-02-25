import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FolderKanban, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Cpu,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  {
    title: '我的项目',
    icon: FolderKanban,
    href: '/projects',
  },
  {
    title: '数据分析',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    title: '文档管理',
    icon: FileText,
    href: '/documents',
  },
  {
    title: '团队管理',
    icon: Users,
    href: '/team',
  },
  {
    title: 'AI提供商',
    icon: Cpu,
    href: '/settings/ai',
  },
  {
    title: '设置',
    icon: Settings,
    href: '/settings',
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  };

  const navItemActiveStyle: React.CSSProperties = {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: 'var(--text-primary)',
    boxShadow: '0 4px 24px rgba(99, 102, 241, 0.2)',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 24px rgba(99, 102, 241, 0.5)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              filter: 'blur(8px)',
              opacity: 0.6,
            }}></div>
            <Sparkles style={{ width: '20px', height: '20px', color: 'white', position: 'relative', zIndex: 1 }} />
          </div>
          {!collapsed && (
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}>
              开演AI
            </span>
          )}
        </Link>
      </div>

      <nav style={{
        flex: 1,
        padding: '16px 12px',
        overflowY: 'auto',
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                ...navItemStyle,
                ...(isActive ? navItemActiveStyle : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              title={collapsed ? item.title : undefined}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }
              }}
            >
              <item.icon style={{ 
                width: '20px', 
                height: '20px', 
                flexShrink: 0,
                transition: 'all 0.3s ease',
                color: isActive ? 'var(--primary-500)' : 'var(--text-tertiary)'
              }} />
              {!collapsed && (
                <>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}>{item.title}</span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '36px',
                      background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                      borderRadius: '0 8px 8px 0',
                      boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                    }} />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <button
          onClick={toggleTheme}
          style={{
            ...buttonStyle,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title={collapsed ? (theme === 'dark' ? '切换亮色主题' : '切换暗色主题') : undefined}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          {theme === 'dark' ? <Sun style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--text-tertiary)' }} /> : <Moon style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--text-tertiary)' }} />}
          {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>切换主题</span>}
        </button>

        <Link
          to="/help"
          style={{
            ...navItemStyle,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title={collapsed ? '帮助' : undefined}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <HelpCircle style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--text-tertiary)' }} />
          {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>帮助</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            ...buttonStyle,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <ChevronRight
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              color: 'var(--text-tertiary)',
            }}
          />
          {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>收起</span>}
        </button>
      </div>
    </div>
  );
}
