# ToAPIs 模型集成设计文档

## 1. 概述

本文档描述如何将 ToAPIs (https://docs.toapis.com/docs/cn) 集成到 AI 模型配置系统中。

### 1.1 目标

- 在 AI 模型配置页面支持选择 ToAPIs Provider 及其所有模型
- 模型配置页面：仅选择 Provider 和模型，不显示参数
- 模型使用地方：根据模型能力动态显示相关参数
- 统一参数接口：显示所有参数，模型不支持的参数自动忽略

### 1.2 ToAPIs 模型列表

| 模型 | 类型 | 描述 |
|------|------|------|
| GPT-5 | chat | OpenAI GPT-5 模型 |
| GPT-4o | chat | OpenAI GPT-4o 模型 |
| Claude | chat | Anthropic Claude 模型 |
| Gemini | chat | Google Gemini 模型 |
| Sora2 | video | OpenAI Sora2 视频生成模型 |
| VEO3 | video | Google VEO3 视频生成模型 |

### 1.3 模型类型定义

```typescript
// apps/api/src/types/ai.types.ts
export type AIModelType = 'chat' | 'image' | 'video';

// ToAPIs 模型能力映射
export const TOAPIS_MODEL_CAPABILITIES: Record<string, AIModelType[]> = {
  'gpt-5': ['chat'],
  'gpt-4o': ['chat'],
  'claude': ['chat'],
  'gemini': ['chat'],
  'sora2': ['video'],
  'veo3': ['video'],
};

// 模型参数定义（仅模型特定参数，不含 temperature、max_tokens）
export interface ModelParameters {
  duration?: number;        // 视频时长 (5-20s)，用于 Sora2/VEO3
  aspect_ratio?: string;   // 宽高比，用于视频/图片
  image_urls?: string[];   // 起始图片 URL
  thumbnail?: string;       // 缩略图 URL
  end_image_url?: string;  // 结束图片 URL
  prompt_strength?: number; // prompt 强度
  size?: string;           // 图片尺寸
  quality?: string;        // 图片质量
  style?: string;          // 图片风格
  n?: number;              // 生成数量
}
```

## 2. 模型能力系统

### 2.1 能力定义

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

// ToAPIs 模型信息
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

// 获取模型能力
export function getModelCapabilities(modelId: string): ModelCapability[] {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.capabilities || [];
}

// 判断是否为视频模型
export function isVideoModel(modelId: string): boolean {
  return getModelCapabilities(modelId).includes('video');
}

// 获取模型默认参数
export function getModelDefaultParams(modelId: string): Record<string, any> {
  const model = TOAPIS_MODELS.find(m => m.id === modelId);
  return model?.default_params || {};
}
```

### 2.2 动态参数渲染组件

```typescript
// apps/web/src/components/ai/ModelParameters.tsx
import { ModelCapability } from '@/types/ai';

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
    <div className="space-y-4">
      {/* 视频模型参数 */}
      {capabilities.includes('video') && (
        <>
          <div className="param-group">
            <label className="param-label">视频时长 (秒)</label>
            <input
              type="number"
              min={5}
              max={20}
              value={value.duration || 10}
              onChange={e => updateParam('duration', Number(e.target.value))}
            />
          </div>
          <div className="param-group">
            <label className="param-label">宽高比</label>
            <select
              value={value.aspect_ratio || '16:9'}
              onChange={e => updateParam('aspect_ratio', e.target.value)}
            >
              <option value="16:9">16:9 (横屏)</option>
              <option value="9:16">9:16 (竖屏)</option>
              <option value="1:1">1:1 (方形)</option>
            </select>
          </div>
          <div className="param-group">
            <label className="param-label">起始图片 URL</label>
            <input
              type="text"
              value={value.image_urls?.[0] || ''}
              onChange={e => updateParam('image_urls', [e.target.value])}
              placeholder="可选"
            />
          </div>
        </>
      )}

      {/* VEO3 额外参数 */}
      {capabilities.includes('video') && (
        <>
          <div className="param-group">
            <label className="param-label">结束图片 URL</label>
            <input
              type="text"
              value={value.end_image_url || ''}
              onChange={e => updateParam('end_image_url', e.target.value)}
              placeholder="可选"
            />
          </div>
          <div className="param-group">
            <label className="param-label">Prompt 强度</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={value.prompt_strength || 0.8}
              onChange={e => updateParam('prompt_strength', Number(e.target.value))}
            />
            <span>{value.prompt_strength || 0.8}</span>
          </div>
        </>
      )}

      {/* 图片模型参数 */}
      {capabilities.includes('image') && (
        <>
          <div className="param-group">
            <label className="param-label">图片尺寸</label>
            <select
              value={value.size || '1024x1024'}
              onChange={e => updateParam('size', e.target.value)}
            >
              <option value="1024x1024">1024x1024</option>
              <option value="1024x1792">1024x1792</option>
              <option value="1792x1024">1792x1024</option>
            </select>
          </div>
          <div className="param-group">
            <label className="param-label">图片质量</label>
            <select
              value={value.quality || 'standard'}
              onChange={e => updateParam('quality', e.target.value)}
            >
              <option value="standard">标准</option>
              <option value="hd">高清</option>
            </select>
          </div>
          <div className="param-group">
            <label className="param-label">图片风格</label>
            <select
              value={value.style || 'vivid'}
              onChange={e => updateParam('style', e.target.value)}
            >
              <option value="vivid">生动</option>
              <option value="natural">自然</option>
            </select>
          </div>
          <div className="param-group">
            <label className="param-label">生成数量</label>
            <input
              type="number"
              min={1}
              max={10}
              value={value.n || 1}
              onChange={e => updateParam('n', Number(e.target.value))}
            />
          </div>
        </>
      )}
    </div>
  );
}
```

## 3. 配置页面设计

### 3.1 AI 模型配置页面（模型选择页）

位置：`apps/web/src/pages/AIProviderPage.tsx`

**设计原则：仅选择 Provider 和模型，不显示任何参数**

```
┌─────────────────────────────────────────────────────────────┐
│  AI 模型配置                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AI Provider          [ToAPIs        ▼]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 模型                      [Sora2 (视频)    ▼]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Key                    [••••••••••••••••]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [                           保存                           ]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**关键点：**
- 不显示任何模型参数（duration, aspect_ratio 等）
- 仅显示 Provider 选择和 Model 选择
- API Key 输入框

