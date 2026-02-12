# 设计文档：AI内容创作平台技术架构

## 1. 架构概览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Web应用 (React 19 + TypeScript)          │  │
│  │                   Vite 6.2                              │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                        API网关层                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  认证授权         │  │  限流熔断         │  │  路由分发     │  │
│  │  (JWT)           │  │  (Redis)         │  │  (Nginx)     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       业务服务层                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐  │
│  │  用户服务    │  │  项目服务    │  │  内容服务    │  │ 资产服务│  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐  │
│  │  AI服务     │  │  Agent服务   │  │  视频服务    │  │ 通知服务│  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       数据访问层                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  PostgreSQL      │  │  Redis           │  │  OSS/S3       │  │
│  │  (主数据库)       │  │  (缓存/会话)      │  │  (文件存储)    │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  Prisma ORM      │  │  Message Queue   │                     │
│  └──────────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       外部服务层                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  AI提供商         │  │  FFmpeg          │  │  云通知       │  │
│  │  (多模型)         │  │  (视频处理)       │  │  (邮件/短信)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选择理由

#### 前端技术栈

**React 19 + TypeScript**
- **选择理由**：BigBanana和CineGen已使用React 19，Toonflow也使用React
- **优势**：组件化开发、类型安全、生态丰富、性能优化
- **复用**：BigBanana的UI组件可直接迁移

**Vite 6.2**
- **选择理由**：BigBanana已使用，构建速度快，开发体验好
- **优势**：HMR、原生ESM、插件生态

#### 后端技术栈

**Node.js + Express**
- **选择理由**：Toonflow已使用Express，团队熟悉
- **优势**：异步I/O、JavaScript全栈、生态丰富

**Prisma ORM**
- **选择理由**：现代化ORM，类型安全，比Knex更易维护
- **优势**：自动迁移、类型生成、查询构建器

**PostgreSQL**
- **选择理由**：关系型数据库，支持复杂查询和关系
- **优势**：ACID、JSON支持、全文搜索、扩展性强

**Redis**
- **选择理由**：缓存、会话存储、消息队列
- **优势**：高性能、数据结构丰富、持久化

#### 存储方案

**阿里云OSS / AWS S3**
- **选择理由**：Toonflow已使用OSS，成熟稳定
- **优势**：高可用、CDN加速、生命周期管理

#### AI服务

**多提供商抽象层**
- **选择理由**：BigBanana已实现modelConfigService
- **优势**：避免厂商锁定、成本优化、备用方案
- **提供商**：
  - AntSK API（默认）
  - OpenAI（GPT-5.1/5.2）
  - Google（Gemini 3 Pro, Veo 3.1）
  - 智普AI（GLM-4, GLM-4V, CogView）
  - 其他（可选）

**LangChain**
- **选择理由**：Toonflow已使用，功能强大
- **优势**：Agent框架、工具调用、链式编排

## 2. 数据模型设计

### 2.1 核心实体关系图

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│  User   │──1:n──│ Project │──1:n──│ Content │
└─────────┘       └─────────┘       └─────────┘
                      │
                      ├──1:n──┌──────────────┐
                      │       │ Character    │
                      ├──1:n──└──────────────┘
                      │       │ Wardrobe     │
                      ├──1:n──└──────────────┘
                      │
                      ├──1:n──┌──────────────┐
                      │       │ Scene        │
                      └──1:n──└──────────────┘
                              │
                              └──1:n──┌──────────┐
                                      │ Shot     │
                                      └──────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                ┌───┴───┐               ┌───┴───┐               ┌───┴───┐
                │ Panel │               │ Agent │               │ Video │
                └───────┘               └───────┘               └───────┘
```

### 2.2 数据库Schema设计

#### 用户模块

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  plan VARCHAR(50) DEFAULT 'free',
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 1073741824, -- 1GB
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- 会话表
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 项目模块

```sql
-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('script', 'novel', 'mixed')),
  status VARCHAR(20) DEFAULT 'draft',
  settings JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 项目成员表
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);
```

#### 内容模块

```sql
-- 内容表（剧本/小说）
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('script', 'novel')),
  raw_text TEXT NOT NULL,
  structured_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 故事线表（小说模式）
CREATE TABLE storylines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_model VARCHAR(100),
  agent_task_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 大纲表（小说模式）
CREATE TABLE outlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  storyline_id UUID REFERENCES storylines(id),
  episodes JSONB NOT NULL,
  agent_task_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 资产模块

