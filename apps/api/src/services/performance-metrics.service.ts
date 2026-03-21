import logger from '../lib/logger';

export interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
  unit?: string;
}

export interface SessionMetrics {
  session_id: string;
  project_id: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  features_attempted: number;
  features_completed: number;
  features_failed: number;
  success_rate: number;
  tools_used: string[];
  iterations: number;
  cache_hits: number;
  cache_misses: number;
  cache_hit_rate: number;
  error_count: number;
  average_response_time_ms: number;
  peak_memory_mb?: number;
  tokens_used?: number;
  cost_estimate_usd?: number;
}

export interface AgentMetrics {
  agent_name: string;
  total_sessions: number;
  successful_sessions: number;
  failed_sessions: number;
  average_session_duration_ms: number;
  average_features_per_session: number;
  total_features_completed: number;
  total_features_attempted: number;
  overall_success_rate: number;
  average_cache_hit_rate: number;
  total_cost_usd: number;
  average_cost_per_session_usd: number;
}

export interface PerformanceAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'performance' | 'reliability' | 'cost' | 'quality';
  message: string;
  metric_name: string;
  current_value: number;
  threshold: number;
  timestamp: string;
  recommendations?: string[];
}

export class PerformanceMetricsService {
  private metrics: Map<string, MetricData[]> = new Map();
  private sessionMetrics: Map<string, SessionMetrics> = new Map();
  private agentMetrics: Map<string, AgentMetrics> = new Map();
  private alerts: PerformanceAlert[] = [];

  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      unit,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricHistory = this.metrics.get(name)!;
    metricHistory.push(metric);

    if (metricHistory.length > 1000) {
      this.metrics.set(name, metricHistory.slice(-1000));
    }

