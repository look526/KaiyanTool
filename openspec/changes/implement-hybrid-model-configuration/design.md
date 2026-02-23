# Design: Hybrid AI Model Configuration Architecture

## Overview

本文档详细说明混合式AI模型配置架构的设计决策、技术方案和权衡分析。

## Architectural Decision: Hybrid Approach

### Problem Statement

当前系统存在以下痛点：

1. **用户体验问题**：
   - 用户需要在每个功能页面重复选择AI模型
   - 没有全局默认模型设置，每次都要手动选择
   - 模型参数配置分散，难以统一管理

2. **开发维护问题**：
   - 各功能页面重复实现模型选择逻辑
   - 模型配置变更需要修改多处代码
   - 缺乏统一的模型管理抽象

3. **系统功能缺失**：
   - 无法追踪用户的模型使用偏好
   - 没有模型使用历史记录
   - 缺少批量测试和管理功能

### Proposed Solution: Hybrid Architecture

采用混合式架构，结合集中式配置和分布式选择的优势：

```
┌─────────────────────────────────────────────────────────────┐
│  Configuration Center (集中式)                         │
│  - Global default models per content type               │
│  - Parameter presets and templates                     │
│  - Batch operations (test, enable, disable)           │
│  - Usage analytics and statistics                     │
│  - Import/Export configuration                     │
└─────────────────────────────────────────────────────────────┘
                        ↓ Shared State
┌─────────────────────────────────────────────────────────────┐
│  API Layer                                          │
│  - UserPreferences CRUD                             │
│  - ModelParameters CRUD                            │
│  - Model usage tracking                            │
│  - Model testing endpoints                          │
└─────────────────────────────────────────────────────────────┘
                        ↓ Components
┌─────────────────────────────────────────────────────────────┐
│  Feature Pages (分布式选择)                           │
│  - Script Creation → ModelSelector(contentType="script")    │
│  - Image Generation → ModelSelector(contentType="image")     │
│  - Video Generation → ModelSelector(contentType="video")     │
│  - Text Generation → ModelSelector(contentType="text")      │
│                                                     │
│  Each selector:                                       │
│  - Reads global defaults first                         │
│  - Shows last used model                             │
│  - Allows temporary override                           │
│  - Links to Configuration Center                      │
└─────────────────────────────────────────────────────────────┘
```

## Data Model Design

### UserPreferences

```prisma
model UserPreferences {
  id                String   @id @default(uuid()) @db.Uuid
  userId            String   @unique @map("user_id") @db.Uuid
  
  defaultModels      Json     @default("{}")
  @map("default_models")
  // Structure:
  // {
  //   "text": "model-uuid-1",
  //   "image": "model-uuid-2",
  //   "video": "model-uuid-3",
  //   "audio": "model-uuid-4",
  //   "script": "model-uuid-5",
  //   "novel": "model-uuid-6",
  //   "storyline": "model-uuid-7",
  //   "outline": "model-uuid-8"
  // }
  
  lastUsedModels    Json     @default("{}")
  @map("last_used_models")
  // Structure: same as defaultModels, but tracks recent usage
  
  modelParameters   Json     @default("{}")
  @map("model_parameters")
  // Structure:
  // {
  //   "text": { temperature: 0.7, maxTokens: 4096, topP: 1.0 },
  //   "image": { steps: 50, guidanceScale: 7.5, ... },
  //   ...
  // }
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

### ModelParameters (Alternative Design)

**Rationale**: While UserPreferences.modelParameters is simple, a separate ModelParameters table offers:

1. **Better querying**: Can efficiently query parameters by type without loading entire user preferences
2. **Separation of concerns**: Parameters have different lifecycle than preferences
3. **Easier migration**: Can add parameter validation and versioning

```prisma
model ModelParameters {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  contentType ContentType @map("content_type")
  parameters  Json     @default("{}")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, contentType])
  @@index([userId, contentType])
}
```

**Decision**: Use separate ModelParameters table for production-grade scalability.

## Component Architecture

### ModelSelector Component

```typescript
interface ModelSelectorProps {
  contentType: ContentType
  
  value?: string
  onChange: (modelId: string) => void
  
  showLastUsed?: boolean
  showDefault?: boolean
  allowCustom?: boolean
  
