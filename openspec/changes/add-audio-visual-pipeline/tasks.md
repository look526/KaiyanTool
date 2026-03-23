# 实施任务清单

## Phase 1：音频 Pipeline

### 1. TTS 配音系统
- [x] 1.1 Prisma schema 新增 `AudioTrack`、`VoiceProfile` 模型，Shot 模型新增 `audio_url`、`audio_duration`、`subtitle_text` 字段
- [x] 1.2 创建 TTS Provider 抽象接口 `apps/api/src/services/ai/tts.provider.ts`
- [x] 1.3 实现火山引擎 TTS Provider `apps/api/src/services/ai/volcengine-tts.provider.ts`
- [x] 1.4 在 `providerManager` 中注册 TTS 能力类型
- [x] 1.5 创建 TTS 服务 `apps/api/src/services/tts.service.ts`（单条/批量合成、声音列表）
- [x] 1.6 创建 TTS 路由和控制器 `apps/api/src/routes/tts.routes.ts`
- [x] 1.7 创建 TTS Prompt `apps/api/src/prompts/services/tts-prompts.ts`（情感分析/旁白生成）
- [x] 1.8 前端：声音配置面板 `VoiceProfilePanel.tsx`（角色 → 声音绑定）
- [x] 1.9 前端：在 EpisodeDetailPage 中添加"生成配音"按钮和批量配音功能
- [x] 1.10 前端：配音预览播放器（Shot 卡片中嵌入音频播放）

### 2. 字幕系统
- [x] 2.1 Prisma schema 新增 `Subtitle` 模型
- [x] 2.2 创建字幕服务 `apps/api/src/services/subtitle.service.ts`（从剧本生成时间轴字幕、并支持导出）
- [x] 2.3 创建字幕路由和控制器 `apps/api/src/routes/subtitle.routes.ts`
- [x] 2.4 实现 SRT/VTT/ASS 格式导出
- [x] 2.5 前端：字幕编辑组件 `SubtitleEditor.tsx`（时间轴拖拽、文本编辑）
- [x] 2.6 前端：字幕样式配置面板（字体/大小/颜色/位置/特效）
- [x] 2.7 前端：字幕预览（叠加在视频预览上）

### 3. BGM/音效系统
- [ ] 3.1 创建 BGM Provider 抽象接口 `apps/api/src/services/ai/bgm.provider.ts`
- [ ] 3.2 实现 Suno/天工音乐 BGM Provider
- [ ] 3.3 创建 BGM/音效服务 `apps/api/src/services/bgm.service.ts`（氛围匹配、AI 生成、素材库查询）
- [ ] 3.4 创建 BGM 路由和控制器 `apps/api/src/routes/bgm.routes.ts`
- [ ] 3.5 创建氛围分析 Prompt `apps/api/src/prompts/services/bgm-prompts.ts`
- [ ] 3.6 前端：BGM 选择面板 `BGMPanel.tsx`（AI 推荐 + 手动选择 + 上传）
- [ ] 3.7 前端：音效匹配面板（按场景标签自动推荐）

### 4. 时间线编辑器
- [x] 4.1 Prisma schema 新增 `TimelineProject` 模型
- [ ] 4.2 安装后端 FFmpeg 依赖（fluent-ffmpeg）
- [x] 4.3 创建时间线合成服务 `apps/api/src/services/timeline.service.ts`
- [x] 4.4 创建时间线路由和控制器（CRUD + render + status）
- [ ] 4.5 创建 FFmpeg 合成 Worker（Bull Queue Job）
- [ ] 4.6 前端：时间线画布组件 `TimelineCanvas.tsx`（Canvas 渲染多轨道）
- [ ] 4.7 前端：轨道面板 `TrackPanel.tsx`（视频轨/配音轨/BGM 轨/字幕轨）
- [ ] 4.8 前端：播放控制 `PlaybackControls.tsx`
- [ ] 4.9 前端：属性编辑面板（音量/淡入淡出/裁剪）
- [ ] 4.10 前端：时间线页面路由 `/projects/:id/timeline`
- [ ] 4.11 集成测试：从分镜视频 → 配音 → BGM → 字幕 → 合成输出

## Phase 2：视觉增强

### 5. 角色一致性增强
- [x] 5.1 重写 `character-consistency.service.ts`，实现参考图管理 + Prompt 增强逻辑
- [x] 5.2 修改 `shot-generation.controller.ts`：生成图像时自动注入角色 `reference_images` 到 `image_urls`
- [ ] 5.3 修改 `director.agent.ts`：在 Prompt 中注入角色外观描述
- [ ] 5.4 图像生成接口支持 `character_ref_strength` 参数
- [ ] 5.5 前端：增强 CharacterConsistencyPanel，支持多角度参考图上传和预览
- [ ] 5.6 前端：在 Shot 生成界面显示自动注入的角色参考图

### 6. 一键出片 Pipeline
- [x] 6.1 Prisma schema 新增 `ProductionTask` 模型
- [ ] 6.2 创建 `ProductionAgent` `apps/api/src/agents/production.agent.ts`
- [x] 6.3 创建 Pipeline 编排服务 `apps/api/src/services/production-pipeline.service.ts`
- [x] 6.4 创建 Pipeline 路由和控制器
- [ ] 6.5 创建 Pipeline Prompt `apps/api/src/prompts/agents/production-agent-prompts.ts`
- [ ] 6.6 实现 WebSocket 进度推送
- [ ] 6.7 前端：一键出片配置面板（选择集数、风格、质量等级）
- [ ] 6.8 前端：Pipeline 进度追踪面板（步骤可视化、错误处理、重试）
- [ ] 6.9 前端：Pipeline 页面路由 `/projects/:id/production`
- [ ] 6.10 集成测试：从大纲到成片端到端自动化

### 7. 口型同步
- [ ] 7.1 创建 LipSync Provider 抽象接口 `apps/api/src/services/ai/lip-sync.provider.ts`
- [ ] 7.2 实现 SadTalker/MuseTalk Provider
- [ ] 7.3 创建口型同步服务 `apps/api/src/services/lip-sync.service.ts`
- [x] 7.4 Shot 模型新增 `lip_sync_url` 字段
- [ ] 7.5 创建口型同步路由和控制器
- [ ] 7.6 前端：在 Shot 卡片中添加"生成口型同步"按钮
- [ ] 7.7 前端：口型同步预览播放
- [ ] 7.8 集成到一键出片 Pipeline

### 8. Animatic 预览
- [ ] 8.1 前端：创建 AnimaticPlayer 组件（Canvas + Web Audio API）
- [ ] 8.2 实现 Ken Burns 镜头运动效果（缩放/平移）
- [ ] 8.3 实现分镜图序列 + 配音音频同步播放
- [ ] 8.4 前端：在 EpisodeDetailPage 添加"Animatic 预览"按钮
- [ ] 8.5 支持导出低保真预览视频（可选，走后端 FFmpeg）

## 通用基础设施

### 9. 基础设施
- [ ] 9.1 扩展 `providerManager` 支持 `tts`、`bgm`、`lip_sync` 能力类型
- [ ] 9.2 新增 AIProvider 表的 type 枚举值
- [ ] 9.3 前端 API Client 新增所有新接口
- [ ] 9.4 前端路由更新（timeline、production）
- [ ] 9.5 ProjectLayout WorkflowSidebar 新增"配音"和"成片"步骤入口
