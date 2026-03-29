# Page Header Redesign - Unified Hero Style

**Date:** 2026-03-29
**Status:** Approved

## Concept & Vision

所有侧边栏页面的 Header 采用全宽沉浸式 Hero 设计，统一风格，营造一致的用户体验。大标题配合装饰光晕和统计卡片，让每个页面都有"杂志感"的视觉冲击力。

## Design Language

### Page Hero Structure
```
┌─────────────────────────────────────────────────────────────┐
│  [装饰光晕背景 - radial-gradient]                           │
│                                                             │
│     📂 页面标题 (大号, letter-spacing 0.15em)               │
│     页面描述 (中等, letter-spacing 0.05em)                  │
│                                                             │
│     ┌────────┐  ┌────────┐  ┌────────┐                   │ ← 统计卡片 (可选)
│     │   数字  │  │   数字  │  │   数字  │                   │
│     │  标签   │  │  标签   │  │  标签   │                   │
│     └────────┘  └────────┘  └────────┘                   │
│                                                             │
│  [工具栏: 搜索 | 筛选 | 操作按钮]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Typography
- **Page Title:** Plus Jakarta Sans, 32-36px, 700-800 weight, letter-spacing 0.15em
- **Subtitle:** Manrope, 14-15px, 400 weight, letter-spacing 0.05em, text-muted color

### Icon Badge
- Size: 52-56px
- Shape: 圆形, border-radius 16px
- Background: 渐变 (accent gradient)
- Icon: material-symbols-outlined, 26-28px, 白色

### Stat Card (Optional)
- Number: 48px, 800 weight, Plus Jakarta Sans
- Label: 12px, 300 weight, letter-spacing 0.15em, uppercase
- Background: rgba glass with blur
- Border: ghost border (outline-variant at 15%)
- Hover: 数字颜色变亮

### Decorative Glow
- Type: radial-gradient ellipse
- Position: 通常在右上角或顶部中央
- Color: 使用页面主题的强调色，opacity 8-12%
- Size: 50-60% of viewport width/height

### Colors (Dark/Light Mode)
```css
/* Dark Mode */
bgPage: linear-gradient(180deg, #070d1f 0%, #0c1326 50%, #11192e 100%)
textPrimary: #dfe4fe
textSecondary: rgba(223, 228, 254, 0.6)
textMuted: #a5aac2
accent: #8b5cf6
accentLight: #a78bfa

/* Light Mode */
bgPage: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
textPrimary: #18181b
textSecondary: rgba(24, 24, 27, 0.6)
textMuted: rgba(24, 24, 27, 0.5)
accent: #7c3aed
accentLight: #8b5cf6
```

## Pages to Update

| Page | Current Style | Target Style |
|------|--------------|--------------|
| ProjectsPage | ✅ Hero style (已有) | 保持 |
| DocumentsPage | 紧凑header | Hero style |
| TeamPage | 无header | Hero style |
| AIProvidersPage | 紧凑header | Hero style |
| AnalyticsPage | 紧凑header | Hero style |
| SettingsPage | 紧凑header | Hero style |

## Implementation Notes

1. **StatCard Component** - 抽取为可复用组件
2. **HeroHeader Component** - 创建统一的 PageHero 组件
3. **Each page passes:** title, subtitle, icon, stats (optional), actions (optional)
4. **Decorative glow** - 使用 radial-gradient ellipse
5. **Consistent spacing** - 页面内边距 48px

## Component Inventory

### StatCard
```tsx
interface StatCardProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
  gradient?: string;
}
```
- 毛玻璃背景 + blur
- 48px 大数字
- hover 时数字变亮

### PageHero
```tsx
interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  stats?: { value: number; label: string }[];
  glowColor?: string;
  actions?: React.ReactNode;
}
```
- 居中或左对齐布局
- 装饰光晕背景
- 可选的统计卡片行
- 可选的操作按钮区
