import React, { useState } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  CheckCircle,
  Volume2,
  Smartphone,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [backHovered, setBackHovered] = useState(false);
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
          height: '72px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          backgroundColor: isDark ? 'rgba(5, 5, 10, 0.95)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(40px)',
          padding: '0 32px',
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
              gap: '8px',
              padding: '8px 16px',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${backHovered ? 'rgba(139, 92, 246, 0.25)' : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              borderRadius: '12px',
              color: isDark ? '#fafafa' : '#18181b',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            返回
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: isDark ? '#fafafa' : '#18181b',
                margin: '0 0 4px 0',
              }}>通知设置</h1>
              <div style={{ fontSize: '12px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }}>
                管理您的通知偏好
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              padding: '32px',
              marginBottom: '24px',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              borderRadius: '24px',
            }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Bell style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
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
                      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: '18px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: isDark ? '#fafafa' : '#18181b' }}>
                        {setting.title}
                      </div>
                      <div style={{ fontSize: '13px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)', marginTop: '4px' }}>
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
            </div>

            <div style={{
              padding: '32px',
              marginBottom: '24px',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              borderRadius: '24px',
            }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Mail style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
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
                          ? 'rgba(139, 92, 246, 0.12)'
                          : isHovered
                            ? isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'
                            : isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                        border: `2px solid ${isSelected ? '#8b5cf6' : isHovered ? 'rgba(139, 92, 246, 0.25)' : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                        borderRadius: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.25s ease',
                        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isSelected && <CheckCircle style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />}
                        <span style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#fafafa' : '#18181b' }}>
                          {option.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)', marginTop: '6px' }}>
                        {option.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{
              padding: '32px',
              marginBottom: '24px',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              borderRadius: '24px',
            }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDark ? '#fafafa' : '#18181b',
                margin: '0 0 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Clock style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                免打扰时段
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '18px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Volume2 style={{ width: '20px', height: '20px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#fafafa' : '#18181b' }}>
                      启用免打扰
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }}>
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
                      color: isDark ? '#fafafa' : '#18181b',
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
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                        borderRadius: '14px',
                        color: isDark ? '#fafafa' : '#18181b',
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
                      color: isDark ? '#fafafa' : '#18181b',
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
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                        borderRadius: '14px',
                        color: isDark ? '#fafafa' : '#18181b',
                        fontSize: '14px',
                        transition: 'all 0.25s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{
              padding: '24px',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              borderRadius: '24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Smartphone style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#fafafa' : '#18181b' }}>
                    浏览器推送通知
                  </div>
                  <div style={{ fontSize: '13px', color: isDark ? 'rgba(250, 250, 250, 0.6)' : 'rgba(24, 24, 27, 0.6)' }}>
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
                      ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