```sql
-- 角色表
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  appearance TEXT NOT NULL,
  reference_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 服装变体表
CREATE TABLE wardrobes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  reference_image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 场景表
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL,
  time VARCHAR(100) NOT NULL,
  atmosphere TEXT,
  reference_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 镜头模块

```sql
-- 镜头表
CREATE TABLE shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id),
  chapter_number INTEGER,
  episode_number INTEGER,
  segment_id INTEGER,
  cell_id INTEGER,
  action_summary TEXT NOT NULL,
  camera_movement TEXT,
  start_prompt TEXT,
  end_prompt TEXT,
  start_image_url TEXT,
  end_image_url TEXT,
  video_url TEXT,
  duration INTEGER DEFAULT 8,
  aspect_ratio VARCHAR(10) DEFAULT '16:9',
  visual_style VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 九宫格面板表
CREATE TABLE nine_grid_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id UUID REFERENCES shots(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 9),
  prompt TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### AI Agent模块

```sql
-- Agent任务表
CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_type VARCHAR(50) NOT NULL,
  input JSONB,
  output JSONB,
  ai_model VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

#### 视频模块

```sql
-- 视频表
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  shot_id UUID REFERENCES shots(id),
  url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  format VARCHAR(20),
  file_size BIGINT,
  status VARCHAR(20) DEFAULT 'processing',
  ai_model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 视频拼接任务表
CREATE TABLE video_merge_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  video_ids UUID[] NOT NULL,
  output_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### 2.3 数据迁移策略

#### 从BigBanana迁移

**IndexedDB数据导出**
```javascript
// 前端导出工具
export async function exportFromIndexedDB(projectId: string) {
  const db = await openDB('bigbanana', 1);
  const project = await db.get('projects', projectId);
  const characters = await db.getAll('characters');
  const scenes = await db.getAll('scenes');
  const shots = await db.getAll('shots');
  
  return {
    project,
    characters,
    scenes,
    shots,
    exportedAt: new Date().toISOString()
  };
}
```

**后端导入工具**
```typescript
// 导入服务
export class MigrationService {
  async importBigBananaProject(
    userId: string,
    data: ExportedProjectData
  ): Promise<string> {
    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        name: data.project.name,
        type: 'script',
        status: 'imported'
      }
    });
    
    for (const char of data.characters) {
      await prisma.character.create({
        data: {
          projectId: project.id,
          name: char.name,
          age: char.age,
          gender: char.gender,
          appearance: char.appearance,
          referenceImages: char.referenceImages
        }
      });
    }
    
    return project.id;
  }
}
```

#### 从Toonflow迁移

**SQLite数据导出**
```sql
-- 导出SQL脚本
SELECT * FROM t_novel;
SELECT * FROM t_storyline;
SELECT * FROM t_outline;
SELECT * FROM t_script;
SELECT * FROM t_assets;
```

**数据映射**
```typescript
const dataMapping = {
  t_novel: 'contents',
  t_storyline: 'storylines',
  t_outline: 'outlines',
  t_script: 'shots',
  t_assets: 'characters/scenes'
};
```

## 3. 服务架构设计

### 3.1 服务拆分

#### 用户服务 (User Service)

**职责**：
- 用户注册/登录
- 会话管理
- 权限验证
- 用户配置

**API端点**：
```
POST   /api/users/register
POST   /api/users/login
POST   /api/users/logout
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/storage
```

#### 项目服务 (Project Service)

**职责**：
- 项目CRUD
- 项目成员管理
- 项目权限控制
- 项目导入/导出

**API端点**：
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
GET    /api/projects/:id/export
POST   /api/projects/:id/import
```

#### 内容服务 (Content Service)

**职责**：
- 剧本解析
- 小说上传
- 内容结构化
- 故事线生成
- 大纲生成

**API端点**：
```
POST   /api/projects/:projectId/contents
GET    /api/contents/:id
PUT    /api/contents/:id
POST   /api/contents/:id/parse
POST   /api/contents/:id/generate-storyline
POST   /api/contents/:id/generate-outline
```

#### 资产服务 (Asset Service)

**职责**：
- 角色管理
- 场景管理
- 图像上传
- 参考图像管理
- 服装变体管理

**API端点**：
```
GET    /api/projects/:projectId/characters
POST   /api/projects/:projectId/characters
GET    /api/characters/:id
PUT    /api/characters/:id
DELETE /api/characters/:id
POST   /api/characters/:id/wardrobes