  onManageModels?: () => void
  onRefreshModels?: () => void
}

interface ModelSelectorState {
  isOpen: boolean
  models: AIModel[]
  groupedModels: Record<string, AIModel[]>
  defaults: Record<ContentType, string>
  lastUsed: Record<ContentType, string>
  isLoading: boolean
  testResults: Record<string, TestResult>
}
```

**Component Responsibilities**:
1. **State Management**: Manage dropdown open/close, selection state
2. **Data Loading**: Fetch models by type, defaults, last used
3. **Filtering**: Filter by provider, search term, capabilities
4. **Testing**: Test individual models or batch test
5. **Persistence**: Save usage to API and localStorage
6. **Accessibility**: Keyboard navigation, ARIA labels, focus management

**Performance Optimizations**:
- **Memoization**: Use React.memo to prevent unnecessary re-renders
- **Virtual Scrolling**: For large model lists (>100 items)
- **Lazy Loading**: Load models on-demand, not on mount
- **Debouncing**: Debounce search input and API calls

### Configuration Center Page

```typescript
interface ModelConfigurationPageState {
  activeTab: ContentType
  preferences: UserPreferences
  parameters: Record<ContentType, any>
  testResults: Record<string, TestResult>
  selectedModels: Set<string>
}

const tabs = [
  { value: 'text' as ContentType, label: '文本生成', icon: FileText },
  { value: 'image' as ContentType, label: '图像生成', icon: Image },
  { value: 'video' as ContentType, label: '视频生成', icon: Video },
  { value: 'audio' as ContentType, label: '音频生成', icon: Mic },
  { value: 'script' as ContentType, label: '剧本创作', icon: Book },
  { value: 'novel' as ContentType, label: '小说创作', icon: Sparkles },
  { value: 'storyline' as ContentType, label: '故事线', icon: Network },
  { value: 'outline' as ContentType, label: '大纲生成', icon: List },
]
```

**Page Layout**:
```
Header
├─ Title & Description
├─ Quick Stats (providers, models, active)

Provider Management (collapsible)
├─ List of AI providers
├─ Enable/disable toggle
└─ Quick link to full provider page

Category Tabs
├─ 8 content type tabs
├─ Model count badges
└─ Keyboard navigation

Configuration Section (per tab)
├─ Default Model Selector
├─ Model List (grouped by provider)
├─ Parameters Panel
└─ Batch Actions

