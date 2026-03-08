import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
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
      await apiClient.login({ email, password, remember_me: rememberMe });
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      // 延迟一下再跳转，确保状态更新完成
      setTimeout(() => {
        window.location.href = '/projects';
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#ffffff',
      display: 'flex',
    }}>
      {/* Left Side - Branding */}
      <div style={{
        flex: 1,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={24} color="#fff" />
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}>
              开演AI
            </span>
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '24px',
            letterSpacing: '-0.03em',
          }}>
            AI 驱动创作
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#737373',
            lineHeight: 1.7,
            maxWidth: '400px',
          }}>
            从剧本到视频的完整创作工作流，让 AI 成为您的创作伙伴
          </p>

          <div style={{ marginTop: '64px' }}>
            {['智能剧本生成', '角色一致性', '场景优化', '批量生成'].map((feature, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                color: '#a3a3a3',
                fontSize: '15px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#6366f1',
                }} />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '80px',
          color: '#404040',
          fontSize: '13px',
        }}>
          © 2025 开演AI. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#171717',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            欢迎回来
          </h2>
          <p style={{
            color: '#737373',
            fontSize: '15px',
            marginBottom: '40px',
          }}>
            登录您的账户
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{
                padding: '14px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#404040',
                marginBottom: '8px',
              }}>
                邮箱
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'email' ? '#6366f1' : '#a3a3a3',
                  transition: 'color 0.2s',
                  zIndex: 1,
                }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px 0 48px',
                    fontSize: '15px',
                    background: '#fafafa',
                    border: focused === 'email' ? '1px solid #6366f1' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#171717',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#404040',
                marginBottom: '8px',
              }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'password' ? '#6366f1' : '#a3a3a3',
                  transition: 'color 0.2s',
                  zIndex: 1,
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 48px 0 48px',
                    fontSize: '15px',
                    background: '#fafafa',
                    border: focused === 'password' ? '1px solid #6366f1' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#171717',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    color: '#a3a3a3',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#737373',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#6366f1',
                  }} 
                />
                记住我
              </label>
              <Link 
                to="/forgot-password" 
                style={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                忘记密码？
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 500,
                borderRadius: '8px',
                border: 'none',
                background: loading ? '#a3a3a3' : '#171717',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '8px',
              }}
            >
              {loading ? '登录中...' : (
                <>
                  登录
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Register */}
            <div style={{ 
              textAlign: 'center', 
              fontSize: '14px', 
              color: '#737373',
            }}>
              还没有账户？{' '}
              <Link 
                to="/register" 
                style={{
                  color: '#171717',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                立即注册
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
