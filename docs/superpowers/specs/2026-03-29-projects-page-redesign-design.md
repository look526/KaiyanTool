# Projects Page Redesign - Immersive Gallery Style

**Date:** 2026-03-29
**Status:** Approved

## 1. Concept & Vision

一个沉浸式的项目画廊页面，参考 Figma/Notion 的视觉风格。强调大封面图的视觉冲击力，配合流畅的视差滚动和丝滑的 hover 交互动效，让项目管理成为一种愉悦的视觉体验。

## 2. Design Language

### Aesthetic Direction
- **风格:** Immersive Cover Gallery (沉浸式封面画廊)
- **参考:** Figma, Notion, Linear App
- **特点:** 大封面图占据卡片主导地位，流畅动画，精致毛玻璃

### Color Palette
使用项目中已有的 Glassmorphism 色彩系统：

```typescript
// 深色模式
{
  bgPrimary: 'rgba(5, 5, 10, 0.95)',
  bgGlass: 'rgba(255, 255, 255, 0.04)',
  bgGlassHover: 'rgba(255, 255, 255, 0.06)',
  textPrimary: '#fafafa',
  textSecondary: 'rgba(250, 250, 250, 0.6)',
  textMuted: 'rgba(250, 250, 250, 0.4)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderHover: 'rgba(139, 92, 246, 0.25)',
  accent: '#8b5cf6',
  accentLight: '#a78bfa',
}

// 浅色模式
{
  bgPrimary: 'rgba(255, 255, 255, 0.92)',
  bgGlass: 'rgba(0, 0, 0, 0.02)',
  bgGlassHover: 'rgba(0, 0, 0, 0.04)',
  textPrimary: '#18181b',
  textSecondary: 'rgba(24, 24, 27, 0.6)',
  textMuted: 'rgba(24, 24, 27, 0.4)',
  border: 'rgba(0, 0, 0, 0.06)',
  borderHover: 'rgba(139, 92, 246, 0.25)',
  accent: '#8b5cf6',
  accentLight: '#a78bfa',
}
```

### Typography
- **主标题:** Plus Jakarta Sans, 36px, 800 weight
- **页面副标题:** Plus Jakarta Sans, 14px, 500 weight
- **卡片标题:** Plus Jakarta Sans, 18px, 700 weight
- **正文:** Manrope, 14px, 400 weight
- **小字:** Manrope, 12px, 400 weight

### Spatial System
- **页面内边距:** 48px
- **卡片间距:** 24px
- **卡片圆角:** 24px
- **按钮圆角:** 14px
- **输入框圆角:** 14px

### Motion Philosophy
- **悬浮缩放:** scale(1.03) - 微妙不夸张
- **视差滚动:** 封面图移动速度 0.5x 相对滚动
- **渐变覆盖层:** 从底部滑入，opacity 0 → 0.8, 300ms ease
- **阴影过渡:** boxShadow 变化，400ms ease
- **所有动画:** 使用 cubic-bezier(0.4, 0, 0.2, 1) 弹性曲线

## 3. Layout & Structure

### Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [背景渐变 + 装饰光晕层]                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎯 我的项目                            [+ 新建]    │   │
│  │  Manage your creative projects                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [统计卡片 × 3]                                              │
│                                                             │
│  [🔍 搜索...] [类型 ▾] [状态 ▾]        [网格/列表切换]        │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 封面图    │ │ 封面图    │ │ 封面图    │ │ 封面图    │       │
│  │ 60%+    │ │ 60%+    │ │ 60%+    │ │ 60%+    │       │
│  │          │ │          │ │          │ │          │       │
│  │ ──────── │ │ ──────── │ │ ──────── │ │ ──────── │       │
│  │ 标题     │ │ 标题     │ │ 标题     │ │ 标题     │       │
│  │ 描述...  │ │ 描述...  │ │ 描述...  │ │ 描述...  │       │
│  │ 状态 日期│ │ 状态 日期│ │ 状态 日期│ │ 状态 日期│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **>= 1400px:** 4 列网格
- **>= 1200px:** 3 列网格
- **>= 768px:** 2 列网格
- **< 768px:** 1 列网格，列表视图自动切换

## 4. Features & Interactions

