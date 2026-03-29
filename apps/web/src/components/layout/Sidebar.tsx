import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: 'folder_open' as any, label: '我的项目', href: '/projects' },
  { icon: 'inventory_2' as any, label: '素材库', href: '/assets' },
  { icon: 'dashboard' as any, label: '工作台', href: '/workspace' },
  { icon: 'analytics' as any, label: '数据分析', href: '/analytics' },
  { icon: 'description' as any, label: '文档管理', href: '/documents' },
  { icon: 'group' as any, label: '团队管理', href: '/team' },
  { icon: 'hub' as any, label: 'AI 提供商', href: '/settings/ai' },
  { icon: 'settings' as any, label: '设置', href: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '260px',
      background: 'var(--bg-sidebar)',
      backdropFilter: 'var(--glass-blur)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      fontFamily: 'var(--font-family-sans)',
      letterSpacing: '-0.02em',
      transition: 'all 0.3s ease',
      boxShadow: isDark
        ? '0 0 80px rgba(186, 158, 255, 0.05), 20px 0 60px rgba(0, 0, 0, 0.3)'
        : '0 0 60px rgba(139, 92, 246, 0.03), 4px 0 24px rgba(0, 0, 0, 0.06)',
    }}>
      <div style={{
        paddingTop: '32px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '32px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140px',
          height: '100px',
          background: isDark
            ? 'radial-gradient(ellipse at center top, rgba(186, 158, 255, 0.25) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: isDark
              ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)'
              : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#39008c' : '#ffffff',
            boxShadow: isDark
              ? '0 4px 20px rgba(186, 158, 255, 0.45), 0 0 40px rgba(186, 158, 255, 0.15)'
              : '0 4px 20px rgba(139, 92, 246, 0.35), 0 0 40px rgba(139, 92, 246, 0.1)',
            transition: 'all 0.3s ease',
          }}>
            <Sparkles size={20} style={{ fill: 'currentColor' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: isDark ? 'var(--accent)' : 'var(--accent-dark)',
              background: isDark
                ? undefined
                : 'linear-gradient(135deg, var(--accent-dark) 0%, var(--accent) 100%)',
              WebkitBackgroundClip: isDark ? undefined : 'text',
              WebkitTextFillColor: isDark ? undefined : 'transparent',
              backgroundClip: isDark ? undefined : 'text',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>Kaiyan AI</h1>
            <p style={{
              fontSize: '10px',
              color: isDark ? 'var(--text-tertiary)' : 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              margin: '2px 0 0 0',
              fontWeight: 500,
            }}>Digital Curator</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.href ||
              (item.href === '/projects' && location.pathname.startsWith('/projects')) ||
              (item.href === '/workspace' && location.pathname.startsWith('/workspace')) ||
              (item.href === '/settings' && location.pathname.startsWith('/settings') && location.pathname !== '/settings/ai');
            const hovered = hoveredItem === item.href;

            return (
              <Link
                key={item.label}
                to={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  background: active
                    ? 'var(--nav-active-bg)'
                    : hovered
                      ? 'var(--bg-hover)'
                      : 'transparent',
                  color: active
                    ? 'var(--accent)'
                    : (isDark ? 'var(--text-tertiary)' : 'var(--text-secondary)'),
                  boxShadow: active
                    ? '0 0 25px rgba(186, 158, 255, 0.12), inset 0 0 20px rgba(186, 158, 255, 0.05)'
                    : 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  transform: hovered && !active ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-dark) 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px var(--accent)',
                  }} />
                )}
                <span className="material-symbols-outlined" style={{
                  fontSize: '20px',
                  fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                  transition: 'all 0.25s ease',
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.25s ease',
                }}>{item.label}</span>
                {hovered && !active && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    opacity: 0.6,
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{
        padding: '24px',
        background: isDark
          ? 'var(--bg-secondary)'
          : 'var(--bg-secondary)',
        borderTop: 'none',
      }}>
        <button
          onClick={() => toggleTheme()}
          onMouseEnter={() => setHoveredItem('theme')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '14px 16px',
            borderRadius: '14px',
            border: 'none',
            background: hoveredItem === 'theme'
              ? 'var(--bg-hover)'
              : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            color: isDark ? 'var(--text-tertiary)' : 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span style={{ fontSize: '14px' }}>深色模式</span>
          </div>
          <div style={{
            width: '40px',
            height: '22px',
            borderRadius: '11px',
            background: isDark
              ? 'var(--bg-elevated)'
              : 'var(--bg-elevated)',
            position: 'relative',
            transition: 'all 0.3s ease',
            boxShadow: isDark
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 15px rgba(186, 158, 255, 0.1)'
              : 'inset 0 2px 4px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-primary)',
          }}>
            <div style={{
              position: 'absolute',
              left: isDark ? '3px' : '19px',
              top: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: isDark
                ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)'
                : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              transition: 'all 0.3s ease',
              boxShadow: isDark
                ? '0 2px 10px rgba(186, 158, 255, 0.5)'
                : '0 2px 8px rgba(251, 191, 36, 0.4)',
            }} />
          </div>
        </button>

        <Link
          to="/help"
          onMouseEnter={() => setHoveredItem('help')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '14px',
            textDecoration: 'none',
            background: hoveredItem === 'help'
              ? 'var(--bg-hover)'
              : 'transparent',
            color: isDark ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            transition: 'all 0.25s ease',
            marginTop: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span>
          <span style={{ fontSize: '14px' }}>帮助中心</span>
        </Link>

        <button
          onClick={() => navigate('/login')}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '14px',
            border: 'none',
            width: '100%',
            background: hoveredItem === 'logout'
              ? 'rgba(239, 68, 68, 0.1)'
              : 'transparent',
            color: hoveredItem === 'logout'
              ? '#ef4444'
              : (isDark ? 'var(--text-tertiary)' : 'var(--text-secondary)'),
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            marginTop: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          <span style={{ fontSize: '14px' }}>退出登录</span>
        </button>
      </div>
    </aside>
  );
}