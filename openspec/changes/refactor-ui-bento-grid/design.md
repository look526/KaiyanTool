# Design: refactor-ui-bento-grid

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend Architecture                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Pages Layer                                   │   │
│  │  LoginPage | ProjectsPage | ScriptEditorPage | CharactersPage    │   │
│  │  ScenesPage | ShotsPage | AIProvidersPage | AnalyticsPage ...    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   Business Components                              │   │
│  │  ProjectCard | CharacterCard | SceneCard | ShotCard | ...        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Bento Components ⭐                            │   │
│  │  BentoGrid | BentoCard | BentoCardSmall | BentoCardLarge |      │   │
│  │  BentoCardWide | BentoStatsCard | BentoGradientCard | ...        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Base UI Components                            │   │
│  │  Button | Input | Card | Modal | Toast | Tabs | Progress | ...  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Design Tokens                                  │   │
│  │  Colors | Typography | Spacing | Shadows | Animations            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Design System

### Color Tokens

```css
/* Primary - Apple Blue */
--color-primary: #007AFF;
--color-primary-hover: #0056CC;
--color-primary-active: #0044A3;

/* Accent Colors - For Bento Cards */
--color-accent-purple: #AF52DE;
--color-accent-pink: #FF2D55;
--color-accent-orange: #FF9500;
--color-accent-green: #34C759;
--color-accent-teal: #5AC8FA;
--color-accent-indigo: #5856D6;

/* Semantic Colors */
--color-success: #34C759;
--color-warning: #FF9500;
--color-error: #FF3B30;
--color-info: #007AFF;

/* Dark Mode */
--color-bg-primary-dark: #000000;
--color-bg-secondary-dark: #1C1C1E;
--color-bg-elevated-dark: #2C2C2E;
--color-text-primary-dark: #FFFFFF;
--color-text-secondary-dark: #EBEBF5;
--color-text-tertiary-dark: #8E8E93;

/* Light Mode */
--color-bg-primary-light: #FFFFFF;
--color-bg-secondary-light: #F2F2F7;
--color-bg-elevated-light: #FFFFFF;
--color-text-primary-light: #000000;
--color-text-secondary-light: #3C3C43;
--color-text-tertiary-light: #8E8E93;
```

### Typography Tokens

```css
/* Font Family */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

/* Font Sizes */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing Tokens

```css
/* Based on 4px grid */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
```

### Border Radius Tokens

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Shadow Tokens

```css
/* Dark Mode */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-card: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.2);

/* Light Mode */
--shadow-sm-light: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md-light: 0 4px 8px rgba(0, 0, 0, 0.1);
--shadow-lg-light: 0 8px 16px rgba(0, 0, 0, 0.12);
--shadow-card-light: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-hover-light: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Glow Effects */
--glow-purple: 0 4px 20px rgba(175, 82, 222, 0.3);
--glow-pink: 0 4px 20px rgba(255, 45, 85, 0.3);
--glow-orange: 0 4px 20px rgba(255, 149, 0, 0.3);
--glow-green: 0 4px 20px rgba(52, 199, 89, 0.3);
--glow-blue: 0 4px 20px rgba(0, 122, 255, 0.3);
```

## Bento Grid System

### Grid Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  BentoGrid Container                                                  │
│  display: grid                                                        │
│  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))         │
│  gap: 16px - 24px                                                     │
│                                                                      │
│  ┌─────────────────────┐  ┌──────────┐  ┌──────────┐               │
│  │    BentoCardLarge   │  │  Small   │  │  Small   │               │
│  │    grid-column: 2   │  │          │  │          │               │
│  │    grid-row: 2      │  │          │  │          │               │
│  └─────────────────────┘  └──────────┘  └──────────┘               │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────────────────┐   │
│  │  Small   │  │  Small   │  │       BentoCardWide              │   │
│  │          │  │          │  │       grid-column: 2             │   │
│  │          │  │          │  │                                  │   │
│  └──────────┘  └──────────┘  └─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Card Sizes

| Type | Size | Grid Span | Dimensions |
|------|------|-----------|------------|
| Small | 1x1 | 1 col × 1 row | 180px - 240px |
| Medium | 1x2 | 1 col × 2 rows | 180px - 240px × 2 |
| Large | 2x2 | 2 cols × 2 rows | 360px - 480px |
| Wide | 2x1 | 2 cols × 1 row | 360px - 480px |
| Tall | 1x2 | 1 col × 2 rows | 180px - 240px × 2 |

### Card Styling

```css
.bento-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--card-border);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bento-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-hover);
}

