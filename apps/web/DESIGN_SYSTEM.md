# KaiyanTool 设计系统规范

## 📋 概述

本文档定义了 KaiyanTool 项目的设计系统规范，包括视觉设计、组件库、交互模式和技术实现标准。

### 设计原则

- **一致性**: 保持统一的视觉语言和交互模式
- **可访问性**: 确保所有用户都能方便地使用
- **响应式**: 适配不同设备和屏幕尺寸
- **性能**: 优化加载速度和交互响应
- **可维护性**: 基于组件化和标准化的实现

---

## 🎨 设计令牌

### 色彩系统

#### 主题色彩

**深色模式**
```css
--bg-base: #05050a              /* 页面基础背景 */
--bg-surface: #0a0a12          /* 卡片/面板背景 */
--bg-elevated: #0f0f1a         /* 悬浮元素背景 */
--bg-glass: rgba(255, 255, 255, 0.04)  /* 毛玻璃背景 */
--bg-glass-hover: rgba(255, 255, 255, 0.06)  /* 悬停毛玻璃背景 */
--bg-input: rgba(255, 255, 255, 0.04)  /* 输入框背景 */
--bg-hover: rgba(255, 255, 255, 0.06)  /* 悬停背景 */

--text-primary: #fafafa         /* 主要文字 */
--text-secondary: rgba(250, 250, 250, 0.6)  /* 次要文字 */
--text-tertiary: rgba(250, 250, 250, 0.4)   /* 弱化文字 */
--text-muted: rgba(250, 250, 250, 0.4)      /* 提示文字 */
--text-placeholder: rgba(250, 250, 250, 0.35)  /* 占位符 */

--border-primary: rgba(255, 255, 255, 0.06)  /* 主要边框 */
--border-secondary: rgba(255, 255, 255, 0.04) /* 次要边框 */
--border-hover: rgba(139, 92, 246, 0.25)      /* 悬停边框 */
```

**浅色模式**
```css
--bg-base: #ffffff              /* 页面基础背景 */
--bg-surface: #f9fafb          /* 卡片/面板背景 */
--bg-elevated: #ffffff         /* 悬浮元素背景 */
--bg-glass: rgba(0, 0, 0, 0.02)  /* 毛玻璃背景 */
--bg-glass-hover: rgba(0, 0, 0, 0.04)  /* 悬停毛玻璃背景 */
--bg-input: rgba(0, 0, 0, 0.04)  /* 输入框背景 */
--bg-hover: rgba(0, 0, 0, 0.04)  /* 悬停背景 */

--text-primary: #18181b         /* 主要文字 */
--text-secondary: rgba(24, 24, 27, 0.6)  /* 次要文字 */
--text-tertiary: rgba(24, 24, 27, 0.4)   /* 弱化文字 */
--text-muted: rgba(24, 24, 27, 0.4)      /* 提示文字 */
--text-placeholder: rgba(24, 24, 27, 0.35)  /* 占位符 */

--border-primary: rgba(0, 0, 0, 0.06)  /* 主要边框 */
--border-secondary: rgba(0, 0, 0, 0.04) /* 次要边框 */
--border-hover: rgba(139, 92, 246, 0.25)      /* 悬停边框 */
```

#### 强调色

```css
--accent: #6366f1               /* 主强调色 */
--accent-light: #a78bfa          /* 浅强调色 */
--accent-glow: #c4b5fd          /* 发光色 */
--accent-shadow: #6366f140       /* 强调色阴影 */
--accent-bg: rgba(139, 92, 246, 0.1)  /* 强调色背景 */
--accent-text: #a78bfa           /* 强调色文字 */
```

#### 渐变色

```css
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)
--gradient-secondary: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%)
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)
--gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%)
```

### 圆角规范

```css
--radius-sm: 8px                /* 小元素（标签、徽章） */
--radius-md: 10px               /* 按钮、输入框 */
--radius-lg: 14px               /* 卡片 */
--radius-xl: 20px               /* 弹窗 */
--radius-2xl: 24px              /* 大型弹窗 */
--radius-full: 9999px           /* 圆形元素 */
```

