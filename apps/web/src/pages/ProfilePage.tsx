import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';
import { uiConfig } from '../config';
import { SettingsLayout, SettingsCard, SettingsSection } from '../components/ui/SettingsLayout';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar_url: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await apiClient.updateProfile({
        name: formData.name,
        avatar_url: formData.avatar_url,
        bio: formData.bio,
      });
      setSuccess('个人资料已更新');
      setTimeout(() => setSuccess(null), uiConfig.successMessageDuration);
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setLoading(true);
          const result = await apiClient.uploadAvatar(file);
          setFormData(prev => ({ ...prev, avatar_url: result.url }));
        } catch (err) {
          setError('上传头像失败');
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  return (
    <SettingsLayout
      title="个人资料"
      subtitle="管理您的账户信息"
      backHref="/settings"
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            background: saving
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
            opacity: saving ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.3)';
            }
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
              保存更改
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
          title="基本信息"
          icon={<User size={18} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '3px solid var(--border-primary)',
                }}>
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="头像"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User style={{ width: '40px', height: '40px', color: 'var(--text-muted)' }} />
                  )}
                </div>
                <button
                  onClick={handleAvatarChange}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    border: '3px solid var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: 'white',
                    opacity: loading ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Camera style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  更换头像
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  支持 JPG、PNG 格式，建议尺寸 200x200 像素
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>
                  用户名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入用户名"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 14px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>
                  邮箱地址
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '42px',
                  padding: '0 14px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                }}>
                  <Mail style={{ width: '16px', height: '16px', marginRight: '10px', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formData.email}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  邮箱地址不可修改
                </div>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}>
                个人简介
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="介绍一下自己..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              />
            </div>
          </div>
        </SettingsSection>
      </SettingsCard>

      <SettingsCard>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Calendar style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                账户创建时间
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : '未知'}
              </div>
            </div>
          </div>
          <div style={{
            padding: '6px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#10b981',
          }}>
            活跃账户
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