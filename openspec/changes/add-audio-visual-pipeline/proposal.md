# Change: 添加音频视觉增强 Pipeline（Phase 1 + Phase 2）

## Why

当前平台已覆盖 **剧本 → 故事线 → 大纲 → 角色/场景 → 分镜 → 图像生成 → 视频生成 → 合并** 的视觉生产链路，但产出的是**无声视频**，距可发布成片存在关键缺口：

1. **缺少声音层**：无配音、无 BGM、无音效，短剧成片必须有声音
2. **缺少字幕**：竖屏短剧几乎 100% 需要字幕，当前无字幕生成能力
3. **缺少音视频合成**：无法将视频、配音、BGM、字幕对齐输出最终成片
4. **角色一致性不足**：`character-consistency.service.ts` 全部为占位实现，分镜生成时未使用角色参考图
5. **无端到端自动化**：每个环节需手动触发，无法批量自动生产

补齐这些能力后，平台将具备 **从剧本到可发布成片** 的完整 AI 短剧生产能力。

## What Changes

### Phase 1：音频 Pipeline（补齐成片能力）

| 模块 | 变更 |
|------|------|
| **TTS 配音** | 新增 TTS 服务，支持多角色配音、旁白生成、情感控制 |
| **字幕系统** | 从剧本/配音自动生成时间轴字幕，支持样式配置 |
| **BGM/音效** | 氛围匹配 BGM 推荐 + AI 生成，场景音效自动匹配 |
| **时间线编辑器** | 轻量级多轨时间线（视频/配音/BGM/字幕），合成输出最终成片 |

### Phase 2：视觉增强（提效降本）

| 模块 | 变更 |
|------|------|
| **角色一致性** | 实现 character-consistency 服务，分镜生成自动注入角色参考图 |
| **一键出片 Pipeline** | 端到端自动化：大纲 → 分镜 → 图像 → 视频 → 配音 → 字幕 → 合成 |
| **口型同步** | 角色对白配音与面部口型同步 |
| **Animatic 预览** | 分镜图 + 配音 + 简单运动生成低保真预览片 |

### **BREAKING** 变更

- **Shot 模型扩展**：新增 `audio_url`、`subtitle_data`、`lip_sync_url` 字段
- **新增数据模型**：`AudioTrack`、`Subtitle`、`TimelineProject`、`BGMTrack`、`ProductionTask`
- **新增 AI Provider 类型**：TTS provider、BGM provider、Lip Sync provider

## Impact

- Affected specs: `tts-dubbing`(新), `subtitle-system`(新), `bgm-sfx`(新), `timeline-editor`(新), `character-consistency`(新), `production-pipeline`(新), `lip-sync`(新), `animatic-preview`(新)
- Affected code:
  - `apps/api/prisma/schema.prisma` — 新增 6+ 模型
  - `apps/api/src/services/` — 新增 8 个服务
  - `apps/api/src/routes/` — 新增 8 组路由
  - `apps/api/src/controllers/` — 新增 8 个控制器
  - `apps/api/src/agents/` — 修改 director.agent，新增 production.agent
  - `apps/api/src/prompts/` — 新增配音/字幕/BGM 相关 prompt
  - `apps/web/src/pages/` — 新增时间线编辑器页面，修改 EpisodeDetailPage
  - `apps/web/src/components/` — 新增音频/字幕/时间线组件
  - `apps/api/src/services/ai/` — 新增 TTS/BGM/LipSync provider
  - `apps/api/src/services/character-consistency.service.ts` — 重写

## 依赖关系

```
Phase 1（串行依赖）:
  TTS 配音 ──→ 字幕系统（字幕可从配音音频自动对齐）
  BGM/音效 ──→ （独立，可与 TTS 并行）
  TTS + BGM + 字幕 ──→ 时间线编辑器（合成所有轨道）

Phase 2（部分依赖 Phase 1）:
  角色一致性 ──→ （独立，可最先开始）
  Animatic 预览 ──→ 依赖 TTS 配音
  口型同步 ──→ 依赖 TTS 配音
  一键出片 ──→ 依赖 Phase 1 全部 + 角色一致性
```
