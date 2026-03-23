# Proposal: enhance-light-mode

## Summary

当前项目已实现主题系统（ThemeContext + CSS Variables），但存在大量硬编码颜色，导致浅色模式支持不完整。主要问题集中在 `ScriptEditorPage` 等页面，需要将所有硬编码颜色替换为 CSS 变量，以实现完整的浅色/深色模式切换。

## Motivation

### 问题分析

1. **硬编码颜色问题**
   - `ScriptEditorPage.tsx` 存在大量硬编码颜色，如 `#070d1f`、`#dfe4fe`、`#ba9eff` 等
   - 这些硬编码值导致页面无法响应主题切换

2. **现有系统已具备的能力**
   - `ThemeContext` 提供 `light`、`dark`、`system` 三种主题模式
   - CSS 变量系统已定义完整的颜色令牌
   - 外观设置页面 (`AppearanceSettingsPage`) 已提供主题切换 UI

3. **目标**
   - 移除所有硬编码颜色，使用 CSS 变量
   - 确保所有页面和组件正确响应主题切换
   - 保持深色模式的视觉一致性

## Specification

### Capability: Light Mode Support

#### Requirement: Theme-Aware Components

所有 UI 组件必须使用 CSS 变量而非硬编码颜色。

**Variables to use:**
```css
/* Background */
--bg-base, --bg-surface, --bg-elevated, --bg-page
--bg-sidebar, --bg-hover, --bg-input, --bg-secondary, --bg-card, --bg-header

/* Text */
--text-primary, --text-secondary, --text-tertiary, --text-muted

/* Border */
--border-primary, --border-secondary, --border-hover

/* Accent */
--accent, --accent-light, --accent-glow, --accent-bg
```

#### Requirement: Consistent Dark Mode

深色模式下必须保持 "The Digital Curator" 设计语言的视觉效果。

**Dark mode values:**
```css
--bg-base: #05050a
--bg-surface: #0a0a12
--text-primary: #fafafa
--accent: #6366f1 (或用户选择的其他强调色)
```

#### Requirement: Monaco Editor Theme

Monaco 编辑器必须支持深色/浅色主题切换。

## Architecture

### Current System

```
ThemeContext
├── useTheme() hook
├── resolvedTheme: 'light' | 'dark'
└── accentColor: string

CSS Variables (index.css)
├── Light mode: :root[theme="light"]
└── Dark mode: :root[theme="dark"]
```

### Proposed Changes

1. **Audit Phase** - 识别所有硬编码颜色
2. **Replace Phase** - 替换为 CSS 变量
3. **Verify Phase** - 验证主题切换
4. **Monaco Phase** - 处理编辑器主题

## Alternatives

1. **全项目重构** - 引入 Tailwind CSS 的暗色模式支持
   - 缺点：需要大量修改，不符合当前项目技术栈

2. **保持现状** - 只修复 `ScriptEditorPage`
   - 缺点：其他页面可能存在同样问题

## Success Criteria

- [ ] 所有页面使用 CSS 变量
- [ ] 主题切换无视觉断裂
- [ ] Monaco 编辑器正确响应主题
- [ ] TypeScript 编译无错误
- [ ] 功能测试通过

## Dependencies

- 无外部依赖
- 基于现有的 `ThemeContext` 和 CSS 变量系统

## Risks

1. **遗漏页面** - 可能存在未发现的硬编码颜色
   - 缓解：全面的代码审计

2. **性能** - CSS 变量切换可能触发重渲染
   - 缓解：CSS 变量切换由浏览器处理，性能开销极小
