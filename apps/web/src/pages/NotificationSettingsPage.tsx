import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  CheckCircle,
  Volume2,
  Smartphone,
  Clock,
} from 'lucide-react';
import { Card } from '../components/ui/card';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? 'var(--accent)' : 'var(--border-primary)',
        borderRadius: '13px',
        transition: '0.2s',
      }}>
        <span style={{
          position: 'absolute',
          content: '""',
          height: '20px',
          width: '20px',
          left: checked ? '26px' : '3px',
          bottom: '3px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: '0.2s',
        }}></span>
      </span>
    </label>
  );
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'project_updates', title: '项目更新', description: '当项目状态发生变化时通知我', enabled: true },
    { id: 'team_invites', title: '团队邀请', description: '当有新的团队邀请时通知我', enabled: true },
    { id: 'comments', title: '评论和回复', description: '当有人评论我的内容时通知我', enabled: true },
    { id: 'ai_completion', title: 'AI 任务完成', description: '当 AI 生成任务完成时通知我', enabled: false },
    { id: 'weekly_report', title: '周报', description: '每周发送项目进度摘要', enabled: false },
    { id: 'marketing', title: '产品更新', description: '接收新功能发布和更新通知', enabled: false },
  ]);

  const [emailDigest, setEmailDigest] = useState<'instant' | 'daily' | 'weekly' | 'never'>('daily');
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '08:00' });

  const handleToggle = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
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
              }}>通知设置</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                管理您的通知偏好
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                <Bell style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                通知类型
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: 'var(--bg-hover)',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>
                        {setting.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {setting.description}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={setting.enabled}
                      onChange={() => handleToggle(setting.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>

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
                <Mail style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                邮件摘要频率
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { value: 'instant', label: '即时', desc: '立即发送每条通知' },
                  { value: 'daily', label: '每日', desc: '每天汇总一次通知' },
                  { value: 'weekly', label: '每周', desc: '每周汇总一次通知' },
                  { value: 'never', label: '从不', desc: '不发送邮件通知' },
                ].map((option) => {
                  const isSelected = emailDigest === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setEmailDigest(option.value as any)}
                      style={{
                        padding: '16px',
                        backgroundColor: isSelected ? 'var(--accent-bg)' : 'var(--bg-surface)',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-primary)'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isSelected && <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />}
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {option.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        {option.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

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
                <Clock style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                免打扰时段
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--bg-hover)',
                borderRadius: '10px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Volume2 style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      启用免打扰
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      在指定时间段内静音通知
                    </div>
                  </div>
                </div>
                <ToggleSwitch
                  checked={quietHours.enabled}
                  onChange={(checked) => setQuietHours({ ...quietHours, enabled: checked })}
                />
              </div>

              {quietHours.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}>
                      开始时间
                    </label>
                    <input
                      type="time"
                      value={quietHours.start}
                      onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 12px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}>
                      结束时间
                    </label>
                    <input
                      type="time"
                      value={quietHours.end}
                      onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 12px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    浏览器推送通知
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    允许浏览器发送桌面推送通知
                  </div>
                </div>
                <button
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission();
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--accent)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  启用推送
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
