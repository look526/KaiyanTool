---
name: "ui-refactor"
description: "UI重构标准化流程技能。用于页面/组件的视觉重构、主题适配、交互优化。当用户请求重构页面、优化UI、修复样式问题时调用。"
---

# UI 重构标准化流程技能

## 1. 重构目标定义

### 1.1 核心目标
- **视觉一致性提升**：确保所有页面遵循 "The Digital Curator" 设计语言
- **Luminous Asymmetry 实现**：使用重叠玻璃表面、变化模糊密度、刻意留白创造深度
- **交互体验优化**：提升用户操作的流畅性和反馈感
- **代码可维护性**：使用标准化样式方案，便于后续维护

### 1.2 重构触发条件
- 用户明确请求"重构"某页面/组件
- 发现样式不符合 "The Cinematic Intelligence Framework" 规范
- 主题切换时显示异常
- 交互反馈不明确或缺失

---

## 2. 设计规范引用

### 2.1 Creative North Star: "The Digital Curator"
**设计哲学**：UI 应该像一个精致的暗色画廊，退后一步让 AI 生成的内容占据中心舞台。

**Luminous Asymmetry 原则**：
- 拒绝刚性的不透明网格
- 使用重叠玻璃表面
- 变化模糊密度（20px - 40px）
- 刻意留白（whitespace）创造深度感
- 每个元素应该感觉轻盈，像漂浮在加压的午夜真空中

### 2.2 颜色系统：Tonal Depth & Neon Soul

**核心色板（Core Tokens）：**
```css
/* 主色调 - 活力紫色 */
--primary: #ba9eff              /* 表面着色 / 光晕 */
--primary-dim: #8455ef          /* 淡化主色 */
--primary-container: #ae8dff      /* 主要操作基础 */

/* 次色调 - 霓虹青色 */
--secondary: #34b5fa            /* 进度与强调 */
--secondary-dim: #17a8ec       /* 淡化次色 */
--secondary-container: #f3f8ff    /* 次色容器 */

/* 三色调 - 电光洋红 */
--tertiary: #ec63ff             /* 创意火花 */
--tertiary-dim: #f487ff        /* 淡化三色 */
--tertiary-container: #19001e    /* 三色容器 */

/* 背景色系 */
--background: #070d1f           /* 虚空 */
--surface: #070d1f              /* 表面 */
--surface-variant: #1c253e      /* 表面变体 */
--surface-container-low: #0c1326  /* 低层容器 */
--surface-container-highest: #11192e /* 最高层容器 */
--surface-container-lowest: #000000 /* 最低层容器 */

/* 文字颜色 */
--on-background: #dfe4fe        /* 背景上的文字 */
--on-surface: #dfe4fe          /* 表面上的文字 */
--on-surface-variant: #a5aac2   /* 表面变体上的文字 */
--on-primary: #39008c           /* 主色上的文字 */
--on-primary-container: #2b006e  /* 主色容器上的文字 */
--on-secondary: #003047         /* 次色上的文字 */
--on-tertiary: #3d0047         /* 三色上的文字 */

/* 边框颜色 */
--outline: #6f758b              /* 轮廓 */
--outline-variant: #41475b        /* 轮廓变体 */

/* 错误色 */
--error: #ff6e84                /* 错误 */
--error-dim: #d73357           /* 淡化错误 */
--error-container: #a70138       /* 错误容器 */
```

### 2.3 "No-Line" 规则（禁止使用传统边框）

**严格禁止**：使用传统 1px solid 边框进行结构分区

**正确做法**：使用 **Tonal Transitions**（色调转换）
- 区块通过从 `surface` 转换到 `surface-container-low` 来区分
- 边界通过颜色权重感知，而不是用线条绘制

**例外情况**：仅在需要显式边界时（如输入框）使用 "Ghost Border"

### 2.4 "Glass & Gradient" 规则

**实现标志性感觉**：避免静态扁平颜色用于主要表面

