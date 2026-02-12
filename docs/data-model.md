# AI内容创作平台 - 数据模型文档

## 目录
- [1. 核心模型](#1-核心模型)
- [2. 认证授权](#2-认证授权)
- [3. 项目内容](#3-项目内容)
- [4. AI管理](#4-ai管理)
- [5. 系统监控](#5-系统监控)

---

## 1. 核心模型

### 1.1 User（用户）

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String?
  avatarUrl     String?   @map("avatar_url")
  plan          String    @default("free")
  role          String    @default("user") @map("role")
  storageUsed   BigInt     @default(0) @map("storage_used")
  storageLimit  BigInt     @default(1073741824) @map("storage_limit")
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")
  lastLoginAt   DateTime?  @map("last_login_at")
}
```

| 字段 | 类型 | 说明 | 默认值 |
|--------|--------|--------|--------|
| `id` | UUID | 用户唯一标识 | 自动生成 |
| `email` | String | 登录邮箱，唯一 | - |
| `passwordHash` | String | bcrypt加密后的密码 | - |
| `name` | String? | 显示名称 | - |
| `avatarUrl` | String? | 头像URL | - |
| `plan` | String | 订阅计划 | free |
| `role` | String | 用户角色 | user |
| `storageUsed` | BigInt | 已用存储空间（字节） | 0 |
| `storageLimit` | BigInt | 存储空间上限（字节） | 1073741824 (1GB) |
| `createdAt` | DateTime | 创建时间 | now() |
| `updatedAt` | DateTime | 更新时间 | 自动更新 |
| `lastLoginAt` | DateTime? | 最后登录时间 | - |

### 1.2 Session（会话）

```prisma
model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
}
```

| 字段 | 类型 | 说明 |
|--------|--------|--------|
| `id` | UUID | 会话唯一标识 |
| `userId` | UUID | 关联用户 |
| `token` | String | 会话Token，唯一 |
| `expiresAt` | DateTime | 过期时间 |
| `createdAt` | DateTime | 创建时间 |

---

## 2. 认证授权

### 2.1 Project（项目）

```prisma
model Project {
  id          String           @id @default(uuid()) @db.Uuid
  ownerId    String           @map("owner_id") @db.Uuid
  name        String
  description String?
  type        ProjectType      @default(script)
  status      String           @default("draft")
  settings    Json             @default("{}")
  thumbnailUrl String?          @map("thumbnail_url")
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")
}
```

| 字段 | 类型 | 说明 | 默认值 |
|--------|--------|--------|--------|
| `id` | UUID | 项目唯一标识 | 自动生成 |
| `ownerId` | UUID | 所有者用户ID | - |
| `name` | String | 项目名称 | - |
| `description` | String? | 项目描述 | - |
| `type` | ProjectType | 项目类型 | script |
| `status` | String | 项目状态 | draft |
| `settings` | Json | 项目设置 | {} |
| `thumbnailUrl` | String? | 缩略图URL | - |
| `createdAt` | DateTime | 创建时间 | now() |
| `updatedAt` | DateTime | 更新时间 | 自动更新 |

### 2.2 ProjectMember（项目成员）

```prisma
model ProjectMember {
  projectId String @map("project_id") @db.Uuid
  userId    String @map("user_id") @db.Uuid
  role      MemberRole @default(viewer)
  joinedAt  DateTime @default(now()) @map("joined_at")
}
```

| 字段 | 类型 | 说明 | 默认值 |
|--------|--------|--------|--------|
| `projectId` | UUID | 项目ID | - |
| `userId` | UUID | 用户ID | - |
| `role` | MemberRole | 成员角色 | viewer |
| `joinedAt` | DateTime | 加入时间 | now() |

**角色权限**：
| 角色 | 读取 | 编辑 | 删除 | 管理 |
|------|--------|--------|--------|
| `owner` | ✅ | ✅ | ✅ | ✅ |
| `editor` | ✅ | ✅ | ❌ | ❌ |
| `viewer` | ✅ | ❌ | ❌ | ❌ |

---

## 3. 项目内容

### 3.1 Script（剧本）

```prisma
model Script {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  title     String
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
}
```

### 3.2 Novel（小说）

```prisma
model Novel {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @map("project_id") @db.Uuid
  title     String
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
}
```

### 3.3 Chapter（章节）

```prisma
model Chapter {
  id        String   @id @default(uuid()) @db.Uuid
  novelId   String   @map("novel_id") @db.Uuid
  title     String
  content   String
  order     Int       @default(0)
}
```

### 3.4 Character（角色）

```prisma
model Character {
  id               String   @id @default(uuid()) @db.Uuid
  projectId        String   @map("project_id") @db.Uuid
  name             String
  age              Int?
  gender           String?
  appearance       String
  referenceImages  String[] @default([]) @map("reference_images")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
}
```

### 3.5 Scene（场景）

```prisma
model Scene {
  id               String   @id @default(uuid()) @db.Uuid
  projectId        String   @map("project_id") @db.Uuid
  scriptId         String?  @map("script_id") @db.Uuid
  location         String
  time             String
  atmosphere       String?
  referenceImages  String[] @default([]) @map("reference_images")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
}
```

### 3.6 Shot（镜头）

```prisma
model Shot {
  id              String          @id @default(uuid()) @db.Uuid
  projectId       String          @map("project_id") @db.Uuid
  sceneId         String?         @map("scene_id") @db.Uuid
  characterId    String?         @map("character_id") @db.Uuid
  chapterNumber   Int?            @map("chapter_number")
  episodeNumber   Int?            @map("episode_number")
  segmentId       Int?            @map("segment_id")
  cellId          Int?            @map("cell_id")
  actionSummary   String          @map("action_summary")
  cameraMovement String?         @map("camera_movement")
  startPrompt   String?         @map("start_prompt")
  endPrompt     String?         @map("end_prompt")
  startImageUrl String?         @map("start_image_url")
  endImageUrl   String?         @map("end_image_url")
  videoUrl       String?         @map("video_url")
  duration       Int             @default(8)
  aspectRatio   String          @default("16:9") @map("aspect_ratio")
  visualStyle   String?         @map("visual_style")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")
}
```

### 3.7 NineGridPanel（九宫格面板）

```prisma
model NineGridPanel {
  id        String   @id @default(uuid()) @db.Uuid
  shotId    String   @map("shot_id") @db.Uuid
  position  Int
  prompt    String
  imageUrl  String?  @map("image_url")
  createdAt DateTime @default(now()) @map("created_at")
}
```

### 3.8 Video（视频）

```prisma
model Video {
  id          String   @id @default(uuid()) @db.Uuid
  projectId   String   @map("project_id") @db.Uuid
  shotId      String?  @unique @map("shot_id") @db.Uuid
  url         String
  duration    Int
  width       Int?
  height      Int?
  format      String?
  fileSize    BigInt?  @map("file_size")
  status      String   @default("processing")
  aiModel     String?  @map("ai_model")
  createdAt    DateTime @default(now()) @map("created_at")
}
```

---

## 4. AI管理

### 4.1 AIProvider（AI提供商）

```prisma
model AIProvider {
  id        String      @id @default(uuid()) @db.Uuid
  userId    String      @map("user_id") @db.Uuid
  name      String
  type      String
  apiKey    String      @map("api_key")
  baseUrl   String?     @map("base_url")
  enabled   Boolean     @default(true)
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")
}
```

**支持的提供商类型**：
- `openai` - OpenAI（GPT-4, DALL-E-3）
- `google` - Google Gemini
- `antsk` - AntSK
- `zhipu` - 智普AI（GLM-4, CogView-3）

### 4.2 AgentTask（Agent任务）

```prisma
model AgentTask {
  id           String     @id @default(uuid()) @db.Uuid
  projectId    String     @map("project_id") @db.Uuid
  contentId    String?    @map("content_id") @db.Uuid
  agentType    AgentType  @map("agent_type")
  input        Json
  output       Json?
  aiModel      String?    @map("ai_model")
  status       TaskStatus @default(pending)
  errorMessage String?    @map("error_message")
  createdAt    DateTime   @default(now()) @map("created_at")
  startedAt    DateTime?  @map("started_at")
  completedAt  DateTime?  @map("completed_at")
}
```

**Agent类型**：
- `storyline` - 故事线生成
- `outline` - 大纲生成
- `director` - 分镜生成

**任务状态**：
- `pending` - 等待处理
- `processing` - 处理中
- `completed` - 已完成
- `failed` - 失败

---

## 5. 系统监控

### 5.1 AuditLog（审计日志）

```prisma
model AuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String?  @map("user_id") @db.Uuid
  action      String
  resource    String
  resourceId  String?  @map("resource_id")
  metadata    Json?
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  success     Boolean  @default(true)
  errorMessage String?  @map("error_message")
  createdAt   DateTime @default(now()) @map("created_at")
}
```

### 5.2 QualityReport（质量报告）

```prisma
model QualityReport {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  type        String
  targetId    String   @map("target_id")
  score       String
  metadata    Json?    @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")
}
```

**报告类型**：
- `text` - 文本质量评分
- `image` - 图像质量评分

**评分数据结构**：
- 文本：`{relevance, coherence, completeness, overall, details}`
- 图像：`{clarity, composition, styleConsistency, technical, overall}`

---

## 附录

### A. 枚举类型

```prisma
enum ProjectType {
  script
  novel
  mixed
}

enum ContentType {
  script
  novel
}

enum MemberRole {
  owner
  editor
  viewer
}

enum AgentType {
  storyline
  outline
  director
  segment
  shot
}

enum TaskStatus {
  pending
  processing
  completed
  failed
}
```

### B. 索引策略

所有外键和查询字段都建立了索引：
- `User.email` - 唯一索引
- `Session.token` - 唯一索引
- `Project.ownerId` - 用户项目查询
- `ProjectMember.projectId` + `userId` - 复合索引（权限检查）
- `Shot.projectId` - 项目镜头查询
- `Video.shotId` - 唯一索引（每镜头一个视频）
- `AuditLog.userId` + `createdAt` - 用户审计日志
- `QualityReport.userId` + `type` - 用户质量历史

### C. 级联删除策略

- `User` → Cascade - 删除用户时删除所有相关数据
- `Session` → Cascade - 删除会话
- `Project` → Cascade - 删除项目时删除所有内容
- `ProjectMember` → Cascade - 删除成员记录
- `Character` → Cascade - 删除角色时删除服装变体
- `Scene` → Cascade - 删除场景时删除镜头
- `Shot` → Cascade - 删除镜头时删除九宫格
- `NineGridPanel` → Cascade - 删除面板
