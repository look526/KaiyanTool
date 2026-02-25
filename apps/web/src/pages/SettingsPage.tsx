import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, User, Key, Bell, Palette, Shield, ChevronRight, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  gradient: string;
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(newParticles);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const settingsItems: SettingItem[] = [
    {
      icon: <User style={{ width: 24, height: 24 }} />,
      title: '个人资料',
      description: '管理您的账户信息',
      link: '/profile',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    {
      icon: <Key style={{ width: 24, height: 24 }} />,
      title: 'AI 提供商',
      description: '配置 AI 模型和 API 密钥',
      link: '/settings/ai',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    },
    {
      icon: <Settings style={{ width: 24, height: 24 }} />,
      title: '模型配置',
      description: '设置默认 AI 模型偏好',
      link: '/settings/models',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    },
    {
      icon: <Bell style={{ width: 24, height: 24 }} />,
      title: '通知设置',
      description: '管理通知偏好',
      link: '/settings/notifications',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      icon: <Palette style={{ width: 24, height: 24 }} />,
      title: '外观设置',
      description: '主题和显示选项',
      link: '/settings/appearance',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    },
    {
      icon: <Shield style={{ width: 24, height: 24 }} />,
      title: '安全设置',
      description: '密码和账户安全',
      link: '/settings/security',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    }
  ];

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <style>{`
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: var(--opacity); }
          50% { transform: translateY(-30px) translateX(10px); opacity: calc(var(--opacity) * 0.5); }
        }

        .cursor-glow {
          position: fixed;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: opacity 0.3s ease;
          z-index: 1;
          filter: blur(40px);
        }

        .background-decoration {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.4));
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 8s ease-in-out infinite;
          --opacity: var(--p-opacity, 0.3);
        }
      `}</style>

      <div className="cursor-glow" style={{
        left: mousePosition.x,
        top: mousePosition.y,
      }}></div>

      <div className="background-decoration">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--p-opacity': p.opacity,
              animationDelay: `${p.id * 0.1}s`,
              animationDuration: `${8 / p.speed}s`,
            }}
          />
        ))}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 35%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'float 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float 15s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <header style={{
        height: '88px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '14px',
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
            position: 'relative',
          }}>
            <Settings style={{ width: '28px', height: '28px', color: 'white' }} />
            <div style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              opacity: 0.3,
              filter: 'blur(8px)',
              zIndex: -1,
            }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              margin: '0 0 4px 0',
              backgroundSize: '200% 200%',
              animation: 'gradientMove 8s ease infinite',
            }}>
              设置
            </h1>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              管理您的账户和应用设置
            </div>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'fadeIn 0.6s ease-out',
        }}>
          {settingsItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '24px 28px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textDecoration: 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: item.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.3px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  fontWeight: '500',
                }}>
                  {item.description}
                </p>
              </div>
              <ChevronRight style={{
                width: '24px',
                height: '24px',
                color: 'var(--text-secondary)',
                flexShrink: 0,
              }} />
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '24px 28px',
            backgroundColor: 'rgba(239, 68, 68, 0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textDecoration: 'none',
            width: '100%',
            maxWidth: '800px',
            margin: '32px auto 0',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#ef4444',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.03)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
          }}>
            <LogOut style={{ width: 28, height: 28, color: 'white' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              letterSpacing: '-0.3px',
            }}>
              退出登录
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: 0,
              fontWeight: '500',
            }}>
              退出当前账户
            </p>
          </div>
        </button>

        <div style={{
          maxWidth: '800px',
          margin: '40px auto 0',
          padding: '24px 28px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <Sparkles style={{ width: 18, height: 18, color: '#6366f1' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              开演AI v1.0.0
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            用 AI 创造无限可能
          </div>
        </div>
      </div>
    </div>
  );
}