GET    /api/projects/:projectId/scenes
POST   /api/projects/:projectId/scenes
GET    /api/scenes/:id
PUT    /api/scenes/:id
DELETE /api/scenes/:id
```

#### 镜头服务 (Shot Service)

**职责**：
- 镜头列表生成
- 镜头CRUD
- 九宫格管理
- 镜头预览

**API端点**：
```
GET    /api/projects/:projectId/shots
POST   /api/projects/:projectId/shots/generate
GET    /api/shots/:id
PUT    /api/shots/:id
DELETE /api/shots/:id
GET    /api/shots/:id/panels
POST   /api/shots/:id/panels/generate
```

#### AI服务 (AI Service)

**职责**：
- 图像生成
- 视频生成
- 模型配置管理
- API密钥管理

**API端点**：
```
POST   /api/ai/generate-image
POST   /api/ai/generate-video
POST   /api/ai/optimize-keyframes
GET    /api/ai/models
GET    /api/ai/providers
POST   /api/ai/providers
PUT    /api/ai/providers/:id
DELETE /api/ai/providers/:id
```

#### Agent服务 (Agent Service)

**职责**：
- Agent任务调度
- Agent执行监控
- Agent结果存储
- Agent配置管理

**API端点**：
```
POST   /api/agents/storyline
POST   /api/agents/outline
POST   /api/agents/director
POST   /api/agents/segment
POST   /api/agents/shot
GET    /api/agents/tasks
GET    /api/agents/tasks/:id
```

#### 视频服务 (Video Service)

**职责**：
- 视频生成
- 视频拼接
- 视频处理
- 视频导出

**API端点**：
```
GET    /api/videos/:id
POST   /api/videos/merge
GET    /api/videos/:id/download
POST   /api/videos/:id/process
```

#### 通知服务 (Notification Service)

**职责**：
- 邮件通知
- 站内消息
- WebSocket推送

**API端点**：
```
GET    /api/notifications
PUT    /api/notifications/:id/read
```

### 3.2 服务间通信

#### 同步调用

**场景**：服务间实时数据查询

**实现**：HTTP REST API

```typescript
// 示例：项目服务调用用户服务验证权限
async function checkProjectAccess(userId: string, projectId: string) {
  const response = await axios.get(
    `http://user-service/api/users/${userId}/projects/${projectId}`
  );
  return response.data.hasAccess;
}
```

#### 异步消息

**场景**：长时间运行的任务

**实现**：消息队列（Redis + Bull）

```typescript
// 示例：视频生成任务
import Queue from 'bull';

const videoQueue = new Queue('video-generation', {
  redis: { host: 'localhost', port: 6379 }
});

videoQueue.process(async (job) => {
  const { shotId, model, duration } = job.data;
  const videoUrl = await generateVideo(shotId, model, duration);
  await updateShotVideoUrl(shotId, videoUrl);
});

// 添加任务
await videoQueue.add({ shotId, model, duration });
```

#### 事件驱动

**场景**：服务解耦，事件通知

**实现**：事件总线

```typescript
// 事件发布者
eventBus.publish('video.generated', {
  shotId,
  videoUrl,
  timestamp: new Date()
});

// 事件订阅者
eventBus.subscribe('video.generated', async (event) => {
  await notificationService.notifyUser(event.shotId, {
    type: 'video_ready',
    message: '视频生成完成'
  });
});
```

## 4. AI服务设计

### 4.1 多提供商抽象层

#### 提供商接口

```typescript
interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'google' | 'zhipu' | 'custom';
  
  // 文本生成
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string>;
  
  // 图像生成
  generateImage(prompt: string, options?: ImageOptions): Promise<string>;
  
  // 视频生成
  generateVideo(prompt: string, options?: VideoOptions): Promise<string>;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface ImageOptions {
  size?: string;
  style?: string;
  referenceImages?: string[];
}

