# Design: 剧本解析管线强化

## 1. 统一解析 Schema（建议）

- **顶层**：`parse_schema_version`（整数，从 `1` 起）、`title`、`script_kind`、`scenes[]`、`characters[]`、`items[]`（可选）、`metadata`（场次数、角色数、对白条数、预估时长等）。
- **场景 `scenes[]`**（与下游对齐的最小集）：`id`（解析侧稳定 id，UUID 或 `scene-1`）、`number`、`heading`、`location`、`time`、`summary` 或 `description`、`character_names[]`、`dialogues[]`（角色名 + 文本）、`actions[]`（类型 + 描述）。
- **映射到 Prisma**（实现时单列映射表，勿散落在多处）：
  - `Scene`：`location`、`time`、`description` ← `summary`/`description`，`scene_order` ← `number`。
  - `Shot`：`action_summary` ← 首场摘要或拼接对白/动作摘要；`start_prompt`/`end_prompt` 可选占位。
- **正则快速解析**：输出经同一 **mapper** 转为上述结构，避免 controller 内联类型与 AI 结果分叉。

## 2. 提示词与 `script_kind`

- 文件：`apps/api/src/prompts/services/` 或 `templates/` 下 `SCRIPT_PARSE_V1.md` 等，占位符 `{{script_content}}`、`{{script_kind}}`。
- 控制器传入 `script_kind`，未传时默认 `standard`。
- 不在 `script-parser.service.ts` 内硬编码大段 prompt。

## 3. AI 调用路径

- **唯一入口**：`parseScriptWithLargeText`（或重命名后的 facade）内部调用 `largeTextProcessingService.processLargeText`，注入 `providerId` / `model`（与现 `parseScriptWithAI` 控制器一致）。
- **删除或标记 deprecated**：仅整篇 `chat` 的 `parseScriptWithAI`（`aiProviderService`），避免两套结果质量不一致。

## 4. JSON 与分段失败

- 每段模型输出：提取首个 JSON 对象 → `jsonrepair` → Zod 或手写校验。
- 失败：记录 `segment_index`、原始片段摘要；策略二选一（实现时择一写死或配置）：**跳过该段继续合并** vs **整次失败返回 422**；推荐新稿定稿向：**该段重试 1 次后跳过并在 `metadata.warnings` 中列出**。

## 5. 「生成到分集」事务与权限

- **Endpoint 草图**：`POST /api/episodes/:episodeId/apply-parse`（或 `/script/apply-to-episode`），body：`{ parse_result, mode: 'append_scenes' | 'fill_empty_only' }`。
- **权限**：用户须为项目 owner 或 member，且 `episode` 属于该项目。
- **默认 `append_scenes`**：仅追加新 `Scene`（新 `scene_order` 递增），不删除已有场景。
- **`fill_empty_only`**：仅当某 `scene_order` 无对应 Scene 或 Scene 的 `description` 为空时写入（具体规则 tasks 中细化）。

## 6. 前端进度（阶段二）

- 方案 A：解析改为异步任务，返回 `job_id`，`GET /api/jobs/:id` 轮询进度。
- 方案 B：复用现有 WebSocket / `agent-stream` 模式推送百分比。
- 实现顺序：先完成 P0 同步 API + 统一 schema，再挂进度，避免同时改协议面。

## 7. 风险

- **Breaking**：统一 schema 后旧前端需一并升级；可提供 `?legacy=1` 短期兼容（可选，YAGNI 则可不做）。
- **Token 成本**：规则预处理与分段策略需可配置，避免小剧本过度分段。
