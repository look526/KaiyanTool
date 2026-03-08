export const analyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  trackPageViews: true,
  trackWebVitals: true,
  trackErrors: true,
}

export const trackPerformance = (metrics: any) => {
  if (!analyticsConfig.enabled) return
  console.log('Performance tracked:', metrics)
}
