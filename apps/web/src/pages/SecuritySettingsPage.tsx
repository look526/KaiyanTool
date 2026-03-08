import React, { useState } from 'react';
import {
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
  ArrowLeft,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiClient } from '../lib/api-client';
import { uiConfig } from '../config';

export default function SecuritySettingsPage() {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backHovered, setBackHovered] = useState(false);
  const [saveHover, setSaveHover] = useState(false);
  const [logoutAllHover, setLogoutAllHover] = useState(false);
  const [passwordHover, setPasswordHover] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = '请输入当前密码';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = '请输入新密码';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = '密码长度至少为8位';
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
      errors.newPassword = '密码需要包含至少一个大写字母';
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
      errors.newPassword = '密码需要包含至少一个数字';
    }

    if (!passwordForm.confirmPassword.trim()) {
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
      setTimeout(() => setSuccess(null), uiConfig.successMessageDuration);
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
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <header style={{
          height: '80px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          backgroundColor: isDark ? 'rgba(5, 5, 10, 0.95)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(40px)',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <button
            onClick={() => window.history.back()}
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              background: backHovered
                ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
                : isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${backHovered ? 'rgba(139, 92, 246, 0.4)' : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              borderRadius: '14px',
              color: backHovered ? '#ffffff' : isDark ? '#fafafa' : '#18181b',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: backHovered ? '0 8px 24px rgba(139, 92, 246, 0.4)' : 'none',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            返回
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: isDark ? '#fafafa' : '#18181b',
                margin: '0 0 4px 0',
              }}>安全设置</h1>
              <div style={{ fontSize: '13px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }}>
                管理您的账户安全和隐私设置
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {error && (
              <div style={{
                marginBottom: '28px',
                padding: '16px 20px',
                background: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                border: '1px solid #ef4444',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#ef4444',
                backdropFilter: 'blur(20px)',
              }}>
                <AlertCircle style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {success && (
              <div style={{
                marginBottom: '28px',
                padding: '16px 20px',
                background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                border: '1px solid #10b981',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#10b981',
                backdropFilter: 'blur(20px)',
              }}>
                <CheckCircle style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{success}</span>
              </div>
            )}

            <div style={{
              padding: '40px',
              marginBottom: '32px',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              borderRadius: '28px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '32px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Lock style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: isDark ? '#fafafa' : '#18181b',
                      margin: '0 0 4px 0',
                    }}>修改密码</h2>
                    <div style={{ fontSize: '13px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }}>
                      定期更新密码以保护账户安全
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDark ? '#fafafa' : '#18181b',
                      marginBottom: '10px',
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
                          height: '52px',
                          padding: '0 56px 0 20px',
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${passwordErrors.currentPassword ? '#ef4444' : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                          borderRadius: '16px',
                          color: isDark ? '#fafafa' : '#18181b',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.25s ease',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
                          padding: '6px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {showCurrentPassword ? (
                          <EyeOff style={{ width: '20px', height: '20px' }} />
                        ) : (
                          <Eye style={{ width: '20px', height: '20px' }} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p style={{ fontSize: '13px', color: '#ef4444', margin: '8px 0 0', fontWeight: 500 }}>
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDark ? '#fafafa' : '#18181b',
                      marginBottom: '10px',
                    }}>
                      新密码
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="输入新密码（至少8位，包含大写字母和数字）"
                        style={{
                          width: '100%',
                          height: '52px',
                          padding: '0 56px 0 20px',
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${passwordErrors.newPassword ? '#ef4444' : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                          borderRadius: '16px',
                          color: isDark ? '#fafafa' : '#18181b',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.25s ease',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
                          padding: '6px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {showNewPassword ? (
                          <EyeOff style={{ width: '20px', height: '20px' }} />
                        ) : (
                          <Eye style={{ width: '20px', height: '20px' }} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p style={{ fontSize: '13px', color: '#ef4444', margin: '8px 0 0', fontWeight: 500 }}>
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDark ? '#fafafa' : '#18181b',
                      marginBottom: '10px',
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
                          height: '52px',
                          padding: '0 56px 0 20px',
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${passwordErrors.confirmPassword ? '#ef4444' : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                          borderRadius: '16px',
                          color: isDark ? '#fafafa' : '#18181b',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.25s ease',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
                          padding: '6px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff style={{ width: '20px', height: '20px' }} />
                        ) : (
                          <Eye style={{ width: '20px', height: '20px' }} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p style={{ fontSize: '13px', color: '#ef4444', margin: '8px 0 0', fontWeight: 500 }}>
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        height: '48px',
                        padding: '0 28px',
                        background: saving
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : saveHover
                            ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)'
                            : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                        boxShadow: saveHover
                          ? '0 12px 40px rgba(139, 92, 246, 0.5)'
                          : '0 8px 32px rgba(139, 92, 246, 0.4)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={() => setSaveHover(true)}
                      onMouseLeave={() => setSaveHover(false)}
                    >
                      {saving ? (
                        <>
                          <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save style={{ width: '18px', height: '18px' }} />
                          更新密码
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}>
              <div style={{
                padding: '32px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                borderRadius: '24px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-60px',
                  right: '-60px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <Smartphone style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#fafafa' : '#18181b', marginBottom: '4px' }}>
                      登录设备
                    </div>
                    <div style={{ fontSize: '13px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }}>
                      查看和管理已登录的设备
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#10b981',
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px' }} />
                    当前设备
                  </div>
                </div>
              </div>

              <div style={{
                padding: '32px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'}`,
                borderRadius: '24px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-60px',
                  right: '-60px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <LogOut style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#fafafa' : '#18181b', marginBottom: '4px' }}>
                      退出所有设备
                    </div>
                    <div style={{ fontSize: '13px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }}>
                      这将使所有已登录的设备需要重新登录
                    </div>
                  </div>
                  <button
                    onClick={handleLogoutAll}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '14px',
                      border: logoutAllHover ? '1px solid #ef4444' : isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                      background: logoutAllHover ? 'rgba(239, 68, 68, 0.12)' : isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={() => setLogoutAllHover(true)}
                    onMouseLeave={() => setLogoutAllHover(false)}
                  >
                    <RefreshCw style={{ width: '16px', height: '16px' }} />
                    退出所有设备
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '32px',
              padding: '28px 32px',
              background: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.04)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)'}`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Fingerprint style={{ width: '24px', height: '24px', color: '#ffffff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? '#fafafa' : '#18181b', marginBottom: '6px' }}>
                  安全提示
                </div>
                <div style={{ fontSize: '13px', color: isDark ? 'rgba(250, 250, 250, 0.7)' : 'rgba(24, 24, 27, 0.7)', lineHeight: '1.6' }}>
                  定期更新密码、启用两步验证可以提高账户安全性。如发现任何可疑活动，请立即退出所有设备并修改密码。
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
