# ImageSelector Component Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        ImageSelector                             │
│                         (200 lines)                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Display Layer                          │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │  │
│  │  │ ThreeViews     │  │ SingleImage    │  │ Trigger    │ │  │
│  │  │ Display        │  │ Display        │  │ Button     │ │  │
│  │  └────────────────┘  └────────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Modal Layer                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              ImageSelectorModal                     │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │           ImageSelectorTabs                   │  │  │  │
│  │  │  │   [Upload]  [AI Generate]  [Library]         │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │            Tab Content                        │  │  │  │
│  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │  │  │  │
│  │  │  │  │ Upload   │ │ Generate │ │ Library  │     │  │  │  │
│  │  │  │  │ (80L)    │ │ (350L)   │ │ (300L)   │     │  │  │  │
│  │  │  │  └──────────┘ └──────────┘ └──────────┘     │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Supporting Layer:
┌─────────────────────────────────────────────────────────────────┐
│                    Custom Hooks                                  │
│  ┌─────────────────────────┐  ┌────────────────────────────┐   │
│  │ useImageSelectorState   │  │ useImageSelectorActions    │   │
│  │ (150 lines)             │  │ (250 lines)                │   │
│  │                         │  │                            │   │
│  │ - UI State              │  │ - handleUpload()           │   │
│  │ - View State            │  │ - handleGenerate()         │   │
│  │ - Data State            │  │ - handleSelectAsset()      │   │
│  │ - Generation State      │  │ - handleDeleteAsset()      │   │
│  └─────────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Utilities                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ imageUtils.ts (100 lines)                               │   │
│  │  - getFullUrl()                                         │   │
│  │  - getStylePrompt()                                     │   │
│  │  - getNegativePrompt()                                  │   │
│  │  - getThreeViewsPrompt()                                │   │
│  │  - getStyleName()                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Types                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ types.ts                                                 │   │
│  │  - ImageSelectorProps                                    │   │
│  │  - TabType, ThreeViewsMode, ImageType                    │   │
│  │  - CategoryOption, StyleOption, Asset                    │   │
│  │  - STYLE_OPTIONS, TYPE_TO_CATEGORY, STYLE_NAMES          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action
    │
    ↓
┌─────────────────────────┐
│   Event Handler         │
│   (useImageSelector     │
│    Actions Hook)        │
└─────────────────────────┘
    │
    ├─→ Update State
    │      │
    │      ↓
    │   ┌─────────────────────────┐
    │   │ State Setter            │
    │   │ (useImageSelector       │
    │   │  State Hook)            │
    │   └─────────────────────────┘
    │             │
    │             ↓
    │         Re-render
    │
    ├─→ API Call
    │      │
    │      ↓
    │   ┌─────────────────────────┐
    │   │ apiClient               │
    │   │ (uploadImage,           │
    │   │  generateImage)         │
    │   └─────────────────────────┘
    │             │
    │             ↓
    │         Success/Error
    │
    └─→ UI Update
           │
           ↓
       ┌─────────────────────────┐
       │ Component Re-render     │
       │ (New props/state)       │
       └─────────────────────────┘
```

## Component Responsibilities

### Main Component (index.tsx)
- **Purpose**: Orchestration and composition
- **Responsibilities**:
  - Manage modal visibility
  - Coordinate sub-components
  - Pass state/actions to children
  - Handle high-level logic

### Display Components
- **ThreeViewsDisplay**: Render three-view selection UI
- **SingleImageDisplay**: Render selected image with remove button
- **ImageSelectorTrigger**: Render upload button when empty

### Tab Components
- **ImageSelectorTabs**: Tab navigation UI
- **ImageSelectorUpload**: File upload interface
- **ImageSelectorGenerate**: AI generation form and controls
- **ImageSelectorLibrary**: Asset browser with search/filter

### Custom Hooks
- **useImageSelectorState**: 
  - Manage all component state
  - Compute derived values
  - Handle side effects (useEffect)
  
- **useImageSelectorActions**:
  - Business logic handlers
  - API interactions
  - Toast notifications
  - State updates

### Utilities
- **imageUtils**: Pure functions for:
  - URL transformation
  - Prompt generation
  - Style helpers

### Types
- **types.ts**: Centralized type definitions

## File Size Distribution

```
Component                  Lines    Category
─────────────────────────────────────────────
index.tsx                   200    Main
ImageSelectorGenerate.tsx   350    Tab
ImageSelectorLibrary.tsx    300    Tab
useImageSelectorActions.ts  250    Hook
useImageSelectorState.ts    150    Hook
ImageSelectorUpload.tsx      80    Tab
imageUtils.ts               100    Utils
ImageSelectorTabs.tsx        50    Tab
types.ts                    120    Types
index.ts                     30    Exports
─────────────────────────────────────────────
Total:                     1,630   (across 10 files)
Average:                     163   lines/file
```

## Import Structure

```typescript
// External usage
import { ImageSelector } from '@/components/ImageSelector';

