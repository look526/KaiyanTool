# Tasks: 剧本解析管线强化

## Phase 0 — 契约与设计冻结

- [ ] 1.1 在 `packages/shared` 或 `apps/api` 共享类型中定稿 `ParsedScriptV1`（或等价名）与 `parse_schema_version` 字段，并文档化与 `Scene`/`Shot` 的字段映射表（可放在 `design.md` 附录或代码注释）。
- [ ] 1.2 与前端确认：`ScriptEditorPage` 预览模式所需最小字段列表，避免 over-fetch。

## Phase 1 — 后端：统一输出与提示词

- [ ] 2.1 新增 `apps/api/src/prompts/` 下解析模板（含 `script_kind` 分支或独立文件），替换 `buildParsingPrompt` 内联字符串。
- [ ] 2.2 实现 **regex 解析结果 → ParsedScriptV1** 的 mapper；`POST /script/parse` 返回新形状（或双写旧字段一个版本周期，若需要兼容则 tasks 加项）。
- [ ] 2.3 `POST /script/parse-ai`：`parseScriptWithLargeText` 输出经 merger 后 **normalize 为 ParsedScriptV1**；控制器去掉无必要的 `useCache: false` 默认，改为可配置（新稿默认可 `true`，与设计一致）。
- [ ] 2.4 移除或废弃 `ScriptParserService` 中仅依赖 `aiProviderService` 的整篇解析路径；确保所有 AI 解析走 `providerManager` 链路。
- [ ] 2.5 分段 AI 输出：`jsonrepair` + 校验；`metadata.warnings` 与失败段策略按 `design.md` 实现。

## Phase 2 — 后端：应用到分集

- [ ] 3.1 新增 `apply-parse` API（路径以最终实现为准），校验 `episode_id` 与项目权限。
- [ ] 3.2 实现 `append_scenes`：创建 `Scene`（`episode_id`、`scene_order`、`location`、`time`、`description`）。
- [ ] 3.3 可选：为每个新场景创建 **一条** `Shot` 草稿（`action_summary` 等），开关由 body 字段控制（默认 false 或 true 由产品定，建议默认 true 且可关）。
- [ ] 3.4 单元测试或集成测试：小样本 parse JSON → DB 中 Scene/Shot 计数与顺序。

## Phase 3 — 前端

- [ ] 4.1 更新 `api-client` / 类型定义以消费 ParsedScriptV1。
- [ ] 4.2 `ScriptEditorPage`：解析成功后 UI 适配新字段；增加「生成到当前分集」入口（需 `episodeId`/`projectId` 上下文，可由路由或 props 传入）。
- [ ] 4.3 错误与 `warnings` 展示（如有跳过片段）。

## Phase 4 — 进度与观测（可选，可拆 PR）

- [ ] 5.1 异步任务 + 轮询或 SSE 进度；替换 `simulateProgress` 中与解析相关的假进度。
- [ ] 5.2 日志/metrics：解析耗时、分段数、失败率。

## 验证

- [ ] `apps/api`：`npx tsc --noEmit`
- [ ] `apps/web`：`npx tsc --noEmit`
- [ ] `npx openspec validate improve-script-parse-pipeline --strict`
- [ ] 手测：新稿粘贴 → AI 解析 → 一键写入某分集 → 分镜页可见新场景与草稿镜头
