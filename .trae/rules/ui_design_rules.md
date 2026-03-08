# UI 设计规范

## 1. 设计风格

### Glassmorphism 毛玻璃风格

所有页面必须使用以下设计语言：

**背景效果：**
- 主背景：垂直渐变
  - 深色模式：`linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)`
  - 浅色模式：`linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)`
- 装饰光晕：`radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)`

**毛玻璃效果：**
- 侧边栏/顶部栏：`backdropFilter: 'blur(40px)'`
- 卡片：`backdropFilter: 'blur(20px)'`
- 背景透明度：深色 `rgba(5, 5, 10, 0.95)`，浅色 `rgba(255, 255, 255, 0.92)`

### 色彩系统

**强调色（必须统一）：**
```typescript
const accentColor = '#8b5cf6';   // 主紫色
const accentLight = '#a78bfa';   // 浅紫色
const accentGlow = '#c4b5fd';    // 发光色
```

**主题颜色：**
```typescript
// 深色模式
{
  bgPrimary: 'rgba(5, 5, 10, 0.95)',
  bgSecondary: 'rgba(255, 255, 255, 0.03)',
  bgGlass: 'rgba(255, 255, 255, 0.04)',
  bgGlassHover: 'rgba(255, 255, 255, 0.06)',
  textPrimary: '#fafafa',
  textSecondary: 'rgba(250, 250, 250, 0.6)',
  textMuted: 'rgba(250, 250, 250, 0.4)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderHover: 'rgba(139, 92, 246, 0.25)',
}

// 浅色模式
{
  bgPrimary: 'rgba(255, 255, 255, 0.92)',
  bgSecondary: 'rgba(0, 0, 0, 0.02)',
  bgGlass: 'rgba(0, 0, 0, 0.02)',
  bgGlassHover: 'rgba(0, 0, 0, 0.04)',
  textPrimary: '#18181b',
  textSecondary: 'rgba(24, 24, 27, 0.6)',
  textMuted: 'rgba(24, 24, 27, 0.4)',
  border: 'rgba(0, 0, 0, 0.06)',
  borderHover: 'rgba(139, 92, 246, 0.25)',
}
```

### 圆角规范

- 按钮：14px
- 输入框/选择框：14px
- 小型元素：12px
- 卡片：24px
- 列表项：18px
- 标签/徽章：6-8px

### 阴影规范

```typescript
// 按钮阴影
boxShadow: `0 8px 24px ${accentColor}40`

// 卡片悬浮阴影
boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px ${accentColor}10`

// 侧边栏阴影
boxShadow: '0 0 80px rgba(139, 92, 246, 0.05), 20px 0 60px rgba(0, 0, 0, 0.3)'
```

### 过渡动画

- 快速过渡：`transition: all 0.2s ease`
- 标准过渡：`transition: all 0.25s ease`
- 强调过渡：`transition: all 0.3s ease`
- 弹性过渡：`transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 2. 控件规范

### 必须复用的基础组件

所有控件必须提取为可复用组件，放置在 `apps/web/src/components/ui/` 目录下：

1. **GlassButton** - 玻璃态按钮
   - 支持 primary/secondary 变体
   - 支持图标插槽
   - 支持悬浮效果

2. **GlassCard** - 玻璃态卡片
   - 支持悬浮效果
   - 支持自定义圆角

3. **GlassInput** - 玻璃态输入框
   - 支持搜索框变体
   - 支持前后图标插槽

4. **GlassSelect** - 玻璃态下拉选择

5. **GlassBadge** - 玻璃态状态徽章

6. **PageHeader** - 页面头部（标题 + 操作按钮）

7. **SearchBar** - 搜索栏（输入框 + 筛选器）

### 组件模板

```typescript
// 示例：GlassButton.tsx
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function GlassButton({ variant = 'primary', icon, children, ...props }: GlassButtonProps) {
  const isDark = useTheme() === 'dark';
  
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    borderRadius: '14px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };
  
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
      color: '#ffffff',
      boxShadow: `0 8px 24px ${accentColor}40`,
    },
    secondary: {
      background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
      color: isDark ? '#fafafa' : '#18181b',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
    },
  };
  
  return (
    <button style={{ ...baseStyles, ...variants[variant] }} {...props}>
      {icon}
      {children}
    </button>
  );
}
```

---

## 3. 页面结构规范

### 必须包含的区域

1. **背景层**
   - 渐变背景
   - 装饰性光晕

2. **顶部栏（Sticky Header）**
   - 毛玻璃效果
   - 页面标题
   - 操作按钮

3. **工具栏**
   - 搜索框
   - 筛选器
   - 视图切换

4. **内容区**
   - 卡片网格或列表
   - 分页

### 代码结构示例

```typescript
export default function PageName() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // 颜色变量
  const colors = isDark ? { /* 深色配置 */ } : { /* 浅色配置 */ };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 装饰光晕 */}
      <div style={{
        position: 'absolute',
        background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      
      {/* 顶部栏 */}
      <header style={{
        background: 'rgba(5, 5, 10, 0.95)',
        backdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* 标题和操作 */}
      </header>
      
      {/* 内容 */}
      <main style={{ padding: '32px 48px' }}>
        {/* 搜索栏 + 网格/列表 */}
      </main>
    </div>
  );
}
```

---

## 4. 禁止事项

- ❌ 禁止使用硬编码颜色值（必须通过 theme 或颜色变量）
- ❌ 禁止在页面中直接写内联样式（必须使用可复用组件）
- ❌ 禁止跳过 Glassmorphism 效果
- ❌ 禁止使用不统一的圆角值
- ❌ 禁止忽略悬浮状态
- ❌ 禁止忘记主题切换兼容性

---

## 5. 验收标准

- [ ] 所有页面使用统一的 Glassmorphism 风格
- [ ] 深色/浅色模式切换正常
- [ ] 所有控件可复用（提取到 components/ui/）
- [ ] 悬浮效果完整
- [ ] 过渡动画流畅
- [ ] 无 TypeScript 错误
