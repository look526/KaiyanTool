# Component Architecture Guidelines

## Overview

This document defines the component architecture for the KaiyanTool project, following **Atomic Design** principles and the **frontend-design** skill's emphasis on distinctive, production-grade interfaces.

## Design Philosophy

### Core Principles

1. **Intentional Aesthetics**: Every component must commit to a clear visual direction
2. **Composability**: Components should be building blocks, not monoliths
3. **Consistency**: Unified design tokens and patterns across all components
4. **Performance**: Lazy loading, code splitting, and optimized renders
5. **Accessibility**: WCAG 2.1 AA compliance for all interactive components

## Atomic Design Structure

```
components/
├── atoms/                    # Basic UI elements (< 100 lines)
│   ├── Button/
│   ├── Input/
│   ├── Label/
│   ├── Icon/
│   └── ...
├── molecules/                # Composed components (< 300 lines)
│   ├── SearchBar/
│   ├── ImageCard/
│   ├── FormField/
│   └── ...
├── organisms/                # Complex components (< 500 lines)
│   ├── ProjectList/
│   ├── ImageGallery/
│   ├── EditorPanel/
│   └── ...
├── templates/                # Page layouts
│   ├── DashboardLayout/
│   ├── EditorLayout/
│   └── ...
└── patterns/                 # Reusable patterns
    ├── DataGrid/
    ├── InfiniteScroll/
    └── ...
```

## Component Size Limits

| Component Type | Max Lines | Purpose |
|----------------|-----------|---------|
| Atom | < 100 | Single UI element with variants |
| Molecule | < 300 | 2-3 atoms composed together |
| Organism | < 500 | Complex UI sections |
| Template | < 300 | Page structure only |
| Pattern | < 400 | Generic reusable solutions |

## Naming Conventions

### Files
- **PascalCase**: `Button.tsx`, `ImageCard.tsx`
- **Index exports**: `index.ts` for clean imports

### Components
```typescript
// ✅ Good
export function Button({ variant, size, ...props }: ButtonProps) { }
export const ImageCard: React.FC<ImageCardProps> = ({ image, title, ...props }) => { }

// ❌ Bad - arrow function export
export const Button = () => { }
```

### Props Interfaces
```typescript
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

interface ButtonStyleProps {
  variant: NonNullable<ButtonProps['variant']>;
  size: NonNullable<ButtonProps['size']>;
}
```

## Component Template

```typescript
import React from 'react';
import { cn } from '../../utils/classNames';

/**
 * Button component for user actions.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" loading={isLoading}>
 *   Submit
 * </Button>
 * ```
 */
interface ButtonProps {
  /** Button variant for different visual styles */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      className={cn(
        'button',
        `button--${variant}`,
        `button--${size}`,
        loading && 'button--loading',
        className
      )}
      onClick={onClick}
      disabled={loading}
    >
      {loading && <Spinner className="button__spinner" />}
      {children}
    </button>
  );
}
```

## JSDoc Documentation Standards

### Required Documentation

1. **Component Description**: What the component does
2. **@example**: Usage example with code
3. **@param**: For complex props
4. **@returns**: For utility components

### Example

```typescript
/**
 * ImageSelector provides a unified interface for image selection,
 * supporting upload, AI generation, and library browsing.
 * 
 * Features:
 * - Drag & drop upload
 * - AI image generation with style presets
 * - Project asset library with search
 * - Three-view generation for characters
 * 
 * @example
 * ```tsx
 * <ImageSelector
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   projectId={project.id}
 *   type="character"
 *   enableThreeViews={true}
 * />
 * ```
 */
