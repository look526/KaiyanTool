# Change: 分镜工作台与生成管线优化

## Why

分镜页缺少剧本/场景总览；镜头描述与音画同出分散；视频生成仅隐含首尾帧路径；九宫格批量出图为占位实现；提示词未结构化，难以扩展与复用。

## What Changes

- 三栏布局：剧本节选 + 场景列表、分镜列表、编辑区。
- 「镜头与音画」综合模块：独立开关控制镜头描述、对白、镜头运动、风格是否并入视频提示；API 扩展 `include_*` 字段并兼容 `sync_audio_video`。
- 视频生成模式 `end_frame` | `nine_grid`：按模式展示配置；九宫格模式视频使用合成图或首尾格参考（双帧兼容策略）。
- 九宫格：九格独立 AI 出图、单格生成、一键合成保留；`generateAllPanels` 改为真实出图。
- 统一 `GenerationPrompt` JSON（version + lens/character/action/scene 等）与序列化；可选持久化 `generation_prompt_json`。

## Impact

- 前端：`EpisodeDetailPage`、`ShotNineGridWorkbench`、新组件 `EpisodeStoryboardOverviewPanel`、`shots-api`、`episodes-api` 类型。
- 后端：`Shot` Prisma 字段、`shot.controller`、`shot-generation.controller`、`ninegrid.controller`、`ninegrid.routes`、`AICreateVideoRequest`（可选第二参考图）。
- 共享：`packages/shared` `generation-prompt`。