Global Actions
├─ Export Configuration
├─ Import Configuration
└─ Reset to Defaults
```

## API Design

### RESTful Endpoints

#### GET /api/preferences
**Description**: Get user's model preferences

**Response**:
```json
{
  "success": true,
  "data": {
    "defaultModels": {
      "text": "model-uuid-1",
      "image": "model-uuid-2"
    },
    "lastUsedModels": {
      "text": "model-uuid-1",
      "image": "model-uuid-3"
    },
    "modelParameters": {
      "text": {
        "temperature": 0.7,
        "maxTokens": 4096
      }
    }
  }
}
```

#### POST /api/preferences/default
**Description**: Set default model for a content type

**Request Body**:
```json
{
  "contentType": "text",
  "modelId": "model-uuid-1"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "defaultModels": {
      "text": "model-uuid-1"
    }
  }
}
```

#### POST /api/preferences/parameters
**Description**: Save parameters for a content type

**Request Body**:
```json
{
  "contentType": "text",
  "parameters": {
    "temperature": 0.8,
    "maxTokens": 8192,
    "topP": 0.95
  }
}
```

#### POST /api/models/test
**Description**: Test multiple models

**Request Body**:
```json
{
  "modelIds": ["model-uuid-1", "model-uuid-2", "model-uuid-3"]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "modelId": "model-uuid-1",
      "success": true,
      "responseTime": 1234,
      "message": "Connection successful"
    },
    {
      "modelId": "model-uuid-2",
      "success": false,
      "error": "Invalid API key"
    }
  ]
}
```

#### POST /api/models/usage
**Description**: Record model usage

**Request Body**:
```json
{
  "contentType": "text",
  "modelId": "model-uuid-1"
}
```

## Trade-offs Analysis

### 1. Data Storage: JSON vs Separate Tables

**Option A: Store parameters in UserPreferences.modelParameters (JSON)**

Pros:
- Simple schema, fewer tables
- Easy to query all preferences at once
- Faster for read-heavy workloads
- Less schema migration overhead

Cons:
- No type safety for parameters
- Difficult to query specific parameter types
- Can't add constraints or validation
- Harder to migrate parameter structures

**Option B: Separate ModelParameters table**

Pros:
- Type-safe parameter storage
- Easy to query by content type
- Can add validation at DB level
- Easier to evolve parameter structure
- Better for analytics (can query parameter usage)

Cons:
- More complex schema
- Requires joins for full preference load
- Slightly slower for full preference queries

**Decision**: Use **separate ModelParameters table** for scalability and type safety.

### 2. State Management: Global vs Local

**Option A: Global Redux/Zustand store**

Pros:
- Consistent state across app
- Easy to share between components
- Built-in dev tools and time-travel

Cons:
- More boilerplate
- Overkill for simple use case
- Increases bundle size
- Learning curve for new developers

**Option B: Local component state + API + localStorage**

Pros:
- Simpler, less boilerplate
- Components are self-contained
- Smaller bundle size
- Easier to understand

Cons:
- Potential state duplication
- Need manual sync
- No dev tools by default

**Decision**: Use **local component state + API + localStorage**. Use Context API only if multiple components need the same data.

### 3. Model Testing: Synchronous vs Asynchronous

**Option A: Synchronous testing (wait for all results)**

Pros:
- User sees all results at once
- Simpler UI (single loading state)
- Easier to implement batch comparison

Cons:
- Slower overall (one slow model blocks all)
- Poor user experience for large batches
- Can't show incremental progress

**Option B: Asynchronous testing (show results as they arrive)**

Pros:
- Faster perceived performance
- User sees results immediately
- Can cancel individual tests
- Better for large batches

Cons:
- More complex UI state management
- Harder to implement comparison view
- More API calls

**Decision**: Use **asynchronous testing** for better UX, with progress indicator.

### 4. Caching Strategy: API-first vs localStorage-first

**Option A: Always fetch from API**

Pros:
- Always fresh data
- Consistent across devices
- Simpler, no cache invalidation

Cons:
- Slower initial load
- More API calls
- Higher server load

**Option B: Cache in localStorage, refresh on demand**

Pros:
- Instant initial load
- Fewer API calls
- Works offline
- Better perceived performance

Cons:
- Cache invalidation complexity
- Potential stale data
- More complex logic

**Decision**: Use **localStorage cache with manual refresh**. Store timestamp and auto-refresh after 5 minutes.

## Security Considerations

### API Key Protection

- Never expose API keys in frontend
- Use server-side proxy for model testing
- Validate all model IDs belong to user
- Implement rate limiting for testing endpoints

### Data Privacy

- User preferences are user-specific
- No cross-user data access
- Implement proper authentication
- Log preference changes for audit

### Input Validation

- Validate all content type values
- Sanitize model IDs to prevent injection
- Validate parameter ranges (e.g., temperature 0-2)
- Implement size limits for parameters

## Performance Targets

### Frontend

| Metric | Target | Measurement |
|---------|---------|--------------|
| Initial page load | < 2s | Lighthouse Performance Score |
| ModelSelector render | < 100ms | React DevTools Profiler |
| Dropdown open/close | < 50ms | CSS transition duration |
| API response display | < 300ms | Network timing |

### Backend

| Metric | Target | Measurement |
|---------|---------|--------------|
| Preference GET | < 100ms | API response time |
| Preference SET | < 200ms | API response time |
| Model test | < 5s per model | Endpoint timeout |
| Database query | < 50ms | Prisma query duration |

## Migration Strategy

### Phase 1: Data Migration

```typescript
// Migration script

