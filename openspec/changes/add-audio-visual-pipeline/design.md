## Context

开演AI 平台需要从"视觉生产工具"升级为"成片生产平台"。核心挑战：

1. 音频链路（TTS + BGM + 音效）是全新领域，需要引入新的 AI Provider 类型
2. 时间线编辑器是前端重型组件，需要精确的时间同步
3. 角色一致性是 AI 生图的核心难题，需要与现有图像生成流程深度集成
4. 一键出片 Pipeline 需要编排 10+ 个异步任务

**约束**：
- 前端端口 3000，后端端口 3001 不可变
- 统一 snake_case 命名规范
- 必须使用 `providerManager` 调用 AI
- Prompt 必须放在 `apps/api/src/prompts/` 目录

## Goals / Non-Goals

**Goals:**
- Phase 1 后：从分镜视频到可发布带声音成片
- Phase 2 后：从剧本到成片的一键自动化
- 各模块可独立使用，也可串联自动化
- 复用现有 AI Provider 架构（providerManager）

**Non-Goals:**
- 不做专业级 NLE（非线编），只做轻量级时间线
- 不做实时协同编辑时间线
- 不做音频混音/均衡器等专业音频处理
- 不做自定义声音训练（使用第三方预置声音）

## Decisions

### 1. TTS Provider 选型

**决定**: 采用 Provider 抽象层 + 多后端策略

| Provider | 用途 | API 风格 |
|----------|------|----------|
| **火山引擎 TTS**（首选） | 字节豆包语音，质量高，支持情感 | REST + WebSocket |
| **CosyVoice**（备选） | 阿里开源，支持声音克隆 | REST |
| **MiniMax TTS**（备选） | 质量好，角色声音丰富 | REST |

**替代方案**: 只接 OpenAI TTS — 中文效果差，排除。

**实现**: 在 `providerManager` 中新增 `tts` 能力类型，Provider 接口：

```typescript
interface TTSProvider {
  synthesize(text: string, options: TTSOptions): Promise<AudioBuffer>;
  listVoices(): Promise<Voice[]>;
  getVoice(voiceId: string): Promise<Voice>;
}

interface TTSOptions {
  voice_id: string;
  speed: number;        // 0.5 ~ 2.0
  pitch: number;        // -10 ~ 10
  emotion?: string;     // happy | sad | angry | neutral | excited
  language?: string;    // zh-CN | en-US
}
```

### 2. 字幕生成策略

**决定**: 双模式 — 剧本直接映射 + 音频 ASR 对齐

- **模式 A（快速）**: 从剧本对白直接生成字幕，时间戳按 TTS 音频时长自动分配
- **模式 B（精准）**: 使用 Whisper 对 TTS 音频做 ASR，得到字级时间戳

**数据格式**: 使用 SRT/VTT 兼容的 JSON 结构：

```typescript
interface SubtitleEntry {
  id: number;
  start_time: number;  // 毫秒
  end_time: number;
  text: string;
  speaker?: string;
  style?: SubtitleStyle;
}
```

### 3. BGM/音效方案

**决定**: AI 生成 + 素材库混合

- **BGM**: 接入 Suno API 或天工音乐 API 按氛围描述生成
- **音效**: 接入 Freesound API 或本地素材库按标签匹配
- **匹配策略**: 由 AI 分析场景氛围（在 director.agent 中增加氛围标签输出），自动匹配 BGM/音效

### 4. 时间线编辑器架构

**决定**: 前端 Canvas 渲染 + 后端 FFmpeg 合成

前端组件结构：
```
TimelineEditor/
├── TimelineCanvas.tsx       # Canvas 渲染时间轴
├── TrackPanel.tsx           # 轨道面板（视频/配音/BGM/字幕）
├── PlaybackControls.tsx     # 播放控制
├── PropertyPanel.tsx        # 属性编辑面板
├── hooks/
│   ├── use_timeline_state.ts
│   ├── use_playback.ts
│   └── use_track_operations.ts
└── types.ts
```

后端合成：
```
POST /api/timeline/:id/render → 创建 FFmpeg 合成任务（Bull Queue）
GET  /api/timeline/:id/render/status → 查询合成状态
```

**替代方案**: 使用 Web Audio API 实时预览 — 复杂度过高，先不做。前端只做拖拽排列和预览，合成走后端。

### 5. 角色一致性方案

**决定**: IP-Adapter + 参考图自动注入

核心改动：
1. **重写 `character-consistency.service.ts`**：实现角色参考图管理 + Prompt 增强
2. **修改 `shot-generation.controller.ts`**：生成分镜图时自动查找角色的 `reference_images`，注入到 `image_urls`
3. **扩展图像生成接口**：支持 `character_ref_strength`（参考图权重控制）

**技术路线**:
- 使用 Seedream 的 `image_urls` 传入角色参考图（当前已支持）
- Prompt 中注入角色外观描述（从 Character.appearance 读取）
- 未来可升级为 IP-Adapter / InstantID 等专用一致性方案

### 6. 一键出片 Pipeline 架构

**决定**: 基于现有 Agent 架构扩展，新增 `ProductionAgent`

Pipeline 步骤：
```
1. 解析大纲 → 获取场景列表
2. 为每个场景生成分镜（调用 director.agent）
3. 为每个分镜生成图像（注入角色一致性）
4. 为每个分镜生成视频
5. 为每个分镜生成配音（TTS）
6. 为每集生成 BGM
7. 生成字幕
8. 时间线合成
```