### 3.2 使用模型的地方（NodeConfigPanel）

位置：`apps/web/src/components/workspace/NodeConfigPanel.tsx`

**设计原则：根据所选模型能力动态显示相关参数**

```
┌─────────────────────────────────────────────────────────────┐
│  节点配置                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Provider: [ToAPIs        ▼]                                │
│                                                             │
│  模型:     [Sora2 (视频)  ▼]                                 │
│                                                             │
│  ─────────────────────────────────────────────              │
│                                                             │
│  视频参数:                                                   │
│                                                             │
│  视频时长 (秒)  [10] (范围: 5-20)                            │
│                                                             │
│  宽高比        [16:9 (横屏)  ▼]                              │
│                                                             │
│  起始图片 URL  [________________________]                    │
│                                                             │
│  结束图片 URL  [________________________] (VEO3 专用)        │
│                                                             │
│  Prompt 强度  [====●========] 0.8                           │
│                                                             │
│  ─────────────────────────────────────────────              │
│                                                             │
│  [                    保存配置                    ]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**关键点：**
- 根据模型能力（chat/image/video）显示对应参数
- 不显示 temperature、max_tokens 等通用参数
- VEO3 特有参数（end_image_url, prompt_strength）仅在 VEO3 时显示

## 4. 模型能力映射表

| 模型 | chat | image | video | duration | aspect_ratio | image_urls | end_image_url | prompt_strength | size | quality | style | n |
|------|------|-------|-------|----------|--------------|------------|---------------|-----------------|------|---------|-------|---|
| GPT-5 | ✓ | - | - | - | - | - | - | - | - | - | - | - |
| GPT-4o | ✓ | - | - | - | - | - | - | - | - | - | - | - |
| Claude | ✓ | - | - | - | - | - | - | - | - | - | - | - |
| Gemini | ✓ | - | - | - | - | - | - | - | - | - | - | - |
| Sora2 | - | - | ✓ | ✓ | ✓ | ✓ | - | - | - | - | - | - |
| VEO3 | - | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | - | - |

## 5. 实现计划

### Phase 1: 类型定义
- [ ] 在 `apps/api/src/types/ai.types.ts` 添加 ToAPIs 模型类型
- [ ] 在 `apps/web/src/types/ai.types.ts` 添加前端模型能力类型
- [ ] 创建 `TOAPIS_MODELS` 常量数组

### Phase 2: Provider 更新
- [ ] 更新 `toapis.provider.ts` 支持 Sora2 和 VEO3 视频生成
- [ ] 添加视频生成方法 `createVideo(params)`

### Phase 3: 前端组件更新
- [ ] 更新 AIProviderPage 仅显示 Provider 和 Model 选择
- [ ] 更新 NodeConfigPanel 添加 ModelParameters 组件
- [ ] 根据模型能力动态渲染参数表单

### Phase 4: 测试验证
- [ ] 测试 ToAPIs Provider 选择
- [ ] 测试 Sora2 视频生成参数
- [ ] 测试 VEO3 视频生成参数
- [ ] 验证参数不影响其他 Provider

## 6. 文件清单

### 新增文件
- `apps/web/src/components/ai/ModelParameters.tsx` - 动态参数渲染组件
- `apps/web/src/types/ai.types.ts` - 前端 AI 类型定义（更新）

### 修改文件
- `apps/api/src/types/ai.types.ts` - 后端 AI 类型定义
- `apps/api/src/services/ai/toapis.provider.ts` - ToAPIs Provider 实现
- `apps/web/src/pages/AIProviderPage.tsx` - 模型配置页面
- `apps/web/src/components/workspace/NodeConfigPanel.tsx` - 节点配置面板

## 7. 验收标准

- [ ] AI 配置页面可以选择 ToAPIs Provider 及其所有模型
- [ ] AI 配置页面不显示任何模型参数
- [ ] NodeConfigPanel 根据模型能力动态显示相关参数
- [ ] 不显示 temperature、max_tokens 等通用参数
- [ ] Sora2/VEO3 视频模型显示正确的专属参数
- [ ] 统一参数接口：前端显示所有参数，后端只使用支持的参数
