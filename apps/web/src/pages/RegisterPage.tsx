import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck, CheckCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button-new';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    if (formData.name.length < 2) {
      setError('用户名至少需要2个字符');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const textColor = 'var(--text-primary)';
  const mutedTextColor = 'var(--text-secondary)';
  const inputBg = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const inputBorder = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div ref={containerRef} style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
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

      <div style={{
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeIn 0.8s ease-out',
      }}>
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '-60px',
            right: '0',
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          {theme === 'dark' ? <Sun style={{ width: '22px', height: '22px' }} /> : <Moon style={{ width: '22px', height: '22px' }} />}
        </button>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: '-2px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                opacity: '0.3',
                filter: 'blur(8px)',
              }} />
              <Sparkles style={{ width: '26px', height: '26px', color: 'white', position: 'relative', zIndex: 1 }} />
            </div>
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px',
              backgroundSize: '200% 200%',
              animation: 'gradientMove 8s ease infinite',
            }}>
              开演AI
            </span>
          </Link>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '8px',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
          }}>创建账户</h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0,
            fontSize: '15px',
            fontWeight: '400',
          }}>开始您的 AI 内容创作之旅</p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          transform: shake ? 'translateX(8px)' : 'translateX(0)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                padding: '14px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '14px',
                color: '#ef4444',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              }}>
                <ShieldCheck style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                {error}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                用户名
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: mutedTextColor,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  <User style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  minLength={2}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 46px',
                    fontSize: '15px',
                    fontWeight: '400',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '14px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                邮箱地址
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: mutedTextColor,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  <Mail style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 46px',
                    fontSize: '15px',
                    fontWeight: '400',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '14px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: mutedTextColor,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  <Lock style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码（至少6位）"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '14px 46px 14px 46px',
                    fontSize: '15px',
                    fontWeight: '400',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '14px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: mutedTextColor,
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = textColor;
                    e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = mutedTextColor;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                确认密码
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: mutedTextColor,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  <Lock style={{ width: '18px', height: '18px' }} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 46px 14px 46px',
                    fontSize: '15px',
                    fontWeight: '400',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '14px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: mutedTextColor,
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = textColor;
                    e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = mutedTextColor;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {showConfirmPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px' }}>
              <input
                type="checkbox"
                required
                style={{
                  marginTop: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer',
                  accentColor: '#6366f1',
                  flexShrink: 0,
                }}
              />
              <label style={{
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                lineHeight: '1.5',
              }}>
                我已阅读并同意{' '}
                <Link to="/terms" style={{
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-hover)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  服务条款
                </Link>{' '}和{' '}
                <Link to="/privacy" style={{
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-hover)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  隐私政策
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="xl"
              fullWidth
              disabled={loading}
              loading={loading}
              icon={loading ? null : <ArrowRight size={18} />}
              iconPosition="right"
              style={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '56px',
                fontSize: '17px',
                fontWeight: '700',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(0, 0, 0, 0.3) inset';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)';
              }}
            >
              {loading ? '注册中...' : '创建账户'}
            </Button>

            <div style={{ textAlign: 'center', fontSize: '15px', color: mutedTextColor }}>
              已有账户？{' '}
              <Link to="/login" style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                padding: '4px 12px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-hover)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                立即登录
              </Link>
            </div>
          </form>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '12px 20px',
            borderRadius: '9999px',
            fontSize: '13px',
            color: '#6366f1',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
          }}>
            <CheckCircle style={{ width: '16px', height: '16px' }} />
            新用户注册送7天高级会员
          </div>
        </div>
      </div>
    </div>
  );
}