interface VideoOptions {
  model?: string;
  duration?: number;
  aspectRatio?: string;
  startImage?: string;
  endImage?: string;
}
```

#### 提供商实现

```typescript
class OpenAIProvider implements AIProvider {
  id: string;
  name: string;
  type = 'openai' as const;
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.id = 'openai';
    this.name = 'OpenAI';
  }
  
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'gpt-5.1',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async *chatStream(messages: ChatMessage[], options: ChatOptions = {}): AsyncIterable<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'gpt-5.1',
        messages,
        stream: true
      })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = JSON.parse(line.slice(6));
        if (data.choices[0].delta.content) {
          yield data.choices[0].delta.content;
        }
      }
    }
  }
  
  async generateImage(prompt: string, options: ImageOptions = {}): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: options.size || '1024x1024'
      })
    });
    
    const data = await response.json();
    return data.data[0].url;
  }
  
  async generateVideo(prompt: string, options: VideoOptions = {}): Promise<string> {
    throw new Error('OpenAI video generation not implemented');
  }
}

class GoogleProvider implements AIProvider {
  id: string;
  name: string;
  type = 'google' as const;
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.id = 'google';
    this.name = 'Google';
  }
  
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${options.model || 'gemini-3-pro'}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        })
      }
    );
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
  
  async generateImage(prompt: string, options: ImageOptions = {}): Promise<string> {
    throw new Error('Google image generation not implemented');
  }
  
  async generateVideo(prompt: string, options: VideoOptions = {}): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${options.model || 'veo-3.1'}:generateVideo?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          duration: options.duration || 8,
          aspectRatio: options.aspectRatio || '16:9'
        })
      }
    );
    
    const data = await response.json();
    return data.videoUrl;
  }
}

class ZhipuProvider implements AIProvider {
  id: string;
  name: string;
  type = 'zhipu' as const;
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.id = 'zhipu';
    this.name = '智普AI';
  }
  
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'glm-4',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async generateImage(prompt: string, options: ImageOptions = {}): Promise<string> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'cogview',
        prompt,
        size: options.size || '1024x1024'
      })
    });
    
    const data = await response.json();
    return data.data[0].url;
  }
  
  async generateVideo(prompt: string, options: VideoOptions = {}): Promise<string> {
    throw new Error('Zhipu AI video generation not implemented');
  }
}
```

#### 提供商管理器

```typescript
class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProviderId: string;
  
  constructor() {
    this.loadProviders();
  }
  
  private loadProviders() {
    const config = loadModelConfig();
    for (const provider of config.providers) {
      this.addProvider(provider);
    }
    this.defaultProviderId = config.defaultProviderId;
  }
  
  addProvider(config: ModelProvider): void {
    let provider: AIProvider;
    
    switch (config.type) {
      case 'openai':
        provider = new OpenAIProvider(config.apiKey);
        break;
      case 'google':
        provider = new GoogleProvider(config.apiKey);
        break;
      case 'zhipu':
        provider = new ZhipuProvider(config.apiKey);
        break;
      case 'custom':
        provider = new CustomProvider(config.baseUrl, config.apiKey);
        break;
      default:
        throw new Error(`Unknown provider type: ${config.type}`);
    }
    
    this.providers.set(config.id, provider);
  }
  
  getProvider(id?: string): AIProvider {
    const providerId = id || this.defaultProviderId;
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    return provider;
  }
  
  getDefaultProvider(): AIProvider {
    return this.getProvider(this.defaultProviderId);
  }
  
  listProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}
```

### 4.2 Agent系统设计

#### Agent基类

```typescript
abstract class BaseAgent {
  protected provider: AIProvider;
  protected model: string;
  
  constructor(provider: AIProvider, model: string) {
    this.provider = provider;
    this.model = model;
  }
  
  abstract call(input: string, context?: any): Promise<string>;
  
  protected async executeWithRetry(
    fn: () => Promise<string>,
    maxRetries: number = 3
  ): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(1000 * (i + 1));
      }
    }
    throw new Error('Max retries exceeded');
  }
  
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 故事线Agent (AI1)

```typescript
class StorylineAgent extends BaseAgent {
  async call(novelText: string): Promise<string> {
    const systemPrompt = `你是一个专业的故事线分析专家。请分析小说文本，提取主要故事线。
    
要求：
1. 识别主要冲突和主题
2. 总结关键情节发展
3. 识别主要角色及其关系
4. 分析故事结构
5. 用清晰、简洁的语言呈现

输出格式为JSON：
{
  "theme": "故事主题",
  "mainConflict": "主要冲突",
  "keyPlots": ["情节1", "情节2", ...],
  "characters": [
    {
      "name": "角色名",
      "role": "角色定位",
      "arc": "角色发展"
    }
  ],
  "structure": "故事结构"
}`;

    return this.executeWithRetry(async () => {
      return await this.provider.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: novelText }
      ], { model: this.model });
    });
  }
}
```

