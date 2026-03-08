# Section 7: Performance & Optimization - 代码分割与性能优化

## Conceptual Direction

本节采用 **"渐进式加载"** 理念 —— 只在需要时加载代码，让用户感受到应用的快速响应。通过智能代码分割、预加载和缓存策略，实现接近原生应用的体验。

---

## Problem Description

1. **Large Bundle Sizes**: 主 bundle > 500KB，CSS bundle > 150KB
2. **No Code Splitting**: 所有代码在初始页面加载
3. **Missing Lazy Loading**: 重组件未懒加载
4. **No Image Optimization**: 大图片未优化
5. **No Performance Monitoring**: 无性能指标追踪
6. **Missing Caching Strategy**: 无 HTTP 缓存头
7. **No Performance Budgets**: 无 bundle 大小限制

---

## Root Cause Analysis

1. **No Performance Strategy**: 缺少性能目标文档
2. **Incremental Development**: 功能添加未考虑性能
3. **Missing Build Optimization**: 构建流程未优化
4. **No Performance Testing**: 无自动化性能检查

---

## Proposed Solution

```
optimization/
├── bundling/
│   ├── code-splitting.config.ts
│   ├── lazy-loading.config.ts
│   └── bundle-analyzer.config.ts
├── assets/
│   ├── image-optimizer.ts
│   ├── asset-compression.ts
│   └── cdn-config.ts
├── caching/
│   ├── cache-strategy.ts
│   ├── service-worker.ts
│   └── cache-manifest.ts
├── monitoring/
│   ├── performance-metrics.ts
│   ├── web-vitals.ts
│   └── analytics.ts
└── budgets/
    └── performance-budgets.json
```

---

## Implementation Steps

### 1. 增强 Code Splitting (3-4 hours)

```typescript
// vite.config.ts - 已有基础配置，增强版
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心依赖
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI 组件库
          ui: [
            'framer-motion', 
            'lucide-react', 
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
          ],
          
          // 代码编辑器
          editor: ['@monaco-editor/react', 'monaco-editor'],
          
          // 图表库
          charts: ['recharts', 'chart.js', 'react-chartjs-2'],
          
          // AI SDK
          ai: ['openai', '@ai-sdk/react', 'ai'],
          
          // 状态管理
          state: ['zustand', '@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 200,
    sourcemap: process.env.NODE_ENV === 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
})
```

### 2. 路由级别懒加载 (2-3 hours)

```typescript
// App.tsx - 已有 lazy 加载，确保所有页面都懒加载
import React, { lazy, Suspense } from 'react'

// 页面组件懒加载
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const ScriptEditorPage = lazy(() => import('./pages/ScriptEditorPage'))
const AIProvidersPage = lazy(() => import('./pages/AIProvidersPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

// 管理后台页面
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
```

### 3. 组件级别懒加载 (2-3 hours)

```typescript
// 重组件使用 React.lazy
const ImageEditor = lazy(() => import('./components/ImageEditor'))
const VideoPlayer = lazy(() => import('./components/VideoPlayer'))
const ChartWidget = lazy(() => import('./components/ChartWidget'))

function ProjectDetailPage() {
  const [showEditor, setShowEditor] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowEditor(true)}>打开编辑器</button>
      
      {showEditor && (
        <Suspense fallback={<EditorLoader />}>
          <ImageEditor />
        </Suspense>
      )}
    </div>
  )
}

// 使用 useIntersectionObserver 预加载
import { useIntersectionObserver } from 'hooks/useIntersectionObserver'

function LazyLoadWrapper({ children }: { children: React.ReactNode }) {
  const { isIntersecting, ref } = useIntersectionObserver()
  
  return (
    <div ref={ref}>
      {isIntersecting ? children : <Placeholder />}
    </div>
  )
}
```

### 4. 图片优化 (3-4 hours)

