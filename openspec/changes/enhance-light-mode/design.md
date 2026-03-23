# Design: enhance-light-mode

## Overview

本变更旨在通过移除硬编码颜色，将 `ScriptEditorPage` 转换为完全主题感知的组件，同时保持深色模式的视觉一致性。

## Architecture

### Current State

```
ScriptEditorPage (Hardcoded Colors)
├── background: '#070d1f'
├── color: '#dfe4fe'
├── border: '1px solid rgba(255, 255, 255, 0.1)'
└── ...
```

### Target State

```
ScriptEditorPage (Theme-Aware)
├── useTheme() → resolvedTheme: 'light' | 'dark'
├── background: 'var(--bg-base)'
├── color: 'var(--text-primary)'
├── border: '1px solid var(--border-primary)'
└── ...
```

## Color Mapping Strategy

### Background Colors

| Current Hardcoded | CSS Variable |
|-------------------|--------------|
| `#070d1f` | `--bg-base` |
| `#0c1326` | `--bg-surface` |
| `#1c253e` | `--bg-elevated` |
| `#000000` | `--bg-page` |
| `rgba(7, 13, 31, 0.6)` | `--bg-sidebar` |
| `rgba(12, 19, 38, 0.5)` | `--bg-card` |

### Text Colors

| Current Hardcoded | CSS Variable |
|-------------------|--------------|
| `#dfe4fe` | `--text-primary` |
| `#a5aac2` | `--text-secondary` |
| `#6f758b` | `--text-muted` |
| `#ba9eff` | `--accent` (primary action) |
| `#ec63ff` | `--accent` (tertiary) |
| `#34b5fa` | `--secondary` |

### Border Colors

| Current Hardcoded | CSS Variable |
|-------------------|--------------|
| `rgba(255, 255, 255, 0.1)` | `--border-primary` |
| `rgba(65, 71, 91, 0.3)` | `--border-secondary` |
| `rgba(186, 158, 255, 0.3)` | `--accent-bg` |

### Gradient Colors

| Current Hardcoded | CSS Variable |
|-------------------|--------------|
| `linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)` | `--gradient-accent` |
| `linear-gradient(135deg, #ec63ff 0%, #f487ff 100%)` | `--gradient-pink` |
| `linear-gradient(135deg, #34b5fa 0%, #17a8ec 100%)` | `--gradient-secondary` |

## Theme-Aware Pattern

### Before (Hardcoded)

```tsx
<div style={{
  background: '#070d1f',
  color: '#dfe4fe',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}}>
```

### After (Theme-Aware)

```tsx
const { resolvedTheme } = useTheme();
const isDark = resolvedTheme === 'dark';

<div style={{
  background: 'var(--bg-base)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-primary)',
}}>
```

## Special Cases

### Accent Color with Opacity

Some accent colors use opacity variants. Map to CSS variables with opacity:

```tsx
// Before
background: 'rgba(186, 158, 255, 0.1)'

// After - use accent-bg
background: 'var(--accent-bg)'
```

### Ambient Glow Effects

```tsx
// Before
boxShadow: '0 0 8px rgba(52, 181, 250, 0.6)'

// After - use accent-shadow or custom CSS variable
boxShadow: 'var(--shadow-glow, 0 0 8px rgba(52, 181, 250, 0.6))'
```

## Monaco Editor Integration

Monaco uses `vs-dark` and `vs-light` themes. The `MonacoEditor` component should:

1. Accept `theme` prop
2. Map `resolvedTheme` to `vs-dark`/`vs-light`
3. Ensure editor content is visible in both modes

## Testing Strategy

### Visual Validation Checklist

- [ ] Sidebar visible in light mode
- [ ] Navigation icons readable in light mode
- [ ] Editor background appropriate in light mode
- [ ] AI panel readable in light mode
- [ ] Buttons have proper contrast in both modes
- [ ] Workflow steps visible in both modes

### Dark Mode Preservation

- [ ] Glow effects still present
- [ ] Gradient buttons preserved
- [ ] Glass morphism effect maintained
- [ ] Overall "Digital Curator" aesthetic intact
