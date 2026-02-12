import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useTheme();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      addToast({
        type: 'info',
        title: '已提交',
        message: '如果该邮箱存在，我们会发送重置指引。',
      });
      setEmail('');
    } finally {
      setSubmitting(false);
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
        maxWidth: '440px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: textColor,
            marginBottom: '8px',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
          }}>找回密码</h1>
          <p style={{
            color: mutedTextColor,
            margin: 0,
            fontSize: '14px',
            fontWeight: '400',
          }}>输入邮箱，我们会发送重置指引</p>
        </div>

        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: theme === 'dark'
            ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                邮箱
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
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '发送重置邮件'}
            </Button>

            <Link to="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: mutedTextColor,
              textDecoration: 'none',
              fontSize: '14px',
              justifyContent: 'center',
            }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              返回登录
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
