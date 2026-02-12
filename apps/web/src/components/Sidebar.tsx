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
  Bot
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  {
    title: '我的项目',
    icon: FolderKanban,
    href: '/projects',
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
    icon: Bot,
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
    padding: '10px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
  };

  const navItemActiveStyle: React.CSSProperties = {
    backgroundColor: 'var(--accent-bg)',
    color: 'var(--accent-text)',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-primary)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      width: collapsed ? '64px' : '256px',
    }}>
      <div style={{
        padding: '16px',
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
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          {!collapsed && (
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              letterSpacing: '0.5px',
            }}>
              KaiyanTool
            </span>
          )}
        </Link>
      </div>

      <nav style={{
        flex: 1,
        padding: '12px',
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
            >
              <item.icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '32px',
                      backgroundColor: 'var(--accent)',
                      borderRadius: '0 4px 4px 0',
                    }} />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <button
          onClick={toggleTheme}
          style={{
            ...buttonStyle,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title={collapsed ? (theme === 'dark' ? '切换亮色主题' : '切换暗色主题') : undefined}
        >
          {theme === 'dark' ? <Sun style={{ width: '20px', height: '20px', flexShrink: 0 }} /> : <Moon style={{ width: '20px', height: '20px', flexShrink: 0 }} />}
          {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>切换主题</span>}
        </button>

        <Link
          to="/help"
          style={{
            ...navItemStyle,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title={collapsed ? '帮助' : undefined}
        >
          <HelpCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>帮助</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            ...buttonStyle,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <ChevronRight
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
          {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>收起</span>}
        </button>
      </div>
    </div>
  );
}
