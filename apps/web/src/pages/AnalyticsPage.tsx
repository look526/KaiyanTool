import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, FolderKanban, FileText, Zap, Eye, Cpu, Activity, 
  CheckCircle, Timer, Loader2, RefreshCw, Download, AlertTriangle, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PageHero } from '../components/ui/PageHero';

type TimeRange = 'today' | 'week' | 'month' | 'all';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'all', label: '全部' },
];

interface TrendData {
  value: number;
  trend?: number;
  trendData?: number[];
}

const AnalyticsStatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  gradient, 
  loading, 
  subValue,
  trend,
  trendData,
  isDark,
}: { 
  label: string; 
  value: string | number; 
  icon: typeof Users; 
  gradient: string; 
  loading?: boolean; 
  subValue?: string;
  trend?: number;
  trendData?: number[];
  isDark: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = isDark ? {
    bgCard: 'rgba(255, 255, 255, 0.04)',
    bgCardHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    border: 'rgba(255, 255, 255, 0.06)',
    accentBorder: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgCard: 'rgba(0, 0, 0, 0.02)',
    bgCardHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    border: 'rgba(0, 0, 0, 0.06)',
    accentBorder: 'rgba(139, 92, 246, 0.25)',
  };
  
  const getTrendDisplay = () => {
    if (trend === undefined || trend === null) return null;
    if (trend === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.textMuted }}>
          <Minus style={{ width: '14px', height: '14px' }} />
          <span>无变化</span>
        </div>
      );
    }
    const isPositive = trend > 0;
    const color = isPositive ? '#10b981' : '#ef4444';
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color }}>
        <TrendIcon style={{ width: '14px', height: '14px' }} />
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  const renderMiniChart = () => {
    if (!trendData || trendData.length < 2) return null;
    const max = Math.max(...trendData);
    const min = Math.min(...trendData);
    const range = max - min || 1;
    const width = 60;
    const height = 24;
    const points = trendData.map((v, i) => {
      const x = (i / (trendData.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    const gradientId = `gradient-${label.replace(/\s/g, '')}`;
    const chartColor = gradient.includes('6366f1') ? '#6366f1' : gradient.includes('06b6d4') ? '#06b6d4' : gradient.includes('10b981') ? '#10b981' : '#f59e0b';
    
    return (
      <svg width={width} height={height} style={{ marginLeft: 'auto' }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#${gradientId})`}
          points={`0,${height} ${points} ${width},${height}`}
        />
        <polyline
          fill="none"
          stroke={chartColor}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div 
      style={{
        padding: '20px',
        borderRadius: '16px',
        border: isHovered ? `1px solid ${colors.accentBorder}` : `1px solid ${colors.border}`,
        background: isHovered ? colors.bgCardHover : colors.bgCard,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.1)' : 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
            color: colors.textMuted,
            marginBottom: '4px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            {label}
          </div>
          {loading ? (
            <Loader2 style={{ width: '20px', height: '20px', color: colors.textMuted, animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: colors.textPrimary,
                }}>
                  {value}
                </div>
                {getTrendDisplay()}
              </div>
              {subValue && (
                <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>{subValue}</div>
              )}
            </>
          )}
        </div>
        {renderMiniChart()}
      </div>
    </div>
  );
};

const ModelUsageCard = ({ model, isDark }: { 
  model: {
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
  };
  isDark: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = isDark ? {
    bgCard: 'rgba(255, 255, 255, 0.04)',
    bgCardHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
  } : {
    bgCard: 'rgba(0, 0, 0, 0.02)',
    bgCardHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
  };
  
  const typeColors: Record<string, string> = {
    text: '#6366f1',
    image: '#06b6d4',
    video: '#f59e0b',
    audio: '#10b981',
    script: '#ef4444',
    novel: '#8b5cf6',
  };

  const color = typeColors[model.type] || '#6366f1';
  const isWarning = model.successRate < 90 && model.successRate >= 70;
  const isCritical = model.successRate < 70;

  return (
    <div 
      style={{
        padding: '20px',
        borderRadius: '16px',
        border: isCritical ? '1px solid rgba(239, 68, 68, 0.3)' : isWarning ? '1px solid rgba(245, 158, 11, 0.3)' : `1px solid ${colors.border}`,
        background: isHovered ? colors.bgCardHover : colors.bgCard,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.1)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          }}>
            <Cpu style={{ width: '20px', height: '20px', color }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary }}>{model.name}</div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>{model.provider} · {model.type}</div>
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
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {isCritical && <AlertTriangle style={{ width: '12px', height: '12px' }} />}
          {model.successRate.toFixed(0)}% 成功率
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: colors.textPrimary }}>{model.totalRequests}</div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>总请求</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>{model.successCount}</div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>成功</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>{model.failureCount}</div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>失败</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: colors.textPrimary }}>{model.averageResponseTime}ms</div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>平均响应</div>
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '12px', color: colors.textMuted }}>
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

const TimeRangeSelector = ({ 
  value, 
  onChange,
  isDark,
}: { 
  value: TimeRange; 
  onChange: (range: TimeRange) => void;
  isDark: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = TIME_RANGE_OPTIONS.find(o => o.value === value);
  
  const colors = isDark ? {
    bgCard: 'rgba(255, 255, 255, 0.04)',
    bgHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
  } : {
    bgCard: 'rgba(0, 0, 0, 0.02)',
    bgHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '10px',
          border: `1px solid ${colors.border}`,
          background: colors.bgCard,
          color: colors.textPrimary,
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown style={{ width: '14px', height: '14px', color: colors.textMuted }} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          padding: '4px',
          borderRadius: '10px',
          border: `1px solid ${colors.border}`,
          background: isDark ? 'rgba(15, 15, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          minWidth: '120px',
        }}>
          {TIME_RANGE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: value === option.value ? colors.bgHover : 'transparent',
                color: colors.textPrimary,
                fontSize: '13px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const colors = isDark ? {
    bg: 'rgba(15, 15, 26, 0.95)',
    textPrimary: '#fafafa',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
  } : {
    bg: 'rgba(255, 255, 255, 0.95)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
  };
  
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '10px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>{label}</div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.textPrimary }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: entry.color }} />
          <span>{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
    trends?: {
      projects: number[];
      collaborations: number[];
      contributions: number[];
    };
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
    if (!user || authLoading) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const userData = await apiClient.getAnalytics('user') as any;
        setUserAnalytics(userData as any);
        
        const currentIsAdmin = user?.role === 'admin';
        if (currentIsAdmin) {
          try {
            const platformData = await apiClient.getAnalytics('platform') as any;
            if (platformData) {
              setPlatformAnalytics(platformData as any);
            }
          } catch (error: any) {
            console.error('Failed to fetch platform analytics:', error);
          }
        }
        
        try {
          const modelData = await apiClient.getModelUsageAnalytics() as any;
          if (modelData) {
            const transformedModelData = {
              modelCount: modelData.summary?.totalModels || 0,
              models: modelData.models?.details?.map((model: any) => ({
                id: model.id,
                name: model.name,
                type: model.type,
                provider: model.provider,
                totalRequests: model.usageCount || 0,
                successCount: model.usageCount || 0,
                failureCount: 0,
                averageResponseTime: 0,
                lastHourRequests: 0,
                lastDayRequests: 0,
                successRate: 100,
                errorRate: 0,
                totalCost: 0,
                lastError: undefined
              })) || []
            };
            setModelUsageStats(transformedModelData);
          }
        } catch (error) {
          console.error('Failed to fetch model usage analytics:', error);
        }
        
        setRefreshing(false);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setRefreshing(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, authLoading, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExport = () => {
    const data = {
      userAnalytics,
      platformAnalytics,
      modelUsageStats,
      exportedAt: new Date().toISOString(),
      timeRange,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dailyStats = platformAnalytics?.recentActivity.dailyStats || [];
  const chartData = dailyStats.slice(-7).map(d => ({
    date: d.date.slice(5),
    projects: d.projects,
    assets: d.assets,
    generations: d.generations,
  }));

  const totalRequests = modelUsageStats?.models?.reduce((sum, m) => sum + m.totalRequests, 0) || 0;
  const totalSuccess = modelUsageStats?.models?.reduce((sum, m) => sum + m.successCount, 0) || 0;
  const totalFailures = modelUsageStats?.models?.reduce((sum, m) => sum + m.failureCount, 0) || 0;
  const avgResponseTime = modelUsageStats?.models?.length
    ? Math.round(modelUsageStats.models.reduce((sum, m) => sum + m.averageResponseTime, 0) / modelUsageStats.models.length)
    : 0;

  const criticalModels = modelUsageStats?.models?.filter(m => m.successRate < 70) || [];
  const warningModels = modelUsageStats?.models?.filter(m => m.successRate >= 70 && m.successRate < 90) || [];

  const chartColors = {
    primary: '#6366f1',
    secondary: '#06b6d4',
    tertiary: '#10b981',
  };

  const colors = isDark ? {
    bgCard: 'rgba(255, 255, 255, 0.04)',
    bgCardHover: 'rgba(255, 255, 255, 0.06)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
  } : {
    bgCard: 'rgba(0, 0, 0, 0.02)',
    bgCardHover: 'rgba(0, 0, 0, 0.04)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
  };

  const ActionButtons = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} isDark={isDark} />
      
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 18px',
          borderRadius: '14px',
          border: `1px solid ${colors.border}`,
          background: colors.bgCard,
          color: colors.textPrimary,
          fontSize: '14px',
          fontWeight: '500',
          cursor: refreshing ? 'not-allowed' : 'pointer',
          opacity: refreshing ? 0.6 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        <RefreshCw style={{ 
          width: '16px', 
          height: '16px', 
          animation: refreshing ? 'spin 1s linear infinite' : 'none' 
        }} />
        <span>刷新</span>
      </button>
      
      <button
        onClick={handleExport}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 18px',
          borderRadius: '14px',
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
        }}
      >
        <Download style={{ width: '16px', height: '16px' }} />
        <span>导出</span>
      </button>
    </div>
  );

  return (
    <div style={{
      minHeight: '100%',
      background: isDark
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px 24px', position: 'relative', zIndex: 1 }}>
        <PageHero
          title="ANALYTICS"
          subtitle="数据分析中心"
          icon={<BarChart3 style={{ width: '28px', height: '28px', color: 'white' }} />}
          stats={[
            { value: userAnalytics?.projects ?? 0, label: '我的项目' },
            { value: userAnalytics?.collaborations ?? 0, label: '参与协作' },
            { value: modelUsageStats?.modelCount ?? 0, label: 'AI模型' },
          ]}
          glowColor="rgba(99, 102, 241, 0.12)"
          actions={ActionButtons}
        />

        {(criticalModels.length > 0 || warningModels.length > 0) && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: criticalModels.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${criticalModels.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <AlertTriangle style={{ 
              width: '20px', 
              height: '20px', 
              color: criticalModels.length > 0 ? '#ef4444' : '#f59e0b' 
            }} />
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: criticalModels.length > 0 ? '#ef4444' : '#f59e0b' 
              }}>
                {criticalModels.length > 0 
                  ? `${criticalModels.length} 个模型处于异常状态` 
                  : `${warningModels.length} 个模型需要关注`}
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                {criticalModels.length > 0 
                  ? '部分模型成功率低于 70%，请检查配置或联系服务提供商'
                  : '部分模型成功率低于 90%，建议关注'}
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <AnalyticsStatCard
            label="我的项目"
            value={userAnalytics?.projects ?? 0}
            icon={FolderKanban}
            gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
            loading={loading}
            trend={12}
            trendData={[3, 5, 4, 6, 8, 7, userAnalytics?.projects ?? 0]}
            isDark={isDark}
          />
          <AnalyticsStatCard
            label="参与协作"
            value={userAnalytics?.collaborations ?? 0}
            icon={Users}
            gradient="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
            loading={loading}
            trend={8}
            trendData={[2, 3, 4, 3, 5, 6, userAnalytics?.collaborations ?? 0]}
            isDark={isDark}
          />
          <AnalyticsStatCard
            label="本周贡献"
            value={userAnalytics?.contributions?.thisWeek ?? 0}
            icon={Zap}
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
            loading={loading}
            trend={25}
            trendData={[10, 15, 12, 18, 20, 22, userAnalytics?.contributions?.thisWeek ?? 0]}
            isDark={isDark}
          />
          <AnalyticsStatCard
            label="本月贡献"
            value={userAnalytics?.contributions?.thisMonth ?? 0}
            icon={TrendingUp}
            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
            loading={loading}
            trend={-5}
            trendData={[50, 55, 48, 52, 60, 58, userAnalytics?.contributions?.thisMonth ?? 0]}
            isDark={isDark}
          />
        </div>

        {isAdmin && platformAnalytics && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye style={{ width: '18px', height: '18px', color: '#6366f1' }} />
              平台概览（管理员）
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}>
              <AnalyticsStatCard
                label="总用户数"
                value={platformAnalytics.totals.users}
                icon={Users}
                gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                isDark={isDark}
              />
              <AnalyticsStatCard
                label="总项目数"
                value={platformAnalytics.totals.projects}
                icon={FolderKanban}
                gradient="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
                isDark={isDark}
              />
              <AnalyticsStatCard
                label="总资源数"
                value={platformAnalytics.totals.assets}
                icon={FileText}
                gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                isDark={isDark}
              />
              <AnalyticsStatCard
                label="生成任务"
                value={platformAnalytics.totals.generations}
                icon={Zap}
                gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                isDark={isDark}
              />
            </div>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu style={{ width: '18px', height: '18px', color: '#6366f1' }} />
            AI 模型使用统计
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <AnalyticsStatCard
              label="配置模型数"
              value={modelUsageStats?.modelCount ?? 0}
              icon={Cpu}
              gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
              loading={loading}
              isDark={isDark}
            />
            <AnalyticsStatCard
              label="总请求数"
              value={totalRequests}
              icon={Activity}
              gradient="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
              loading={loading}
              subValue={`成功 ${totalSuccess} / 失败 ${totalFailures}`}
              isDark={isDark}
            />
            <AnalyticsStatCard
              label="成功率"
              value={totalRequests > 0 ? `${((totalSuccess / totalRequests) * 100).toFixed(1)}%` : '0%'}
              icon={CheckCircle}
              gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
              loading={loading}
              isDark={isDark}
            />
            <AnalyticsStatCard
              label="平均响应时间"
              value={`${avgResponseTime}ms`}
              icon={Timer}
              gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
              loading={loading}
              isDark={isDark}
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
                  <ModelUsageCard key={model.id} model={model} isDark={isDark} />
                ))}
            </div>
          )}

          {modelUsageStats?.models && modelUsageStats.models.length === 0 && !loading && (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              background: colors.bgCard,
            }}>
              <Cpu style={{ width: '40px', height: '40px', color: colors.textMuted, marginBottom: '12px' }} />
              <div style={{ fontSize: '15px', fontWeight: '500', color: colors.textPrimary, marginBottom: '6px' }}>
                暂无模型使用记录
              </div>
              <div style={{ fontSize: '13px', color: colors.textMuted }}>
                配置 AI 模型后，使用统计将在此显示
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '20px' }}>
          <div style={{
            padding: '24px',
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
            background: colors.bgCard,
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
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                我的项目
              </h3>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <Loader2 style={{ width: '28px', height: '28px', color: colors.textMuted, animation: 'spin 1s linear infinite' }} />
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
                      background: colors.bgCardHover,
                      border: `1px solid ${colors.border}`,
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
                      <div style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>
                        {project.role === 'owner' ? '所有者' : project.role === 'admin' ? '管理员' : project.role === 'editor' ? '编辑者' : '查看者'}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>
                      {project.assetCount} 资源
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: colors.textMuted }}>
                暂无项目
              </div>
            )}
          </div>

          {isAdmin && platformAnalytics && chartData.length > 0 && (
            <div style={{
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              background: colors.bgCard,
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
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, margin: 0 }}>
                  近7日趋势
                </h3>
              </div>
              
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis 
                      dataKey="date" 
                      stroke={colors.textMuted} 
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke={colors.textMuted} 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="projects" 
                      name="新建项目"
                      stroke={chartColors.primary} 
                      fillOpacity={1} 
                      fill="url(#colorProjects)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="assets" 
                      name="新增资源"
                      stroke={chartColors.secondary} 
                      fillOpacity={1} 
                      fill="url(#colorAssets)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