#### 大纲Agent (AI2)

```typescript
class OutlineAgent extends BaseAgent {
  async call(storyline: string, episodeCount: number = 10): Promise<string> {
    const systemPrompt = `你是一个专业的大纲生成专家。基于故事线，生成详细的剧集大纲。
    
要求：
1. 将故事分为${episodeCount}集
2. 每集包含清晰的场景设置
3. 平衡每集的节奏
4. 保持角色一致性
5. 确保情节连贯

输出格式为JSON：
{
  "episodes": [
    {
      "number": 1,
      "title": "集标题",
      "summary": "集摘要",
      "scenes": [
        {
          "number": 1,
          "location": "地点",
          "time": "时间",
          "action": "动作描述",
          "dialogue": "对话"
        }
      ]
    }
  ]
}`;

    return this.executeWithRetry(async () => {
      return await this.provider.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: storyline }
      ], { model: this.model });
    });
  }
}
```

#### 导演Agent

```typescript
class DirectorAgent extends BaseAgent {
  async call(outline: string): Promise<string> {
    const systemPrompt = `你是一个专业的影视导演。将大纲转换为详细的剧本。
    
要求：
1. 将场景转换为镜头
2. 设计镜头运动和角度
3. 添加角色动作和表情
4. 包含对话和旁白
5. 标注视觉风格和氛围

输出格式为JSON：
{
  "shots": [
    {
      "number": 1,
      "sceneNumber": 1,
      "cameraAngle": "镜头角度",
      "cameraMovement": "镜头运动",
      "action": "动作描述",
      "dialogue": "对话",
      "duration": 8
    }
  ]
}`;

    return this.executeWithRetry(async () => {
      return await this.provider.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: outline }
      ], { model: this.model });
    });
  }
}
```

#### 分镜Agent

```typescript
class StoryboardAgent extends BaseAgent {
  async call(script: string, segmentCount: number = 4): Promise<string> {
    const systemPrompt = `你是一个专业的分镜师。将剧本转换为分镜板。
    
要求：
1. 将镜头分为${segmentCount}个分段
2. 每个分段生成九宫格提示词
3. 保持视觉连贯性
4. 标注关键元素和细节
5. 考虑角色位置和运动

输出格式为JSON：
{
  "segments": [
    {
      "number": 1,
      "shotId": "镜头ID",
      "panels": [
        {
          "position": 1,
          "prompt": "提示词"
        }
      ]
    }
  ]
}`;

    return this.executeWithRetry(async () => {
      return await this.provider.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: script }
      ], { model: this.model });
    });
  }
}
```

### 4.3 图像/视频生成服务

#### 图像生成服务

```typescript
class ImageGenerationService {
  private providerManager: AIProviderManager;
  
  constructor(providerManager: AIProviderManager) {
    this.providerManager = providerManager;
  }
  
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const provider = this.providerManager.getProvider(options.providerId);
    
    const enhancedPrompt = this.enhancePrompt(prompt, options);
    
    return await provider.generateImage(enhancedPrompt, {
      size: options.size || '1024x1024',
      style: options.style || 'realistic',
      referenceImages: options.referenceImages
    });
  }
  
  async generateNineGridImage(
    panels: NineGridPanel[],
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const provider = this.providerManager.getProvider(options.providerId);
    
    const prompts = panels.map(p => p.prompt);
    const compositePrompt = this.createCompositePrompt(prompts);
    
    const imageUrl = await provider.generateImage(compositePrompt, {
      size: options.size || '2048x2048',
      referenceImages: options.referenceImages
    });
    
    return imageUrl;
  }
  
  private enhancePrompt(prompt: string, options: ImageGenerationOptions): string {
    let enhanced = prompt;
    
    if (options.visualStyle) {
      enhanced = `${enhanced}, style: ${options.visualStyle}`;
    }
    
    if (options.negativePrompt) {
      enhanced = `${enhanced}, avoid: ${options.negativePrompt}`;
    }
    
    return enhanced;
  }
  
  private createCompositePrompt(prompts: string[]): string {
    return `Nine grid comic panel with following scenes:
${prompts.map((p, i) => `Panel ${i + 1}: ${p}`).join('\n')}
Style: consistent, cohesive, professional comic art`;
  }
}
```

#### 视频生成服务

