import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCsrfToken } from '../lib/csrf';

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
  const [focused, setFocused] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const passwordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 6) strength++;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('请同意服务条款和隐私政策');
      return;
    }

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
      await register(formData.email, formData.password, formData.name);
      navigate('/projects', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  const strengthLabels = ['非常弱', '弱', '一般', '强', '非常强'];

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
            加入我们
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#737373',
            lineHeight: 1.7,
            maxWidth: '400px',
          }}>
            解锁 AI 创作的全部潜力，让您的创意无限延伸
          </p>

          <div style={{ marginTop: '64px' }}>
            {['免费试用', '无需信用卡', '随时取消'].map((feature, i) => (
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
            创建账户
          </h2>
          <p style={{
            color: '#737373',
            fontSize: '15px',
            marginBottom: '32px',
          }}>
            开始您的创作之旅
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                padding: '12px 16px',
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

            {/* Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#404040',
                marginBottom: '8px',
              }}>
                用户名
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'name' ? '#6366f1' : '#a3a3a3',
                  transition: 'color 0.2s',
                  zIndex: 1,
                }} />
                <input
                  type="text"
                  placeholder="输入用户名"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px 0 48px',
                    fontSize: '15px',
                    background: '#fafafa',
                    border: focused === 'name' ? '1px solid #6366f1' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#171717',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              
              {/* Password Strength */}
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: passwordStrength() >= level 
                          ? strengthColors[passwordStrength() - 1] 
                          : '#e5e5e5',
                        transition: 'background 0.3s ease',
                      }} />
                    ))}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: passwordStrength() > 0 
                      ? strengthColors[passwordStrength() - 1] 
                      : '#9ca3af',
                    fontWeight: 500,
                  }}>
                    密码强度: {passwordStrength() > 0 ? strengthLabels[passwordStrength() - 1] : '请输入密码'}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#404040',
                marginBottom: '8px',
              }}>
                确认密码
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'confirmPassword' ? '#6366f1' : '#a3a3a3',
                  transition: 'color 0.2s',
                  zIndex: 1,
                }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  onFocus={() => setFocused('confirmPassword')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 48px 0 48px',
                    fontSize: '15px',
                    background: '#fafafa',
                    border: formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? '1px solid #ef4444' 
                      : focused === 'confirmPassword' ? '1px solid #6366f1' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    color: '#171717',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444' }}>
                  两次密码输入不一致
                </div>
              )}
            </div>

            {/* Terms */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#737373',
              lineHeight: 1.5,
            }}>
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  marginTop: '2px',
                  accentColor: '#6366f1',
                  flexShrink: 0,
                }} 
              />
              <span>
                我同意{' '}
                <Link to="/terms" style={{ color: '#171717', textDecoration: 'none', fontWeight: 500 }}>
                  服务条款
                </Link>
                {' '}和{' '}
                <Link to="/privacy" style={{ color: '#171717', textDecoration: 'none', fontWeight: 500 }}>
                  隐私政策
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
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
                background: loading || !agreedToTerms ? '#a3a3a3' : '#171717',
                color: '#ffffff',
                cursor: loading || !agreedToTerms ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '8px',
              }}
            >
              {loading ? '注册中...' : (
                <>
                  注册
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Login */}
            <div style={{ 
              textAlign: 'center', 
              fontSize: '14px', 
              color: '#737373',
            }}>
              已有账户？{' '}
              <Link 
                to="/login" 
                style={{
                  color: '#171717',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                立即登录
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
