export interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  inp: number
}

export const collectMetrics = (): PerformanceMetrics => {
  return {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0,
    inp: 0,
  }
}