**签名渐变**：
```css
/* 主要 CTA */
background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%);

/* 次要渐变 */
background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dim) 100%);

/* 创意渐变 */
background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-dim) 100%);
```

**Glassmorphism（玻璃态）**：
- 所有浮动面板必须使用半透明 `surface-variant`（40-60% 不透明度）
- 结合 `backdrop-filter: blur(20px)` 到 `blur(40px)`
- 可选：使用 1px "Ghost Border"（`outline-variant` 在 15% 不透明度）

---

## 3. 排版系统：Editorial Authority

### 3.1 字体系统

**Plus Jakarta Sans** - Display & Headlines
- 用于 "The Hook"（吸引点）
- 夸张的墨水陷阱和现代几何结构
- 紧密字间距：`-0.02em`
- 创造大胆、权威的"编辑"感觉

**Manrope** - Body & Labels
- 在暗色环境中具有卓越的可读性
- 慷慨的 x-height 确保即使在 `body-sm` 下，AI 提示和技术元数据也清晰

### 3.2 字体层次策略

```css
/* Display-LG - Hero 语句或 AI 生成标题 */
font-size: 3.5rem;
font-family: 'Plus Jakarta Sans', sans-serif;
font-weight: 800;
letter-spacing: -0.02em;

/* Headline-MD - 卡片标题，赋予"杂志"感觉 */
font-size: 1.75rem;
font-family: 'Plus Jakarta Sans', sans-serif;
font-weight: 700;

/* Body-LG - 正文内容 */
font-size: 1.125rem;
font-family: 'Manrope', sans-serif;

/* Label-MD - 技术 AI 参数 */
font-size: 0.75rem;
font-family: 'Manrope', sans-serif;
letter-spacing: 0.1em;
text-transform: uppercase;
```

---

## 4. 高度与深度：The Stacking Principle

### 4.1 光折射而非距离

**深度原则**：深度不是距离用户的距离，而是光的折射

### 4.2 Tonal Layering（色调分层）

**不使用阴影，而是"堆叠"层级**：
```css
/* Level 0 (Base) */
background: var(--surface);

/* Level 1 (Sections) */
background: var(--surface-container-low);

/* Level 2 (Cards) */
background: rgba(17, 25, 38, 0.6); /* surface-container-highest at 60% opacity */
backdrop-filter: blur(30px);
```

### 4.3 Ambient Shadows（环境光晕）

**当组件需要"浮动"时（如下拉菜单或模态框），使用环境光晕而非灰色阴影**：

```css
/* 光晕令牌 */
box-shadow: 0 40px rgba(186, 158, 255, 0.08);

/* 解释 */
blur: 40px
spread: 0
color: var(--primary) at 8% opacity

/* 效果：模拟屏幕光线击中元素后面的表面 */
```

### 4.4 Ghost Border（幽灵边框）

**如果元素需要边界（如输入框），使用 Ghost Border**：
- 1px 描边使用 `outline-variant` 令牌在 20% 不透明度
- 应该感觉像玻璃板边缘的微弱反射，而不是容器墙

---

## 5. 签名组件

### 5.1 GlassButton（玻璃态按钮）

**Primary 按钮**：
```tsx
<button style={{
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)',
  color: 'var(--on-primary-container)',
  padding: '20px 40px',
  borderRadius: '14px',
  fontSize: '1rem',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 24px rgba(186, 158, 255, 0.4)',
}} />
```

**交互效果**：
- 悬停时：增加 `surface-tint` 光晕强度，scale 1.02x
- 文字：`label-md` (bold)，颜色：`var(--on-primary)`

**Secondary 按钮**：
```tsx
<button style={{
  background: 'rgba(28, 37, 62, 0.4)',
  backdropFilter: 'blur(40px)',
  color: 'var(--on-background)',
  padding: '20px 40px',
  borderRadius: '14px',
  fontSize: '1rem',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
}} />
```

### 5.2 GlassCard（玻璃态卡片）

