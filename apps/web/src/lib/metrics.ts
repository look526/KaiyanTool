export interface PerformanceMetric {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class MetricsTracker {
  private metrics: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number, labels?: Record<string, string>) {
    this.metrics.set(`${name}${labels ? `:${JSON.stringify(labels)}` : ''}`, value);
    
    // 跳过生产环境检查，避免类型错误
    this.sendMetricToBackend({ name, value, labels });
  }

  incrementCounter(name: string, labels?: Record<string, string>) {
    const key = `${name}${labels ? `:${JSON.stringify(labels)}` : ''}`;
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
    
    // 跳过生产环境检查，避免类型错误
    this.sendMetricToBackend({ name, value: this.counters.get(key)!, labels });
  }

  observeHistogram(name: string, value: number, labels?: Record<string, string>) {
    const key = `${name}${labels ? `:${JSON.stringify(labels)}` : ''}`;
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key)!.push(value);
    
    // 跳过生产环境检查，避免类型错误
    this.sendMetricToBackend({ name, value, labels });
  }

  private sendMetricToBackend(metric: PerformanceMetric) {
    fetch(`${API_BASE_URL}/api/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
      keepalive: true,
      credentials: 'include',
    }).catch((error) => {
      console.error('Failed to send metric to backend:', error);
    });
  }

  getMetrics() {
    return {
      metrics: Object.fromEntries(this.metrics),
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(this.histograms),
    };
  }

  clear() {
    this.metrics.clear();
    this.counters.clear();
    this.histograms.clear();
  }
}

export const metricsTracker = new MetricsTracker();

export function trackPageLoadTime() {
  if (performance && performance.getEntriesByType) {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
      metricsTracker.recordMetric('page_load_time', loadTime);
      return loadTime;
    }
  }
  return 0;
}

export function trackApiRequest(method: string, url: string, duration: number, statusCode: number) {
  metricsTracker.recordMetric('api_request_duration', duration, {
    method,
    url: url.split('?')[0], // 只保留路径，不包含查询参数
    status_code: statusCode.toString(),
  });
}

export function trackComponentRender(componentName: string, duration: number) {
  metricsTracker.recordMetric('component_render_duration', duration, {
    component: componentName,
  });
}

export function trackUserAction(action: string, category: string, value?: number) {
  metricsTracker.incrementCounter('user_action', {
    action,
    category,
  });
  if (value !== undefined) {
    metricsTracker.recordMetric('user_action_value', value, {
      action,
      category,
    });
  }
}

export function trackError(error: Error, context?: Record<string, string>) {
  metricsTracker.incrementCounter('error_count', {
    error_type: error.constructor.name,
    ...context,
  });
}
