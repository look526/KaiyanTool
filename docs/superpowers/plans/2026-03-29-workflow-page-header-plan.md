# Workflow 页面 Header 统一实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 workflow sidebar 页面（StorylinePage、CharactersPage、ScenesPage、ItemsPage）的 header 统一为紧凑版 PageHero 风格，增加 UX 动画提升用户体验。

**Architecture:** 创建 CompactPageHero 组件作为可复用页面头部，复用现有的 useTheme hook 和颜色系统，保持与 dashboard 其他页面的视觉一致性。

**Tech Stack:** React + TypeScript + CSS-in-JS (inline styles)

---

## 文件结构

### 新建文件
- `apps/web/src/components/ui/CompactPageHero.tsx` - 紧凑版 PageHero 组件

### 修改文件
- `apps/web/src/pages/StorylinePage.tsx` - 使用 CompactPageHero
- `apps/web/src/pages/CharactersPage.tsx` - 使用 CompactPageHero
- `apps/web/src/pages/ScenesPage.tsx` - 使用 CompactPageHero
- `apps/web/src/pages/ItemsPageSimple.tsx` - 使用 CompactPageHero

---

## 实现任务

### Task 1: 创建 CompactPageHero 组件

**Files:**
- Create: `apps/web/src/components/ui/CompactPageHero.tsx`

- [ ] **Step 1: 创建 CompactPageHero.tsx 文件**

```tsx
import React, { useEffect, useState, useRef } from 'react';

interface StatItem {
  value: number;
  label: string;
}

interface CompactPageHeroProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  stats?: StatItem[];
  glowColor?: string;
  actions?: React.ReactNode;
  index?: number;
}

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value, duration]);

  return <>{displayValue}</>;
}

export function CompactPageHero({ title, subtitle, icon, stats = [], glowColor, actions, index = 0 }: CompactPageHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [cardVisibility, setCardVisibility] = useState<boolean[]>(stats.map(() => false));

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    stats.forEach((_, i) => {
      setTimeout(() => {
        setCardVisibility(prev => {
          const newState = [...prev];
          newState[i] = true;
          return newState;
        });
      }, 200 + i * 100);
    });
    return () => clearTimeout(timer);
  }, [stats.length]);

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const colors = {
    bgGlass: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    border: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    textPrimary: isDark ? '#fafafa' : '#18181b',
    textMuted: isDark ? 'rgba(250, 250, 250, 0.4)' : 'rgba(24, 24, 27, 0.4)',
  };

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 300ms ease-out',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            {icon}
          </div>
          <div>
            <h1
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: colors.textPrimary,
                margin: 0,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: '13px',
                  color: colors.textMuted,
                  margin: '2px 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>

      {stats.length > 0 && (
        <div style={{ display: 'flex', gap: '12px' }}>
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '12px 16px',
                background: colors.bgGlass,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(20px)',
                opacity: cardVisibility[i] ? 1 : 0,
                transform: cardVisibility[i] ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 400ms ease-out',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: colors.textPrimary,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <AnimatedNumber value={stat.value} />
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '2px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Task 2: 重构 StorylinePage

**Files:**
- Modify: `apps/web/src/pages/StorylinePage.tsx`
- 移除现有的自定义 header 样式，使用 CompactPageHero

- [ ] **Step 1: 更新 StorylinePage imports**
- [ ] **Step 2: 在页面顶部使用 CompactPageHero**
- [ ] **Step 3: 调整页面布局适配紧凑 header**

---

### Task 3: 重构 CharactersPage

**Files:**
- Modify: `apps/web/src/pages/CharactersPage.tsx`
- 替换 PageHeader 组件为 CompactPageHero

- [ ] **Step 1: 更新 imports，移除 PageHeader**
- [ ] **Step 2: 在页面顶部使用 CompactPageHero**
- [ ] **Step 3: 调整页面布局**

---

### Task 4: 重构 ScenesPage

**Files:**
- Modify: `apps/web/src/pages/ScenesPage.tsx`
- 替换 StandardPageHeader 为 CompactPageHero

- [ ] **Step 1: 更新 imports，移除 StandardPageHeader**
- [ ] **Step 2: 在页面顶部使用 CompactPageHero**
- [ ] **Step 3: 调整页面布局**

---

### Task 5: 重构 ItemsPage

**Files:**
- Modify: `apps/web/src/pages/ItemsPageSimple.tsx`
- 添加 CompactPageHero header

- [ ] **Step 1: 添加 CompactPageHero import**
- [ ] **Step 2: 在页面顶部使用 CompactPageHero**
- [ ] **Step 3: 调整页面布局**

---

### Task 6: 最终验证

**Files:**
- None (验证任务)

- [ ] **Step 1: 运行 TypeScript 编译检查**
  - Run: `cd apps/web && npx tsc --noEmit`
  - Expected: 无错误

- [ ] **Step 2: 运行 lint 检查**
  - Run: `cd apps/web && npm run lint`
  - Expected: 无错误

- [ ] **Step 3: 手动测试页面渲染**
  - 访问 http://localhost:3000/projects/:id/storyline
  - 访问 http://localhost:3000/projects/:id/characters
  - 访问 http://localhost:3000/projects/:id/scenes
  - 访问 http://localhost:3000/projects/:id/items
  - 验证 header 正确显示，动画正常，深色/浅色模式切换正常

---

## 验收标准

- [ ] CompactPageHero 组件创建完成
- [ ] StorylinePage 重构完成
- [ ] CharactersPage 重构完成
- [ ] ScenesPage 重构完成
- [ ] ItemsPage 重构完成
- [ ] TypeScript 编译通过
- [ ] 页面动画效果正常
- [ ] 深色/浅色模式正常
