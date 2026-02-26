import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle, Moon, Sun, AlertCircle } from 'lucide-react';
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
          ? 'radial-gradient(ellipse at 20% 0%, rgba(175, 82, 222, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0, 122, 255, 0.1) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 20% 0%, rgba(175, 82, 222, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0, 122, 255, 0.05) 0%, transparent 50%)',
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
                background: 'linear-gradient(135deg, #AF52DE 0%, #FF2D55 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(175, 82, 222, 0.35)',
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
              创建账户
            </h1>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              lineHeight: 1.6,
            }}>
              开始您的AI创作之旅
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  用户名
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
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="请输入用户名"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
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
                  邮箱
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
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
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
                    placeholder="请输入密码（至少6位）"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}>
                  确认密码
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="请再次输入密码"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
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
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                {loading ? '注册中...' : '创建账户'}
              </Button>

              <div style={{ 
                textAlign: 'center', 
                fontSize: '14px', 
                color: 'var(--text-secondary)',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                已有账户？{' '}
                <Link 
                  to="/login" 
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
                  立即登录
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
              <CheckCircle size={16} />
              注册即表示您同意我们的服务条款
            </div>
          </div>
        </div>
      </div>

      <div style={{
        width: '50%',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(175, 82, 222, 0.12) 0%, rgba(255, 45, 85, 0.08) 50%, rgba(0, 122, 255, 0.06) 100%)'
          : 'linear-gradient(135deg, rgba(175, 82, 222, 0.06) 0%, rgba(255, 45, 85, 0.04) 50%, rgba(0, 122, 255, 0.03) 100%)',
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
          background: 'radial-gradient(circle, rgba(175, 82, 222, 0.15) 0%, transparent 70%)',
          top: '10%',
          left: '5%',
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 122, 255, 0.12) 0%, transparent 70%)',
          bottom: '10%',
          right: '5%',
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
            background: 'linear-gradient(135deg, #AF52DE 0%, #FF2D55 50%, #FF9500 100%)',
            borderRadius: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(175, 82, 222, 0.3)',
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
            开启创作之旅
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: '40px',
          }}>
            加入我们，体验AI驱动的剧本创作新方式
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {['免费注册', '无限创作', '云端存储', '团队协作'].map((feature, index) => (
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
