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
  Image,
  Sparkles,
  Video,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { title: '我的项目', icon: FolderKanban, href: '/projects' },
  { title: '素材库', icon: Image, href: '/assets' },
  { title: 'AI 图像', icon: Sparkles, href: '/image-generation' },
  { title: 'AI 视频', icon: Video, href: '/video-generation' },
  { title: '数据分析', icon: BarChart3, href: '/analytics' },
  { title: '文档管理', icon: FileText, href: '/documents' },
  { title: '团队管理', icon: Users, href: '/team' },
  { title: 'AI提供商', icon: Cpu, href: '/settings/ai' },
  { title: '设置', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const { resolvedTheme, toggleTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';
  
  const accentColor = '#8b5cf6';
  const accentLight = '#a78bfa';
  const accentGlow = '#c4b5fd';
  
  const colors = isDark ? {
    bg: 'rgba(5, 5, 10, 0.85)',
    bgSolid: '#05050a',
    bgGlass: 'rgba(255, 255, 255, 0.03)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    bgGlassActive: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.3)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    iconBg: 'rgba(255, 255, 255, 0.04)',
  } : {
    bg: 'rgba(255, 255, 255, 0.85)',
    bgSolid: '#ffffff',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    bgGlassActive: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.3)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    iconBg: 'rgba(0, 0, 0, 0.03)',
  };
  
  return (
    <aside 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: collapsed ? '80px' : '280px',
        background: colors.bg,
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRight: `1px solid ${colors.border}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark 
          ? '0 0 80px rgba(139, 92, 246, 0.05), 20px 0 60px rgba(0, 0, 0, 0.3)' 
          : '0 0 80px rgba(139, 92, 246, 0.03), 20px 0 60px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark
          ? 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0 20px' : '0 24px',
        borderBottom: `1px solid ${colors.border}`,
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
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 8px 24px ${accentColor}40`,
          }}>
            <Zap style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: colors.textPrimary,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                开演AI
              </span>
              <span style={{
                fontSize: '10px',
                color: colors.textMuted,
                whiteSpace: 'nowrap',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}>
                创作平台
              </span>
            </div>
          )}
        </Link>
        
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              border: 'none',
              background: colors.iconBg,
              color: colors.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgGlassHover;
              e.currentTarget.style.color = colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.iconBg;
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      <nav style={{
        flex: 1,
        padding: '20px 16px',
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
                  gap: '14px',
                  padding: collapsed ? '14px' : '14px 18px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? colors.bgGlassActive : isHovered ? colors.bgGlassHover : 'transparent',
                  border: isActive ? `1px solid ${colors.borderHover}` : '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                title={collapsed ? item.title : undefined}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: '0px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '24px',
                    background: `linear-gradient(180deg, ${accentColor} 0%, ${accentLight} 100%)`,
                    borderRadius: '0 6px 6px 0',
                    boxShadow: `0 0 16px ${accentColor}60`,
                  }} />
                )}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: isActive 
                    ? `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`
                    : colors.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 4px 16px ${accentColor}40` : 'none',
                  flexShrink: 0,
                }}>
                  <item.icon style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
                    transition: 'color 0.2s ease',
                  }} />
                </div>
                {!collapsed && (
                  <span style={{
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    color: isActive ? colors.textPrimary : colors.textSecondary,
                    letterSpacing: isActive ? '-0.01em' : '0',
                  }}>
                    {item.title}
                  </span>
                )}
                {!collapsed && isActive && (
                  <ChevronRight style={{
                    width: '14px',
                    height: '14px',
                    color: accentColor,
                    marginLeft: 'auto',
                    opacity: 0.7,
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{
        padding: '20px 16px',
        borderTop: `1px solid ${colors.border}`,
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
              gap: '14px',
              padding: collapsed ? '14px' : '14px 18px',
              borderRadius: '14px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.3s ease',
              width: '100%',
            }}
            title={collapsed ? (resolvedTheme === 'dark' ? '切换亮色主题' : '切换暗色主题') : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgGlassHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: colors.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}>
              {resolvedTheme === 'dark' ? 
                <Sun style={{ width: '20px', height: '20px', color: colors.textSecondary }} /> : 
                <Moon style={{ width: '20px', height: '20px', color: colors.textSecondary }} />
              }
            </div>
            {!collapsed && (
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: colors.textSecondary 
              }}>
                {resolvedTheme === 'dark' ? '浅色模式' : '深色模式'}
              </span>
            )}
          </button>

          <Link
            to="/help"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: collapsed ? '14px' : '14px 18px',
              borderRadius: '14px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              width: '100%',
            }}
            title={collapsed ? '帮助' : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgGlassHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: colors.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <HelpCircle style={{ width: '20px', height: '20px', color: colors.textSecondary }} />
            </div>
            {!collapsed && (
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: colors.textSecondary 
              }}>
                帮助中心
              </span>
            )}
          </Link>

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: colors.iconBg,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
              }}
              title="展开侧边栏"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgGlassHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.iconBg;
              }}
            >
              <ChevronRight style={{ width: '20px', height: '20px', color: colors.textSecondary }} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
