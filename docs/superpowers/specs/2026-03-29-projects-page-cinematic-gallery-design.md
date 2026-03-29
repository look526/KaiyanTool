# Projects Page Redesign - Cinematic Gallery Style

**Date:** 2026-03-29
**Status:** Approved

## Concept & Vision

一个电影海报风格的项目画廊页面。每个项目卡片就是一张电影海报 — 封面图占据全部空间，标题优雅地叠加在图片上，配合精致的渐变遮罩营造电影感。页面顶部是大标题配合渐变背景的 Hero 区域，统计数字作为强调元素水平排列。

**关键词:** 杂志风格、电影海报、优雅精致、大胆排版

## Design Language

### Aesthetic Direction
- **风格:** Cinematic Gallery (电影画廊)
- **参考:** Spotify Wrapped, 时尚杂志, 电影海报
- **特点:** 全屏封面、渐变遮罩、超大标题、优雅字间距

### Color Palette
使用项目现有的 Dark Mode 配色：

```css
--bg-base: '#070d1f'
--bg-surface: '#0c1326'
--bg-elevated: '#171f36'
--bg-glass: 'rgba(28, 37, 62, 0.4)'
--text-primary: '#dfe4fe'
--text-secondary: 'rgba(223, 228, 254, 0.6)'
--text-muted: '#a5aac2'
--accent: '#8b5cf6'
--accent-light: '#a78bfa'
--gradient-primary: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
```

### Typography
- **Display:** Plus Jakarta Sans, 48px, 800 weight, letter-spacing 0.15em
- **Headline:** Plus Jakarta Sans, 36px, 700 weight
- **Body:** Manrope, 14px, 400 weight
- **Label:** Manrope, 12px, 300 weight, letter-spacing 0.3em

### Motion Philosophy
- **封面缩放:** scale(1.05), 600ms ease
- **渐变遮罩:** opacity 变化, 400ms ease
- **卡片位移:** translateY(-8px), 400ms cubic-bezier(0.4, 0, 0.2, 1)
- **发光阴影:** box-shadow 0 20px 50px rgba(139, 92, 246, 0.15)

## Layout & Structure

### Hero Section
```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← 渐变背景
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                             │
│        M Y   P R O J E C T S                              │ ← 大标题
│        管理您的创作项目                                      │
│                                                             │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│    │    3    │  │    1    │  │    0    │                  │
│    │ 全部项目 │  │ 进行中  │  │ 已完成  │                  │
│    └─────────┘  └─────────┘  └─────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Project Card (Grid View)
```
┌─────────────────────────────────────┐
│                                      │
│   [全屏封面图 - 100%]               │
│                                      │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← 底部渐变遮罩 50%
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│   ┌─────────────────────────────┐   │
│   │  S  C  R  I  P  T          │   │ ← 类型标签 (超宽字间距)
│   │                             │   │
│   │  项目名称                    │   │ ← 叠加在图片上
│   │  描述文字...                 │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Responsive Strategy
- **>= 1400px:** 4 列网格
- **>= 1200px:** 3 列网格
- **>= 768px:** 2 列网格
- **< 768px:** 1 列网格

## Features & Interactions

### Hero Region
- 渐变背景从页面顶部延伸
- 标题居中，超大 Plus Jakarta Sans
- 三个统计卡片水平排列，数字超大粗体，标签细瘦

### Card Cover Image
- 100% 填充卡片，无内边距
- 底部 50% 区域渐变遮罩 (`linear-gradient to top`)
- 封面图使用 `object-fit: cover`

### Card Content Overlay
- 类型标签在图片上方，12px，letter-spacing 0.3em
- 标题叠加在封面图上，使用 text-shadow 增加可读性
- 描述文字在标题下方，2 行截断

### Hover Effects
- 封面图 scale(1.05)
- 渐变遮罩向上延伸
- 卡片 translateY(-8px) + 发光阴影
- 箭头图标淡入显示

### Empty State
- 大尺寸图标
- 居中布局
- 创建按钮渐变背景

## Component Inventory

### StatCard (In Hero)
- 超大数字 (48px, 800 weight)
- 细瘦标签 (12px, 300 weight, letter-spacing)
- 无边框，使用背景色区分
- 悬停时数字颜色变化

### ProjectCard (Grid)
- 100% 封面图
- 底部内容叠加区
- 类型标签 + 标题 + 描述
- 悬停箭头图标

### FilterSelect
- 毛玻璃下拉选择器
- 与整体风格一致

### ViewModeToggle
- 分段控制器
- 网格/列表切换

## Technical Approach

### File Structure
```
apps/web/src/pages/
└── ProjectsPage.tsx          # 主页面 (重新设计)

apps/web/src/components/projects/
├── ProjectCard.tsx           # 电影海报风格卡片
├── StatCard.tsx              # Hero 统计卡片
└── FilterSelect.tsx          # 筛选器 (复用)
```

### Implementation Notes
1. 使用 CSS 变量保持一致性
2. 封面图 URL 优先级: 用户上传 > picsum.photos > 渐变占位符
3. 使用 `will-change` 优化动画性能
4. 响应式网格布局使用 `auto-fill, minmax()`
