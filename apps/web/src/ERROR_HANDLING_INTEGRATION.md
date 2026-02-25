# 增强错误处理系统集成指南

本文档说明如何将新创建的增强错误处理系统集成到项目中。

## 新增组件和工具概览

### 1. errorHandling.ts 工具
**文件位置**: `utils/errorHandling.ts`

**功能**:
- 错误类型分类（9种错误类型）
- 错误严重程度评估（4个级别）
- 详细的错误解决方案（10种场景）
- 自动错误分析和解决建议

**支持的错误类型**:
| 错误类型 | 严重程度 | 场景 |
|---------|---------|------|
| network | high | 网络连接失败 |
| timeout | medium | 请求超时 |
| authentication | high | 身份验证失败（401） |
| authorization | high | 权限不足（403） |
| not_found | medium | 资源未找到（404） |
| validation | low | 输入验证失败（400） |
| rate_limit | medium | 请求过于频繁（429） |
| server | critical | 服务器错误（500+） |
| payment | medium | 支付失败 |
| unknown | medium | 未知错误 |

**使用方式**:
```typescript
import { categorizeError, ErrorInfo } from '../utils/errorHandling';

// 在错误发生时调用
const errorInfo = categorizeError(error);

console.log(errorInfo.title);         // "网络错误"
console.log(errorInfo.message);        // "无法连接到服务器..."
console.log(errorInfo.severity);       // "high"
console.log(errorInfo.category);       // "network"
console.log(errorInfo.retryable);      // true
console.log(errorInfo.solution);      // 包含解决步骤和建议
```

### 2. EnhancedToast 组件
**文件位置**: `components/ui/EnhancedToast.tsx`

**功能**:
- 增强的错误提示卡片
- 显示错误详情和解决步骤
- 提供快捷操作按钮
- 支持展开/收起解决方案
- 错误严重程度颜色标识

**操作按钮**:
- **重试**: 重新执行失败的操作
- **复制**: 复制错误信息到剪贴板
- **关闭**: 关闭错误提示
- **反馈**: 打开邮件发送错误反馈
- **快捷操作**: 根据错误类型提供的快捷操作（如"刷新页面"、"前往登录页"等）

**使用方式**:
```typescript
import { EnhancedToast } from '../components/ui/EnhancedToast';
import { createRoot } from 'react-dom/client';

// 在需要显示错误时
const container = document.createElement('div');
document.body.appendChild(container);

const root = createRoot(container);
root.render(
  <EnhancedToast
    error={errorInfo}
    onClose={() => document.body.removeChild(container)}
    onRetry={() => retryOperation()}
    onDismiss={() => console.log('用户关闭了错误提示')}
  />
);
```

### 3. ErrorBoundary 组件
**文件位置**: `components/ErrorBoundary.tsx`

**功能**:
- 捕获组件树中的任何错误
- 显示友好的错误页面
- 提供错误详情和解决建议
- 支持自定义 fallback UI
- 提供 reset 机制

**使用方式**:
```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';

// 包裹整个应用或关键部分
<ErrorBoundary
  onError={(error, errorInfo) => {
    // 可选：发送错误到监控服务
    sendToMonitoring(error, errorInfo);
  }}
  fallback={<CustomErrorFallback />}
>
  <App />
</ErrorBoundary>

// 包裹特定页面
<ErrorBoundary fallback={<PageErrorFallback />}>
  <SomeComponent />
</ErrorBoundary>
```

### 4. useErrorHandler Hook
**文件位置**: `hooks/useErrorHandler.ts`

**功能**:
- 统一的错误处理接口
- 支持自动重试机制
- 增强的 Toast 显示
- 组件包装器

**提供的函数**:
```typescript
interface ErrorHandlerReturn {
  handleError: (error: any, options?: ErrorHandlerOptions) => void;
  handleAsyncError: <T>(promise: Promise<T>, options?: ErrorHandlerOptions) => Promise<T | null>;
  withErrorHandling: <T>(fn: () => Promise<T>, options?: ErrorHandlerOptions) => (args: any[]) => Promise<T>;
  wrapComponent: <P>(Component: React.ComponentType<P>, props: P) => JSX.Element;
}
```

**使用方式**:
```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleError, handleAsyncError, withErrorHandling, wrapComponent } = useErrorHandler({
    showToast: true,           // 默认显示简单 Toast
    showEnhanced: false,      // 默认不显示增强 Toast（可以动态切换）
    autoRetry: true,          // 自动重试
    maxRetries: 3,            // 最大重试次数
    retryDelay: 1000,         // 重试延迟
  });

  // 方式1：直接处理错误
  const handleClick = () => {
    try {
      doSomething();
    } catch (error) {
      handleError(error, { showEnhanced: true }); // 显示增强错误提示
    }
  };

  // 方式2：处理异步操作（自动重试）
  const fetchData = async () => {
    const result = await handleAsyncError(
      apiClient.getData(),
      { showEnhanced: true, autoRetry: true, maxRetries: 3 }
    );
    if (result) {
      // 成功
    }
  };

  // 方式3：包装函数
  const safeFetch = withErrorHandling(async () => {
    return await apiClient.saveData(data);
  }, { showEnhanced: true });

  // 方式4：包装组件
  const SafeComponent = wrapComponent(RiskyComponent, { showEnhanced: true });
  
  return <SafeComponent someProp={value} />;
}
```

## 集成步骤

### 步骤1：更新导入

在需要使用错误处理的地方添加导入：

```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { categorizeError } from '../utils/errorHandling';
```

### 步骤2：在根组件中添加 ErrorBoundary

