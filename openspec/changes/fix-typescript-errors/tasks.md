# Tasks: 修复 TypeScript 编译错误

## 实施计划（7个独立Block）

### Block 1: 修复 workflow.service.ts
- [x] 1.1 修复 `execution.workflowId` → `execution.workflow_id`
- [x] 1.2 修复 `currentStepId` → `current_step_id`
- [x] 1.3 修复 `updatedAt` → `updated_at`
- [x] 1.4 修复 `completedAt` → `completed_at`
- [x] 1.5 修复 `createdAt` → `created_at`
- [x] 1.6 修复 `projectId` → `project_id`
- [x] 1.7 修复 orderBy 中的字段名

### Block 2: 修复 validators/index.ts
- [x] 2.1 修复 z.enum() 语法错误
- [x] 2.2 移除不支持的 errorMap 参数

### Block 3: 修复 Controllers (controllers/*)
- [x] 3.1 修复 ai-provider.controller.ts (2 errors)
- [x] 3.2 修复 asset.controller.ts (12 errors)
- [x] 3.3 修复 assistant.controller.ts (7 errors)
- [ ] 3.4 修复 novel.controller.ts (18 errors)
- [ ] 3.5 修复 shot.controller.ts (18 errors)
- [ ] 3.6 修复 panel-generation.controller.ts (13 errors)
- [ ] 3.7 修复 shot-generation.controller.ts (36 errors)
- [ ] 3.8 修复 video-generation.controller.ts (23 errors)
- [ ] 3.9 修复 model-preference.controller.ts (44 errors)
- [ ] 3.10 修复其他 controllers

### Block 4: 修复 Services (services/*)
- [ ] 4.1 修复 analytics.service.ts (39 errors)
- [ ] 4.2 修复 backup.service.ts (36 errors)
- [ ] 4.3 修复 version-control.service.ts (43 errors)
- [ ] 4.4 修复 video-tutorial.service.ts (77 errors)
- [ ] 4.5 修复 workflow.service.ts 其他错误
- [ ] 4.6 修复其他 services

### Block 5: 修复 Routes (routes/*)
- [ ] 5.1 修复 admin/*.routes.ts (约 20 errors)
- [ ] 5.2 修复 agent-stream.routes.ts (142 errors)
- [ ] 5.3 修复 image-enhancement.routes.ts (24 errors)
- [ ] 5.4 修复 upload.routes.ts (152 errors)
- [ ] 5.5 修复其他 routes

### Block 6: 修复 Agents (agents/*)
- [ ] 6.1 修复 base-agent-v2.ts
- [ ] 6.2 修复 director.agent.ts
- [ ] 6.3 修复 multi-agent.ts
- [ ] 6.4 修复 orchestrator-v2.ts
- [ ] 6.5 修复其他 agents

### Block 7: 修复其他文件
- [ ] 7.1 修复 middleware/validation.middleware.ts
- [ ] 7.2 修复 middleware/rate-limit.middleware.ts
- [ ] 7.3 修复 utils/permission.util.ts
- [ ] 7.4 修复 prompts/*.ts
- [ ] 7.5 运行 npx tsc --noEmit 验证

---

## 并行执行建议

以下 Block 可以并发处理：
- Block 1, 2 可独立并行
- Block 3-6 可分配给不同 AI 并发处理
- Block 7 依赖前面 Block 的修复结果

---

## 依赖关系

```
Block 1 → Block 2 → Block 7
   ↓        ↓
 Block 3 ← Block 4 ← Block 5 ← Block 6
```

## 验证步骤

每个 Block 完成后执行：
1. npx tsc --noEmit 验证编译
2. 确认错误数量减少