### Cover Image Management
- **上传封面:** 用户可在项目创建/编辑时上传封面图
- **随机图备选:** 无封面时使用 `https://picsum.photos/seed/{projectId}/800/600` 生成随机图
- **占位符:** 完全没有图片时显示基于项目类型的渐变占位符

### Card Hover Interactions
1. **封面图缩放:** scale(1.05), 600ms ease
2. **渐变覆盖层:** 从底部 30% 处向上渐变显示，opacity 0 → 0.7
3. **操作按钮:** "点击查看" 按钮淡入显示
4. **阴影:** 添加紫色发光阴影 `0 20px 40px rgba(139, 92, 246, 0.15)`
5. **卡片位移:** translateY(-4px)

### Project Type Visual System
| 类型 | 渐变色 | Icon |
|------|--------|------|
| SCRIPT | linear-gradient(135deg, #ba9eff 0%, #ae8dff 100%) | description |
| NOVEL | linear-gradient(135deg, #ec63ff 0%, #f487ff 100%) | menu_book |
| MIXED | linear-gradient(135deg, #34b5fa 0%, #81ccff 100%) | auto_awesome |

### Status Badges
| 状态 | 颜色 | 背景色 |
|------|------|--------|
| ACTIVE | #34b5fa | rgba(52, 181, 250, 0.15) |
| COMPLETED | #ba9eff | rgba(186, 158, 255, 0.15) |
| PAUSED | #f487ff | rgba(244, 135, 255, 0.15) |
| ARCHIVED | #a5aac2 | rgba(165, 170, 194, 0.15) |

### Search & Filter
- **搜索:** 支持项目名称模糊搜索
- **类型筛选:** 全部 / 剧本 / 小说 / 混合
- **状态筛选:** 全部 / 进行中 / 已完成 / 已暂停 / 已归档
- **视图切换:** 网格视图 / 列表视图

### Empty State
- 大尺寸图标 (80px)
- 毛玻璃卡片容器
- 引导文案 + 创建按钮
- hover 效果同创建按钮

## 5. Component Inventory

### StatCard
- **尺寸:** 弹性宽度，高度 100px
- **内容:** 图标 + 数字 + 标签
- **渐变:** 顶部 4px 强调色条
- **Hover:** 轻微发光效果

### ProjectCard (Grid View)
- **尺寸:** 最小宽度 320px，弹性拉伸
- **封面区:** 高度 192px (60%+)
- **内容区:** 标题 + 描述(2行截断) + 元信息
- **状态:** default / hover / loading

### ProjectCard (List View)
- **高度:** 80px
- **布局:** 封面缩略图(48px) + 标题 + 描述 + 状态 + 日期
- **Hover:** 整体右移 4px

### FilterSelect
- **样式:** 毛玻璃下拉选择器
- **圆角:** 14px
- **边框:** 1px solid border

### SearchBar
- **样式:** 毛玻璃输入框
- **图标:** 左侧搜索图标
- **圆角:** 16px

### ViewModeToggle
- **样式:** 分段控制器
- **选项:** 网格视图 / 列表视图
- **选中态:** 高亮背景 + accent 颜色

## 6. Technical Approach

### File Structure
```
apps/web/src/pages/
└── ProjectsPage.tsx          # 主页面 (重新设计)

apps/web/src/components/projects/
├── ProjectCard.tsx           # 项目卡片 (重新设计)
├── StatCard.tsx              # 统计卡片 (复用)
└── FilterSelect.tsx          # 筛选器 (复用)
```

### Key Implementation Details
1. **封面图 URL 优先级:** 用户上传封面 > 随机图 > 类型渐变占位符
2. **视差效果:** 使用 CSS transform + scroll 事件计算
3. **图片懒加载:** 使用 React Query 的懒加载策略
4. **动画性能:** 使用 will-change 和 GPU 加速

### API Integration
- 继续使用现有的 `apiClient.getProjects()` 接口
- 项目类型和状态配置保持不变
- 新增字段: cover_image_url (可选)

### Performance Considerations
- 封面图使用 aspect-ratio 防止布局跳动
- 大量项目时使用虚拟滚动（如果超过 50 个）
- 图片使用 webp 格式（如果后端支持）
