# ToAPIs 模型集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 AI 模型配置系统中集成 ToAPIs Provider，支持所有 ToAPIs 模型（GPT-5、GPT-4o、Claude、Gemini、Sora2、VEO3），并根据模型能力动态显示参数。

**Architecture:**
- 前端创建模型能力类型定义和工具函数
- 后端扩展 ToAPIs Provider 支持新的视频模型
- 模型配置页面仅显示 Provider/Model 选择（无参数）
- NodeConfigPanel 根据模型能力动态显示相关参数

**Tech Stack:** TypeScript, React, Express, Prisma

---

## 文件结构

### 新增文件
- `apps/web/src/types/ai.types.ts` - 前端 AI 类型定义（模型能力）
- `apps/web/src/components/ai/ModelParameters.tsx` - 动态参数渲染组件

### 修改文件
- `apps/api/src/types/ai.types.ts` - 后端 AI 类型定义
- `apps/api/src/services/ai/toapis.provider.ts` - ToAPIs Provider 实现
- `apps/web/src/components/workspace/NodeConfigPanel.tsx` - 节点配置面板

---

## 任务分解

### Task 1: 创建前端模型能力类型定义

**Files:**
- Create: `apps/web/src/types/ai.types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// apps/web/src/types/ai.types.ts

export type ModelCapability = 'chat' | 'image' | 'video';

export interface ToAPIsModelInfo {
  id: string;
  name: string;
  provider: 'toapis';
  capabilities: ModelCapability[];
  default_params?: {
    duration?: number;
    aspect_ratio?: string;
    size?: string;
    quality?: string;
    style?: string;
  };
}

export const TOAPIS_MODELS: ToAPIsModelInfo[] = [
  { id: 'gpt-5', name: 'GPT-5', provider: 'toapis', capabilities: ['chat'] },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'toapis', capabilities: ['chat'] },
  { id: 'claude', name: 'Claude', provider: 'toapis', capabilities: ['chat'] },
  { id: 'gemini', name: 'Gemini', provider: 'toapis', capabilities: ['chat'] },
  { id: 'sora2', name: 'Sora2', provider: 'toapis', capabilities: ['video'],
    default_params: { duration: 10, aspect_ratio: '16:9' } },
  { id: 'veo3', name: 'VEO3', provider: 'toapis', capabilities: ['video'],
    default_params: { duration: 10, aspect_ratio: '16:9' } },
];

export function getModelCapabilities(modelId: string): ModelCapability[] {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.capabilities || [];
}

export function isVideoModel(modelId: string): boolean {
  return getModelCapabilities(modelId).includes('video');
}

export function getModelDefaultParams(modelId: string): Record<string, any> {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.default_params || {};
}
```

- [ ] **Step 2: 验证文件创建成功**

Run: `ls -la apps/web/src/types/ai.types.ts`

---

### Task 2: 创建动态参数渲染组件

**Files:**
- Create: `apps/web/src/components/ai/ModelParameters.tsx`

- [ ] **Step 1: 创建 ModelParameters 组件**

```tsx
// apps/web/src/components/ai/ModelParameters.tsx
import { ModelCapability } from '../../types/ai';

interface ModelParametersProps {
  capabilities: ModelCapability[];
  value: Record<string, any>;
  onChange: (params: Record<string, any>) => void;
}

export function ModelParameters({ capabilities, value, onChange }: ModelParametersProps) {
  const updateParam = (key: string, val: any) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {capabilities.includes('video') && (
        <>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              视频时长 (秒)
            </label>
            <input
              type="number"
              min={5}
              max={20}
              value={value.duration || 10}
              onChange={e => updateParam('duration', Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              宽高比
            </label>
            <select
              value={value.aspect_ratio || '16:9'}
              onChange={e => updateParam('aspect_ratio', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            >
              <option value="16:9">16:9 (横屏)</option>
              <option value="9:16">9:16 (竖屏)</option>
              <option value="1:1">1:1 (方形)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              起始图片 URL
            </label>
            <input
              type="text"
              value={value.image_urls?.[0] || ''}
              onChange={e => updateParam('image_urls', [e.target.value])}
              placeholder="可选"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
          {capabilities.includes('veo3') && (
            <>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  结束图片 URL
                </label>
                <input
                  type="text"
                  value={value.end_image_url || ''}
                  onChange={e => updateParam('end_image_url', e.target.value)}
                  placeholder="可选 (VEO3)"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Prompt 强度: {value.prompt_strength ?? 0.8}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={value.prompt_strength || 0.8}
                  onChange={e => updateParam('prompt_strength', Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
```

---

### Task 3: 更新后端 AI 类型定义

**Files:**
- Modify: `apps/api/src/types/ai.types.ts`

- [ ] **Step 1: 添加 ToAPIs 模型类型和接口**

在 `AIProvider` 接口的 `type` 字段中添加 `'toapis'`（已存在）

在 `AIModel` 接口中添加视频模型支持（已存在 `type: 'chat' | 'image' | 'video'`）

添加 VEO3 视频请求接口：

```typescript
export interface VEO3VideoRequest {
  model?: 'veo3' | 'veo3-pro'
  prompt: string
  duration?: number
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  image_urls?: string[]
  end_image_url?: string
  prompt_strength?: number
  metadata?: any
}
```

- [ ] **Step 2: 验证类型定义正确**

Run: `cd apps/api && npx tsc --noEmit src/types/ai.types.ts`

---

### Task 4: 更新 ToAPIs Provider

**Files:**
- Modify: `apps/api/src/services/ai/toapis.provider.ts`

- [ ] **Step 1: 添加 VEO3 视频生成方法**

在 `ToapisProvider` 类中添加 `createVEO3Video` 方法：

