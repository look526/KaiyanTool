import promClient from 'prom-client';

export function initMetrics() {
  const register = new promClient.Registry();

  promClient.collectDefaultMetrics({
    register,
    prefix: 'kaiyantool_api_',
  });

  const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'kaiyantool_api_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5],
  });

  const httpRequestTotal = new promClient.Counter({
    name: 'kaiyantool_api_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  const dbQueryDuration = new promClient.Histogram({
    name: 'kaiyantool_api_db_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'model'],
    registers: [register],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  });

  const activeConnections = new promClient.Gauge({
    name: 'kaiyantool_api_active_connections',
    help: 'Number of active connections',
    registers: [register],
  });

  const aiRequestDuration = new promClient.Histogram({
    name: 'kaiyantool_api_ai_request_duration_seconds',
    help: 'Duration of AI provider requests in seconds',
    labelNames: ['provider', 'model', 'operation'],
    registers: [register],
    buckets: [0.5, 1, 2, 5, 10, 30],
  });

  const aiRequestTotal = new promClient.Counter({
    name: 'kaiyantool_api_ai_requests_total',
    help: 'Total number of AI provider requests',
    labelNames: ['provider', 'model', 'operation', 'status'],
    registers: [register],
  });

  const queueJobsTotal = new promClient.Counter({
    name: 'kaiyantool_api_queue_jobs_total',
    help: 'Total number of queue jobs processed',
    labelNames: ['queue', 'status'],
    registers: [register],
  });

  const queueJobsDuration = new promClient.Histogram({
    name: 'kaiyantool_api_queue_jobs_duration_seconds',
    help: 'Duration of queue jobs in seconds',
    labelNames: ['queue', 'status'],
    registers: [register],
    buckets: [1, 5, 10, 30, 60, 120],
  });

  return {
    register,
    metrics: {
      httpRequestDurationMicroseconds,
      httpRequestTotal,
      dbQueryDuration,
      activeConnections,
      aiRequestDuration,
      aiRequestTotal,
      queueJobsTotal,
      queueJobsDuration,
    },
  };
}

let metricsInstance: ReturnType<typeof initMetrics> | null = null;

export function getMetrics() {
  if (!metricsInstance) {
    metricsInstance = initMetrics();
  }
  return metricsInstance;
}

export function recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
  const { metrics } = getMetrics();
  metrics.httpRequestTotal.inc({ method, route, status_code: statusCode });
  metrics.httpRequestDurationMicroseconds.observe({ method, route, status_code: statusCode }, duration);
}

export function recordDbQuery(operation: string, model: string, duration: number) {
  const { metrics } = getMetrics();
  metrics.dbQueryDuration.observe({ operation, model }, duration);
}

export function recordAiRequest(provider: string, model: string, operation: string, duration: number, status: string) {
  const { metrics } = getMetrics();
  metrics.aiRequestTotal.inc({ provider, model, operation, status });
  metrics.aiRequestDuration.observe({ provider, model, operation }, duration);
}

export function incrementActiveConnections() {
  const { metrics } = getMetrics();
  metrics.activeConnections.inc();
}

export function decrementActiveConnections() {
  const { metrics } = getMetrics();
  metrics.activeConnections.dec();
}

export function recordQueueJob(queue: string, status: string, duration: number) {
  const { metrics } = getMetrics();
  metrics.queueJobsTotal.inc({ queue, status });
  metrics.queueJobsDuration.observe({ queue, status }, duration);
}
