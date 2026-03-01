import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../core/api/client';
import { Users, FolderOpen, Image, LogIn, UserPlus, Upload, FileText, ArrowRight } from 'lucide-react';

interface Stats {
  users: number;
  projects: number;
  assets: number;
  todayLogins: number;
}

interface RecentLog {
  id: string;
  action: string;
  resource: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<{
          stats: Stats;
          recentLogs: RecentLog[];
        }>('/api/admin/auth/stats');
        setStats(response.stats);
        setRecentLogs(response.recentLogs);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const statCards = [
    {
      name: '用户总数',
      value: stats?.users || 0,
      icon: <Users size={24} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    },
    {
      name: '项目总数',
      value: stats?.projects || 0,
      icon: <FolderOpen size={24} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      name: '素材总数',
      value: stats?.assets || 0,
      icon: <Image size={24} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    },
    {
      name: '今日登录',
      value: stats?.todayLogins || 0,
      icon: <LogIn size={24} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  ];

  const quickActions = [
    {
      name: '添加用户',
      description: '创建新用户账户',
      icon: <UserPlus size={24} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      href: '/admin/users',
    },
    {
      name: '管理素材',
      description: '查看和管理上传素材',
      icon: <Upload size={24} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      href: '/admin/assets',
    },
    {
      name: '查看日志',
      description: '审计系统操作记录',
      icon: <FileText size={24} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      href: '/admin/logs',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '14px',
                borderRadius: '14px',
                background: stat.gradient,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '4px',
                }}>{stat.name}</p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1,
                }}>{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-primary)',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}>最近活动</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentLogs.length === 0 ? (
            <div style={{
              padding: '32px 24px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              暂无活动记录
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-tertiary)',
                }}>
                  <FileText size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {log.user?.name || '系统'} - {log.action}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    margin: 0,
                  }}>
                    {log.resource} · {new Date(log.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 24px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            <div style={{
              padding: '14px',
              borderRadius: '14px',
              background: action.gradient,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              {action.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '2px',
              }}>{action.name}</p>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}>{action.description}</p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
