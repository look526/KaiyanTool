# Page Header Redesign - Unified Hero Style

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构所有侧边栏页面的 Header 为统一的 Hero 风格，营造沉浸式杂志感视觉体验。

**Architecture:**
- 创建可复用的 `StatCard` 和 `PageHero` 组件
- 每个页面的 Header 结构统一：大标题 + 装饰光晕 + 统计卡片（可选）+ 工具栏
- 使用 `useTheme` hook 获取当前主题颜色

**Tech Stack:** React 19, TypeScript, CSS-in-JS (inline styles), material-symbols-outlined

---

## File Inventory

| File | Action | Purpose |
|------|--------|---------|
| `apps/web/src/components/ui/StatCard.tsx` | Create | 可复用统计卡片组件 |
| `apps/web/src/components/ui/PageHero.tsx` | Create | 可复用 Hero Header 组件 |
| `apps/web/src/pages/ProjectsPage.tsx` | Modify | 已有 Hero style，检查是否可复用组件 |
| `apps/web/src/pages/DocumentsPage.tsx` | Modify | 重构为 Hero style |
| `apps/web/src/pages/TeamPage.tsx` | Modify | 重构为 Hero style |
| `apps/web/src/pages/AIProvidersPage/AIProvidersPage.tsx` | Modify | 重构为 Hero style |
| `apps/web/src/pages/AnalyticsPage.tsx` | Modify | 重构为 Hero style |
| `apps/web/src/pages/SettingsPage.tsx` | Modify | 重构为 Hero style |

---

## Task 1: Create StatCard Component

**Files:**
- Create: `apps/web/src/components/ui/StatCard.tsx`

- [ ] **Step 1: Implement StatCard component**

```tsx
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
}

export function StatCard({ value, label }: StatCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isHovered, setIsHovered] = useState(false);

  const colors = isDark ? {
    bg: 'rgba(255, 255, 255, 0.03)',
    bgHover: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#dfe4fe',
    textMuted: '#a5aac2',
    accent: '#a78bfa',
  } : {
    bg: 'rgba(255, 255, 255, 0.8)',
    bgHover: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.6)',
    accent: '#7c3aed',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 32px',
        borderRadius: '24px',
        background: isHovered ? colors.bgHover : colors.bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
    >
      <span style={{
        fontSize: '48px',
        fontWeight: 800,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: isHovered ? colors.accent : colors.textPrimary,
        lineHeight: 1,
        marginBottom: '8px',
        transition: 'color 0.4s ease',
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '12px',
        fontWeight: 300,
        color: colors.textMuted,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd apps/web && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/ui/StatCard.tsx
git commit -m "feat: create reusable StatCard component for page heroes"
```

---

## Task 2: Create PageHero Component

**Files:**
- Create: `apps/web/src/components/ui/PageHero.tsx`

- [ ] **Step 1: Implement PageHero component**

```tsx
import { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface StatItem {
  value: number;
  label: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  stats?: StatItem[];
  glowColor?: string;
  actions?: ReactNode;
}

export function PageHero({ title, subtitle, icon, stats = [], glowColor, actions }: PageHeroProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const colors = isDark ? {
    textPrimary: '#dfe4fe',
    textMuted: '#a5aac2',
    glow1: glowColor || 'rgba(139, 92, 246, 0.12)',
    glow2: 'rgba(236, 99, 255, 0.08)',
  } : {
    textPrimary: '#18181b',
    textMuted: 'rgba(24, 24, 27, 0.6)',
    glow1: glowColor || 'rgba(139, 92, 246, 0.08)',
    glow2: 'rgba(236, 99, 255, 0.05)',
  };

  return (
    <section style={{
      textAlign: 'center',
      paddingBottom: '48px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        width: '60%',
        height: '300px',
        background: `radial-gradient(ellipse at center, ${colors.glow1} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '40px',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 12px 32px rgba(139, 92, 246, 0.3)',
        }}>
          {icon}
        </div>

        <h1 style={{
          fontSize: '14px',
          fontWeight: 300,
          color: colors.textMuted,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          {title}
        </h1>

        {subtitle && (
          <p style={{
            fontSize: '14px',
            fontWeight: 300,
            color: colors.textMuted,
            letterSpacing: '0.05em',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {stats.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}>
          {stats.map((stat, idx) => (
            <StatCard key={idx} value={stat.value} label={stat.label} />
          ))}
        </div>
      )}

      {actions && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {actions}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd apps/web && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/ui/PageHero.tsx
git commit -m "feat: create reusable PageHero component"
```

---

## Task 3: Refactor DocumentsPage

**Files:**
- Modify: `apps/web/src/pages/DocumentsPage.tsx`

- [ ] **Step 1: Replace header with PageHero component**

Replace the current header section with:
```tsx
<PageHero
  title="DOCUMENTS"
  subtitle="管理您的文档"
  icon={<span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'white' }}>description</span>}
/>
```

- [ ] **Step 2: Run TypeScript check**
- [ ] **Step 3: Commit**

---

## Task 4: Refactor TeamPage

**Files:**
- Modify: `apps/web/src/pages/TeamPage.tsx`

- [ ] **Step 1: Replace header with PageHero component**
- [ ] **Step 2: Run TypeScript check**
- [ ] **Step 3: Commit**

---

## Task 5: Refactor AIProvidersPage

**Files:**
- Modify: `apps/web/src/pages/AIProvidersPage/AIProvidersPage.tsx`

- [ ] **Step 1: Replace header with PageHero component**
- [ ] **Step 2: Run TypeScript check**
- [ ] **Step 3: Commit**

---

## Task 6: Refactor AnalyticsPage

**Files:**
- Modify: `apps/web/src/pages/AnalyticsPage.tsx`

- [ ] **Step 1: Replace header with PageHero component**
- [ ] **Step 2: Run TypeScript check**
- [ ] **Step 3: Commit**

---

## Task 7: Refactor SettingsPage

**Files:**
- Modify: `apps/web/src/pages/SettingsPage.tsx`

- [ ] **Step 1: Replace header with PageHero component**
- [ ] **Step 2: Run TypeScript check**
- [ ] **Step 3: Commit**

---

## Task 8: Final Verification

- [ ] **Step 1: Run TypeScript check for all files**

```bash
cd apps/web && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 2: Run lint check**

```bash
cd apps/web && npm run lint
```
Expected: No errors (excluding pre-existing warnings)

- [ ] **Step 3: Commit all changes**

```bash
git add -A
git commit -m "refactor: unify all page headers with Hero style"
```
