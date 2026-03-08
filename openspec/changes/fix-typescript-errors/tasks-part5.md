# TypeScript 错误修复任务 - 第5份 (services - data, export, image, monitoring)

## 目标
修复 src/services 目录下的生成和导出服务错误

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/services/data-migration.service.ts (7 errors)
### src/services/export.service.ts (6 errors)
### src/services/image-generation.service.ts (4 errors)
### src/services/monitoring.service.ts (5 errors)
### src/services/novel-analysis.service.ts (3 errors)
### src/services/plugin.service.ts (12 errors)
### src/services/premiere-export.service.ts (2 errors)
### src/services/project-template.service.ts (6 errors)

## 修复模式

```typescript
// Prisma 查询
where: { projectId }           // ✗
where: { project_id: projectId } // ✓

// orderBy
orderBy: { createdAt: 'desc' }  // ✗
orderBy: { created_at: 'desc' } // ✓

// create() 必需字段
data: {
  id: crypto.randomUUID(),
  updated_at: new Date(),
  project_id: projectId
}                                 // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