```typescript
async createVEO3Video(request: VEO3VideoRequest): Promise<AICreateVideoResponse> {
  const imageUrls = [request.image_urls?.[0], request.end_image_url].filter(
    (u): u is string => typeof u === 'string' && u.length > 0
  )

  const veo3Request = {
    model: request.model || 'veo3',
    prompt: request.prompt,
    duration: request.duration ?? 10,
    aspect_ratio: request.aspect_ratio || '16:9',
    image_urls: imageUrls.length > 0 ? imageUrls : undefined,
    prompt_strength: request.prompt_strength ?? 0.8,
  }

  logger.info('ToAPIs VEO3 createVideo request', veo3Request)

  const response = await this.request('/videos/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
    },
    body: JSON.stringify(veo3Request),
  })

  if (!response.id) {
    throw new Error('Failed to create VEO3 video generation task')
  }

  const taskManager = new Sora2TaskManager(this.apiKey, this.baseUrl || 'https://api.toapis.com/v1')
  
  const result = await taskManager.waitForTaskCompletion(response.id, {
    pollInterval: 3000,
    maxPollAttempts: 200,
  })

  return {
    url: result.url || '',
    duration: result.metadata?.duration,
    resolution: result.metadata?.resolution,
  }
}
```

- [ ] **Step 2: 更新 chat 方法支持更多模型**

修改默认模型逻辑，使 chat 方法能支持 gpt-5、gpt-4o、claude、gemini 等模型：

```typescript
async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
  // 根据 options.model 选择实际使用的模型
  const modelMap: Record<string, string> = {
    'gpt-5': 'gpt-5',
    'gpt-4o': 'gpt-4o',
    'claude': 'claude-3-5-sonnet',
    'gemini': 'gemini-2.0-flash',
    'sora-2': 'sora-2',
  }

  const requestBody = {
    model: modelMap[options.model || ''] || options.model || 'gpt-4o',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4000,
  }
  // ... 其余代码保持不变
}
```

- [ ] **Step 3: 验证 Provider 更新正确**

Run: `cd apps/api && npx tsc --noEmit src/services/ai/toapis.provider.ts`

---

### Task 5: 更新 NodeConfigPanel

**Files:**
- Modify: `apps/web/src/components/workspace/NodeConfigPanel.tsx`

- [ ] **Step 1: 添加模型参数状态和导入**

在文件顶部添加导入：
```tsx
import { getModelCapabilities, isVideoModel, getModelDefaultParams } from '../../types/ai';
```

在组件内添加状态：
```tsx
const [modelParams, setModelParams] = useState<Record<string, any>>({});
```

- [ ] **Step 2: 添加模型选择和参数渲染**

在 Provider 选择下方添加 Model 选择和参数渲染：

```tsx
<div style={{ marginBottom: '12px' }}>
  <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block' }}>
    模型
  </label>
  <select
    value={selectedModel}
    onChange={(e) => {
      setSelectedModel(e.target.value);
      setModelParams(getModelDefaultParams(e.target.value));
    }}
    style={{
      width: '100%',
      padding: '10px 12px',
      borderRadius: '10px',
      border: `1px solid ${colors.border}`,
      background: colors.bgSecondary,
      color: colors.textPrimary,
      fontSize: '13px',
    }}
  >
    {(providers.find(p => p.id === selectedProvider)?.models || []).map(m => (
      <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
    ))}
  </select>
</div>

{/* 根据模型能力显示参数 */}
{(isVideoModel(selectedModel) || isImageModel(selectedModel)) && (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px', display: 'block' }}>
      模型参数
    </label>
    <ModelParameters
      capabilities={getModelCapabilities(selectedModel)}
      value={modelParams}
      onChange={setModelParams}
    />
  </div>
)}
```

- [ ] **Step 3: 更新 handleGenerate 传递模型参数**

修改 `handleGenerateWithAI` 函数：

```tsx
const handleGenerateWithAI = () => {
  if (!node) return;
  onGenerate(node.id, 'image', promptJson, selectedProvider, selectedModel, modelParams);
};
```

- [ ] **Step 4: 更新 onGenerate 接口类型**

修改 `NodeConfigPanelProps` 中的 `onGenerate` 签名：

```tsx
onGenerate: (
  nodeId: string,
  type: string,
  promptJson?: WorkspacePromptJson,
  providerId?: string,
  modelId?: string,
  modelParams?: Record<string, any>
) => void;
```

---

### Task 6: 验证与测试

- [ ] **Step 1: 运行前端构建检查**

Run: `cd apps/web && npm run build`
Expected: 无编译错误

- [ ] **Step 2: 运行后端构建检查**

Run: `cd apps/api && npm run build`
Expected: 无编译错误

- [ ] **Step 3: 测试模型选择**

Manual: 打开 Workspace -> 创建文本节点 -> 打开配置面板 -> 选择 ToAPIs Provider -> 验证模型下拉列表包含所有 ToAPIs 模型

- [ ] **Step 4: 测试视频参数显示**

Manual: 选择 Sora2 模型 -> 验证显示视频时长、宽高比、起始图片 URL
Manual: 选择 VEO3 模型 -> 验证额外显示结束图片 URL、Prompt 强度

---

## 验收标准

- [ ] AI 配置页面（ModelConfigurationPage）可以选择 ToAPIs Provider 及其所有模型
- [ ] AI 配置页面不显示任何模型参数
- [ ] NodeConfigPanel 根据模型能力动态显示相关参数
- [ ] 不显示 temperature、max_tokens 等通用参数
- [ ] Sora2/VEO3 视频模型显示正确的专属参数
- [ ] 统一参数接口：前端显示所有参数，后端只使用支持的参数
