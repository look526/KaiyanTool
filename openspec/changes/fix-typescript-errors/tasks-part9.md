# TypeScript 错误修复任务 - 第9份 (multi-agent)

## 目标
修复 multi-agent 相关错误

## ⚠️ 重要：全部使用 snake_case 格式

## 文件列表

### src/agents/multi-agent.ts (10 errors)

## 修复模式

```typescript
// Prisma 查询
where: { projectId }           // ✗
where: { project_id: projectId } // ✓

// 访问返回字段
result.userId                    // ✗
result.user_id                    // ✓
```

## 验证
修复后运行 `npx tsc --noEmit` 确认无错误。
