import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FolderKanban, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  Zap,
  Sun,
  Moon,
  Cpu,
  BarChart3,
  Home
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  {
    title: '首页',
    icon: Home,
    href: '/',
  },
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <aside 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: collapsed ? '80px' : '260px',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--border-primary)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '0 16px' : '0 20px',
        borderBottom: '1px solid var(--border-secondary)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            textDecoration: 'none',
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px var(--accent-shadow)',
            transition: 'all 0.3s ease',
          }}>
            <Zap style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
              }}>
                开演AI
              </span>
              <span style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                创作平台
              </span>
            </div>
          )}
        </Link>
      </div>

      <nav style={{
        flex: 1,
        padding: '16px 12px',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {navItems.map((item) => {
            const isExactMatch = location.pathname === item.href;
            const hasMoreSpecificMatch = navItems.some(other => 
              other.href !== item.href && 
              other.href.startsWith(item.href + '/') && 
              (location.pathname === other.href || location.pathname.startsWith(other.href + '/'))
            );
            const isActive = isExactMatch || (!hasMoreSpecificMatch && item.href !== '/' && location.pathname.startsWith(item.href + '/'));
            const isHovered = hoveredItem === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px' : '12px 14px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive 
                    ? 'var(--nav-active-bg)' 
                    : isHovered 
                      ? 'var(--nav-hover-bg)' 
                      : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  border: isActive ? '1px solid var(--border-primary)' : '1px solid transparent',
                }}
                title={collapsed ? item.title : undefined}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '24px',
                    background: 'var(--gradient-primary)',
                    borderRadius: '0 3px 3px 0',
                    boxShadow: '0 0 10px var(--accent-shadow)',
                  }} />
                )}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isActive ? 'var(--gradient-primary)' : 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px var(--accent-shadow)' : 'none',
                }}>
                  <item.icon style={{ 
                    width: '18px', 
                    height: '18px', 
                    flexShrink: 0,
                    color: isActive ? 'white' : 'var(--text-tertiary)',
                  }} />
                </div>
                {!collapsed && (
                  <span style={{
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}>
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid var(--border-secondary)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px' : '12px 14px',
              borderRadius: '14px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease',
              width: '100%',
            }}
            title={collapsed ? (resolvedTheme === 'dark' ? '切换亮色主题' : '切换暗色主题') : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--nav-hover-bg)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}>
              {resolvedTheme === 'dark' ? 
                <Sun style={{ width: '18px', height: '18px', flexShrink: 0 }} /> : 
                <Moon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              }
            </div>
            {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>切换主题</span>}
          </button>

          <Link
            to="/help"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px' : '12px 14px',
              borderRadius: '14px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              width: '100%',
            }}
            title={collapsed ? '帮助' : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--nav-hover-bg)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <HelpCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            </div>
            {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>帮助中心</span>}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px' : '12px 14px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-secondary)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease',
              width: '100%',
            }}
            title={collapsed ? '展开侧边栏' : '收起侧边栏'}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--nav-hover-bg)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ChevronLeft style={{ 
                width: '18px', 
                height: '18px', 
                flexShrink: 0,
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }} />
            </div>
            {!collapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>收起侧栏</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
