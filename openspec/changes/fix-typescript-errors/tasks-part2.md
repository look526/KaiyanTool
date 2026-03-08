# TypeScript 错误修复任务 - 第2份 (controllers/*)

## 目标
修复 src/controllers 目录下的 TypeScript 错误（约 165 个错误）

## ⚠️ 重要：全部使用 snake_case 格式

**所有 Prisma 字段必须使用 snake_case**

## 文件列表

### src/controllers/auth.controller.ts (1 error)
### src/controllers/base.controller.ts (1 error)
### src/controllers/content.controller.ts (10 errors)
### src/controllers/director.controller.ts (3 errors)
### src/controllers/document.controller.ts (1 error)
### src/controllers/init-admin.controller.ts (1 error)
### src/controllers/model-preference.controller.ts (44 errors)
### src/controllers/ninegrid.controller.ts (15 errors)
### src/controllers/novel.controller.ts (18 errors)
### src/controllers/panel-generation.controller.ts (13 errors)
### src/controllers/panel.controller.ts (9 errors)
### src/controllers/shot-generation.controller.ts (36 errors)
### src/controllers/shot.controller.ts (18 errors)
### src/controllers/test.controller.ts (5 errors)
### src/controllers/upload.controller.ts (1 error)
### src/controllers/video-generation.controller.ts (23 errors)

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
