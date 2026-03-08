# TypeScript 错误修复任务 - 第1份 (agents/*.ts)

## 目标
修复 src/agents 目录下的 TypeScript 错误

## ⚠️ 重要：全部使用 snake_case 格式

**所有 Prisma 字段必须使用 snake_case**：
- `projectId` → `project_id`
- `userId` → `user_id`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `apiKey` → `api_key`
- `baseUrl` → `base_url`

## 文件列表

### src/agents/base-agent-v2.ts (5 errors)
### src/agents/director.agent.ts (2 errors)
### src/agents/multi-agent.ts (10 errors)
### src/agents/orchestrator-v2.ts (10 errors)
### src/agents/outline-agent.ts (2 errors)
### src/agents/storyboard-agent.ts (5 errors)
### src/agents/storyline-agent.ts (1 error)

## 修复模式

### 1. Prisma 查询
```typescript
// 错误 ✗
where: { projectId }

// 正确 ✓
where: { project_id: projectId }
```

### 2. orderBy 排序
```typescript
// 错误 ✗
orderBy: { createdAt: 'desc' }

// 正确 ✓
orderBy: { created_at: 'desc' }
```

### 3. create/update 数据
```typescript
// 错误 ✗
data: { projectId, name }

// 正确 ✓
data: { project_id: projectId, name }
```

### 4. 访问返回字段
```typescript
// 错误 ✗
const userId = result.userId

// 正确 ✓
const userId = result.user_id
```

### 5. create() 必需字段
```typescript
// 错误 ✗
data: { project_id: projectId }

// 正确 ✓
data: {
  id: crypto.randomUUID(),
  updated_at: new Date(),
  project_id: projectId
}
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