### 阴影系统

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15)
--shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2)
--shadow-accent: 0 8px 24px #6366f140
--shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08)
--shadow-card-hover: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 30px rgba(139, 92, 246, 0.1)
--shadow-glow: 0 0 80px rgba(139, 92, 246, 0.05), 20px 0 60px rgba(0, 0, 0, 0.3)
```

### 间距系统

```css
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
```

### 字体系统

#### 字体家族

```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
--font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace
```

#### 字体大小

```css
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px
--font-size-3xl: 30px
--font-size-4xl: 36px
```

#### 字体粗细

```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

#### 行高

```css
--line-height-tight: 1.2
--line-height-normal: 1.5
--line-height-relaxed: 1.75
```

#### 字间距

```css
--letter-spacing-tight: -0.025em
--letter-spacing-normal: 0
--letter-spacing-wide: 0.025em
```

### 动画系统

#### 过渡时间

```css
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
--transition-bounce: 0.4s cubic-bezier(0.4, 0, 0.2, 1)
```

#### 缓动函数

```css
--easing-linear: linear
--easing-in: cubic-bezier(0.4, 0, 1, 1)
--easing-out: cubic-bezier(0, 0, 0.2, 1)
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

### 模糊效果

```css
--glass-blur: blur(40px)          /* 标准毛玻璃模糊 */
--glass-blur-sm: blur(20px)       /* 小型毛玻璃模糊 */
```

### 层级系统

```css
--z-dropdown: 1000
--z-sticky: 1020
--z-fixed: 1030
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

---

## 🧩 核心组件

### GlassButton

玻璃态按钮组件，支持多种变体和尺寸。

```tsx
import { GlassButton } from '@/components/ui';

<GlassButton
  variant="primary"
  size="md"
  icon={<Icon />}
  onClick={handleClick}
>
  点击按钮
</GlassButton>
```

**Props**
- `variant`: `'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'`
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `icon`: React 节点，图标
- `iconPosition`: `'left' | 'right'`
- `loading`: boolean，加载状态
- `disabled`: boolean，禁用状态

### GlassCard

玻璃态卡片组件，支持悬停交互效果。

```tsx
import { GlassCard } from '@/components/ui';

<GlassCard
  variant="default"
  interactive
  padding="md"
>
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</GlassCard>
```

**Props**
- `variant`: `'default' | 'elevated' | 'outlined' | 'glass'`
- `interactive`: boolean，是否可交互
- `padding`: `'none' | 'sm' | 'md' | 'lg' | 'xl'`

### GlassInput

玻璃态输入框组件，支持图标和验证状态。

```tsx
import { GlassInput } from '@/components/ui';

<GlassInput
  variant="default"
  size="md"
  placeholder="请输入内容"
  icon={<SearchIcon />}
  error={hasError}
  helperText="请输入有效的邮箱地址"
/>
```

**Props**
- `variant`: `'default' | 'search' | 'transparent'`
- `size`: `'sm' | 'md' | 'lg'`
- `icon`: React 节点，图标
- `iconPosition`: `'left' | 'right'`
- `error`: boolean，错误状态
- `helperText`: string，帮助文本

### GlassSelect

玻璃态下拉选择组件。

```tsx
import { GlassSelect, GlassSelectOption } from '@/components/ui';

<GlassSelect
  options={[
    { value: 'option1', label: '选项1' },
    { value: 'option2', label: '选项2' },
  ]}
  value={selectedValue}
  onChange={handleChange}
  placeholder="请选择"
/>
```

**Props**
- `options`: GlassSelectOption[]
- `size`: `'sm' | 'md' | 'lg'`
- `error`: boolean
- `helperText`: string
- `placeholder`: string

### PageHeader

页面头部组件，包含标题、面包屑和操作按钮。

```tsx
import { PageHeader } from '@/components/ui';

<PageHeader
  title="页面标题"
  subtitle="页面描述"
  breadcrumbs={[
    { label: '首页', href: '/' },
    { label: '当前页' },
  ]}
  showBackButton
  onBackClick={handleBack}
  actions={<GlassButton>操作</GlassButton>}
/>
```

