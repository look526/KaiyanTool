<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Prompt Management Guidelines

## Directory Structure

All prompts are centralized in `apps/api/src/prompts/`:

```
prompts/
├── index.ts              # Main entry point
├── types.ts              # Type definitions
├── loader.ts             # Prompt loader utility
├── templates/            # Style templates
│   ├── index.ts
│   └── style-templates.ts
├── agents/               # Agent prompts
│   └── index.ts
├── routes/               # Route prompts
│   └── polish-prompts.ts
└── services/             # Service prompts
    └── index.ts
```

## Naming Conventions

1. **Files**: Use `[module]-prompts.ts` format (e.g., `polish-prompts.ts`)
2. **Constants**: Use UPPER_SNAKE_CASE (e.g., `STORYLINE_AGENT`, `POLISH_PROMPTS`)
3. **Variables**: Use `{{variableName}}` syntax for template variables

## Categories

| Category | Directory | Description |
|----------|-----------|-------------|
| `template` | `templates/` | Style templates, visual styles |
| `agent` | `agents/` | AI agent system/user prompts |
| `route` | `routes/` | API route prompts |
| `service` | `services/` | Service layer prompts |

## Adding New Prompts

1. Identify the correct category directory
2. Create or update the appropriate file
3. Export from the category's `index.ts`
4. Export from main `prompts/index.ts`
5. Import and use in your code

### Example

```typescript
// In prompts/agents/index.ts
export const NEW_AGENT: AgentPromptConfig = {
  systemPrompt: `You are a helpful assistant...`,
  userPromptTemplate: `Please help with {{task}}...`
};

// In your code
import { NEW_AGENT } from '../prompts/agents';

const prompt = NEW_AGENT.systemPrompt;
```

## Modification Rules

1. **Always modify prompts in the `prompts/` directory**, not in agent/service files
2. **Use template variables** for dynamic content: `{{variable}}`
3. **Keep prompts organized** by category
4. **Update exports** when adding new prompts
5. **Maintain backward compatibility** when possible

## Template Variable Syntax

```typescript
// Define prompt with variables
const prompt = `Hello {{name}}, your task is {{task}}`;

// Replace variables
const rendered = prompt
  .replace('{{name}}', userName)
  .replace('{{task}}', taskDescription);
```

## Import Paths

From different locations:

| From | Import Path |
|------|-------------|
| `apps/api/src/agents/` | `../prompts/agents` |
| `apps/api/src/routes/` | `../prompts/routes` |
| `apps/api/src/services/` | `../prompts/services` or `../../prompts/services` |
| `apps/api/src/controllers/` | `../prompts/services` |
| `apps/api/src/config/` | `../prompts/templates` |

---

# AI Provider 调用规范

## 概述

本项目使用 `providerManager` 管理 AI Provider，正确调用 AI 需要遵循以下流程：

## 正确的调用方式

### 1. 从数据库获取 Provider 配置

```typescript
import { providerManager } from '../services/ai/provider.manager';
import { prisma } from '../lib/prisma';

router.post('/your-endpoint', async (req, res) => {
  const { model } = req.body; // 前端传递的模型 ID

  // 1. 从数据库获取启用的 AI Provider
  const aiProviders = await prisma.aIProvider.findMany({
    where: { enabled: true },
    include: { models: true },
  });

  if (aiProviders.length === 0) {
    res.status(400).json({ error: 'No AI provider available' });
    return;
  }

  // 2. 查找匹配的模型
  let selectedProvider = aiProviders[0];
  let modelName: string | undefined;

  if (model) {
    for (const p of aiProviders) {
      const foundModel = p.models?.find((m: any) => m.id === model || m.name === model);
      if (foundModel) {
        selectedProvider = p;
        modelName = foundModel.name;
        break;
      }
    }
  }

  // 3. 添加 Provider 到 manager
  providerManager.addProvider({
    id: selectedProvider.id,
    name: selectedProvider.name,
    type: selectedProvider.type as any, // 'openai' | 'zhipu' | 'google' | 'antsk'
    apiKey: selectedProvider.apiKey,
    baseUrl: selectedProvider.baseUrl || undefined,
  });

  // 4. 获取 Provider 实例
  const aiProvider = providerManager.getProvider(selectedProvider.id);
  if (!aiProvider) {
    throw new Error('Failed to initialize AI provider');
  }

  // 5. 调用 AI
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello' },
  ];

  const result = await aiProvider.chat(
    messages,
    modelName ? { model: modelName } : undefined
  );

  res.json({ content: result.content });
});
```

### 2. 前端调用方式

前端需要传递 `selectedModel` 参数：

```typescript
// api-client.ts
async optimizePrompt(prompt: string, model?: string) {
  return this.post('/prompt/optimize', { prompt, model });
}

// 页面调用时
const result = await apiClient.optimizePrompt(prompt, selectedModel);
```

## 常见错误及避免方法

### ❌ 错误 1: 硬编码模型名称

```typescript
// 错误 - 硬编码模型
const result = await provider.chat(messages, { model: 'glm-4' });

// 正确 - 从数据库获取
const result = await aiProvider.chat(messages, modelName ? { model: modelName } : undefined);
```

### ❌ 错误 2: 不传递 model 参数

```typescript
// 错误 - 前端不传 model
const result = await apiClient.optimizePrompt(prompt);

// 正确 - 传递 model
const result = await apiClient.optimizePrompt(prompt, selectedModel);
```

### ❌ 错误 3: 使用旧的 aiProviderService

```typescript
// 错误 - 使用旧的 service
import { aiProviderService } from '../services/ai/provider.service';
const result = await aiProviderService.chat(provider.id, messages);

// 正确 - 使用 providerManager
import { providerManager } from '../services/ai/provider.manager';
providerManager.addProvider({...});
const provider = providerManager.getProvider(id);
const result = await provider.chat(messages, options);
```

### ❌ 错误 4: 不注册路由

```typescript
// 错误 - 路由文件未注册到 index.ts
import promptRoutes from './routes/prompt.routes';

// 正确 - 在 index.ts 中注册
import promptRoutes from './routes/prompt.routes';
app.use('/api/prompt', promptRoutes);
```

## Provider 配置结构

数据库 `AIProvider` 表结构：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | Provider ID |
| name | string | Provider 名称 |
| type | string | 类型: 'openai' \| 'zhipu' \| 'google' \| 'antsk' |
| apiKey | string | API Key |
| baseUrl | string | 自定义 API 地址（可选） |
| enabled | boolean | 是否启用 |

数据库 `AIModel` 表结构：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 模型 ID |
| name | string | 模型名称（如 glm-4, glm-4-plus） |
| providerId | string | 关联的 Provider ID |

## Zhipu Provider 特殊说明

Zhipu Provider 默认模型定义在 `config/index.ts`：

```typescript
zhipu: {
  apiKey: process.env.ZHIPU_API_KEY || '',
  baseUrl: process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
}
```

但实际使用的模型应该从数据库的 `AIModel` 表中读取，而不是硬编码。

所有的prompts提示词，都要放在[text](apps/api/src/prompts)这个文件下