使用 Bull Queue 管理任务，支持：
- 任务暂停/恢复/重试
- 进度百分比追踪
- 单步失败不阻塞（跳过或重试）
- WebSocket 推送实时进度

### 7. 口型同步方案

**决定**: 集成 SadTalker/MuseTalk API

- 输入：角色面部图 + 配音音频
- 输出：带口型动画的视频片段
- 在视频生成后、时间线合成前执行

### 8. Animatic 预览

**决定**: 前端轻量合成

- 将分镜图 + 配音音频 + 简单 Ken Burns 运镜效果在前端预览
- 不走后端 FFmpeg，使用 Canvas + Web Audio API
- 目的是快速验证叙事节奏，无需高质量

## 数据模型设计

### 新增模型

```prisma
model AudioTrack {
  id           String   @id @db.Uuid
  project_id   String   @db.Uuid
  shot_id      String?  @db.Uuid
  episode_id   String?  @db.Uuid
  type         String   // dialogue | narration | bgm | sfx
  url          String
  duration     Int      // 毫秒
  speaker      String?  // 角色名或 narrator
  voice_id     String?  // TTS 声音 ID
  emotion      String?
  text         String?  // 原始文本（对白/旁白）
  start_time   Int?     // 在时间线中的起始时间（毫秒）
  volume       Float    @default(1.0)
  status       String   @default("pending")
  created_at   DateTime @default(now())
  updated_at   DateTime
  Project      Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@index([project_id])
  @@index([shot_id])
  @@index([episode_id])
}

model Subtitle {
  id           String   @id @db.Uuid
  project_id   String   @db.Uuid
  episode_id   String   @db.Uuid
  entries      Json     // SubtitleEntry[]
  format       String   @default("srt") // srt | vtt | ass
  language     String   @default("zh-CN")
  style        Json?    // 字幕样式配置
  created_at   DateTime @default(now())
  updated_at   DateTime
  Project      Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@index([project_id])
  @@index([episode_id])
}

model TimelineProject {
  id           String   @id @db.Uuid
  project_id   String   @db.Uuid
  episode_id   String   @db.Uuid
  tracks       Json     // 轨道配置
  duration     Int      // 总时长（毫秒）
  fps          Int      @default(30)
  resolution   String   @default("1080x1920") // 竖屏
  output_url   String?
  status       String   @default("draft")
  created_at   DateTime @default(now())
  updated_at   DateTime
  Project      Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@index([project_id])
  @@index([episode_id])
}

model VoiceProfile {
  id           String   @id @db.Uuid
  project_id   String   @db.Uuid
  character_id String?  @db.Uuid
  name         String
  provider     String   // volcengine | cosyvoice | minimax
  voice_id     String   // 第三方声音 ID
  sample_url   String?  // 试听音频
  language     String   @default("zh-CN")
  gender       String?
  style        String?  // 声音风格标签
  created_at   DateTime @default(now())
  Project      Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@index([project_id])
  @@index([character_id])
}

model ProductionTask {
  id           String    @id @db.Uuid
  project_id   String    @db.Uuid
  episode_id   String?   @db.Uuid
  type         String    // full_production | partial
  config       Json      // Pipeline 配置参数
  progress     Float     @default(0) // 0-100
  current_step String?   // 当前步骤名称
  total_steps  Int?
  status       String    @default("pending")
  error_log    Json?
  output_url   String?
  started_at   DateTime?
  completed_at DateTime?
  created_at   DateTime  @default(now())
  updated_at   DateTime
  Project      Project   @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@index([project_id])
  @@index([episode_id])
}
```

### Shot 模型扩展字段

```prisma
// 在现有 Shot 模型中新增：
audio_url       String?   // TTS 配音 URL
lip_sync_url    String?   // 口型同步视频 URL
subtitle_text   String?   // 该镜头对应的台词
audio_duration  Int?      // 配音时长（毫秒）
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| TTS 第三方 API 延迟高 | 批量生成耗时长 | 使用 Bull Queue 异步处理 + 并发控制 |
| 角色一致性效果不稳定 | 不同场景角色外观差异大 | 多张参考图 + Prompt 约束 + 人工审核节点 |
| FFmpeg 合成服务器资源消耗 | 高并发下服务器压力大 | 限制并发合成数 + 任务队列 |
| 口型同步模型推理慢 | 单镜头处理需 10-30s | 可选步骤，用户可跳过 |
| 时间线前端性能 | 大量轨道时 Canvas 卡顿 | 虚拟滚动 + 按需渲染 |

## Migration Plan

1. **数据库迁移**: 新增模型为纯新增，不修改现有表结构。Shot 扩展字段使用 `ALTER TABLE ADD COLUMN`（nullable），无破坏性
2. **API 向后兼容**: 所有新 API 为新增路由，现有 API 不受影响
3. **渐进式上线**: Phase 1 各模块可独立上线使用，Phase 2 依赖 Phase 1 但也可按模块上线

## Open Questions

1. TTS 供应商最终选哪家？需要实际测试中文短剧配音效果
2. BGM 生成是用 Suno API 还是天工音乐？需要评估成本和质量
3. 口型同步是自部署模型还是调用第三方 API？取决于算力资源
4. 时间线编辑器是否需要支持多人协同？（当前设计为不支持）
5. FFmpeg 是否需要独立部署为微服务？（当前设计为后端进程内调用）
