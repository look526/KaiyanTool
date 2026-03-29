import React, { useState } from 'react';
import { Bell, Mail, CheckCircle, Volume2, Smartphone, Clock } from 'lucide-react';
import { SettingsLayout, SettingsCard, SettingsSection } from '../components/ui/SettingsLayout';

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
        top: '3px',
        left: checked ? '26px' : '3px',
        width: '20px',
        height: '20px',
        backgroundColor: 'white',
        borderRadius: '50%',
        transition: '0.2s',
      }}></span>
      </span>
    </label>
  );
};

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationSettingsPage() {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [pushHovered, setPushHovered] = useState(false);

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
    <SettingsLayout
      title="通知设置"
      subtitle="管理您的通知偏好"
      backHref="/settings"
    >
      <SettingsCard style={{ marginBottom: '24px' }}>
        <SettingsSection
          title="通知类型"
          icon={<Bell size={18} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {settings.map((setting) => (
              <div
                key={setting.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
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
        </SettingsSection>
      </SettingsCard>

      <SettingsCard style={{ marginBottom: '24px' }}>
        <SettingsSection
          title="邮件摘要频率"
          icon={<Mail size={18} />}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { value: 'instant', label: '即时', desc: '立即发送每条通知' },
              { value: 'daily', label: '每日', desc: '每天汇总一次通知' },
              { value: 'weekly', label: '每周', desc: '每周汇总一次通知' },
              { value: 'never', label: '从不', desc: '不发送邮件通知' },
            ].map((option) => {
              const isSelected = emailDigest === option.value;
              const isHovered = hoveredOption === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setEmailDigest(option.value as any)}
                  onMouseEnter={() => setHoveredOption(option.value)}
                  onMouseLeave={() => setHoveredOption(null)}
                  style={{
                    padding: '16px',
                    backgroundColor: isSelected
                      ? 'var(--accent-bg)'
                      : isHovered
                        ? 'var(--bg-hover)'
                        : 'transparent',
                    border: `2px solid ${isSelected ? 'var(--accent)' : isHovered ? 'var(--border-hover)' : 'var(--border-primary)'}`,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isSelected && <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />}
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
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
        </SettingsSection>
      </SettingsCard>

      <SettingsCard style={{ marginBottom: '24px' }}>
        <SettingsSection
          title="免打扰时段"
          icon={<Clock size={18} />}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Volume2 style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
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
                  fontWeight: 500,
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
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.25s ease',
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
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
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    transition: 'all 0.25s ease',
                  }}
                />
              </div>
            </div>
          )}
        </SettingsSection>
      </SettingsCard>

      <SettingsCard>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Smartphone style={{ width: '24px', height: '24px', color: '#ffffff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
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
            onMouseEnter={() => setPushHovered(true)}
            onMouseLeave={() => setPushHovered(false)}
            style={{
              padding: '12px 24px',
              background: pushHovered
                ? 'linear-gradient(135deg, var(--accent-light) 0%, var(--accent-glow) 100%)'
                : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: pushHovered
                ? '0 12px 32px rgba(139, 92, 246, 0.5)'
                : '0 8px 24px rgba(139, 92, 246, 0.4)',
            }}
          >
            启用推送
          </button>
        </div>
      </SettingsCard>
    </SettingsLayout>
  );
}