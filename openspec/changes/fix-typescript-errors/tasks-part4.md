# TypeScript 错误修复任务 - 第4份 (services - analytics, auth, backup)

## 目标
修复 src/services 目录下的核心服务错误（约 80 个错误）

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/services/analytics.service.ts (22 errors)
### src/services/audit.service.ts (2 errors)
### src/services/auth.service.ts (7 errors)
### src/services/backup-internal.service.ts (23 errors)
### src/services/backup.service.ts (15 errors)
### src/services/collaboration.service.ts (3 errors)

## 修复模式

```typescript
// Prisma 查询
where: { projectId }           // ✗
where: { project_id: projectId } // ✓

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
  project_id: projectId
}                                 // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