interface ImageSelectorProps {
  /** Current selected image URL */
  value: string | null;
  /** Callback when image changes */
  onChange: (url: string | null) => void;
  /** Project ID for asset library */
  projectId: string;
  // ... more props
}
```

## Styling Guidelines

### CSS Modules vs Inline Styles

**Prefer CSS Modules** for:
- Reusable components
- Complex animations
- Hover/focus states
- Multi-line styles

**Inline styles** ONLY for:
- Dynamic values (computed at runtime)
- One-off customizations
- Style prop passthrough
- Single-line simple overrides

### CSS Module Structure

```css
/* ImageSelector.module.css */
.image-selector {
  /* Block styles */
  &__three-views {
    display: flex;
    gap: 20px;
  }

  /* Element styles */
  &__view-label {
    font-size: 13px;
    font-weight: 500;
  }

  /* Modifier styles */
  &__button--primary {
    background-color: var(--primary-500);
  }

  /* State styles */
  &__button--loading {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

### Usage in Components

```typescript
// ✅ Good - Use CSS modules
import styles from './ImageSelector.module.css';

function Component() {
  return (
    <div className={styles.imageSelector}>
      <button className={styles.button}>Click</button>
    </div>
  );
}

// ❌ Bad - Inline styles
function Component() {
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <button style={{ backgroundColor: 'var(--primary-500)' }}>Click</button>
    </div>
  );
}
```

### Design Tokens

All components must use design tokens from `@/design-system/tokens`:

```typescript
// ✅ Good - using tokens
const styles = {
  button: {
    background: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-sm)',
  }
};

// ❌ Bad - hardcoded values
const styles = {
  button: {
    background: '#6366f1',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
  }
};
```

### Class Naming (BEM-inspired)

```css
/* Block */
.button { }

/* Element */
.button__icon { }

/* Modifier */
.button--primary { }
.button--loading { }

/* State */
.is-active { }
.is-disabled { }
```

## Composition Patterns

### Compound Components

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return <div className={cn('card', className)}>{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card__header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card__body">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card__footer">{children}</div>;
};

export { Card };
```

### Render Props

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T, loading: boolean, error: Error | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch logic...
  
  return <>{children(data as T, loading, error)}</>;
}
```

### Custom Hooks

```typescript
/**
 * Hook for managing image selection state
 */
function useImageSelection(options: UseImageSelectionOptions) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const select = useCallback((imageUrl: string) => {
    setSelectedImages(prev => [...prev, imageUrl]);
  }, []);
  
  const remove = useCallback((imageUrl: string) => {
    setSelectedImages(prev => prev.filter(url => url !== imageUrl));
  }, []);
  
  const clear = useCallback(() => {
    setSelectedImages([]);
  }, []);
  
  return {
    selectedImages,
    isSelecting,
    select,
    remove,
    clear,
  };
}
```

## Performance Guidelines

### Code Splitting

```typescript
// Lazy load heavy components
const ImageEditor = lazy(() => import('./ai/ImageEditor'));

function App() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <ImageEditor />
    </Suspense>
  );
}
```

### Memoization

```typescript
// Memoize expensive computations
const processedImages = useMemo(
  () => images.map(img => processImage(img)),
  [images]
);

// Memoize callback functions
const handleImageSelect = useCallback((imageUrl: string) => {
  // Handler logic
}, [dependencies]);

// Memoize components when needed
const ExpensiveComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

### Virtualization

For lists > 50 items:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.key} style={{ transform: `translateY(${virtualRow.start}px)` }}>
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing Guidelines

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--primary');
  });
  
  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('disables when loading', () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Snapshot Tests

```typescript
it('matches snapshot', () => {
  const { container } = render(<Button>Click</Button>);
  expect(container).toMatchSnapshot();
});
```

## Refactoring Large Components

### Strategy for Components > 500 Lines

1. **Identify Responsibilities**: What does this component do?
2. **Extract Sub-components**: Break into smaller, focused components
3. **Extract Hooks**: Move state logic to custom hooks
4. **Extract Utilities**: Helper functions to separate files
5. **Compose**: Reassemble using composition patterns

### Example: Refactoring ImageSelector (1493 lines)

```typescript
// Before: Monolithic component
function ImageSelector({ ... 20 props }) {
  // 200 lines of state
  // 300 lines of handlers
  // 500 lines of render
  // 493 lines of utilities
}

// After: Composed architecture

// 1. Custom hook for state management
function useImageSelectorState(props: UseImageSelectorProps) {
  // Extracted state logic
}

// 2. Custom hook for actions
function useImageSelectorActions(props: UseImageSelectorActions) {
  // Extracted handlers
}

// 3. Sub-components
function ImageSelectorTabs({ activeTab, onTabChange }) { }
function ImageSelectorUpload({ onUpload }) { }
function ImageSelectorGenerate({ onGenerate }) { }
function ImageSelectorLibrary({ onSelect }) { }
function ImageSelectorPreview({ image }) { }

// 4. Main component (now < 100 lines)
function ImageSelector(props: ImageSelectorProps) {
  const state = useImageSelectorState(props);
  const actions = useImageSelectorActions({ ...props, ...state });
  
  return (
    <div className="image-selector">
      <ImageSelectorTabs activeTab={state.activeTab} onTabChange={actions.setTab} />
      {state.activeTab === 'upload' && <ImageSelectorUpload onUpload={actions.handleUpload} />}
      {state.activeTab === 'generate' && <ImageSelectorGenerate onGenerate={actions.handleGenerate} />}
      {state.activeTab === 'library' && <ImageSelectorLibrary onSelect={actions.handleSelect} />}
      <ImageSelectorPreview image={state.selectedImage} />
    </div>
  );
}
```

## Migration Guide

### Phase 1: Foundation (Week 1-2)
- [ ] Create design token system
- [ ] Set up component documentation
- [ ] Refactor atom components

### Phase 2: Core Components (Week 3-4)
- [ ] Refactor molecule components
- [ ] Create composition patterns
- [ ] Add comprehensive tests

### Phase 3: Complex Components (Week 5-6)
- [ ] Refactor organism components
- [ ] Implement lazy loading
- [ ] Optimize performance

### Phase 4: Templates & Pages (Week 7-8)
- [ ] Create page templates
- [ ] Document patterns
- [ ] Final cleanup and verification

## Verification Checklist

Before merging component changes:

- [ ] Component follows size limits
- [ ] JSDoc documentation complete
- [ ] All props typed correctly
- [ ] Design tokens used (no hardcoded values)
- [ ] Tests added/updated
- [ ] Accessibility verified
- [ ] Performance impact assessed
- [ ] Documentation updated

## CI/CD Integration

### Component Size Check

Automated component size validation is integrated into CI/CD pipeline:

```bash
# Run locally
npm run check:component-size        # Unix/Linux/Mac
npm run check:component-size:win  # Windows

# Run in CI
# Automatically triggered on:
# - Pull requests to components/
# - Pushes to main/develop branches
```

### Size Limits Enforcement

| Component Type | Max Lines | CI Action |
|----------------|-----------|-----------|
| Atom | < 100 | Fail PR if exceeded |
| Molecule | < 300 | Fail PR if exceeded |
| Organism | < 500 | Fail PR if exceeded |
| Template | < 300 | Fail PR if exceeded |
| Pattern | < 400 | Fail PR if exceeded |
| Hook | < 300 | Fail PR if exceeded |
| Utils | < 150 | Fail PR if exceeded |

### GitHub Actions Workflow

The `.github/workflows/component-size-check.yml` workflow:
- Runs on every PR affecting `apps/web/src/components/**`
- Checks all component files against size limits
- Generates detailed report
- Comments on PR with results
- Fails PR if any component exceeds limits

### Example CI Output

```
================================================================================
Component Size Check Report
================================================================================

Total files checked: 42
Over limit: 0
Near limit (>90%): 3
Within limit: 39

⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
NEAR LIMIT COMPONENTS (>90%)
⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠⚠⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠⚠⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠⚠️⚠️⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠️⚠⚠️⚠⚠⚠️⚠️⚠️⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠⚠⚠️⚠️⚠⚠⚠⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠⚠⚠️⚠⚠️⚠⚠⚠⚠⚠️⚠️⚠⚠⚠️⚠⚠️⚠️⚠⚠⚠⚠⚠⚠⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠⚠⚠⚠️⚠⚠⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠️⚠️⚠⚠⚠⚠⚠⚠️⚠️⚠⚠⚠⚠⚠️⚠️⚠⚠️⚠️⚠⚠⚠⚠⚠⚠⚠⚠️⚠️⚠⚠⚠⚠️⚠⚠⚠️⚠⚠⚠️⚠⚠⚠️⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠⚠⚠️⚠⚠⚠️⚠️⚠️⚠️⚠️⚠⚠⚠⚠️⚠⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠⚠⚠️⚠️⚠️⚠️⚠⚠️⚠️⚠⚠️⚠️⚠️⚠⚠⚠️⚠⚠⚠️⚠️⚠⚠⚠⚠️⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠️⚠️⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠️⚠⚠⚠⚠️⚠️⚠️⚠️⚠⚠⚠⚠⚠️⚠️⚠⚠⚠⚠⚠️⚠⚠⚠⚠️⚠️⚠️⚠⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠️⚠�⚠⚠⚠⚠️⚠⚠⚠⚠️⚠⚠⚠⚠⚠⚠️⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠⚠⚠️⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠️⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠️⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠�⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠�⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠�⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠�⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠�⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠� 暂无素材
    </div>
  );
}

function AssetsGrid({
  assets,
  editingAssetId,
  categories,
  shouldUseThreeViews,
  type,
  currentView,
  onSelect,
  onEditCategory,
  onUpdateCategory,
  onDelete,
}: {
  assets: Asset[];
  editingAssetId: string | null;
  categories: CategoryOption[];
  shouldUseThreeViews: boolean;
  type: string;
  currentView: string;
  onSelect: (asset: Asset) => void;
  onEditCategory: (assetId: string) => void;
  onUpdateCategory: (assetId: string, category: string) => void;
  onDelete: (assetId: string) => void;
}) {
  return (
    <div style={styles.assetsGrid}>
      {assets.map((asset) => (
        <div key={asset.id} style={styles.assetContainer}>
          <button
            onClick={() => onSelect(asset)}
            style={styles.assetButton}
          >
            <img
              src={asset.thumbnailUrl || asset.url}
              alt={asset.name}
              style={styles.assetImage}
            />
          </button>
          
          {asset.categoryLabel && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onEditCategory(asset.id);
              }}
              style={styles.categoryBadge}
            >
              <Tag style={{ width: '10px', height: '10px' }} />
              {asset.categoryLabel}
            </div>
          )}
          
          {editingAssetId === asset.id && (
            <div style={styles.categoryEditor}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onUpdateCategory(asset.id, cat.value)}
                  style={getCategoryEditorItemStyle(asset.category === cat.value)}
                >
                  {cat.label}
                </button>
              ))}
              <button
                onClick={() => onDelete(asset.id)}
                style={styles.deleteButton}
              >
                删除素材
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  toolbar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: 1,
    minWidth: '200px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px',
    height: '16px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    borderRadius: '8px',
    border: '1px solid var(--border-primary)',
    backgroundColor: 'var(--bg-hover)',
    color: 'var(--text-primary)',
    fontSize: '14px',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-primary)',
    backgroundColor: 'var(--bg-hover)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  categoryMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 10,
    minWidth: '150px',
    overflow: 'hidden',
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-muted)',
  },
  assetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '12px',
  },
  assetContainer: {
    position: 'relative',
  },
  assetButton: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid transparent',
    cursor: 'pointer',
    padding: 0,
    background: 'none',
    transition: 'all 0.2s ease',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    fontSize: '10px',
    cursor: 'pointer',
  },
  categoryEditor: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '4px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-primary)',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 20,
    minWidth: '120px',
    overflow: 'hidden',
  },
  deleteButton: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    borderTop: '1px solid var(--border-primary)',
    background: 'transparent',
    color: '#ef4444',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

function getCategoryMenuItemStyle(isSelected: boolean): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
    color: isSelected ? '#8b5cf6' : 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
  };
}

function getCategoryEditorItemStyle(isSelected: boolean): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
    color: isSelected ? '#8b5cf6' : 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '12px',
  };
}
```

================================================================================
✅ All components within size limits!
================================================================================
```

### Local Development Workflow

1. **Before committing**:
   ```bash
   npm run check:component-size
   ```

2. **If violations found**:
   - Refactor the component
   - Extract sub-components
   - Move logic to hooks/utils
   - Re-run check

3. **After passing**:
   - Commit changes
   - Push to branch
   - CI will verify automatically

## Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [React Design Patterns](https://www.patterns.dev/react/)
- [Frontend Design Skill Guidelines](../../../.trae/skills/frontend-design)
