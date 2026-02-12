import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Projector,
  Images,
  Clock,
  Award,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  overview: {
    totalProjects: number;
    totalAssets: number;
    totalGenerations: number;
    totalUsers: number;
  };
  trends: {
    projectsChange: number;
    assetsChange: number;
    generationsChange: number;
    usersChange: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  generationBreakdown: {
    images: number;
    videos: number;
    keyframes: number;
  };
  usageByDay: Array<{
    date: string;
    generations: number;
    assets: number;
  }>;
  topProjects: Array<{
    id: string;
    name: string;
    assetCount: number;
    lastActivity: string;
  }>;
}

interface DashboardProps {
  data?: DashboardStats;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function Dashboard({ data, onRefresh, onExport }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(data || {
    overview: {
      totalProjects: 12,
      totalAssets: 156,
      totalGenerations: 89,
      totalUsers: 5
    },
    trends: {
      projectsChange: 8.5,
      assetsChange: 12.3,
      generationsChange: -3.2,
      usersChange: 0
    },
    recentActivity: [],
    generationBreakdown: {
      images: 120,
      videos: 45,
      keyframes: 200
    },
    usageByDay: [],
    topProjects: []
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">数据概览</h1>
          <p className="text-gray-500 dark:text-gray-400">
            平台运营数据统计
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
          </select>
          <button
            onClick={onRefresh}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="总项目数"
          value={formatNumber(stats.overview.totalProjects)}
          change={stats.trends.projectsChange}
          icon={Projector}
          color="bg-blue-500"
        />
        <StatCard
          title="总素材数"
          value={formatNumber(stats.overview.totalAssets)}
          change={stats.trends.assetsChange}
          icon={Images}
          color="bg-green-500"
        />
        <StatCard
          title="总生成次数"
          value={formatNumber(stats.overview.totalGenerations)}
          change={stats.trends.generationsChange}
          icon={Zap}
          color="bg-purple-500"
        />
        <StatCard
          title="团队成员"
          value={stats.overview.totalUsers}
          change={stats.trends.usersChange}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">生成类型分布</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">图像生成</span>
                <span className="text-sm font-medium">{stats.generationBreakdown.images}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(stats.generationBreakdown.images / (stats.generationBreakdown.images + stats.generationBreakdown.videos + stats.generationBreakdown.keyframes)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">视频生成</span>
                <span className="text-sm font-medium">{stats.generationBreakdown.videos}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.generationBreakdown.videos / (stats.generationBreakdown.images + stats.generationBreakdown.videos + stats.generationBreakdown.keyframes)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">关键帧生成</span>
                <span className="text-sm font-medium">{stats.generationBreakdown.keyframes}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(stats.generationBreakdown.keyframes / (stats.generationBreakdown.images + stats.generationBreakdown.videos + stats.generationBreakdown.keyframes)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">使用趋势</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-32 flex items-end gap-1">
            {stats.usageByDay.slice(-14).map((day, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-500 rounded-t"
                style={{ height: `${(day.generations / Math.max(...stats.usageByDay.map(d => d.generations))) * 100}%` }}
                title={`${day.date}: ${day.generations}次生成`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>14天前</span>
            <span>今天</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">热门项目</h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.topProjects.slice(0, 5).map((project, i) => (
              <div key={project.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-gray-400">{project.assetCount} 个素材</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">最近活动</h3>
          <button className="text-sm text-blue-500 hover:text-blue-600">查看全部</button>
        </div>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">暂无活动记录</p>
        )}
      </div>
    </div>
  );
}

export function ProjectStats({ projectId }: { projectId: string }) {
  const [stats, setStats] = useState({
    totalShots: 0,
    completedShots: 0,
    totalDuration: 0,
    totalAssets: 0
  });

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-500">镜头总数</span>
        </div>
        <p className="text-2xl font-bold">{stats.totalShots}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-500">已完成</span>
        </div>
        <p className="text-2xl font-bold">{stats.completedShots}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-gray-500">总时长</span>
        </div>
        <p className="text-2xl font-bold">{stats.totalDuration}秒</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Images className="w-5 h-5 text-orange-500" />
          <span className="text-sm text-gray-500">素材数</span>
        </div>
        <p className="text-2xl font-bold">{stats.totalAssets}</p>
      </div>
    </div>
  );
}
