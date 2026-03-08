# TypeScript 错误修复任务 - 第10份 (video-generation, remaining)

## 目标
修复剩余的 agents 和视频生成服务错误

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/services/video-generation.service.ts (4 errors)
### src/agents/director.agent.ts (2 errors)
### src/agents/base-agent-v2.ts (5 errors)
### src/agents/storyboard-agent.ts (5 errors)
### src/agents/storyline-agent.ts (1 error)
### src/agents/orchestrator-v2.ts (10 errors)

## 关键修复：Prisma create() 必需字段

当使用 `prisma.model.create({ data: {...} })` 时，必须包含所有必需字段：

```typescript
// 必需字段
data: {
  id: crypto.randomUUID(),      // 必需
  updated_at: new Date(),        // 必需
  type: 'video',
  status: 'pending',
  project_id: projectId,
  // 其他字段...
}
```

## 常见修复

```typescript
// Prisma 查询
where: { projectId }           // ✗
where: { project_id: projectId } // ✓

// orderBy
orderBy: { createdAt: 'desc' }  // ✗
orderBy: { created_at: 'desc' } // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