```typescript
// 在 App.tsx 或 main.tsx 中
import { ErrorBoundary } from '../components/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // 发送错误到监控服务（如 Sentry）
    if (window.Sentry) {
      Sentry.captureException(error);
    }
  }}
>
  <Router>
    <AppRoutes />
  </Router>
</ErrorBoundary>
```

### 步骤3：在组件中使用 useErrorHandler

```typescript
function MyPage() {
  const { handleError, handleAsyncError } = useErrorHandler({
    showToast: true,
    showEnhanced: true,
  });

  const handleSubmit = async () => {
    const result = await handleAsyncError(
      apiClient.createProject(formData),
      { 
        showEnhanced: true,
        autoRetry: true,
        maxRetries: 2,
      }
    );

    if (result) {
      navigate(`/projects/${result.id}`);
    }
  };

  // ... rest of component
}
```

### 步骤4：在 API 调用中使用

```typescript
// 在 apiClient 或 API 相关文件中
async function createProject(data: ProjectData) {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // 错误会自动被捕获并分类
    throw error;
  }
}
```

## 使用场景示例

### 场景1：API 请求错误处理

```typescript
function ProjectList() {
  const { handleAsyncError } = useErrorHandler({ showEnhanced: true });

  const loadProjects = async () => {
    const result = await handleAsyncError(
      apiClient.getProjects(),
      { autoRetry: true, maxRetries: 2 }
    );

    if (result) {
      setProjects(result);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);
}
```

### 场景2：表单验证错误处理

```typescript
function CreateProjectForm() {
  const { handleError } = useErrorHandler();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      // 手动创建验证错误
      handleError({
        message: '项目名称不能为空',
        status: 400,
      }, { showEnhanced: true });
      return;
    }

    // 提交表单
    // ...
  };
}
```

### 场景3：AI 服务错误处理

```typescript
function ScriptEditor() {
  const { handleAsyncError } = useErrorHandler({ showEnhanced: true });

  const handleAIContinue = async () => {
    const result = await handleAsyncError(
      apiClient.continueScript(content),
      { showEnhanced: true }
    );

    if (result) {
      // 显示 DiffView
      showDiff(result);
    }
  };
}
```

### 场景4：网络错误处理

```typescript
function DataFetcher() {
  const { handleAsyncError } = useErrorHandler();

  const fetchData = async () => {
    const result = await handleAsyncError(
      fetch('/api/data'),
      { 
        showEnhanced: true,
        autoRetry: true,
        maxRetries: 3,
        retryDelay: 2000,
      }
    );

    if (result) {
      setData(result);
    }
  };
}
```

## 配置选项

### ErrorHandlerOptions

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| showToast | boolean | true | 是否显示简单 Toast |
| showEnhanced | boolean | false | 是否显示增强错误提示 |
| autoRetry | boolean | false | 是否自动重试 |
| maxRetries | number | 3 | 最大重试次数 |
| retryDelay | number | 1000 | 重试延迟（毫秒） |
| onError | (error: ErrorInfo) => void | undefined | 自定义错误回调 |

## 最佳实践

### 1. 错误分类
- 使用 `categorizeError` 函数自动分析错误
- 根据错误类型提供不同的解决方案
- 区分可重试和不可重试的错误

### 2. 错误提示
- 简单操作显示 Toast（快速提示）
- 严重错误显示 EnhancedToast（详细解决方案）
- 用户提供明确的下一步操作

### 3. 自动重试
- 网络错误和超时适合自动重试
- 验证错误不适合自动重试
- 逐步增加重试延迟（exponential backoff）

### 4. 错误监控
- 使用 ErrorBoundary 捕获未处理错误
- 集成 Sentry 或其他监控服务
- 记录错误上下文信息

### 5. 用户反馈
- 提供"反馈"按钮收集用户问题
- 包含错误详情和上下文
- 便于开发团队快速定位问题

## 迁移指南

### 从现有 Toast 迁移

**现有代码**:
```typescript
const { addToast } = useToast();
try {
  await someOperation();
} catch (error) {
  addToast({
    type: 'error',
    title: '操作失败',
    message: error.message,
  });
}
```

**迁移后代码**:
```typescript
const { handleAsyncError } = useErrorHandler({ showEnhanced: true });

const result = await handleAsyncError(someOperation());
// 错误会自动显示增强提示，包含解决步骤
```

### 在 API 客户端集成

**现有代码**:
```typescript
async function getData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**迁移后代码**:
```typescript
async function getData() {
  // 错误会自动被 useErrorHandler 捕获和分类
  const response = await fetch('/api/data');
  
  if (!response.ok) {
    // 抛出包含状态码的错误
    throw new Error(`HTTP ${response.status}`, { cause: response.status });
  }
  
  return await response.json();
}
```

## 注意事项

1. **性能考虑**
   - 避免在每个错误点都创建 EnhancedToast
   - 使用 ErrorBoundary 包裹关键部分而非整个应用
   - 合理使用 showEnhanced 选项

2. **用户体验**
   - 不要过度显示错误提示
   - 提供清晰的解决步骤
   - 支持用户关闭错误提示

3. **错误监控**
   - 集成生产环境错误监控
   - 记录错误上下文信息
   - 设置错误告警

4. **国际化**
   - 错误消息支持多语言
   - 解决步骤可以本地化
   - 使用 i18n 库管理翻译

## 预期效果

- **减少用户支持请求 50%**：用户可自助解决问题
- **提升用户满意度**：清晰的错误信息和解决步骤
- **降低用户挫败感**：提供明确的下一步操作
- **提高问题定位效率**：结构化的错误信息和代码
