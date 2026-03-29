## 1. Implementation

- [x] 1.1 OpenSpec proposal/design/tasks 与 spec delta
- [x] 1.2 `packages/shared` GenerationPrompt 与序列化
- [x] 1.3 Prisma：`video_generation_mode`、`video_prompt_flags`、`generation_prompt_json`
- [x] 1.4 分镜更新/视频生成/ninegrid 控制器与路由
- [x] 1.5 前端三栏、场景过滤、合并模块、模式切换、九宫格 UI
- [x] 1.6 构建与关键路径验证（`packages/shared` tsc 通过；全仓 `apps/api` tsc 受既有 Prisma/依赖问题影响，需本地 `prisma generate` + `migrate` 后复验）
