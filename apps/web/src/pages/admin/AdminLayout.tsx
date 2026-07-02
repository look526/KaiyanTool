import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../core/store/auth.store';
import { api } from '../../core/api/client';
import { 
  Home, Users, Image, FileText, 
  Menu, X, LogOut, ChevronLeft, ChevronRight, Bot
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: '控制面板',
    path: '/admin',
    icon: <Home size={20} />,
  },
  {
    name: '用户管理',
    path: '/admin/users',
    icon: <Users size={20} />,
  },
  {
    name: '素材管理',
    path: '/admin/assets',
    icon: <Image size={20} />,
  },
  {
    name: '系统日志',
    path: '/admin/logs',
    icon: <FileText size={20} />,
  },
  {
    name: 'AI 提供商',
    path: '/admin/ai-providers',
    icon: <Bot size={20} />,
  },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await api.get<{ user: any }>('/admin/auth/me');
        setAdminUser(response.user);
        setIsLoading(false);
      } catch (error) {
        console.error('Admin auth check failed:', error);
        navigate('/admin/login');
      }
    };
    checkAdminAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      localStorage.removeItem('admin_logged_in');
      navigate('/admin/login');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: sidebarOpen ? '260px' : '80px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          padding: sidebarOpen ? '0 20px' : '0',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {sidebarOpen && (
            <Link to="/admin" style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '16px' }}>🎬</span>
              </div>
              开演AI 管理
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav style={{
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
        }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: sidebarOpen ? '12px 16px' : '12px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : 'transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  boxShadow: isActive ? '0 4px 14px rgba(0, 122, 255, 0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                {item.icon}
                {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          {sidebarOpen && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              padding: '0 4px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 600,
                color: '#fff',
              }}>
                {adminUser?.name?.[0] || 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{adminUser?.name}</p>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{adminUser?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'center' : 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            <LogOut size={18} />
            {sidebarOpen && '退出登录'}
          </button>
        </div>
      </aside>

      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '260px' : '80px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        minHeight: 0,
        minWidth: 0,
      }}>
        <header style={{
          position: 'sticky',
          top: 0,
          height: '64px',
          flexShrink: 0,
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '16px',
          zIndex: 40,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Menu size={20} />
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {navItems.find(item => item.path === location.pathname)?.name || '管理后台'}
          </h1>
        </header>

        <main style={{
          flex: 1,
          minHeight: 0,
          padding: '24px',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