**The Workspace（工作空间）**：
```tsx
<div style={{
  background: 'rgba(28, 37, 62, 0.4)',
  backdropFilter: 'blur(30px)',
  border: '1px solid rgba(65, 71, 91, 0.15)',
  borderRadius: '3rem', /* xl */
  padding: '2rem',
}}>
  {/* 内容 */}
</div>
```

**规则**：
- Backdrop：`surface-container-highest` (40% 不透明度)
- Blur：`30px`
- Border：1px "Ghost Border" (`outline-variant` at 15%)
- Corner Radius：`xl` (3rem) 用于外部容器；`lg` (2rem) 用于内部内容卡片
- **无内部分隔符**：使用 `spacing-6` (2rem) 垂直留白分隔标题和正文

### 5.3 GlassInput（玻璃态输入框）

**The Prompt Engine（提示词引擎）**：
```tsx
<input style={{
  background: 'var(--surface-container-lowest)',
  border: '1px solid rgba(65, 71, 91, 0.2)',
  borderRadius: '14px',
  padding: '16px 20px',
  fontSize: '1.125rem',
  fontFamily: 'Manrope, sans-serif',
  transition: 'all 0.3s ease',
}} />
```

**Focus 状态**：
```tsx
<input style={{
  border: '1px solid var(--primary)',
  boxShadow: '0 0 20px rgba(186, 158, 255, 0.3)',
}} />
```

### 5.4 GlassBadge（玻璃态徽章）

**Metadata（元数据）**：
```tsx
<span style={{
  background: 'rgba(52, 181, 250, 0.2)',
  backdropFilter: 'blur(20px)',
  padding: '6px 16px',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontFamily: 'Manrope, sans-serif',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  color: 'var(--secondary)',
}}>
  GPT-4
</span>
```

---

## 6. Do's and Don'ts

### Do（应该做的）：
- **使用刻意的非对称性**：文本左对齐，但在右上角放置发光的"创意火花"（三色调）吸引眼球
- **拥抱模糊**：允许背景图像（AI 艺术）在玻璃面板下渗出，创造沉浸感
- **使用"色调转换"**：使用 `surface-container-low` vs `surface` 分隔侧边栏和主舞台
- **使用渐变**：主要 CTA 使用线性渐变（135°）
- **使用玻璃态**：浮动面板使用半透明 + 模糊