**Props**
- `title`: string，页面标题
- `subtitle`: string，页面描述
- `breadcrumbs`: 面包屑数组
- `showBackButton`: boolean
- `onBackClick`: 回调函数
- `actions`: React 节点

### SearchBar

搜索栏组件，支持搜索和筛选。

```tsx
import { SearchBar } from '@/components/ui';

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  filters={[
    {
      key: 'status',
      label: '状态',
      options: [
        { value: 'all', label: '全部' },
        { value: 'active', label: '活跃' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ]}
/>
```

**Props**
- `value`: string，搜索值
- `onChange`: 回调函数
- `placeholder`: string
- `filters`: 筛选器数组
- `actions`: React 节点

### Typography

排版组件，提供统一的文字样式。

```tsx
import { Typography, H1, H2, Body1, Body2 } from '@/components/ui';

<H1>主标题</H1>
<H2>副标题</H2>
<Body1>正文内容</Body1>
<Body2>次要内容</Body2>
```

**Props**
- `variant`: `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline'`
- `color`: `'primary' | 'secondary' | 'tertiary' | 'muted' | 'accent' | 'danger' | 'success' | 'warning'`
- `weight`: `'normal' | 'medium' | 'semibold' | 'bold'`
- `align`: `'left' | 'center' | 'right' | 'justify'`
- `truncate`: boolean
- `gutterBottom`: boolean

### LoadingState

加载状态组件，提供多种加载动画。

```tsx
import { LoadingState, InlineLoader } from '@/components/ui';

<LoadingState
  message="加载中..."
  size="md"
  variant="spinner"
/>
```

**Props**
- `message`: string
- `size`: `'sm' | 'md' | 'lg'`
- `variant`: `'spinner' | 'dots' | 'pulse'`

### Grid & ResponsiveGrid

网格布局组件。

```tsx
import { ResponsiveGrid } from '@/components/ui';

<ResponsiveGrid
  xs={1}
  sm={2}
  md={3}
  lg={4}
  gap={16}
>
  {items.map(item => (
    <GlassCard key={item.id}>{item.name}</GlassCard>
  ))}
</ResponsiveGrid>
```

**Props**
- `cols`: number 或响应式对象
- `gap`: number 或响应式对象
- `padding`: number 或响应式对象
- `align`: 对齐方式
- `justify`: 交叉轴对齐方式

### ResponsiveContainer & useBreakpoint

响应式容器和钩子。

```tsx
import { useBreakpoint, Hide, Show } from '@/components/ui';

function Component() {
  const { isMobile, isDesktop } = useBreakpoint();
  
  return (
    <div>
      <Hide on={['xs', 'sm']}>桌面端内容</Hide>
      <Show on={['xs', 'sm']}>移动端内容</Show>
    </div>
  );
}
```

### FeedbackSystem

反馈系统组件。

```tsx
import { FeedbackToast, LoadingOverlay, EmptyState } from '@/components/ui';

<FeedbackToast
  type="success"
  message="操作成功"
  duration={3000}
/>

<LoadingOverlay
  isLoading={true}
  message="加载中..."
  variant="spinner"
/>

<EmptyState
  title="暂无数据"
  description="请先创建一些内容"
  action={<GlassButton>创建</GlassButton>}
/>
```

---

## 🎬 动画系统

### 基础动画类

- `.animate-fade-in` - 淡入
- `.animate-fade-in-up` - 向上淡入
- `.animate-scale-in` - 缩放淡入
- `.animate-slide-in-right` - 从右侧滑入
- `.animate-slide-in-left` - 从左侧滑入
- `.animate-slide-in-up` - 从下方滑入
- `.animate-slide-in-down` - 从上方滑入
- `.animate-bounce` - 弹跳
- `.animate-pulse` - 脉冲
- `.animate-spin` - 旋转
- `.animate-shake` - 震动
- `.animate-wiggle` - 摆动

### 过渡动画类

- `.transition-all` - 所有属性
- `.transition-transform` - 变换
- `.transition-opacity` - 透明度
- `.transition-colors` - 颜色
- `.transition-shadow` - 阴影

### 悬停效果类