// Internal structure
index.tsx
  ├── hooks/useImageSelectorState
  ├── hooks/useImageSelectorActions
  ├── ImageSelectorTabs
  ├── ImageSelectorUpload
  ├── ImageSelectorGenerate
  ├── ImageSelectorLibrary
  └── types

ImageSelectorGenerate.tsx
  ├── types
  ├── ui/button-new
  ├── ui/ModelSelector
  └── utils/imageUtils

ImageSelectorLibrary.tsx
  ├── types
  ├── ui/button-new
  └── lucide-react (icons)

hooks/useImageSelectorActions.ts
  ├── apiClient
  ├── utils/imageUtils
  └── ui/Toast

utils/imageUtils.ts
  └── (pure functions, no dependencies)
```

## State Structure

```typescript
interface ImageSelectorState {
  // UI State
  showModal: boolean;
  activeTab: 'upload' | 'generate' | 'library';
  showReferenceImagePicker: boolean;
  
  // View State
  currentView: 'front' | 'side' | 'top';
  localThreeViewsMode: 'separate' | 'combined';
  effectiveThreeViewsMode: 'separate' | 'combined';
  
  // Data State
  assets: Asset[];
  loadingAssets: boolean;
  searchQuery: string;
  categories: CategoryOption[];
  selectedCategory: string;
  showCategoryMenu: boolean;
  editingAssetId: string | null;
  
  // Generation State
  generating: boolean;
  prompt: string;
  negativePrompt: string;
  style: string;
  selectedModel: string | undefined;
  referenceImage: string | null;
  generatedImages: string[];
  imageCount: number;
  selectedImage: string | null;
}
```

## Actions Structure

```typescript
interface ImageSelectorActions {
  handleUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleGenerate: () => Promise<void>;
  handleSelectGeneratedImage: (imageUrl: string) => void;
  handleThreeViewsSelect: (view: ViewType, imageUrl: string) => void;
  handleThreeViewsRemove: (view: ViewType) => void;
  handleViewSelect: (view: ViewType) => void;
  handleRemove: () => void;
  handleSelectAsset: (asset: Asset) => void;
  handleUpdateAssetCategory: (assetId: string, category: string) => Promise<void>;
  handleDeleteAsset: (assetId: string) => Promise<void>;
}
```

## Testing Structure

```
ImageSelector/
├── __tests__/
│   ├── ImageSelector.test.tsx          # Integration tests
│   ├── ImageSelectorTabs.test.tsx      # Component tests
│   ├── ImageSelectorUpload.test.tsx    # Component tests
│   ├── ImageSelectorGenerate.test.tsx  # Component tests
│   ├── ImageSelectorLibrary.test.tsx   # Component tests
│   ├── hooks/
│   │   ├── useImageSelectorState.test.ts
│   │   └── useImageSelectorActions.test.ts
│   └── utils/
│       └── imageUtils.test.ts
└── __mocks__/
    └── apiClient.ts
```

## Performance Considerations

### Memoization Points
```typescript
// Components
const ImageSelectorTabs = memo(...);
const ImageSelectorUpload = memo(...);

// Hooks
const state = useMemo(() => computeState(), [dependencies]);
const actions = useCallback(() => { ... }, [dependencies]);

// Utilities (already pure)
const getStylePrompt = memoize((basePrompt, style) => { ... });
```

### Code Splitting Opportunities
```typescript
// Lazy load tabs
const ImageSelectorGenerate = lazy(() => 
  import('./ImageSelectorGenerate')
);
const ImageSelectorLibrary = lazy(() => 
  import('./ImageSelectorLibrary')
);

// Usage
<Suspense fallback={<TabSkeleton />}>
  {activeTab === 'generate' && <ImageSelectorGenerate />}
  {activeTab === 'library' && <ImageSelectorLibrary />}
</Suspense>
```

## Extension Points

### Adding New Tab
1. Create `ImageSelectorNewTab.tsx`
2. Add to types: `type TabType = 'upload' | 'generate' | 'library' | 'new'`
3. Import and add to main component

### Adding New Style
1. Add to `STYLE_OPTIONS` in `types.ts`
2. Add style prompt logic to `utils/imageUtils.ts`

### Adding New View Type
1. Update `ViewType` in `types.ts`
2. Update view arrays in display components

---

**Architecture Version**: 1.0  
**Last Updated**: 2026-03-04  
**Maintainer**: Development Team