export async function migrateToHybridConfiguration() {
  const users = await prisma.user.findMany({
    include: {
      aIProviders: {
        where: { enabled: true },
        include: { models: true }
      }
    }
  })
  
  for (const user of users) {
    const defaultModels: Record<string, string> = {}
    
    // Set first model of each type as default
    for (const provider of user.aIProviders) {
      for (const model of provider.models) {
        if (!defaultModels[model.type]) {
          defaultModels[model.type] = model.id
        }
      }
    }
    
    // Create user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        defaultModels,
        lastUsedModels: {},
        modelParameters: {}
      }
    })
  }
}
```

### Phase 2: Feature Flag Rollout

1. Enable configuration center for beta users
2. Collect feedback and iterate
3. Gradually roll out to all users
4. Monitor performance and error rates
5. Full release after stabilization

### Phase 3: Cleanup

- Remove old model selection logic from feature pages
- Deprecate unused API endpoints
- Update documentation
- Train users on new workflow

## Future Extensions

### 1. AI Model Recommendations

**Goal**: Suggest optimal model based on context

**Implementation**:
- Track user success rates per model
- Analyze content characteristics
- Use ML to predict best model
- Show confidence score with recommendation

### 2. Cost Optimization

**Goal**: Help users minimize AI costs

**Implementation**:
- Track token usage per model
- Calculate cost per request
- Suggest cheaper alternatives
- Set budget limits and alerts

### 3. A/B Testing Framework

**Goal**: Test different model configurations

**Implementation**:
- Allow parallel generation with different models
- Blind test results
- Collect user preferences
- Auto-select best performing model

### 4. Model Marketplace

**Goal**: Enable community model sharing

**Implementation**:
- User can publish model configs
- Community rating system
- One-click import of community configs
- Model performance benchmarking

## Testing Strategy

### Unit Tests

```typescript
describe('ModelSelector', () => {
  it('should load models by content type', async () => {
    const { result } = render(<ModelSelector contentType="text" />)
    await waitFor(() => expect(result.getByText('GPT-4')).toBeInTheDocument())
  })
  
  it('should show default model badge', () => {
    const { result } = render(<ModelSelector contentType="text" defaultModel="model-1" />)
    expect(result.getByText('默认')).toBeInTheDocument()
  })
  
  it('should record usage on selection', async () => {
    const recordUsage = jest.fn()
    const { result } = render(<ModelSelector contentType="text" onRecordUsage={recordUsage} />)
    
    fireEvent.click(result.getByText('GPT-4'))
    await waitFor(() => expect(recordUsage).toHaveBeenCalledWith('text', 'model-1'))
  })
})
```

### Integration Tests

```typescript
describe('Model Configuration Flow', () => {
  it('should allow user to set default model', async () => {
    await page.goto('/settings/ai/models')
    await page.click('tab-text')
    await page.click('model-gpt-4')
    await page.click('set-default-button')
    
    await expect(page.locator('default-badge')).toBeVisible()
    
    const preferences = await apiClient.getUserPreferences()
    expect(preferences.defaultModels.text).toBe('model-gpt-4')
  })
})
```

### E2E Tests

```typescript
test('complete model configuration workflow', async ({ page }) => {
  // 1. Set default model in config center
  await page.goto('/settings/ai/models')
  await page.selectModel('text', 'GPT-4')
  await page.setAsDefault('text', 'GPT-4')
  
  // 2. Navigate to feature page
  await page.goto('/script/create')
  
  // 3. Verify default model is selected
  await expect(page.locator('model-selector')).toContainText('GPT-4')
  
  // 4. Create content
  await page.fill('prompt', 'Write a script')
  await page.click('generate')
  
  // 5. Verify correct model was used
  await expect(page.locator('generation-result')).toContainText('Generated with GPT-4')
})
```

## Monitoring & Observability

### Key Metrics

1. **User Engagement**:
   - % of users who set default models
   - Average number of models configured per user
   - Frequency of model changes
   - Feature page vs config center usage ratio

2. **Performance**:
   - API response times (p50, p95, p99)
   - Page load times
   - Model test success rates
   - Error rates by endpoint

3. **Business Impact**:
   - Reduction in support tickets for model selection
   - Time saved per configuration task
   - User satisfaction scores
   - AI cost optimization percentage

### Alerts

- API response time > 1s
- Error rate > 5%
- Test failure rate > 10%
- Database query time > 100ms

## Conclusion

The hybrid architecture provides the best balance of:

1. **User Experience**: Easy configuration, flexible selection
2. **Development Efficiency**: Reusable components, centralized logic
3. **System Scalability**: Efficient data models, performant APIs
4. **Future-Proof**: Extensible for advanced features

This design aligns with modern best practices and provides a solid foundation for future enhancements.
