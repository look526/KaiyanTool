import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button-new';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { login, sessionExpired, clearSessionExpired } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(savedRememberMe);
    }
  }, []);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (sessionExpired) {
      setError('登录已过期，请重新登录');
      clearSessionExpired();
    }
  }, [sessionExpired, clearSessionExpired]);

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
    setLoading(true);

    try {
      await login(email, password, Boolean(rememberMe));
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      const redirectTo = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/projects';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const textColor = 'var(--text-primary)';
  const mutedTextColor = 'var(--text-secondary)';
  const inputBg = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const inputBorder = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div style={{
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
      `}</style>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 10,
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
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: '-3px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '18px',
                opacity: '0.4',
                filter: 'blur(10px)',
              }} />
              <Sparkles style={{ width: '28px', height: '28px', color: 'white', position: 'relative', zIndex: 1 }} />
            </div>
            <span style={{
              fontSize: '30px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.8px',
              backgroundSize: '200% 200%',
              animation: 'gradientMove 8s ease infinite',
            }}>
              开演AI
            </span>
          </Link>
          <h1 style={{
            fontSize: '34px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '10px',
            margin: '0 0 10px 0',
            letterSpacing: '-0.6px',
          }}>欢迎回来</h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0,
            fontSize: '16px',
            fontWeight: '400',
          }}>登录您的账户继续创作</p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '44px 36px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          transform: shake ? 'translateX(8px)' : 'translateX(0)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {error && (
              <div style={{
                padding: '16px 18px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '14px',
                color: '#ef4444',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              }}>
                <ShieldCheck style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                {error}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: textColor,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                账号
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: mutedTextColor,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  <Mail style={{ width: '20px', height: '20px' }} />
                </div>
                <input
                  type="text"
                  placeholder="请输入您的账号"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    fontSize: '15px',
                    fontWeight: '400',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '14px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
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
                fontSize: '14px',
                fontWeight: '700',
                color: textColor,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: mutedTextColor,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  <Lock style={{ width: '20px', height: '20px' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px 48px 16px 48px',
                    fontSize: '15px',
                    fontWeight: '400',
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '14px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
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
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
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
                  {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-primary)',
                    cursor: 'pointer',
                    accentColor: '#6366f1',
                    flexShrink: 0,
                  }} 
                />
                记住我
              </label>
              <Link to="/forgot-password" style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
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
                忘记密码？
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="xl"
              fullWidth
              disabled={loading}
              loading={loading}
              icon={loading ? null : <ArrowRight size={20} />}
              iconPosition="right"
            >
              {loading ? '登录中...' : '登录'}
            </Button>

            <div style={{ textAlign: 'center', fontSize: '16px', color: mutedTextColor, marginTop: '8px' }}>
              还没有账户？{' '}
              <Link to="/register" style={{
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
                创建账户
              </Link>
            </div>
          </form>
        </div>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontSize: '14px',
            color: 'var(--text-tertiary)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}>
            <ShieldCheck style={{ width: '18px', height: '18px' }} />
            您的账户安全是我们的首要任务
          </div>
        </div>
      </div>
    </div>
  );
}
