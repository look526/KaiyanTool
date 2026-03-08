# TypeScript 错误修复任务 - 第8份 (middleware, prompts)

## 目标
修复 src/middleware 和 src/prompts 目录下的错误

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/middleware/legacy-response.middleware.ts (1 error)
### src/middleware/rate-limit.middleware.ts (1 error)
### src/middleware/response-case-transform.middleware.ts (1 error)
### src/middleware/response.middleware.ts (1 error)
### src/middleware/validation.middleware.ts (8 errors)
### src/prompts/testing/ab-test.ts (1 error)
### src/prompts/testing/index.ts (1 error)
### src/prompts/versioning/index.ts (1 error)

## 修复模式

```typescript
// 常见修复
result.userId                    // ✗
result.user_id                    // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
