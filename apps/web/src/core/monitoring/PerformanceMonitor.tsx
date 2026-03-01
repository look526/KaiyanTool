import React, { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
  resources: {
    count: number;
    totalSize: number;
    averageDuration: number;
  };
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
  interval?: number;
  enabled?: boolean;
}

export function usePerformanceMonitor(options: PerformanceMonitorProps = {}) {
  const { onMetrics, interval = 5000, enabled = true } = options;
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const collectMetrics = useCallback((): PerformanceMetrics => {
    const now = performance.now();
    const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
    frameCountRef.current = 0;
    lastTimeRef.current = now;

    const memory = (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
    } : undefined;

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    const timing = {
      domContentLoaded: navigationEntry?.domContentLoadedEventEnd || 0,
      loadComplete: navigationEntry?.loadEventEnd || 0,
      firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime,
      firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime,
    };

    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resources = {
      count: resourceEntries.length,
      totalSize: resourceEntries.reduce((sum, r) => sum + (r.encodedBodySize || 0), 0),
      averageDuration: resourceEntries.length > 0
        ? resourceEntries.reduce((sum, r) => sum + r.duration, 0) / resourceEntries.length
        : 0,
    };

    return { fps, memory, timing, resources };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let animationFrameId: number;
    
    const countFrames = () => {
      frameCountRef.current++;
      animationFrameId = requestAnimationFrame(countFrames);
    };
    animationFrameId = requestAnimationFrame(countFrames);

    intervalRef.current = setInterval(() => {
      const metrics = collectMetrics();
      onMetrics?.(metrics);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance]', {
          fps: metrics.fps,
          memoryMB: metrics.memory ? Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024) : 'N/A',
          resourceCount: metrics.resources.count,
        });
      }
    }, interval);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, collectMetrics, onMetrics]);

  return { collectMetrics };
}

export function PerformanceMonitor(props: PerformanceMonitorProps & { children?: React.ReactNode }) {
  const { children, ...options } = props;
  usePerformanceMonitor(options);
  return <>{children}</>;
}

interface WebVitals {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export function useWebVitals(onVitals?: (vitals: WebVitals) => void) {
  const vitalsRef = useRef<WebVitals>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          vitalsRef.current.lcp = entry.startTime;
        }
        if (entry.entryType === 'first-input') {
          vitalsRef.current.fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        }
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          vitalsRef.current.cls = (vitalsRef.current.cls || 0) + (entry as any).value;
        }
      }
      onVitals?.(vitalsRef.current);
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      vitalsRef.current.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }

    return () => observer.disconnect();
  }, [onVitals]);

  return vitalsRef.current;
}