```typescript
class VideoGenerationService {
  private providerManager: AIProviderManager;
  private taskQueue: Queue;
  
  constructor(providerManager: AIProviderManager) {
    this.providerManager = providerManager;
    this.taskQueue = new Queue('video-generation', {
      redis: { host: 'localhost', port: 6379 }
    });
    this.setupWorker();
  }
  
  async generateVideo(
    prompt: string,
    options: VideoGenerationOptions = {}
  ): Promise<string> {
    const taskId = uuidv4();
    
    await this.taskQueue.add('generate-video', {
      taskId,
      prompt,
      options
    });
    
    return taskId;
  }
  
  private setupWorker() {
    this.taskQueue.process(async (job) => {
      const { taskId, prompt, options } = job.data;
      const provider = this.providerManager.getProvider(options.providerId);
      
      try {
        const videoUrl = await provider.generateVideo(prompt, {
          model: options.model || 'veo',
          duration: options.duration || 8,
          aspectRatio: options.aspectRatio || '16:9',
          startImage: options.startImage,
          endImage: options.endImage
        });
        
        await prisma.video.update({
          where: { id: taskId },
          data: {
            url: videoUrl,
            status: 'completed'
          }
        });
        
      } catch (error) {
        await prisma.video.update({
          where: { id: taskId },
          data: {
            status: 'failed',
            errorMessage: error.message
          }
        });
        throw error;
      }
    });
  }
  
  async mergeVideos(videoIds: string[]): Promise<string> {
    const taskId = uuidv4();
    
    await this.taskQueue.add('merge-videos', {
      taskId,
      videoIds
    });
    
    return taskId;
  }
}
```

## 5. 前端架构设计

### 5.1 组件层次结构

```
App
├── AuthProvider
│   ├── LoginPage
│   └── RegisterPage
├── Layout
│   ├── Sidebar
│   ├── Header
│   └── MainContent
│       ├── ProjectList
│       ├── ProjectDetail
│       │   ├── ProjectSettings
│       │   ├── ContentEditor
│       │   ├── AssetManager
│       │   │   ├── CharacterManager
│       │   │   ├── SceneManager
│       │   │   └── WardrobeManager
│       │   ├── ShotEditor
│       │   │   ├── ShotList
│       │   │   ├── ShotDetail
│       │   │   ├── KeyframeEditor
│       │   │   └── NineGridPreview
│       │   ├── AgentPanel
│       │   └── VideoEditor
│       └── CollaborationPanel
└── NotificationProvider
```

### 5.2 状态管理

#### 使用React Context + Hooks

