# TypeScript 错误修复任务 - 第7份 (services/ai/*)

## 目标
修复 src/services/ai 目录下的 AI 提供商错误

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/services/ai/antsk.provider.ts (2 errors)
### src/services/ai/google.provider.ts (7 errors)
### src/services/ai/provider-helper.service.ts (5 errors)
### src/services/ai/seedream.task-manager.ts (7 errors)

## 修复模式

```typescript
// Prisma 查询
where: { userId }           // ✗
where: { user_id: userId } // ✓

where: { providerId }           // ✗
where: { provider_id: providerId } // ✓

where: { modelId }           // ✗
where: { model_id: modelId } // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
