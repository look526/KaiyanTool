import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Key,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';

export default function SecuritySettingsPage() {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = '请输入当前密码';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = '密码长度至少6位';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
      setSaving(true);
      setError(null);
      await apiClient.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('密码修改成功');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || '密码修改失败');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm('确定要退出所有设备吗？这将使所有已登录的设备需要重新登录。')) {
      try {
        await apiClient.logoutAll();
        await logout();
      } catch (err) {
        setError('操作失败');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/settings" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </Link>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>安全设置</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                管理您的账户安全
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {error && (
              <div style={{
                marginBottom: '24px',
                padding: '14px 18px',
                backgroundColor: 'var(--error-bg)',
                border: '1px solid var(--error)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--error)',
              }}>
                <AlertCircle style={{ width: '18px', height: '18px' }} />
                {error}
              </div>
            )}

            {success && (
              <div style={{
                marginBottom: '24px',
                padding: '14px 18px',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--success)',
              }}>
                <CheckCircle style={{ width: '18px', height: '18px' }} />
                {success}
              </div>
            )}

            <Card style={{ padding: '32px', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Lock style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                修改密码
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    当前密码
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="输入当前密码"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 48px 0 16px',
                        backgroundColor: 'var(--bg-surface)',
                        border: `1px solid ${passwordErrors.currentPassword ? 'var(--error)' : 'var(--border-primary)'}`,
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '4px',
                      }}
                    >
                      {showCurrentPassword ? (
                        <EyeOff style={{ width: '18px', height: '18px' }} />
                      ) : (
                        <Eye style={{ width: '18px', height: '18px' }} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p style={{ fontSize: '12px', color: 'var(--error)', margin: '6px 0 0' }}>
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    新密码
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="输入新密码"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 48px 0 16px',
                        backgroundColor: 'var(--bg-surface)',
                        border: `1px solid ${passwordErrors.newPassword ? 'var(--error)' : 'var(--border-primary)'}`,
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '4px',
                      }}
                    >
                      {showNewPassword ? (
                        <EyeOff style={{ width: '18px', height: '18px' }} />
                      ) : (
                        <Eye style={{ width: '18px', height: '18px' }} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p style={{ fontSize: '12px', color: 'var(--error)', margin: '6px 0 0' }}>
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    确认新密码
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="再次输入新密码"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 48px 0 16px',
                        backgroundColor: 'var(--bg-surface)',
                        border: `1px solid ${passwordErrors.confirmPassword ? 'var(--error)' : 'var(--border-primary)'}`,
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
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
                        color: 'var(--text-muted)',
                        padding: '4px',
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff style={{ width: '18px', height: '18px' }} />
                      ) : (
                        <Eye style={{ width: '18px', height: '18px' }} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p style={{ fontSize: '12px', color: 'var(--error)', margin: '6px 0 0' }}>
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      height: '44px',
                      padding: '0 24px',
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save style={{ width: '16px', height: '16px' }} />
                        更新密码
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <Card style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Smartphone style={{ width: '24px', height: '24px', color: 'var(--text-secondary)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      登录设备管理
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      查看和管理已登录的设备
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--success-bg)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--success)',
                }}>
                  当前设备
                </span>
              </div>
            </Card>

            <Card style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <LogOut style={{ width: '24px', height: '24px', color: 'var(--error)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      退出所有设备
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      这将使所有已登录的设备需要重新登录
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogoutAll}
                  style={{
                    borderColor: 'var(--error)',
                    color: 'var(--error)',
                  }}
                >
                  退出所有设备
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