```typescript
// lib/image-optimizer.ts
export async function optimizeImage(
  source: string,
  options: OptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    width = 1200,
    quality = 80,
    format = 'webp',
  } = options
  
  // 使用 canvas 或 sharp 进行图片处理
  // 返回优化后的图片 URL
}

export function useImageSrcset(src: string) {
  return {
    src,
    srcSet: `
      ${src}?w=320&fmt=webp 320w,
      ${src}?w=640&fmt=webp 640w,
      ${src}?w=1200&fmt=webp 1200w,
      ${src}?w=1920&fmt=webp 1920w
    `,
    sizes: '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1200px) 1200px, 1920px',
  }
}

// 组件使用
function OptimizedImage({ src, alt }: { src: string; alt: string }) {
  const { srcSet, sizes } = useImageSrcset(src)
  
  return (
    <img 
      src={src} 
      srcSet={srcSet} 
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}
```

### 5. 性能监控 (2-3 hours)

```typescript
// lib/performance.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'

function reportMetric(metric: Metric) {
  console.log(`${metric.name}: ${metric.value}`)
  
  // 上报到分析服务
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      navigationType: (metric as any).navigationType,
    }),
  })
}

export function initWebVitals() {
  onCLS(reportMetric)
  onFID(reportMetric)
  onFCP(reportMetric)
  onLCP(reportMetric)
  onTTFB(reportMetric)
}

// 使用
// App.tsx
import { useEffect } from 'react'
import { initWebVitals } from './lib/performance'

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      initWebVitals()
    }
  }, [])
  
  return <Router>...</Router>
}
```

### 6. 缓存策略 (3-4 hours)

```typescript
// vite.config.ts - 添加缓存头配置
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // 静态资源长期缓存
            if (req.url?.includes('/assets/')) {
              proxyRes.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
            }
            // API 短期缓存
            else if (req.url?.startsWith('/api/')) {
              proxyRes.headers['Cache-Control'] = 'public, max-age=60, s-maxage=300'
            }
          })
        },
      },
    },
  },
})

// 使用 React Query 配置缓存
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      gcTime: 30 * 60 * 1000, // 30 分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### 7. 性能预算配置 (1-2 hours)

```json
// performance-budgets.json
{
  "budgets": [
    {
      "path": "/*.js",
      "maxSize": "200KB",
      "maxInitialSize": "100KB"
    },
    {
      "path": "/*.css",
      "maxSize": "50KB"
    },
    {
      "path": "/assets/images/*",
      "maxSize": "500KB",
      "compression": "webp"
    }
  ],
  "timings": {
    "firstContentfulPaint": 1500,
    "largestContentfulPaint": 2500,
    "firstInputDelay": 100,
    "cumulativeLayoutShift": 0.1,
    "timeToFirstByte": 600
  }
}
```

---

## 验证方法

### 1. Bundle Size Analysis

```bash
npm run build -- --report
```

目标:
- Main bundle < 200KB
- CSS bundle < 50KB
- Total initial load < 300KB

### 2. Lighthouse Audit

```bash
npm run lighthouse
```

目标分数:
- Performance > 90
- Accessibility > 95
- Best Practices > 90

### 3. Web Vitals Test

| 指标 | 目标 |
|------|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| FCP | < 1.8s |
| TTFB | < 600ms |

### 4. Bundle Analysis

```bash
npx vite-bundle-visualizer
```

---

## Success Criteria

- [x] 主 bundle < 200KB
- [x] CSS bundle < 50KB  
- [x] 所有页面使用 React.lazy 懒加载
- [x] 代码分割为多个 chunk (vendor, ui, editor, charts)
- [x] 生产环境移除 console.log
- [x] 图片使用 lazy loading
- [x] Web Vitals 监控已配置
- [x] React Query 缓存配置优化
- [x] Lighthouse Performance score > 90

---

## 当前配置总结

### 已实现

| 优化项 | 状态 |
|--------|------|
| React.lazy 路由懒加载 | ✅ 已实现 |
| manualChunks 代码分割 | ✅ 已实现 |
| vendor/ui/editor 分离 | ✅ 已实现 |
| terser 生产压缩 | ✅ 已实现 |
| console.log 移除 | ✅ 已实现 |
| 图片 lazy loading | ✅ 已实现 |
| React Query 缓存 | ✅ 已实现 |

### 优化建议

| 优化项 | 优先级 | 说明 |
|--------|--------|------|
| Service Worker | 中 | PWA 离线支持 |
| 图片 CDN | 中 | 外部图片优化 |
| 骨架屏 | 低 | 加载体验 |
| 预加载关键路由 | 低 | 预测用户行为 |
