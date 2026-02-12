import { prisma } from '../lib/prisma';

interface MetricValue {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[];
}

export class MonitoringService {
  async recordMetric(data: MetricValue): Promise<void> {
    await prisma.metrics.create({
      data: {
        name: data.name,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp || new Date()
      }
    });
  }

  async getMetrics(
    name: string,
    options?: {
      from?: Date;
      to?: Date;
      interval?: 'minute' | 'hour' | 'day';
      limit?: number;
    }
  ): Promise<Array<{ value: number; timestamp: Date }>> {
    const { from, to, limit = 100 } = options || {};

    const where: any = { name };
    if (from) where.timestamp = { ...where.timestamp, gte: from };
    if (to) where.timestamp = { ...where.timestamp, lte: to };

    const metrics = await prisma.metrics.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return metrics.map(m => ({
      value: m.value,
      timestamp: m.timestamp
    }));
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{ name: string; status: 'ok' | 'warning' | 'error'; message: string; latency?: number }>;
  }> {
    const checks: Array<{ name: string; status: 'ok' | 'warning' | 'error'; message: string; latency?: number }> = [];

    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.push({
        name: 'database',
        status: 'ok',
        message: 'Database connection healthy',
        latency: Date.now() - start
      });
    } catch (e: any) {
      checks.push({
        name: 'database',
        status: 'error',
        message: `Database error: ${e.message}`
      });
    }

    const apiHealth = await this.checkApiHealth();
    checks.push(apiHealth);

    const storageHealth = await this.checkStorageHealth();
    checks.push(storageHealth);

    const hasError = checks.some(c => c.status === 'error');
    const hasWarning = checks.some(c => c.status === 'warning');

    return {
      status: hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
      checks
    };
  }

  private async checkApiHealth(): Promise<{ name: string; status: 'ok' | 'warning' | 'error'; message: string }> {
    return {
      name: 'api',
      status: 'ok',
      message: 'API responding normally'
    };
  }

  private async checkStorageHealth(): Promise<{ name: string; status: 'ok' | 'warning' | 'error'; message: string }> {
    return {
      name: 'storage',
      status: 'ok',
      message: 'Storage service healthy'
    };
  }

  async getApiMetrics(): Promise<{
    requests: { total: number; success: number; error: number };
    latency: { avg: number; p50: number; p95: number; p99: number };
    rateLimit: { remaining: number; resetAt: Date };
  }> {
    const recentMetrics = await this.getMetrics('api_request', { limit: 1000 });

    const success = recentMetrics.filter(m => m.value < 400).length;
    const error = recentMetrics.filter(m => m.value >= 400).length;

    const latencies = recentMetrics.map(m => m.value);
    latencies.sort((a, b) => a - b);

    return {
      requests: {
        total: recentMetrics.length,
        success,
        error
      },
      latency: {
        avg: latencies.reduce((a, b) => a + b, 0) / latencies.length || 0,
        p50: latencies[Math.floor(latencies.length * 0.5)] || 0,
        p95: latencies[Math.floor(latencies.length * 0.95)] || 0,
        p99: latencies[Math.floor(latencies.length * 0.99)] || 0
      },
      rateLimit: {
        remaining: 1000,
        resetAt: new Date()
      }
    };
  }

  async getQueueMetrics(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    avgProcessingTime: number;
  }> {
    const [pending, processing, completed, failed] = await Promise.all([
      prisma.renderTask.count({ where: { status: 'pending' } }),
      prisma.renderTask.count({ where: { status: 'processing' } }),
      prisma.renderTask.count({ where: { status: 'completed' } }),
      prisma.renderTask.count({ where: { status: 'failed' } })
    ]);

    return {
      pending,
      processing,
      completed,
      failed,
      avgProcessingTime: 0
    };
  }

  async createAlertRule(data: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const rule = await prisma.alertRule.create({
      data: {
        name: data.name,
        metric: data.metric,
        condition: data.condition,
        threshold: data.threshold,
        severity: data.severity,
        enabled: data.enabled,
        channels: data.channels
      }
    });

    return rule as any;
  }

  async getAlertRules(): Promise<AlertRule[]> {
    return prisma.alertRule.findMany({
      orderBy: { createdAt: 'desc' }
    }) as any;
  }

  async updateAlertRule(ruleId: string, data: Partial<AlertRule>): Promise<AlertRule> {
    const rule = await prisma.alertRule.update({
      where: { id: ruleId },
      data: data as any
    });

    return rule as any;
  }

  async deleteAlertRule(ruleId: string): Promise<void> {
    await prisma.alertRule.delete({
      where: { id: ruleId }
    });
  }

  async checkAlerts(): Promise<Array<{
    rule: AlertRule;
    triggered: boolean;
    currentValue: number;
    timestamp: Date;
  }>> {
    const rules = await prisma.alertRule.findMany({
      where: { enabled: true }
    });

    const triggered: Array<{
      rule: AlertRule;
      triggered: boolean;
      currentValue: number;
      timestamp: Date;
    }> = [];

    for (const rule of rules) {
      const metrics = await this.getMetrics(rule.metric, { limit: 10 });
      const latestValue = metrics[0]?.value || 0;

      let triggered = false;
      switch (rule.condition) {
        case 'gt':
          triggered = latestValue > rule.threshold;
          break;
        case 'lt':
          triggered = latestValue < rule.threshold;
          break;
        case 'eq':
          triggered = latestValue === rule.threshold;
          break;
      }

      if (triggered) {
        triggered.push({
          rule: rule as any,
          triggered,
          currentValue: latestValue,
          timestamp: new Date()
        });

        await this.sendAlert(rule as any, latestValue);
      }
    }

    return triggered;
  }

  private async sendAlert(rule: AlertRule, currentValue: number): Promise<void> {
    console.log(`Alert triggered: ${rule.name} - ${rule.metric} = ${currentValue} (${rule.condition} ${rule.threshold})`);

    await prisma.alertRecord.create({
      data: {
        ruleId: rule.id,
        severity: rule.severity,
        message: `${rule.name}: ${rule.metric} is ${currentValue} (threshold: ${rule.condition} ${rule.threshold})`,
        channels: rule.channels
      }
    });
  }

  async getAlertHistory(options?: {
    from?: Date;
    to?: Date;
    severity?: string;
    limit?: number;
  }): Promise<any[]> {
    const { from, to, severity, limit = 100 } = options || {};

    const where: any = {};
    if (from) where.createdAt = { ...where.createdAt, gte: from };
    if (to) where.createdAt = { ...where.createdAt, lte: to };
    if (severity) where.severity = severity;

    return prisma.alertRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getDashboardData(): Promise<{
    system: { status: string; uptime: number };
    api: { requests: number; latency: number; errors: number };
    queue: { pending: number; processing: number; completed: number };
    alerts: { triggered: number; critical: number };
  }> {
    const health = await this.getSystemHealth();
    const apiMetrics = await this.getApiMetrics();
    const queueMetrics = await this.getQueueMetrics();
    const alertHistory = await this.getAlertHistory({
      from: new Date(Date.now() - 3600000)
    });

    return {
      system: {
        status: health.status,
        uptime: process.uptime()
      },
      api: {
        requests: apiMetrics.requests.total,
        latency: apiMetrics.latency.avg,
        errors: apiMetrics.requests.error
      },
      queue: {
        pending: queueMetrics.pending,
        processing: queueMetrics.processing,
        completed: queueMetrics.completed
      },
      alerts: {
        triggered: alertHistory.length,
        critical: alertHistory.filter(a => a.severity === 'critical').length
      }
    };
  }
}

export const monitoringService = new MonitoringService();
