import {
  onCLS,
  onFCP,
  onFID,
  onINP,
  onLCP,
  onTTFB,
  type Metric,
} from 'web-vitals'

export type { Metric }

interface WebVitalsOptions {
  reportToConsole?: boolean
  reportCallback?: (metric: Metric) => void
}

export function reportWebVitals(options: WebVitalsOptions = {}) {
  const { reportToConsole = true, reportCallback } = options

  const handleMetric = (metric: Metric) => {
    if (reportToConsole) {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      })
    }

    if (reportCallback) {
      reportCallback(metric)
    }
  }

  onCLS(handleMetric)
  onFCP(handleMetric)
  onFID(handleMetric)
  onINP(handleMetric)
  onLCP(handleMetric)
  onTTFB(handleMetric)
}

export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const

export type VitalName = keyof typeof PERFORMANCE_THRESHOLDS

export function getPerformanceRating(
  name: VitalName,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[name]
  if (!thresholds) return 'poor'

  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}
