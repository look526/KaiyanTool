import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FolderKanban, FileText, Zap, Eye, Cpu, Activity, CheckCircle, Timer, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ label, value, icon: Icon, gradient, loading, subValue }: { label: string; value: string | number; icon: typeof Users; gradient: string; loading?: boolean; subValue?: string }) => {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid var(--border-primary)',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 14px ${gradient.includes('6366f1') ? 'rgba(99, 102, 241, 0.3)' : gradient.includes('06b6d4') ? 'rgba(6, 182, 212, 0.3)' : gradient.includes('10b981') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        }}>
          <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '4px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            {label}
          </div>
          {loading ? (
            <Loader2 style={{ width: '20px', height: '20px', color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'var(--text-primary)',
              }}>
                {value}
              </div>
              {subValue && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{subValue}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ChartBar = ({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{value}</span>
      </div>
      <div style={{
        height: '6px',
        background: 'var(--bg-hover)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: color,
          borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
};

const ModelUsageCard = ({ model }: { model: {
  id: string;
  name: string;
  type: string;
  provider: string;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  lastHourRequests: number;
  lastDayRequests: number;
  successRate: number;
  errorRate: number;
  totalCost: number;
  lastError?: string;
} }) => {
  const typeColors: Record<string, string> = {
    text: '#6366f1',
    image: '#06b6d4',
    video: '#f59e0b',
    audio: '#10b981',
    script: '#ef4444',
    novel: '#8b5cf6',
  };

  const color = typeColors[model.type] || '#6366f1';

  return (
    <div style={{
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid var(--border-primary)',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Cpu style={{ width: '20px', height: '20px', color }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{model.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{model.provider} · {model.type}</div>
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '8px',
          background: model.successRate >= 90 ? 'rgba(16, 185, 129, 0.15)' : model.successRate >= 70 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: model.successRate >= 90 ? '#10b981' : model.successRate >= 70 ? '#f59e0b' : '#ef4444',
          fontSize: '12px',
          fontWeight: '600',
          border: `1px solid ${model.successRate >= 90 ? 'rgba(16, 185, 129, 0.3)' : model.successRate >= 70 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}>
          {model.successRate.toFixed(0)}% 成功率
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{model.totalRequests}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>总请求</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>{model.successCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>成功</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>{model.failureCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>失败</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{model.averageResponseTime}ms</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>平均响应</div>
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>最近1小时: {model.lastHourRequests} 次</span>
        <span>最近24小时: {model.lastDayRequests} 次</span>
      </div>

      {model.lastError && (
        <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', fontSize: '12px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {model.lastError}
        </div>
      )}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState<{
    projects: number;
    collaborations: number;
    contributions: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    topProjects: Array<{
      id: string;
      name: string;
      role: string;
      assetCount: number;
    }>;
  } | null>(null);
  const [platformAnalytics, setPlatformAnalytics] = useState<{
    totals: {
      users: number;
      projects: number;
      assets: number;
      generations: number;
    };
    recentActivity: {
      dailyStats: Array<{
        date: string;
        projects: number;
        assets: number;
        generations: number;
      }>;
      topProjects: Array<{
        id: string;
        name: string;
        assetCount: number;
      }>;
    };
  } | null>(null);
  const [modelUsageStats, setModelUsageStats] = useState<{
    modelCount: number;
    models: Array<{
      id: string;
      name: string;
      type: string;
      provider: string;
      totalRequests: number;
      successCount: number;
      failureCount: number;
      averageResponseTime: number;
      lastHourRequests: number;
      lastDayRequests: number;
      successRate: number;
      errorRate: number;
      totalCost: number;
      lastError?: string;
    }>;
  } | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, platformData, modelData] = await Promise.all([
          apiClient.getUserAnalytics(),
          isAdmin ? apiClient.getPlatformAnalytics() : null,
          apiClient.getUsageStats(),
        ]);
        setUserAnalytics(userData);
        if (platformData) {
          setPlatformAnalytics(platformData);
        }
        setModelUsageStats(modelData as any);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const dailyStats = platformAnalytics?.recentActivity.dailyStats || [];
  const maxProjects = Math.max(...dailyStats.map(d => d.projects), 1);
  const maxAssets = Math.max(...dailyStats.map(d => d.assets), 1);

  const totalRequests = modelUsageStats?.models?.reduce((sum, m) => sum + m.totalRequests, 0) || 0;
  const totalSuccess = modelUsageStats?.models?.reduce((sum, m) => sum + m.successCount, 0) || 0;
  const totalFailures = modelUsageStats?.models?.reduce((sum, m) => sum + m.failureCount, 0) || 0;
  const avgResponseTime = modelUsageStats?.models?.length
    ? Math.round(modelUsageStats.models.reduce((sum, m) => sum + m.averageResponseTime, 0) / modelUsageStats.models.length)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            }}>
              <BarChart3 style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>分析中心</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>查看项目数据与使用统计</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <StatCard
            label="我的项目"
            value={userAnalytics?.projects ?? 0}
            icon={FolderKanban}
            gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
            loading={loading}
          />
          <StatCard
            label="参与协作"
            value={userAnalytics?.collaborations ?? 0}
            icon={Users}
            gradient="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
            loading={loading}
          />
          <StatCard
            label="本周贡献"
            value={userAnalytics?.contributions?.thisWeek ?? 0}
            icon={Zap}
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
            loading={loading}
          />
          <StatCard
            label="本月贡献"
            value={userAnalytics?.contributions?.thisMonth ?? 0}
            icon={TrendingUp}
            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
            loading={loading}
          />
        </div>

        {isAdmin && platformAnalytics && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye style={{ width: '18px', height: '18px', color: '#6366f1' }} />
              平台概览（管理员）
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}>
              <StatCard
                label="总用户数"
                value={platformAnalytics.totals.users}
                icon={Users}
                gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
              />
              <StatCard
                label="总项目数"
                value={platformAnalytics.totals.projects}
                icon={FolderKanban}
                gradient="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
              />
              <StatCard
                label="总资源数"
                value={platformAnalytics.totals.assets}
                icon={FileText}
                gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
              />
              <StatCard
                label="生成任务"
                value={platformAnalytics.totals.generations}
                icon={Zap}
                gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
              />
            </div>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu style={{ width: '18px', height: '18px', color: '#6366f1' }} />
            AI 模型使用统计
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <StatCard
              label="配置模型数"
              value={modelUsageStats?.modelCount ?? 0}
              icon={Cpu}
              gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
              loading={loading}
            />
            <StatCard
              label="总请求数"
              value={totalRequests}
              icon={Activity}
              gradient="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
              loading={loading}
              subValue={`成功 ${totalSuccess} / 失败 ${totalFailures}`}
            />
            <StatCard
              label="成功率"
              value={totalRequests > 0 ? `${((totalSuccess / totalRequests) * 100).toFixed(1)}%` : '0%'}
              icon={CheckCircle}
              gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
              loading={loading}
            />
            <StatCard
              label="平均响应时间"
              value={`${avgResponseTime}ms`}
              icon={Timer}
              gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
              loading={loading}
            />
          </div>

          {modelUsageStats?.models && modelUsageStats.models.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '16px',
            }}>
              {modelUsageStats.models
                .sort((a, b) => b.totalRequests - a.totalRequests)
                .map((model) => (
                  <ModelUsageCard key={model.id} model={model} />
                ))}
            </div>
          )}

          {modelUsageStats?.models && modelUsageStats.models.length === 0 && !loading && (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              borderRadius: '16px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-card)',
            }}>
              <Cpu style={{ width: '40px', height: '40px', color: 'var(--text-muted)', marginBottom: '12px' }} />
              <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                暂无模型使用记录
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                配置 AI 模型后，使用统计将在此显示
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '20px' }}>
          <div style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FolderKanban style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                我的项目
              </h3>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <Loader2 style={{ width: '28px', height: '28px', color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : userAnalytics?.topProjects && userAnalytics.topProjects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userAnalytics.topProjects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => window.location.href = `/projects/${project.id}`}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FolderKanban style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {project.role === 'owner' ? '所有者' : project.role === 'admin' ? '管理员' : project.role === 'editor' ? '编辑者' : '查看者'}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {project.assetCount} 资源
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                暂无项目
              </div>
            )}
          </div>

          {isAdmin && platformAnalytics && (
            <div style={{
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-card)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  近7日趋势
                </h3>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>新建项目</h4>
                {dailyStats.slice(-7).map((item) => (
                  <ChartBar
                    key={item.date}
                    label={item.date.slice(5)}
                    value={item.projects}
                    maxValue={maxProjects}
                    color="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  />
                ))}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>新增资源</h4>
                {dailyStats.slice(-7).map((item) => (
                  <ChartBar
                    key={item.date}
                    label={item.date.slice(5)}
                    value={item.assets}
                    maxValue={maxAssets}
                    color="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
