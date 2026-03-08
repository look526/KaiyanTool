# TypeScript 错误修复任务 - 通用指南

## ⚠️ 重要：正确使用 Prisma 字段名

### Prisma 字段命名规则

Prisma 使用 `@map` 注解实现自动转换：

```prisma
// schema.prisma 中定义
projectId String @map("project_id") @db.Uuid
```

**代码中应该使用驼峰（camelCase）**： `projectId`

**Prisma 会自动转换为蛇形（snake_case）**： `project_id`

### 常见错误修复

| 错误写法 | 正确写法 |
|---------|---------|
| `where: { project_id }` | `where: { projectId }` |
| `orderBy: { created_at: 'desc' }` | `orderBy: { createdAt: 'desc' }` |
| `data: { project_id: value }` | `data: { projectId: value }` |

### 验证方法

运行 `npx tsc --noEmit` 查看错误：
- 提示 `Did you mean 'project_id'?` → 说明应该用驼峰 `projectId`
- 提示 `Did you mean 'projectId'?` → 说明应该用蛇形 `project_id`

### 访问返回字段

从 Prisma 查询返回的对象访问字段时，**使用驼峰**：
```typescript
// 正确
const userId = result.userId
const createdAt = result.createdAt

// 错误（如果 schema 用 @map）
const userId = result.user_id
```

---

## 错误分布

### Part 1: agents/*.ts (~30 errors)
- src/agents/base-agent-v2.ts
- src/agents/director.agent.ts
- src/agents/orchestrator-v2.ts
- src/agents/outline-agent.ts
- src/agents/storyboard-agent.ts
- src/agents/storyline-agent.ts

### Part 2: controllers/* (~165 errors)
- src/controllers/auth.controller.ts
- src/controllers/content.controller.ts
- src/controllers/director.controller.ts
- src/controllers/document.controller.ts
- src/controllers/init-admin.controller.ts
- src/controllers/model-preference.controller.ts
- src/controllers/ninegrid.controller.ts
- src/controllers/novel.controller.ts
- src/controllers/panel-generation.controller.ts
- src/controllers/panel.controller.ts
- src/controllers/shot-generation.controller.ts
- src/controllers/shot.controller.ts
- src/controllers/upload.controller.ts
- src/controllers/video-generation.controller.ts

### Part 3: routes/* (~99 errors)
- src/routes/admin/*.routes.ts
- src/routes/agent-stream.routes.ts
- src/routes/ai-provider.routes.ts
- src/routes/clothing-variant.routes.ts
- src/routes/content-process.routes.ts
- src/routes/export-routes.ts
- src/routes/image-enhancement.routes.ts
- src/routes/prompt-template.routes.ts
- src/routes/task-queue.routes.ts
- src/routes/upload.routes.ts

### Part 4: services - analytics, auth, backup (~80 errors)
- src/services/analytics.service.ts
- src/services/audit.service.ts
- src/services/auth.service.ts
- src/services/backup-internal.service.ts
- src/services/backup.service.ts
- src/services/collaboration.service.ts

### Part 5: services - data, export, image, monitoring, novel (~46 errors)
- src/services/data-migration.service.ts
- src/services/export.service.ts
- src/services/image-generation.service.ts
- src/services/monitoring.service.ts
- src/services/novel-analysis.service.ts
- src/services/plugin.service.ts
- src/services/premiere-export.service.ts
- src/services/project-template.service.ts

### Part 6: services - quality, render-queue, scene, script-analysis (~10 errors)
- src/services/quality/quality-scoring.service.ts
- src/services/render-queue.service.ts
- src/services/scene-concept.service.ts
- src/services/script-analysis.service.ts
- src/services/script/script-parser.service.ts

### Part 7: services/ai/* (~21 errors)
- src/services/ai/antsk.provider.ts
- src/services/ai/google.provider.ts
- src/services/ai/provider-helper.service.ts
- src/services/ai/seedream.task-manager.ts

### Part 8: middleware, prompts (~15 errors)
- src/middleware/validation.middleware.ts
- src/middleware/legacy-response.middleware.ts
- src/middleware/rate-limit.middleware.ts
- src/middleware/response-case-transform.middleware.ts
- src/middleware/response.middleware.ts
- src/prompts/testing/ab-test.ts
- src/prompts/testing/index.ts
- src/prompts/versioning/index.ts