- `.hover:scale-105` - 放大 1.05 倍
- `.hover:scale-110` - 放大 1.1 倍
- `.hover:-translate-y-1` - 向上移动
- `.hover:shadow-2xl` - 大阴影
- `.hover:glow` - 发光效果

### 使用示例

```tsx
<div className="animate-fade-in hover:scale-105 transition-all">
  内容
</div>
```

---

## 📱 响应式设计

### 断点系统

- `xs`: < 640px (移动端)
- `sm`: 640px - 767px (移动端横屏)
- `md`: 768px - 1023px (平板)
- `lg`: 1024px - 1279px (桌面)
- `xl`: ≥ 1280px (大屏桌面)

### 响应式布局

```tsx
<ResponsiveGrid
  xs={1}    /* 移动端 1 列 */
  sm={2}    /* 小屏 2 列 */
  md={3}    /* 平板 3 列 */
  lg={4}    /* 桌面 4 列 */
  xl={6}    /* 大屏 6 列 */
>
  {items.map(item => <GlassCard key={item.id}>{item}</GlassCard>)}
</ResponsiveGrid>
```

### 条件渲染

```tsx
<Hide on={['xs', 'sm']}>
  {/* 仅在桌面显示 */}
</Hide>

<Show on={['xs', 'sm']}>
  {/* 仅在移动显示 */}
</Show>
```

---

## 🎯 最佳实践

### 1. 使用 CSS 变量

```tsx
// ✅ 正确
<div style={{ color: 'var(--text-primary)' }}>

// ❌ 错误
<div style={{ color: '#ffffff' }}>
```

### 2. 组件化开发

```tsx
// ✅ 正确
function ProjectCard({ project }) {
  return (
    <GlassCard interactive>
      <H3>{project.name}</H3>
      <Body2>{project.description}</Body2>
    </GlassCard>
  );
}

// ❌ 错误
function ProjectList({ projects }) {
  return (
    <div>
      {projects.map(p => (
        <div style={{ /* 内联样式 */ }}>{p.name}</div>
      ))}
    </div>
  );
}
```

### 3. 主题适配

```tsx
// ✅ 正确 - 使用 CSS 变量自动适配
<GlassCard variant="glass" />

// ❌ 错误 - 硬编码主题
<GlassCard style={{ background: '#ffffff' }} />
```

### 4. 交互反馈

```tsx
// ✅ 正确 - 提供加载状态
<GlassButton loading={isLoading} onClick={handleSubmit}>
  提交
</GlassButton>

// ❌ 错误 - 没有反馈
<button onClick={handleSubmit}>提交</button>
```

### 5. 错误处理

```tsx
// ✅ 正确 - 显示错误状态
<GlassInput
  error={hasError}
  helperText={errorMessage}
/>

// ❌ 错误 - 忽略错误
<input />
```

---

## 🔧 技术实现

### 文件结构

```
apps/web/src/
├── components/
│   └── ui/
│       ├── GlassButton.tsx
│       ├── GlassCard.tsx
│       ├── GlassInput.tsx
│       ├── GlassSelect.tsx
│       ├── PageHeader.tsx
│       ├── SearchBar.tsx
│       ├── Typography.tsx
│       ├── LoadingState.tsx
│       ├── Grid.tsx
│       ├── ResponsiveContainer.tsx
│       ├── FeedbackSystem.tsx
│       └── index.ts
├── contexts/
│   └── ThemeContext.tsx
└── index.css
```

### 主题切换

主题通过 `ThemeContext` 管理，自动适配系统偏好设置。

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function Component() {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      切换到 {resolvedTheme === 'dark' ? '浅色' : '深色'} 模式
    </button>
  );
}
```

### 类型安全

所有组件都提供完整的 TypeScript 类型定义。

```tsx
import type { GlassButtonProps } from '@/components/ui';

function CustomButton(props: GlassButtonProps) {
  return <GlassButton {...props} />;
}
```

---

## 📚 参考资源

- [React 文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [CSS 变量](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [可访问性指南](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🔄 更新日志

### v1.0.0 (2024-03-05)

- 初始版本发布
- 完整的设计令牌系统
- 核心组件库
- 响应式设计系统
- 动画和过渡效果
- 主题支持（深色/浅色）
