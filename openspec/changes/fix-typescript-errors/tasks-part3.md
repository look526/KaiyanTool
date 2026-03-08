# TypeScript 错误修复任务 - 第3份 (routes/*)

## 目标
修复 src/routes 目录下的错误（约 99 个错误）

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/routes/admin/assets.routes.ts (2 errors)
### src/routes/admin/auth.routes.ts (6 errors)
### src/routes/admin/logs.routes.ts (12 errors)
### src/routes/admin/users.routes.ts (6 errors)
### src/routes/agent-stream.routes.ts (7 errors)
### src/routes/ai-provider.routes.ts (1 error)
### src/routes/clothing-variant.routes.ts (1 error)
### src/routes/content-process.routes.ts (5 errors)
### src/routes/export-routes.ts (1 error)
### src/routes/image-enhancement.routes.ts (17 errors)
### src/routes/prompt-template.routes.ts (11 errors)
### src/routes/task-queue.routes.ts (5 errors)
### src/routes/upload.routes.ts (5 errors)

## 修复模式

```typescript
// Prisma 查询 - 错误 vs 正确
where: { projectId }           // ✗
where: { project_id: projectId } // ✓

// orderBy - 错误 vs 正确
orderBy: { createdAt: 'desc' }  // ✗
orderBy: { created_at: 'desc' } // ✓

// 访问返回字段 - 错误 vs 正确
result.userId                    // ✗
result.user_id                    // ✓

// create() 必需字段
data: { project_id: projectId }  // ✗ 缺少 id 和 updated_at
data: {
  id: crypto.randomUUID(),
  updated_at: new Date(),
  project_id: projectId
}                                 // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
