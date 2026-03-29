import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../core/api/client';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [backLinkHovered, setBackLinkHovered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post<{ user: any }>('/admin/auth/login', {
        email,
        password,
      });

      localStorage.setItem('admin_logged_in', 'true');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Manrope', sans-serif",
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '36px',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
            }}>
              <ShieldCheck size={28} color="#ffffff" />
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#fafafa',
            }}>
              管理后台
            </span>
          </Link>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#fafafa',
            marginBottom: '8px',
          }}>
            管理员登录
          </h1>

          <p style={{
            color: 'rgba(250, 250, 250, 0.6)',
            fontSize: '15px',
            lineHeight: 1.5,
          }}>
            请使用管理员账户登录
          </p>
        </div>

        <div style={{
          background: 'rgba(30, 30, 50, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.1)',
        }}>
          {error && (
            <div style={{
              padding: '14px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#fca5a5',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 500,
              marginBottom: '24px',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgba(250, 250, 250, 0.9)',
                marginBottom: '10px',
                letterSpacing: '0.02em',
              }}>
                邮箱地址
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: emailFocused ? '#8b5cf6' : 'rgba(250, 250, 250, 0.4)',
                  transition: 'color 0.2s ease',
                  zIndex: 1,
                }}>
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 16px 0 48px',
                    fontSize: '15px',
                    background: 'rgba(15, 15, 30, 0.9)',
                    border: emailFocused
                      ? '2px solid #8b5cf6'
                      : '2px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '14px',
                    color: '#fafafa',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    fontFamily: "'Manrope', sans-serif",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgba(250, 250, 250, 0.9)',
                marginBottom: '10px',
                letterSpacing: '0.02em',
              }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: passwordFocused ? '#8b5cf6' : 'rgba(250, 250, 250, 0.4)',
                  transition: 'color 0.2s ease',
                  zIndex: 1,
                }}>
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 50px 0 48px',
                    fontSize: '15px',
                    background: 'rgba(15, 15, 30, 0.9)',
                    border: passwordFocused
                      ? '2px solid #8b5cf6'
                      : '2px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '14px',
                    color: '#fafafa',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    fontFamily: "'Manrope', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(250, 250, 250, 0.4)',
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fafafa';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(250, 250, 250, 0.4)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
              style={{
                width: '100%',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: isLoading
                  ? 'rgba(139, 92, 246, 0.5)'
                  : buttonHovered
                    ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: "'Manrope', sans-serif",
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                transform: buttonHovered && !isLoading ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: buttonHovered && !isLoading
                  ? '0 12px 28px rgba(139, 92, 246, 0.5)'
                  : '0 6px 20px rgba(139, 92, 246, 0.35)',
                marginTop: '8px',
                letterSpacing: '0.02em',
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                <>
                  登录
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(139, 92, 246, 0.15)',
            textAlign: 'center',
          }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: backLinkHovered ? '#a78bfa' : 'rgba(250, 250, 250, 0.5)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setBackLinkHovered(true)}
              onMouseLeave={() => setBackLinkHovered(false)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: 'rotate(180deg)' }}>
                <path d="M11 7H3M3 7L6.5 3.5M3 7L6.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              返回首页
            </Link>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          color: 'rgba(250, 250, 250, 0.35)',
          fontSize: '12px',
          marginTop: '28px',
        }}>
          © 2024 开演AI. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