```typescript
// 用户Context
interface UserContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setUser(data.user);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// 项目Context
interface ProjectContextValue {
  project: Project | null;
  characters: Character[];
  scenes: Scene[];
  shots: Shot[];
  loadProject: (id: string) => Promise<void>;
  updateProject: (data: Partial<Project>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children, projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  
  const loadProject = async (id: string) => {
    const [projectRes, charsRes, scenesRes, shotsRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/projects/${id}/characters`),
      fetch(`/api/projects/${id}/scenes`),
      fetch(`/api/projects/${id}/shots`)
    ]);
    
    setProject(await projectRes.json());
    setCharacters(await charsRes.json());
    setScenes(await scenesRes.json());
    setShots(await shotsRes.json());
  };
  
  return (
    <ProjectContext.Provider value={{ project, characters, scenes, shots, loadProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
```

### 5.3 离线支持

#### Service Worker + IndexedDB

```typescript
// 注册Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// IndexedDB封装
class OfflineStorage {
  private db: IDBDatabase | null = null;
  
  async init() {
    this.db = await openDB('ai-content-platform', 1, {
      upgrade(db) {
        db.createObjectStore('projects', { keyPath: 'id' });
        db.createObjectStore('characters', { keyPath: 'id' });
        db.createObjectStore('scenes', { keyPath: 'id' });
        db.createObjectStore('shots', { keyPath: 'id' });
      }
    });
  }
  
  async get<T>(store: string, id: string): Promise<T | undefined> {
    return await this.db?.get(store, id);
  }
  
  async set<T>(store: string, data: T): Promise<void> {
    await this.db?.put(store, data);
  }
  
  async delete(store: string, id: string): Promise<void> {
    await this.db?.delete(store, id);
  }
  
  async clear(store: string): Promise<void> {
    await this.db?.clear(store);
  }
}

// 同步管理器
class SyncManager {
  private storage = new OfflineStorage();
  private pendingSync: Map<string, any> = new Map();
  
  async sync() {
    for (const [type, data] of this.pendingSync) {
      try {
        await this.syncToServer(type, data);
        this.pendingSync.delete(type);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
  
  private async syncToServer(type: string, data: any) {
    switch (type) {
      case 'project':
        await fetch(`/api/projects/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        break;
      case 'character':
        await fetch(`/api/characters/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        break;
    }
  }
  
  async addToSync(type: string, data: any) {
    this.pendingSync.set(type, data);
    await this.storage.set(type, data);
  }
}
```

### 5.4 性能优化

#### 虚拟滚动

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function ShotList({ shots }: { shots: Shot[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: shots.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <ShotItem shot={shots[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 图片懒加载

```typescript
function LazyImage({ src, alt, ...props }: ImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setImageSrc(src);
        observer.disconnect();
      }
    });
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return <img ref={imgRef} src={imageSrc} alt={alt} {...props} />;
}
```

#### Web Worker处理耗时任务

```typescript
// worker.ts
self.onmessage = (e) => {
  const { type, data } = e.data;
  
  if (type === 'parse-script') {
    const result = parseScript(data);
    self.postMessage({ type: 'script-parsed', data: result });
  }
};

// 使用
const worker = new Worker('/worker.js');

worker.onmessage = (e) => {
  if (e.data.type === 'script-parsed') {
    setScriptData(e.data.data);
  }
};

function parseScriptInWorker(script: string) {
  worker.postMessage({ type: 'parse-script', data: script });
}
```

## 6. 安全设计

### 6.1 认证授权

#### JWT Token

```typescript
// 生成Token
function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证Token
function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
}

// 中间件
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 6.2 权限控制

#### 基于角色的访问控制（RBAC）

```typescript
enum Role {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

async function checkProjectAccess(
  userId: string,
  projectId: string,
  requiredRole: Role
): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId }
    }
  });
  
  if (!member) return false;
  
  const roleHierarchy = {
    [Role.OWNER]: 3,
    [Role.EDITOR]: 2,
    [Role.VIEWER]: 1
  };
  
  return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
}

// 使用
export async function updateProjectHandler(req: Request, res: Response) {
  const hasAccess = await checkProjectAccess(
    req.user.userId,
    req.params.projectId,
    Role.EDITOR
  );
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  // 处理请求
}
```

### 6.3 数据加密

#### 敏感数据加密

```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text: string): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 6.4 API限流

#### Redis限流

```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function rateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60
): Promise<boolean> {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}

// 中间件
export function rateLimitMiddleware(limit: number = 100, window: number = 60) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.user?.userId || 'unknown';
    
    const allowed = await rateLimit(identifier, limit, window);
    
    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    next();
  };
}
```

## 7. 监控与日志

### 7.1 性能监控

#### APM集成

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});

// 性能追踪
app.use(Sentry.Handlers.requestHandler());

// 事务追踪
Sentry.startSpan({
  name: 'generate-video',
  op: 'ai.generation'
}, async () => {
  await videoGenerationService.generateVideo(prompt, options);
});
```

### 7.2 日志管理

#### 结构化日志

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用
logger.info('Video generation started', {
  shotId,
  model,
  userId: req.user.userId
});

logger.error('Video generation failed', {
  shotId,
  error: error.message,
  stack: error.stack
});
```

## 8. 部署架构

### 8.1 容器化部署

#### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ai_content_platform
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  api:
    build: ./api
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@postgres:5432/ai_content_platform
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  web:
    build: ./web
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

### 8.2 CI/CD流程

#### GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker build -t ai-content-platform ./api
      - run: docker push ai-content-platform

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: kubectl apply -f k8s/
```

## 9. 总结

本设计文档详细说明了AI内容创作平台的技术架构，包括：

1. **整体架构**：分层架构，职责清晰
2. **数据模型**：统一的数据模型，支持剧本和小说两种模式
3. **服务架构**：微服务拆分，可独立部署和扩展
4. **AI服务**：多提供商抽象，避免厂商锁定
5. **Agent系统**：基于LangChain，专业分工
6. **前端架构**：React 19，组件化，离线支持
7. **安全设计**：认证授权，数据加密，API限流
8. **监控日志**：性能监控，结构化日志
9. **部署架构**：容器化，CI/CD自动化

该架构具有良好的可扩展性、可维护性和安全性，能够支撑平台的长期发展。
