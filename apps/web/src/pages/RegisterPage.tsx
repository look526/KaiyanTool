import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

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
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { register } = useAuth();

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const bgGradient = theme === 'dark'
    ? 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
    : 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.08) 0%, transparent 50%)';

  const cardBg = theme === 'dark'
    ? 'rgba(17, 17, 17, 0.8)'
    : 'rgba(255, 255, 255, 0.9)';

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#18181b' : '#f8fafc';
  const inputBorder = theme === 'dark' ? '#27272a' : '#e2e8f0';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#09090b' : '#f8fafc',
      backgroundImage: bgGradient,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        opacity: theme === 'dark' ? '0.4' : '0.5',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23${theme === 'dark' ? 'ffffff' : '000000'}' stroke-width='0.5' opacity='0.1'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        zIndex: 10,
      }}>
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
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: '-2px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                borderRadius: '16px',
                opacity: '0.3',
                filter: 'blur(8px)',
              }} />
              <Sparkles style={{ width: '26px', height: '26px', color: 'white', position: 'relative', zIndex: 1 }} />
            </div>
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px',
            }}>
              KaiyanTool
            </span>
          </Link>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: textColor,
            marginBottom: '8px',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
          }}>创建账户</h1>
          <p style={{
            color: mutedTextColor,
            margin: 0,
            fontSize: '15px',
            fontWeight: '400',
          }}>开始您的 AI 内容创作之旅</p>
        </div>

        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '20px',
          padding: '36px 32px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: theme === 'dark'
            ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          transform: shake ? 'translateX(8px)' : 'translateX(0)',
          transition: 'transform 0.1s ease-in-out',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                padding: '14px 16px',
                backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                borderRadius: '12px',
                color: '#ef4444',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '500',
              }}>
                <ShieldCheck style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                {error}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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
                    borderRadius: '12px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme === 'dark' ? '#6366f1' : '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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
                    borderRadius: '12px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme === 'dark' ? '#6366f1' : '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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
                    borderRadius: '12px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme === 'dark' ? '#6366f1' : '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
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
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = textColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = mutedTextColor;
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
                fontWeight: '600',
                color: textColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
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
                    borderRadius: '12px',
                    color: textColor,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme === 'dark' ? '#6366f1' : '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
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
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = textColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = mutedTextColor;
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
                  border: `1px solid ${inputBorder}`,
                  cursor: 'pointer',
                  accentColor: '#6366f1',
                  flexShrink: 0,
                }}
              />
              <label style={{
                color: mutedTextColor,
                cursor: 'pointer',
                lineHeight: '1.5',
              }}>
                我已阅读并同意{' '}
                <Link to="/terms" style={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6366f1';
                }}>
                  服务条款
                </Link>{' '}和{' '}
                <Link to="/privacy" style={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6366f1';
                }}>
                  隐私政策
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              style={{
                width: '100%',
                height: '52px',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V4a8 8 0 00-8 0z"></path>
                  </svg>
                  注册中...
                </>
              ) : (
                <>
                  <span>创建账户</span>
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </Button>

            <div style={{ textAlign: 'center', fontSize: '15px', color: mutedTextColor }}>
              已有账户？{' '}
              <Link to="/login" style={{
                color: '#6366f1',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6366f1';
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
            backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
            border: `1px solid ${theme === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
            padding: '12px 20px',
            borderRadius: '9999px',
            fontSize: '13px',
            color: '#6366f1',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
            <CheckCircle style={{ width: '16px', height: '16px' }} />
            新用户注册送7天高级会员
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
