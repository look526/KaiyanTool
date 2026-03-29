# Projects Page Redesign - Immersive Gallery Style

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重新设计项目页面，采用沉浸式封面画廊风格，参考 Figma/Notion 的视觉风格，强调大封面图的视觉冲击力和流畅的交互动效。

**Architecture:**
- 页面整体布局保持三段式：Header (固定) → 统计卡片 → 筛选工具栏 → 项目网格
- 项目卡片改为大封面设计，封面占据 60%+ 卡片空间
- 新增随机封面图生成逻辑（picsum.photos）
- 保持现有的筛选、搜索、视图切换功能
- 卡片 hover 效果采用视差缩放 + 渐变覆盖层

**Tech Stack:** React 19, TypeScript, CSS-in-JS (inline styles), material-symbols-outlined

---

## File Inventory

| File | Action | Purpose |
|------|--------|---------|
| `apps/web/src/pages/ProjectsPage.tsx` | Modify | 主页面重新设计 |
| `apps/web/src/components/projects/ProjectCard.tsx` | Modify | 项目卡片沉浸式改版 |
| `apps/web/src/components/projects/StatCard.tsx` | Modify | 统计卡片样式微调 |
| `apps/web/src/components/projects/FilterSelect.tsx` | Modify | 筛选器样式保持 |
| `packages/shared/src/types.ts` | Reference | Project 类型定义 |

---

## Task 1: Redefine ProjectCard Component (Immersive Grid View)

**Files:**
- Modify: `apps/web/src/components/projects/ProjectCard.tsx`

- [ ] **Step 1: Implement new ProjectCard with immersive cover design**

```tsx
// Key changes:
// 1. Cover image area takes 60%+ of card height (192px out of ~320px total)
// 2. Fallback to picsum.photos if no thumbnail_url
// 3. Parallax-like scale effect on hover (scale 1.05)
// 4. Gradient overlay slides up from bottom on hover
// 5. "点击查看" button fades in on hover
// 6. Card lifts up with purple glow shadow on hover

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  typeConfig: { icon: string; gradient: string; label: string; color: string };
  statusConfig: { label: string; color: string; bg: string };
  formatDate: (date: Date | string | undefined | null) => string;
}

// Grid View Card Structure:
// ┌────────────────────────────┐
// │  Cover Image (192px)       │ ← 60%+ of card
// │  [type badge]              │
// │                            │
// │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← hover gradient overlay
// │  ▓▓▓▓▓▓▓ [点击查看] ▓▓▓▓▓ │
// ├────────────────────────────┤
// │  Title (18px, bold)        │
// │  Description (2 lines)     │
// │  [status] [date] [avatar] │
// └────────────────────────────┘
```

- [ ] **Step 2: Run dev server and verify build**

```bash
cd apps/web && npm run dev
```
Expected: No TypeScript/compilation errors

- [ ] **Step 3: Test card hover effect in browser**

Navigate to http://localhost:3000/projects
- Cover image should scale smoothly on hover
- Gradient overlay should slide up
- "点击查看" button should fade in
- Card should lift with purple shadow

---

## Task 2: Redefine ProjectCard List View

**Files:**
- Modify: `apps/web/src/components/projects/ProjectCard.tsx`

- [ ] **Step 1: Update list view to match new design language**

```tsx
// List View Card Structure:
// ┌──────────────────────────────────────────────────────────┐
// │ [48px thumb] [Title + Description]  [Status] [Date]   │
// └──────────────────────────────────────────────────────────┘
// Changes from grid:
// 1. Use thumbnail_url with fallback to gradient
// 2. Add subtle hover translation (translateX 4px)
// 3. Maintain consistent typography with grid view
```

- [ ] **Step 2: Verify list view renders correctly**

---

## Task 3: Update ProjectsPage Layout

**Files:**
- Modify: `apps/web/src/pages/ProjectsPage.tsx`

- [ ] **Step 1: Update page structure and styling**

```tsx
// Key changes:
// 1. Add decorative background gradient + glow effects (radial gradient)
// 2. Update header background to use Glassmorphism properly
// 3. Adjust spacing (padding: 120px 48px 48px)
// 4. Update grid layout to responsive columns:
//    - >= 1400px: 4 columns
//    - >= 1200px: 3 columns
//    - >= 768px: 2 columns
//    - < 768px: 1 column
// 5. Update empty state to match new design language
// 6. Add CSS animation for gradient/glow effects
```

- [ ] **Step 2: Verify page layout in browser**

Check:
- Background gradient renders correctly
- Header is sticky with backdrop blur
- Stats cards are evenly spaced
- Project grid is responsive

---

## Task 4: Add Random Cover Image Logic

**Files:**
- Modify: `apps/web/src/components/projects/ProjectCard.tsx`

- [ ] **Step 1: Add cover image URL generation logic**

```tsx
// Get cover image URL with fallback priority:
// 1. project.thumbnail_url (user uploaded)
// 2. `https://picsum.photos/seed/${project.id}/800/600` (random)
// 3. Gradient placeholder (type-based gradient)

function getCoverImageUrl(project: Project): string | null {
  if (project.thumbnail_url) {
    return project.thumbnail_url;
  }
  // Use picsum for random covers
  return `https://picsum.photos/seed/${project.id}/800/600`;
}
```

---

## Task 5: Update StatCard Styling (Optional Polish)

**Files:**
- Modify: `apps/web/src/components/projects/StatCard.tsx`

- [ ] **Step 1: Minor style refinements if needed**

Check if existing StatCard matches new design language:
- Border radius (24px) ✓
- Backdrop blur ✓
- Hover lift effect ✓
- Gradient icon background ✓

No major changes expected, but verify consistency.

---

## Task 6: Final Verification

- [ ] **Step 1: Run TypeScript check**

```bash
cd apps/web && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 2: Run lint check**

```bash
cd apps/web && npm run lint
```
Expected: No errors

- [ ] **Step 3: Verify in browser**

- Grid view cards display correctly with large covers
- List view cards display correctly
- Hover animations work smoothly (scale, overlay, shadow)
- Search and filters work
- View mode toggle works
- Empty state renders correctly

- [ ] **Step 4: Test responsive layout**

- Resize browser to different breakpoints
- Verify grid columns adjust correctly

---

## Task 7: Commit Changes

- [ ] **Step 1: Commit all changes**

```bash
git add -A
git commit -m "feat: redesign projects page with immersive gallery style"
```
