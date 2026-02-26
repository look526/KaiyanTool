import type { MetricData } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class MetricsTracker {
  private isEnabled: boolean = true
  private batch: MetricData[] = []
  private batchSize: number = 10
  private flushInterval: number = 5000
  private flushTimer: NodeJS.Timeout | null = null

  constructor() {
    if (import.meta.env.DEV) {
      this.isEnabled = import.meta.env.VITE_ENABLE_METRICS !== 'false'
    }
    this.startFlushTimer()
  }

  async sendMetricToBackend(metric: MetricData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to send metric: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send metric to backend:', error)
    }
  }

  incrementCounter(name: string, value: number = 1, tags: Record<string, string> = {}): void {
    const metric: MetricData = {
      name,
      type: 'counter',
      value,
      tags,
      timestamp: new Date().toISOString(),
    }
    this.batch.push(metric)

    if (this.batch.length >= this.batchSize) {
      this.flush()
    }
  }

  recordGauge(name: string, value: number, tags: Record<string, string> = {}): void {
    const metric: MetricData = {
      name,
      type: 'gauge',
      value,
      tags,
      timestamp: new Date().toISOString(),
    }
    this.batch.push(metric)

    if (this.batch.length >= this.batchSize) {
      this.flush()
    }
  }

  recordHistogram(name: string, value: number, tags: Record<string, string> = {}): void {
    const metric: MetricData = {
      name,
      type: 'histogram',
      value,
      tags,
      timestamp: new Date().toISOString(),
    }
    this.batch.push(metric)

    if (this.batch.length >= this.batchSize) {
      this.flush()
    }
  }

  private async flush(): Promise<void> {
    if (this.batch.length === 0) {
      return
    }

    const metricsToSend = [...this.batch]
    this.batch = []

    try {
      await Promise.all(metricsToSend.map(metric => this.sendMetricToBackend(metric)))
    } catch (error) {
      console.error('Failed to flush metrics:', error)
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    this.flush()
  }
}

export const metricsTracker = new MetricsTracker()
