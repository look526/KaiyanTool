# Change: 剧本解析管线强化（新稿一次定稿向）

## Why

当前剧本解析存在：**正则路径与 AI 路径返回结构不一致**、**解析提示词散落在 service**、**旧 `aiProviderService` 与 `largeTextProcessingService` 双轨**、**parse-ai 关闭缓存且前端进度为模拟**、解析结果与 **Scene / Shot** 落地需大量手工步骤。对「每次多为新剧本、追求一次定稿」的用户，应优先 **解析质量、格式覆盖、与分集一键衔接**，而非反复打开同一稿的缓存优化。

## What Changes

1. **统一解析输出契约**：定义带 `parse_schema_version` 的 JSON 结构；`/script/parse` 与 `/script/parse-ai` 对外返回同一形状（或明确弃用旧形状并版本迁移）。
2. **提示词外置**：解析相关 system/user 模板迁入 `apps/api/src/prompts/`（如 `services/` 或 `templates/`），支持 `script_kind`（如 `standard` | `short_drama` | `treatment`）切换模板。
3. **单一 AI 主链**：新稿解析统一走 `largeTextProcessingService` + `providerManager` + 用户所选 `model`；收敛或删除与主链重复的 `ScriptParserService.parseScriptWithAI`（`aiProviderService`）路径。
4. **输出稳健性**：模型输出经 JSON 提取、`jsonrepair`、与 schema 校验；分段失败时可定位片段并重试策略（设计见 `design.md`）。
5. **可选规则预处理**：在送模型前对常见场次/人物/括号动作做轻量规范化（不替代 AI），提高长新稿稳定性。
6. **解析结果 → 分集落地**：新增 API（及最小 UI 入口）：在指定 `episode_id` 下 **创建/更新 Scene**，并可选为每场生成 **Shot 草稿**；默认策略为保守（仅追加或仅填空，见 design）。
7. **进度可观测（阶段二）**：将分段/合并进度通过任务 ID + 轮询或 SSE 暴露，替代纯前端假进度条（可与现有 agent-stream / websocket 模式对齐）。

## Impact

- 后端：`script.controller`、`script-parser.service`、`large-text/*`、新增 `prompts` 文件、可能新增 `script-parse` 或 `episode` 子路由。
- 前端：`ScriptEditorPage`、解析结果类型、`api-client` / `scripts-api`；分集页或解析预览上的「生成到当前分集」入口。
- 契约：API 响应可能 **breaking**（若统一 schema）；需在 tasks 中列迁移与兼容期。

## Out of Scope

- 以「同稿反复编辑」为核心的强缓存、增量解析（属另一优先级画像）。
- 用户纠错学习的长期个性化（可在本变更归档后单独立项）。

## Related

- `fix-script-editor-ui`：编辑器 UI，可与本变更 UI 部分协调。
- `update-storyboard-generation-workbench`：分镜与 Scene/Shot 已存在，本变更与之对接字段映射。
