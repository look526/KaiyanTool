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



  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
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
            color: 'var(--text-primary)',
            marginBottom: '8px',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
          }}>找回密码</h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0,
            fontSize: '14px',
            fontWeight: '400',
          }}>输入邮箱，我们会发送重置指引</p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
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
                color: 'var(--text-primary)',
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
                  color: 'var(--text-secondary)',
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
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-primary)';
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
                background: 'var(--gradient-primary)',
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
              color: 'var(--text-secondary)',
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
