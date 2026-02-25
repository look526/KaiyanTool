import { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Users, FolderKanban, FileText, Clock, Zap, Eye, ArrowUpRight, ArrowDownRight, Image, Video, Music, File, Loader2, Cpu, Activity, CheckCircle, XCircle, Timer, Coins } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ label, value, icon: Icon, gradient, trend, trendValue, loading, subValue }: { label: string; value: string | number; icon: typeof Users; gradient: string; trend?: 'up' | 'down'; trendValue?: string; loading?: boolean; subValue?: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: isHovered
          ? '0 16px 40px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          : '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: gradient,
        opacity: isHovered ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'rotate(360deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
        }}>
          <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)', 
            marginBottom: '6px', 
            fontWeight: '700', 
            letterSpacing: '0.8px', 
            textTransform: 'uppercase',
          }}>
            {label}
          </div>
          {loading ? (
            <Loader2 style={{ width: '24px', height: '24px', color: 'var(--text-secondary)', animation: 'spin 1s linear infinite' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: 'var(--text-primary)', 
                letterSpacing: '-0.02em',
              }}>
                {value}
              </span>
              {trend && trendValue && (
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: trend === 'up' ? 'var(--success)' : 'var(--error)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 8px',
                  borderRadius: '10px',
                  background: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                }}>
                  {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {trendValue}
                </span>
              )}
            </div>
          )}
          {subValue && !loading && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{subValue}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChartBar = ({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{value}</span>
      </div>
      <div style={{ 
        height: '8px', 
        background: 'rgba(99, 102, 241, 0.1)', 
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{ 
          height: '100%', 
          width: `${percentage}%`, 
          background: color,
          borderRadius: '4px',
          transition: 'width 0.5s ease',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
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
  const [isHovered, setIsHovered] = useState(false);
  
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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset' : '0 4px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
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
            boxShadow: `0 4px 12px ${color}40`,
          }}>
            <Cpu style={{ width: '20px', height: '20px', color }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{model.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{model.provider} · {model.type}</div>
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '8px',
          background: model.successRate >= 90 ? 'rgba(16, 185, 129, 0.1)' : model.successRate >= 70 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: model.successRate >= 90 ? '#10b981' : model.successRate >= 70 ? '#f59e0b' : '#ef4444',
          fontSize: '12px',
          fontWeight: '600',
          border: `1px solid ${model.successRate >= 90 ? 'rgba(16, 185, 129, 0.2)' : model.successRate >= 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
        }}>
          {model.successRate.toFixed(0)}% 成功率
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{model.totalRequests}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>总请求</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>{model.successCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>成功</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>{model.failureCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>失败</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{model.averageResponseTime}ms</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>平均响应</div>
        </div>
      </div>
      
      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
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
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(newParticles);
  }, []);

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
        console.log('User analytics data:', userData);
        console.log('Top projects:', userData?.topProjects);
        if (platformData) {
          setPlatformAnalytics(platformData);
        }
        setModelUsageStats(modelData);
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
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: var(--opacity); }
          50% { transform: translateY(-30px) translateX(10px); opacity: calc(var(--opacity) * 0.5); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cursor-glow {
          position: fixed;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: opacity 0.3s ease;
          z-index: 1;
          filter: blur(40px);
        }

        .background-decoration {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.4));
          border-radius: 50%;
          pointer-events: none;
          animation: particleFloat 8s ease-in-out infinite;
          --opacity: var(--p-opacity, 0.3);
        }
      `}</style>

      <div className="cursor-glow" style={{
        left: mousePosition.x,
        top: mousePosition.y,
      }}></div>

      <div className="background-decoration">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--p-opacity': p.opacity,
              animationDelay: `${p.id * 0.1}s`,
              animationDuration: `${8 / p.speed}s`,
            }}
          />
        ))}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 35%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'float 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float 15s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <header style={{
        height: '88px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
            position: 'relative',
          }}>
            <BarChart3 style={{ width: '28px', height: '28px', color: 'white' }} />
            <div style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              opacity: 0.3,
              filter: 'blur(8px)',
              zIndex: -1,
            }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              margin: 0,
              backgroundSize: '200% 200%',
              animation: 'gradientMove 8s ease infinite',
            }}>
              分析中心
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: '4px 0 0 0',
              fontWeight: '500',
            }}>
              查看项目数据与使用统计
            </p>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
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
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye style={{ width: '20px', height: '20px', color: '#6366f1' }} />
              平台概览（管理员）
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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

        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu style={{ width: '20px', height: '20px', color: '#6366f1' }} />
            AI 模型使用统计
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
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
              padding: '60px',
              textAlign: 'center',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              <Cpu style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                暂无模型使用记录
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                配置 AI 模型后，使用统计将在此显示
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '24px' }}>
          <div style={{
            padding: '28px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              }}>
                <FolderKanban style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                我的项目
              </h3>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : userAnalytics?.topProjects && userAnalytics.topProjects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userAnalytics.topProjects.map((project) => (
                  <div 
                    key={project.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => window.location.href = `/projects/${project.id}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FolderKanban style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {project.role === 'owner' ? '所有者' : project.role === 'admin' ? '管理员' : project.role === 'editor' ? '编辑者' : '查看者'}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {project.assetCount} 资源
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                暂无项目
              </div>
            )}
          </div>

          {isAdmin && platformAnalytics && (
            <div style={{
              padding: '28px',
              borderRadius: '24px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              background: 'rgba(99, 102, 241, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
                }}>
                  <TrendingUp style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  近7日趋势
                </h3>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>新建项目</h4>
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
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>新增资源</h4>
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
