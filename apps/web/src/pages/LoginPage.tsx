import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck, Moon, Sun, AlertCircle } from 'lucide-react';
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '52px',
    padding: '0 16px 0 52px',
    fontSize: '15px',
    backgroundColor: 'var(--bg-secondary)',
    border: '2px solid var(--border-primary)',
    borderRadius: '16px',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-family-sans)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: theme === 'dark' 
          ? 'radial-gradient(ellipse at 20% 0%, rgba(0, 122, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(88, 86, 214, 0.1) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 20% 0%, rgba(0, 122, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(88, 86, 214, 0.05) 0%, transparent 50%)',
      }} />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <button
            onClick={toggleTheme}
            aria-label="切换主题"
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              border: '2px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
            }}
          >
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Link to="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px',
              textDecoration: 'none',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.35)',
              }}>
                <Sparkles size={30} color="white" />
              </div>
              <span style={{
                fontSize: '26px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}>
                开演AI
              </span>
            </Link>
            
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}>
              欢迎回来
            </h1>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              lineHeight: 1.6,
            }}>
              登录您的账户，继续您的创作之旅
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transform: shake ? 'translateX(8px)' : 'translateX(0)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {error && (
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '2px solid #FF3B30',
                  borderRadius: '16px',
                  color: '#FF3B30',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontWeight: 500,
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}>
                  账号
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-tertiary)',
                    transition: 'color 0.2s',
                  }}>
                    <Mail size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="请输入您的账号"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.15)';
                      const icon = e.currentTarget.previousElementSibling as HTMLElement;
                      if (icon) icon.style.color = 'var(--color-primary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                      const icon = e.currentTarget.previousElementSibling as HTMLElement;
                      if (icon) icon.style.color = 'var(--text-tertiary)';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}>
                  密码
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-tertiary)',
                    transition: 'color 0.2s',
                  }}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: '52px' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.15)';
                      const icon = e.currentTarget.previousElementSibling as HTMLElement;
                      if (icon) icon.style.color = 'var(--color-primary)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                      const icon = e.currentTarget.previousElementSibling as HTMLElement;
                      if (icon) icon.style.color = 'var(--text-tertiary)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-tertiary)',
                      transition: 'all 0.2s',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  userSelect: 'none',
                }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '6px',
                      border: '2px solid var(--border-primary)',
                      cursor: 'pointer',
                      accentColor: 'var(--color-primary)',
                    }} 
                  />
                  记住我
                </label>
                <Link 
                  to="/forgot-password" 
                  style={{
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary-hover)';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
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
                icon={loading ? null : <ArrowRight size={18} />}
                iconPosition="right"
              >
                {loading ? '登录中...' : '登录'}
              </Button>

              <div style={{ 
                textAlign: 'center', 
                fontSize: '14px', 
                color: 'var(--text-secondary)',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                还没有账户？{' '}
                <Link 
                  to="/register" 
                  style={{
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary-hover)';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  创建账户
                </Link>
              </div>
            </form>
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
            }}>
              <ShieldCheck size={16} />
              您的账户安全是我们的首要任务
            </div>
          </div>
        </div>
      </div>

      <div style={{
        width: '50%',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(88, 86, 214, 0.08) 50%, rgba(175, 82, 222, 0.06) 100%)'
          : 'linear-gradient(135deg, rgba(0, 122, 255, 0.06) 0%, rgba(88, 86, 214, 0.04) 50%, rgba(175, 82, 222, 0.03) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 122, 255, 0.15) 0%, transparent 70%)',
          top: '10%',
          right: '5%',
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(175, 82, 222, 0.12) 0%, transparent 70%)',
          bottom: '10%',
          left: '5%',
        }} />
        
        <div style={{
          textAlign: 'center',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
          maxWidth: '480px',
        }}>
          <div style={{
            width: '140px',
            height: '140px',
            margin: '0 auto 32px',
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 50%, #AF52DE 100%)',
            borderRadius: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(0, 122, 255, 0.3)',
          }}>
            <Sparkles size={70} color="white" />
          </div>
          
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>
            AI 驱动创作
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: '40px',
          }}>
            利用人工智能技术，让您的剧本创作更加高效、专业
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {['剧本解析', '角色生成', '场景优化', 'AI 续写'].map((feature, index) => (
              <div key={index} style={{
                padding: '10px 20px',
                background: 'var(--bg-secondary)',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
