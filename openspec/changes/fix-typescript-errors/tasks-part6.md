# TypeScript 错误修复任务 - 第6份 (services - quality, render-queue, scene)

## 目标
修复 src/services 目录下的质量评分和渲染队列错误

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/services/quality/quality-scoring.service.ts (7 errors)
- userId → user_id
- targetId → target_id
- createdAt → created_at
- timestamp → created_at

### src/services/render-queue.service.ts (2 errors)
### src/services/scene-concept.service.ts (2 errors)
### src/services/script-analysis.service.ts (2 errors)
### src/services/script/script-parser.service.ts (2 errors)

## 修复模式

```typescript
// Prisma 查询
where: { userId }           // ✗
where: { user_id: userId } // ✓

// orderBy
orderBy: { createdAt: 'desc' }  // ✗
orderBy: { created_at: 'desc' } // ✓

// 访问返回字段
result.userId                    // ✗
result.user_id                    // ✓

// create() 必需字段
data: {
  id: crypto.randomUUID(),
  updated_at: new Date(),
  user_id: userId
}                                 // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
