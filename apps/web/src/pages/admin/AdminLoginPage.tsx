import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../core/api/client';
import { useAuthStore } from '../../core/store/auth.store';
import { Button } from '../../components/ui/button-new';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  React.useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post<{ user: any }>('/api/admin/auth/login', {
        email,
        password,
      });

      setUser(response.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 20% 0%, rgba(0, 122, 255, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(88, 86, 214, 0.08) 0%, transparent 50%)',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
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
              <ShieldCheck size={30} color="white" />
            </div>
            <span style={{
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              管理后台
            </span>
          </Link>
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>
            管理员登录
          </h1>
          
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '16px',
            lineHeight: 1.6,
          }}>
            请使用管理员账户登录
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
              marginBottom: '24px',
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}>
                邮箱地址
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
                  zIndex: 1,
                }}>
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.15)';
                    const icon = e.currentTarget.parentElement?.querySelector('div') as HTMLElement;
                    if (icon) icon.style.color = 'var(--color-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                    const icon = e.currentTarget.parentElement?.querySelector('div') as HTMLElement;
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
                  zIndex: 1,
                }}>
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  style={{ ...inputStyle, paddingRight: '52px' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.15)';
                    const icon = e.currentTarget.parentElement?.querySelector('div') as HTMLElement;
                    if (icon) icon.style.color = 'var(--color-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                    const icon = e.currentTarget.parentElement?.querySelector('div') as HTMLElement;
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

            <Button
              type="submit"
              variant="primary"
              size="xl"
              fullWidth
              disabled={isLoading}
              loading={isLoading}
              icon={isLoading ? null : <ArrowRight size={18} />}
              iconPosition="right"
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div style={{ 
            marginTop: '24px',
            textAlign: 'center', 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <Link 
              to="/" 
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
              返回首页
            </Link>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '13px',
          marginTop: '32px',
        }}>
          © 2024 开演AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