    this.checkForAlerts(metric);
  }

  recordSessionMetrics(sessionMetrics: SessionMetrics): void {
    const sessionKey = this.getSessionKey(sessionMetrics.project_id, sessionMetrics.session_id);
    
    sessionMetrics.success_rate =
      sessionMetrics.features_attempted > 0
        ? (sessionMetrics.features_completed / sessionMetrics.features_attempted) * 100
        : 0;

    sessionMetrics.cache_hit_rate =
      sessionMetrics.cache_hits + sessionMetrics.cache_misses > 0
        ? (sessionMetrics.cache_hits /
          (sessionMetrics.cache_hits + sessionMetrics.cache_misses)) * 100
        : 0;

    this.sessionMetrics.set(sessionKey, sessionMetrics);
    this.updateAgentMetrics(sessionMetrics);

    logger.info('Session metrics recorded', {
      session_id: sessionMetrics.session_id,
      project_id: sessionMetrics.project_id,
      duration_ms: sessionMetrics.duration_ms,
      features_completed: sessionMetrics.features_completed,
      success_rate: sessionMetrics.success_rate.toFixed(2),
    });
  }

  getMetricHistory(name: string, limit = 100): MetricData[] {
    const history = this.metrics.get(name) || [];
    return history.slice(-limit);
  }

  getMetricStats(name: string): {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
    count: number;
  } | null {
    const history = this.metrics.get(name);
    if (!history || history.length === 0) {
      return null;
    }

    const values = history.map(m => m.value).sort((a, b) => a - b);

    const sum = values.reduce((s, v) => s + v, 0);
    const avg = sum / values.length;

    const median = values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];

    const p95Index = Math.floor(values.length * 0.95);
    const p99Index = Math.floor(values.length * 0.99);

    return {
      min: values[0],
      max: values[values.length - 1],
      avg: Math.round(avg * 100) / 100,
      median: Math.round(median * 100) / 100,
      p95: values[p95Index],
      p99: values[p99Index],
      count: values.length,
    };
  }

  getSessionMetrics(projectId: string, sessionId: string): SessionMetrics | null {
    const sessionKey = this.getSessionKey(projectId, sessionId);
    return this.sessionMetrics.get(sessionKey) || null;
  }

  getProjectSessionMetrics(projectId: string, limit = 50): SessionMetrics[] {
    const projectMetrics: SessionMetrics[] = [];

    for (const [key, metrics] of this.sessionMetrics.entries()) {
      if (key.startsWith(projectId + ':')) {
        projectMetrics.push(metrics);
      }
    }

    return projectMetrics.slice(-limit);
  }

  getAgentMetrics(agentName: string): AgentMetrics | null {
    return this.agentMetrics.get(agentName) || null;
  }

  getPerformanceReport(projectId: string): {
    project_id: string;
    total_sessions: number;
    total_duration_ms: number;
    average_session_duration_ms: number;
    total_features_completed: number;
    average_features_per_session: number;
    overall_success_rate: number;
    cost_summary: {
      total_cost_usd: number;
      average_cost_per_session_usd: number;
      average_cost_per_feature_usd: number;
    };
    performance_trends: {
      session_duration: { trend: 'improving' | 'degrading' | 'stable'; change_percent: number };
      success_rate: { trend: 'improving' | 'degrading' | 'stable'; change_percent: number };
      features_per_session: { trend: 'improving' | 'degrading' | 'stable'; change_percent: number };
    };
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const projectSessions = this.getProjectSessionMetrics(projectId);

    if (projectSessions.length === 0) {
      return {
        project_id: projectId,
        total_sessions: 0,
        total_duration_ms: 0,
        average_session_duration_ms: 0,
        total_features_completed: 0,
        average_features_per_session: 0,
        overall_success_rate: 0,
        cost_summary: {
          total_cost_usd: 0,
          average_cost_per_session_usd: 0,
          average_cost_per_feature_usd: 0,
        },
        performance_trends: {
          session_duration: { trend: 'stable', change_percent: 0 },
          success_rate: { trend: 'stable', change_percent: 0 },
          features_per_session: { trend: 'stable', change_percent: 0 },
        },
        alerts: [],
        recommendations: [],
      };
    }

    const totalDuration = projectSessions.reduce(
      (sum, s) => sum + (s.duration_ms || 0),
      0
    );
    const totalFeaturesCompleted = projectSessions.reduce(
      (sum, s) => sum + s.features_completed,
      0
    );
    const totalFeaturesAttempted = projectSessions.reduce(
      (sum, s) => sum + s.features_attempted,
      0
    );

    const overallSuccessRate =
      totalFeaturesAttempted > 0
        ? (totalFeaturesCompleted / totalFeaturesAttempted) * 100
        : 0;

    const totalCost = projectSessions.reduce(
      (sum, s) => sum + (s.cost_estimate_usd || 0),
      0
    );

    const performanceTrends = this.calculatePerformanceTrends(projectSessions);
    const projectAlerts = this.getProjectAlerts(projectId);
    const recommendations = this.generateRecommendations(projectSessions, performanceTrends, projectAlerts);

    return {
      project_id: projectId,
      total_sessions: projectSessions.length,
      total_duration_ms: totalDuration,
      average_session_duration_ms: Math.round(totalDuration / projectSessions.length),
      total_features_completed: totalFeaturesCompleted,
      average_features_per_session: Math.round(totalFeaturesCompleted / projectSessions.length * 100) / 100,
      overall_success_rate: Math.round(overallSuccessRate * 100) / 100,
      cost_summary: {
        total_cost_usd: Math.round(totalCost * 100) / 100,
        average_cost_per_session_usd: Math.round((totalCost / projectSessions.length) * 100) / 100,
        average_cost_per_feature_usd: totalFeaturesCompleted > 0
          ? Math.round((totalCost / totalFeaturesCompleted) * 100) / 100
          : 0,
      },
      performance_trends: performanceTrends,
      alerts: projectAlerts,
      recommendations,
    };
  }

  private calculatePerformanceTrends(sessions: SessionMetrics[]): {
    session_duration: { trend: 'improving' | 'degrading' | 'stable'; change_percent: number };
    success_rate: { trend: 'improving' | 'degrading' | 'stable'; change_percent: number };
    features_per_session: { trend: 'improving' | 'degrading' | 'stable'; change_percent: number };
  } {
    if (sessions.length < 3) {
      return {
        session_duration: { trend: 'stable', change_percent: 0 },
        success_rate: { trend: 'stable', change_percent: 0 },
        features_per_session: { trend: 'stable', change_percent: 0 },
      };
    }

    const recentSessions = sessions.slice(-10);
    const earlierSessions = sessions.slice(0, -10);

    const calculateTrend = (getValue: (s: SessionMetrics) => number) => {
      const recentAvg =
        recentSessions.reduce((sum, s) => sum + getValue(s), 0) / recentSessions.length;
      const earlierAvg =
        earlierSessions.length > 0
          ? earlierSessions.reduce((sum, s) => sum + getValue(s), 0) / earlierSessions.length
          : recentAvg;

      const changePercent = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

      let trend: 'improving' | 'degrading' | 'stable';
      if (Math.abs(changePercent) < 5) {
        trend = 'stable';
      } else if (changePercent < 0) {
        trend = 'improving';
      } else {
        trend = 'degrading';
      }

      return { trend, change_percent: Math.round(changePercent * 100) / 100 };
    };

    return {
      session_duration: calculateTrend(s => s.duration_ms || 0),
      success_rate: calculateTrend(s => s.success_rate),
      features_per_session: calculateTrend(s => s.features_completed),
    };
  }

  private checkForAlerts(metric: MetricData): void {
    const alerts: PerformanceAlert[] = [];

    if (metric.name === 'session_duration_ms' && metric.value > 600000) {
      alerts.push({
        id: `alert_${Date.now()}`,
        severity: 'warning',
        category: 'performance',
        message: 'Session duration exceeds 10 minutes',
        metric_name: metric.name,
        current_value: metric.value,
        threshold: 600000,
        timestamp: metric.timestamp,
        recommendations: [
          'Consider reducing the number of features per session',
          'Optimize AI model calls for better performance',
          'Review feature complexity and dependencies',
        ],
      });
    }

    if (metric.name === 'session_success_rate' && metric.value < 50) {
      alerts.push({
        id: `alert_${Date.now()}`,
        severity: 'error',
        category: 'quality',
        message: 'Session success rate is below 50%',
        metric_name: metric.name,
        current_value: metric.value,
        threshold: 50,
        timestamp: metric.timestamp,
        recommendations: [
          'Review feature selection criteria',
          'Check for dependencies that are blocking progress',
          'Consider adjusting complexity limits',
        ],
      });
    }

    if (metric.name === 'cost_per_session_usd' && metric.value > 5.0) {
      alerts.push({
        id: `alert_${Date.now()}`,
        severity: 'warning',
        category: 'cost',
        message: 'Session cost exceeds $5.00',
        metric_name: metric.name,
        current_value: metric.value,
        threshold: 5.0,
        timestamp: metric.timestamp,
        recommendations: [
          'Use more efficient AI models where possible',
          'Implement caching to reduce API calls',
          'Reduce features per session to lower costs',
        ],
      });
    }

    alerts.forEach(alert => this.alerts.push(alert));

    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  private getProjectAlerts(projectId: string): PerformanceAlert[] {
    const projectAlerts: PerformanceAlert[] = [];

    for (const alert of this.alerts) {
      if (alert.tags?.project_id === projectId) {
        projectAlerts.push(alert);
      }
    }

    return projectAlerts.slice(-20);
  }

  private generateRecommendations(
    sessions: SessionMetrics[],
    trends: any,
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];

    if (trends.session_duration.trend === 'degrading' && Math.abs(trends.session_duration.change_percent) > 20) {
      recommendations.push(
        'Session duration is increasing significantly. Consider reducing features per session or optimizing implementation.'
      );
    }

    if (trends.success_rate.trend === 'degrading' && trends.success_rate.change_percent < -10) {
      recommendations.push(
        'Success rate is declining. Review feature selection and complexity management.'
      );
    }

    const errorAlerts = alerts.filter(a => a.category === 'quality');
    if (errorAlerts.length > 3) {
      recommendations.push(
        'Multiple quality alerts detected. Consider reviewing error handling and testing strategies.'
      );
    }

    const costAlerts = alerts.filter(a => a.category === 'cost');
    if (costAlerts.length > 2) {
      recommendations.push(
        'Cost alerts are frequent. Implement caching and optimize AI model usage.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges. Continue current approach.');
    }

    return recommendations;
  }

  private updateAgentMetrics(sessionMetrics: SessionMetrics): void {
    const agentName = 'coding-agent';

    if (!this.agentMetrics.has(agentName)) {
      this.agentMetrics.set(agentName, {
        agent_name: agentName,
        total_sessions: 0,
        successful_sessions: 0,
        failed_sessions: 0,
        average_session_duration_ms: 0,
        average_features_per_session: 0,
        total_features_completed: 0,
        total_features_attempted: 0,
        overall_success_rate: 0,
        average_cache_hit_rate: 0,
        total_cost_usd: 0,
        average_cost_per_session_usd: 0,
      });
    }

    const metrics = this.agentMetrics.get(agentName)!;
    metrics.total_sessions++;
    metrics.total_features_completed += sessionMetrics.features_completed;
    metrics.total_features_attempted += sessionMetrics.features_attempted;
    metrics.total_cost_usd += sessionMetrics.cost_estimate_usd || 0;

    if (sessionMetrics.features_completed > 0) {
      metrics.successful_sessions++;
    } else {
      metrics.failed_sessions++;
    }

    metrics.average_session_duration_ms =
      metrics.average_session_duration_ms === 0
        ? sessionMetrics.duration_ms || 0
        : (metrics.average_session_duration_ms + (sessionMetrics.duration_ms || 0)) / 2;

    metrics.average_features_per_session =
      metrics.average_features_per_session === 0
        ? sessionMetrics.features_completed
        : (metrics.average_features_per_session + sessionMetrics.features_completed) / 2;

    metrics.overall_success_rate =
      metrics.total_features_attempted > 0
        ? (metrics.total_features_completed / metrics.total_features_attempted) * 100
        : 0;

    metrics.average_cache_hit_rate =
      metrics.average_cache_hit_rate === 0
        ? sessionMetrics.cache_hit_rate
        : (metrics.average_cache_hit_rate + sessionMetrics.cache_hit_rate) / 2;

    metrics.average_cost_per_session_usd = metrics.total_cost_usd / metrics.total_sessions;

    this.agentMetrics.set(agentName, metrics);
  }

  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        metrics: Array.from(this.metrics.entries()).map(([name, data]) => ({ name, data })),
        session_metrics: Array.from(this.sessionMetrics.values()),
        agent_metrics: Array.from(this.agentMetrics.values()),
        alerts: this.alerts,
      }, null, 2);
    }

    const csvLines: string[] = ['name,value,timestamp,tags,unit'];

    for (const [_, metricHistory] of this.metrics.entries()) {
      for (const metric of metricHistory) {
        const tags = metric.tags ? JSON.stringify(metric.tags) : '';
        csvLines.push(
          `${metric.name},${metric.value},${metric.timestamp},"${tags}",${metric.unit || ''}`
        );
      }
    }

    return csvLines.join('\n');
  }

  async reset(): Promise<void> {
    this.metrics.clear();
    this.sessionMetrics.clear();
    this.agentMetrics.clear();
    this.alerts = [];

    logger.info('Performance metrics reset');
  }

  private getSessionKey(projectId: string, sessionId: string): string {
    return `${projectId}:${sessionId}`;
  }
}

export const performanceMetricsService = new PerformanceMetricsService();
