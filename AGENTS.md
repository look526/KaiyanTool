<!-- OPENSPEC:START -->
# OpenSpec Instructions

AI assistants should reference `@/openspec/AGENTS.md` when:
- Proposing plans, specs, or changes
- Introducing breaking changes or architecture shifts
- Needing authoritative specs before coding

<!-- OPENSPEC:END -->

# Project Best Practices

## Project Structure

```
kaiyanTool/
├── apps/
│   ├── api/          # Express + Prisma + TypeScript
│   └── web/          # React 19 + Vite + Tailwind
└── packages/         # Shared code
```

## Prompt Management

**所有提示词必须放在 `apps/api/src/prompts/`**

```
prompts/
├── agents/           # Agent prompts (STORYLINE_AGENT, etc.)
├── routes/          # Route prompts
├── services/         # Service prompts
└── templates/        # Style templates
```

**规则:**
- 使用 `{{variableName}}` 语法
- 常量命名: `UPPER_SNAKE_CASE`
- 永远不要在 agent/service 文件中硬编码 prompt

## AI Provider 调用

**必须使用 `providerManager`，禁止使用旧的 `aiProviderService`**

```typescript
// 1. 从数据库获取配置
const providers = await prisma.aIProvider.findMany({
  where: { enabled: true },
  include: { models: true },
});

// 2. 添加到 manager
providerManager.addProvider({
  id: provider.id,
  type: provider.type, // 'openai' | 'zhipu' | 'google' | 'antsk'
  apiKey: provider.apiKey,
  baseUrl: provider.baseUrl || undefined,
});

// 3. 调用 AI (传递 model 参数!)
const result = await aiProvider.chat(messages, { model: modelName });
```

**前端必须传递 `model` 参数:**
```typescript
apiClient.optimizePrompt(prompt, selectedModel);
```

## Anti-Patterns (禁止)

| 错误 | 正确 |
|------|------|
| 硬编码模型名 `{ model: 'glm-4' }` | 从数据库读取模型 |
| 直接使用 `aiProviderService` | 使用 `providerManager` |
| 前端不传 model 参数 | 传递 `selectedModel` |
| 在 agent 文件中写 prompt | 放在 `prompts/` 目录 |
| 内联样式 | 使用 design tokens |
| UI 重构不用 skill | 使用 `ui-refactor` skill |

## UI 重构规范

**所有 UI 重构或修改必须使用 `ui-refactor` skill**

```bash
# 使用 Skill tool 调用
Skill(name="ui-refactor")
```

该 skill 提供：
- 标准化 UI 重构流程
- 主题适配指南
- 交互优化建议
- 样式问题修复

## API Response 格式

```typescript
// 成功
{ success: true, data: T }

// 错误
{ success: false, error: { code: string, message: string } }
```

## State Management

- **Server State**: React Query (服务器数据)
- **Client State**: Zustand (用户偏好、UI状态)
- **禁止**: 在 Zustand 中存储服务器数据

## API 命名规范（统一 snake_case）

### 概述

项目统一使用 snake_case 命名规范：
- **前端**: 使用 snake_case
- **后端数据库**: 使用 snake_case
- **转换**: 禁用自动大小写转换，直接使用 snake_case

### 转换中间件

| 文件 | 职责 |
|------|------|
| `apps/api/src/utils/case-transform.ts` | 转换工具函数（保留备用） |
| `apps/api/src/middleware/case-transform.middleware.ts` | 请求体转换 (camelCase → snake_case)（已禁用） |
| `apps/api/src/middleware/response-case-transform.middleware.ts` | 响应转换 (snake_case → camelCase)（已禁用） |

### 工作原理

- **禁用自动转换**: 通过设置 `CASE_TRANSFORM_ENABLED=false` 禁用大小写转换
- **统一命名**: 前后端直接使用 snake_case 命名规范
- **数据库交互**: 直接使用 snake_case 与 Prisma/数据库交互

### 使用规则

- **控制器**: 直接使用 snake_case 与 Prisma/数据库交互
- **前端**: 使用 snake_case 与 API 交互
- **禁止**: 使用 camelCase 命名规范

### 环境变量

```bash
CASE_TRANSFORM_ENABLED=false  # 禁用转换（统一使用 snake_case）
```

每次修改和重构，必须要保证没有编译错误，不会影响其他相关功能，否则不能视为完成
前端端口就是3000，后端端口是3001，不可改