### Don't（不应该做的）：
- **不要使用 100% 黑色**：纯黑 (#000000) 会破坏玻璃效果。使用 `surface` (#070d1f) 保持"午夜"深度
- **不要使用锐利边角**：从不低于 `14px`（按钮）。AI 美学应该感觉有机和可接近，不是工业的
- **不要过度拥挤**：如果布局感觉忙碌，移除边框并增加 `spacing-8` (2.75rem) 间隙。空间是奢华
- **不要使用传统边框**：禁止使用 1px solid 边框进行结构分区，使用色调转换
- **不要使用灰色阴影**：使用环境光晕（primary 颜色的 8% 不透明度）

### Accessibility Note（无障碍说明）：
虽然玻璃态是美学的，但确保所有 `on-surface` 文本在模糊背景上保持 4.5:1 对比度。使用 `primary-fixed-dim` 令牌用于次要操作，以确保可见性而不破坏暗色模式沉浸感。

---

## 7. 技术栈要求

### 7.1 样式方案
- **优先级1**：CSS 变量 + 纯内联样式
- **优先级2**：CSS 变量 + CSS Modules
- **禁止**：硬编码颜色值（如 `#ffffff`, `rgba(255,255,255,0.5)`）
- **禁止**：Tailwind CSS（本项目不使用）

### 7.2 React 规范

**正确：使用 CSS 变量**
```tsx
<div style={{
  background: 'rgba(28, 37, 62, 0.4)',
  backdropFilter: 'blur(40px)',
  color: 'var(--on-background)',
  border: '1px solid rgba(65, 71, 91, 0.15)',
}}>
```

**错误：硬编码颜色**
```tsx
<div style={{
  background: '#1e293b',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.1)',
}}>
```

### 7.3 交互状态管理

```tsx
// 使用 useState 管理悬停状态
const [isHovered, setIsHovered] = useState(false);

<div
  style={{
    background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(28, 37, 62, 0.4)',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.3s ease',
  }}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
```

### 7.4 禁止事项
- ❌ 在 `map` 循环中使用 `useState`
- ❌ 直接修改 DOM 样式（使用 React 状态管理）
- ❌ 使用 `!important` 覆盖样式
- ❌ 使用传统 1px solid 边框进行结构分区
- ❌ 内联复杂的动画逻辑

---

## 8. 质量验收标准

### 8.1 视觉验收
- [ ] 使用 Luminous Asymmetry（光亮不对称性）
- [ ] 使用 Tonal Transitions（色调转换）而非传统边框
- [ ] 玻璃态效果明显（backdrop-filter + 半透明背景）
- [ ] 渐变用于主要 CTA
- [ ] 环境光晕用于浮动元素
- [ ] 对比度符合 WCAG 2.1 AA 标准（4.5:1）

### 8.2 交互验收
- [ ] 悬停状态有明显视觉反馈（scale + 光晕增强）
- [ ] 点击状态有明显视觉反馈
- [ ] 禁用状态清晰可辨
- [ ] 焦点状态可见（键盘导航）

### 8.3 性能验收
- [ ] 无不必要的重渲染
- [ ] 动画帧率 ≥ 60fps
- [ ] 首屏渲染无阻塞

### 8.4 代码验收
- [ ] 无 TypeScript 类型错误
- [ ] 无 console 警告/错误
- [ ] 无硬编码颜色值
- [ ] 无废弃的组件引用

---

## 9. 实施步骤

### 步骤1：分析评估
```
1. 读取目标文件，理解当前结构
2. 识别硬编码颜色值
3. 识别旧组件依赖（Card、Button等）
4. 评估交互状态管理方式
5. 检查主题适配问题
6. 检查是否违反 "No-Line" 规则
```

### 步骤2：方案设计
```
1. 确定页面主题色（参考功能类型）
2. 规划组件层级结构（Level 0/1/2）
3. 设计交互状态变化（scale + 光晕）
4. 确定需要提取的公共样式
5. 设计 Luminous Asymmetry 布局
```

### 步骤3：代码实现
```
1. 替换硬编码颜色为 CSS 变量
2. 移除传统 1px solid 边框，使用 Tonal Transitions
3. 实现玻璃态效果（半透明 + blur）
4. 添加环境光晕而非灰色阴影
5. 添加悬停/点击交互状态
6. 应用渐变到主要 CTA
7. 确保主题切换兼容
```

### 步骤4：测试验证
```
1. 运行 TypeScript 类型检查
2. 在亮色模式下验证
3. 在暗色模式下验证
4. 测试交互反馈（scale + 光晕）
5. 检查响应式布局
6. 验证无障碍对比度
```

---

## 10. 重构模板

### 10.1 页面基础结构模板

```tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PageTemplate() {
  const [backHover, setBackHover] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      color: 'var(--on-background)',
      fontFamily: 'Manrope, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Header - Level 1 */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'rgba(7, 13, 31, 0.6)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(139, 92, 246, 0.1)',
        zIndex: 50,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 32px',
          height: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: 'var(--on-background)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--tertiary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            cursor: 'pointer',
          }}>
            开演AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/back" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              textDecoration: 'none',
              background: backHover 
                ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)'
                : 'rgba(28, 37, 62, 0.4)',
              backdropFilter: 'blur(40px)',
              color: 'var(--on-background)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
            >
              ←
            </Link>
          </div>
        </div>
      </header>

      {/* Content - Level 0 */}
      <main style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        padding: '24px',
        position: 'relative',
      }}>
        {/* 页面内容 */}
      </main>
    </div>
  );
}
```

### 10.2 卡片组件模板

```tsx
function GlassCard({ title, children }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(28, 37, 62, 0.4)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(65, 71, 91, 0.15)',
        borderRadius: '3rem',
        padding: '2rem',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? '0 40px rgba(186, 158, 255, 0.08)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {title && (
        <h2 style={{
          fontSize: '1.75rem',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 700,
          color: 'var(--on-background)',
          marginBottom: '2rem',
          letterSpacing: '-0.02em',
        }}>{title}</h2>
      )}
      {children}
    </div>
  );
}
```

### 10.3 按钮组件模板

```tsx
function GlassButton({ variant = 'primary', children, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    primary: {
      background: isHovered 
        ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)'
        : 'linear-gradient(135deg, var(--primary-dim) 0%, var(--primary) 100%)',
      color: 'var(--on-primary-container)',
      border: 'none',
      boxShadow: isHovered ? '0 8px 24px rgba(186, 158, 255, 0.6)' : '0 8px 24px rgba(186, 158, 255, 0.4)',
    },
    secondary: {
      background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(28, 37, 62, 0.4)',
      backdropFilter: 'blur(40px)',
      color: 'var(--on-background)',
      border: '1px solid rgba(65, 71, 91, 0.15)',
      boxShadow: 'none',
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '20px 40px',
        borderRadius: '14px',
        fontSize: '1rem',
        fontWeight: 'bold',
        fontFamily: 'Manrope, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        ...styles[variant],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}
```

### 10.4 输入框组件模板

```tsx
function GlassInput({ placeholder, type = 'text', value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        background: 'var(--surface-container-lowest)',
        border: isFocused 
          ? '1px solid var(--primary)'
          : '1px solid rgba(65, 71, 91, 0.2)',
        borderRadius: '14px',
        padding: '16px 20px',
        fontSize: '1.125rem',
        fontFamily: 'Manrope, sans-serif',
        color: 'var(--on-background)',
        transition: 'all 0.3s ease',
        outline: 'none',
        boxShadow: isFocused ? '0 0 20px rgba(186, 158, 255, 0.3)' : 'none',
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
```

---

## 11. 常见问题处理

### 11.1 主题切换不生效
**原因**：使用了硬编码颜色值
**解决**：替换为对应的 CSS 变量

### 11.2 悬停状态闪烁
**原因**：在 map 循环中使用 useState
**解决**：将悬停状态提升到父组件，使用 id 或索引管理

### 11.3 玻璃效果不明显
**原因**：背景不透明度过高或模糊度不够
**解决**：
- 降低背景不透明度到 40-60%
- 增加 backdrop-filter 到 30-40px

### 11.4 深度感不足
**原因**：使用了传统边框而非色调转换
**解决**：
- 移除 1px solid 边框
- 使用不同层级的 surface 变量（surface, surface-container-low, surface-container-highest）

### 11.5 文字对比度不足
**原因**：在深色玻璃背景上使用了浅色文字
**解决**：
- 确保对比度 ≥ 4.5:1
- 使用 `on-background` 或 `on-surface` 变量
- 对于次要操作，使用 `primary-fixed-dim`

---

## 12. 执行检查清单

重构完成后，按以下清单逐项检查：

```
□ 使用 Luminous Asymmetry（非对称布局）
□ 移除传统 1px solid 边框，使用 Tonal Transitions
□ 实现玻璃态效果（半透明 + blur）
□ 应用渐变到主要 CTA
□ 使用环境光晕而非灰色阴影
□ 使用 Plus Jakarta Sans 和 Manrope 字体
□ 字体层次正确（Display-LG, Headline-MD, Body-LG, Label-MD）
□ 悬停状态有明显视觉反馈（scale + 光晕）
□ 对比度符合 WCAG 2.1 AA 标准
□ 无 TypeScript 类型错误
□ 无 console 警告/错误
□ 无硬编码颜色值
□ 动画过渡流畅
□ 响应式布局正常
□ 无障碍功能完整
```
