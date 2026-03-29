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
  Smartphone,
  LogOut,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';
import { uiConfig } from '../config';
import { SettingsLayout, SettingsCard, SettingsSection } from '../components/ui/SettingsLayout';

export default function SecuritySettingsPage() {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveHover, setSaveHover] = useState(false);
  const [logoutAllHover, setLogoutAllHover] = useState(false);

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
    <SettingsLayout
      title="安全设置"
      subtitle="管理您的账户安全和隐私设置"
      backHref="/settings"
      actions={
        <button
          onClick={handlePasswordChange}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '40px',
            padding: '0 20px',
            background: saving
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : saveHover
                ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)'
                : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
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
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              保存中...
            </>
          ) : (
            <>
              <Save style={{ width: '16px', height: '16px' }} />
              更新密码
            </>
          )}
        </button>
      }
    >
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#ef4444',
          fontSize: '14px',
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#10b981',
          fontSize: '14px',
        }}>
          <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          {success}
        </div>
      )}

      <SettingsCard style={{ marginBottom: '24px' }}>
        <SettingsSection
          title="修改密码"
          description="定期更新密码以保护账户安全"
          icon={<Lock size={18} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
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
                    height: '44px',
                    padding: '0 48px 0 16px',
                    background: 'var(--bg-input)',
                    border: `1px solid ${passwordErrors.currentPassword ? '#ef4444' : 'var(--border-primary)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.25s ease',
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
                  {showCurrentPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0', fontWeight: 500 }}>
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
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
                  placeholder="输入新密码（至少8位，包含大写字母和数字）"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 48px 0 16px',
                    background: 'var(--bg-input)',
                    border: `1px solid ${passwordErrors.newPassword ? '#ef4444' : 'var(--border-primary)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.25s ease',
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
                  {showNewPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0', fontWeight: 500 }}>
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
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
                    height: '44px',
                    padding: '0 48px 0 16px',
                    background: 'var(--bg-input)',
                    border: `1px solid ${passwordErrors.confirmPassword ? '#ef4444' : 'var(--border-primary)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.25s ease',
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
                  {showConfirmPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0', fontWeight: 500 }}>
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </SettingsSection>
      </SettingsCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <SettingsCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Smartphone style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                登录设备
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                查看和管理已登录的设备
              </div>
            </div>
            <div style={{
              padding: '6px 12px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#10b981',
            }}>
              当前设备
            </div>
          </div>
        </SettingsCard>

        <SettingsCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LogOut style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                退出所有设备
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                这将使所有已登录的设备需要重新登录
              </div>
            </div>
            <button
              onClick={handleLogoutAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: logoutAllHover ? '1px solid #ef4444' : '1px solid var(--border-primary)',
                background: logoutAllHover ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={() => setLogoutAllHover(true)}
              onMouseLeave={() => setLogoutAllHover(false)}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              退出所有设备
            </button>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Fingerprint style={{ width: '22px', height: '22px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              安全提示
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              定期更新密码、启用两步验证可以提高账户安全性。如发现任何可疑活动，请立即退出所有设备并修改密码。
            </div>
          </div>
        </div>
      </SettingsCard>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </SettingsLayout>
  );
}