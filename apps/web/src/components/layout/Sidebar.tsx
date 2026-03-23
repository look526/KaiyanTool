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
      width: '256px',
      background: isDark
        ? 'rgba(7, 13, 31, 0.6)'
        : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(40px)',
      borderRight: isDark
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: isDark
        ? '40px 0 40px rgba(186, 158, 255, 0.08)'
        : '4px 0 24px rgba(0, 0, 0, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      letterSpacing: '-0.02em',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        marginBottom: '40px',
        padding: '0 24px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '60px',
          background: isDark
            ? 'radial-gradient(ellipse at center, rgba(186, 158, 255, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: isDark
              ? 'linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#39008c' : '#ffffff',
            boxShadow: isDark
              ? '0 4px 16px rgba(186, 158, 255, 0.4)'
              : '0 4px 16px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
          }}>
            <Sparkles size={20} style={{ fill: 'currentColor' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: isDark ? '#e9d5ff' : undefined,
              background: isDark
                ? undefined
                : 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
              WebkitBackgroundClip: isDark ? undefined : 'text',
              WebkitTextFillColor: isDark ? undefined : 'transparent',
              backgroundClip: isDark ? undefined : 'text',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>Kaiyan AI</h1>
            <p style={{
              fontSize: '10px',
              color: isDark ? 'rgba(201, 188, 255, 0.9)' : 'rgba(24, 24, 27, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              margin: '2px 0 0 0',
              fontWeight: 500,
            }}>Digital Curator</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.href || 
              (item.href === '/projects' && location.pathname.startsWith('/projects')) ||
              (item.href === '/workspace' && location.pathname.startsWith('/workspace')) ||
              (item.href === '/settings' && location.pathname.startsWith('/settings'));
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
                  padding: '12px 16px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  background: active
                    ? (isDark ? 'rgba(174, 141, 255, 0.15)' : 'rgba(139, 92, 246, 0.1)')
                    : hovered
                      ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)')
                      : 'transparent',
                  color: active
                    ? (isDark ? '#ba9eff' : '#7c3aed')
                    : (isDark ? 'rgba(165, 170, 194, 0.8)' : 'rgba(24, 24, 27, 0.7)'),
                  boxShadow: active
                    ? (isDark ? '0 0 20px rgba(174, 141, 255, 0.15)' : '0 0 20px rgba(139, 92, 246, 0.1)')
                    : 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '20px',
                  fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{
        padding: '24px',
        borderTop: isDark
          ? '1px solid rgba(255, 255, 255, 0.06)'
          : '1px solid rgba(0, 0, 0, 0.06)',
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
            padding: '12px 16px',
            borderRadius: '14px',
            border: 'none',
            background: hoveredItem === 'theme'
              ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)')
              : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            color: isDark ? 'rgba(165, 170, 194, 0.8)' : 'rgba(24, 24, 27, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span style={{ fontSize: '14px' }}>深色模式</span>
          </div>
          <div style={{
            width: '36px',
            height: '20px',
            borderRadius: '10px',
            background: isDark
              ? 'linear-gradient(135deg, #1c253e 0%, #11192e 100%)'
              : 'linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)',
            position: 'relative',
            transition: 'all 0.3s ease',
            boxShadow: isDark
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
              : 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{
              position: 'absolute',
              left: isDark ? '2px' : '18px',
              top: '2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isDark
                ? 'linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)'
                : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              transition: 'all 0.3s ease',
              boxShadow: isDark
                ? '0 2px 8px rgba(186, 158, 255, 0.5)'
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
            padding: '12px 16px',
            borderRadius: '14px',
            textDecoration: 'none',
            background: hoveredItem === 'help'
              ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)')
              : 'transparent',
            color: isDark ? 'rgba(165, 170, 194, 0.8)' : 'rgba(24, 24, 27, 0.7)',
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
            padding: '12px 16px',
            borderRadius: '14px',
            border: 'none',
            width: '100%',
            background: hoveredItem === 'logout'
              ? (isDark ? 'rgba(255, 110, 132, 0.1)' : 'rgba(239, 68, 68, 0.08)')
              : 'transparent',
            color: isDark ? '#ff6e84' : '#dc2626',
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