.bento-card-gradient {
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-color-dark) 100%);
  color: white;
}
```

## Animation System

### Entry Animations

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bento-card {
  animation: fadeInUp 0.5s ease forwards;
}

/* Staggered delays */
.bento-card:nth-child(1) { animation-delay: 0ms; }
.bento-card:nth-child(2) { animation-delay: 50ms; }
.bento-card:nth-child(3) { animation-delay: 100ms; }
.bento-card:nth-child(4) { animation-delay: 150ms; }
.bento-card:nth-child(5) { animation-delay: 200ms; }
.bento-card:nth-child(6) { animation-delay: 250ms; }
```

### Interaction Animations

```css
/* Hover Effects */
.bento-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bento-card:hover {
  transform: translateY(-4px) scale(1.02);
}

/* Click Feedback */
.bento-card:active {
  transform: scale(0.98);
}

/* Icon Animation */
.bento-card-icon {
  transition: transform 0.3s ease;
}

.bento-card:hover .bento-card-icon {
  transform: scale(1.1) rotate(5deg);
}
```

## Component Hierarchy

```
components/
├── ui/                          # Base UI Components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── Tabs.tsx
│   └── ...
│
├── bento/                       # Bento Components ⭐
│   ├── BentoGrid.tsx           # Grid container
│   ├── BentoCard.tsx           # Base card component
│   ├── BentoCardSmall.tsx      # 1x1 card
│   ├── BentoCardMedium.tsx     # 1x2 card
│   ├── BentoCardLarge.tsx      # 2x2 card
│   ├── BentoCardWide.tsx       # 2x1 card
│   ├── BentoCardTall.tsx       # 1x2 card (vertical)
│   ├── BentoStatsCard.tsx      # Stats display card
│   ├── BentoActionCard.tsx     # Action button card
│   ├── BentoImageCard.tsx      # Image display card
│   └── BentoGradientCard.tsx   # Gradient background card
│
└── business/                    # Business Components
    ├── ProjectCard.tsx
    ├── CharacterCard.tsx
    ├── SceneCard.tsx
    ├── ShotCard.tsx
    └── ...
```

## Theme Switching

### CSS Variables Approach

```css
:root {
  /* Light mode by default */
  --bg-primary: var(--color-bg-primary-light);
  --bg-secondary: var(--color-bg-secondary-light);
  --text-primary: var(--color-text-primary-light);
  --text-secondary: var(--color-text-secondary-light);
  --card-bg: var(--card-bg-light);
  --card-border: var(--card-border-light);
  --shadow-card: var(--shadow-card-light);
}

[data-theme='dark'] {
  --bg-primary: var(--color-bg-primary-dark);
  --bg-secondary: var(--color-bg-secondary-dark);
  --text-primary: var(--color-text-primary-dark);
  --text-secondary: var(--color-text-secondary-dark);
  --card-bg: var(--card-bg-dark);
  --card-border: var(--card-border-dark);
  --shadow-card: var(--shadow-card-dark);
}
```

### Theme Context

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Usage in components
const { theme } = useTheme();
```

## Migration Strategy

### Phase 1: Parallel Development
- Create new Bento components alongside existing components
- No breaking changes to existing pages

### Phase 2: Gradual Migration
- Migrate one page at a time
- Keep old components available for fallback

### Phase 3: Cleanup
- Remove unused old components
- Update all imports

## Performance Considerations

1. **CSS-in-JS vs CSS Variables**: Use CSS variables for better performance
2. **Animation Performance**: Use `transform` and `opacity` for animations (GPU accelerated)
3. **Lazy Loading**: Lazy load Bento components for faster initial load
4. **Memoization**: Memoize card components to prevent unnecessary re-renders
