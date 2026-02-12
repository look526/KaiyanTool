# AI 内容创作平台架构文档

## 目录

1. [系统概述](#系统概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [核心模块](#核心模块)
5. [数据模型](#数据模型)
6. [API 设计](#api-设计)
7. [安全架构](#安全架构)
8. [部署架构](#部署架构)

---

## 系统概述

AI 内容创作平台是一个统一的 AI 驱动的内容创作工具，整合了三个现有项目：BigBanana-AI-Director、Toonflow-app 和 CineGen-AI。平台提供剧本创作、角色设计、场景管理、分镜生成、AI 图像生成和视频生成等功能。

### 核心功能

- 用户认证与授权
- 项目管理
- 角色管理
- 场景管理
- 镜头管理
- 剧本编辑（Monaco Editor）
- AI 提供商管理
- 导演 Agent（剧本生成）
- 图像生成
- 视频生成
- 项目导出/导入

---

## 技术栈

### 后端

- **框架**: Express.js (TypeScript)
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **认证**: JWT + Cookie
- **文件存储**: 本地 / 阿里云 OSS
- **图像处理**: Sharp
- **视频处理**: FFmpeg
- **日志**: Winston + Sentry
- **监控**: Prometheus + Grafana
- **AI 提供商**: OpenAI, Google, AntSK

### 前端

- **框架**: React (TypeScript)
- **构建工具**: Vite
- **UI 组件**: Tailwind CSS + shadcn/ui
- **编辑器**: Monaco Editor
- **状态管理**: React Context
- **路由**: React Router
- **HTTP 客户端**: Fetch API

---

## 项目结构

```
kaiyanTool/
├── apps/
│   ├── api/              # 后端 API 服务
│   │   ├── src/
│   │   │   ├── controllers/   # 控制器
│   │   │   ├── routes/        # 路由
│   │   │   ├── services/      # 业务逻辑
│   │   │   ├── middleware/    # 中间件
│   │   │   ├── lib/           # 工具库
│   │   │   ├── agents/        # AI Agent
│   │   │   └── types/         # 类型定义
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/              # 前端应用
│       └── src/
│           ├── components/    # React 组件
│           ├── pages/         # 页面
│           ├── lib/           # 工具库
│           ├── contexts/      # Context
│           └── styles/        # 样式
├── packages/             # 共享包
├── docker/               # Docker 配置
├── openspec/             # OpenSpec 变更记录
└── README.md
```

---

## 核心模块

### 认证模块

- 用户注册/登录
- JWT 令牌生成与验证
- 会话管理（Redis）
- 密码加密（bcrypt）

### 项目管理模块

- 项目 CRUD
- 项目成员管理
- 权限控制（RBAC）

### 资产管理模块

- 角色管理
- 场景管理
- 参考图像上传

### 镜头管理模块

- 镜头 CRUD
- 镜头排序
- 镜头图像生成
- 镜头视频生成

### AI 服务模块

- AI 提供商抽象层
- OpenAI 提供商
- Google 提供商
- AntSK 提供商
- 导演 Agent

### 导出模块

- 项目导出（ZIP）
- 项目导入
- 视频/图像导出

---

## 数据模型

### User（用户）

```typescript
{
  id: string
  email: string
  password: string (encrypted)
  name: string
  createdAt: Date
  updatedAt: Date
}
```

### Project（项目）

```typescript
{
  id: string
  ownerId: string
  name: string
  description: string
  type: 'script' | 'novel' | 'mixed'
  visualStyle: string
  createdAt: Date
  updatedAt: Date
}
```

### Character（角色）

```typescript
{
  id: string
  projectId: string
  name: string
  description: string
  appearance: string
  personality: string
  background: string
  referenceImages: string[]
}
```

### Scene（场景）

```typescript
{
  id: string
  projectId: string
  location: string
  time: string
  weather: string
  lighting: string
  mood: string
  referenceImages: string[]
}
```

### Shot（镜头）

```typescript
{
  id: string
  projectId: string
  sceneId: string
  characterId: string
  chapterNumber: number
  episodeNumber: number
  segmentId: number
  cellId: number
  actionSummary: string
  cameraMovement: string
  startPrompt: string
  endPrompt: string
  startImageUrl: string
  endImageUrl: string
  duration: number
  aspectRatio: string
  visualStyle: string
  videoUrl: string
}
```

### AIProvider（AI 提供商）

```typescript
{
  id: string
  userId: string
  name: string
  type: 'openai' | 'google' | 'antsk'
  apiKey: string (encrypted)
  baseUrl: string
  enabled: boolean
  config: JSON
}
```

---

## API 设计

### 认证 API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户

### 项目 API

- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 角色 API

- `GET /api/projects/:projectId/characters` - 获取角色列表
- `POST /api/projects/:projectId/characters` - 创建角色
- `PUT /api/characters/:id` - 更新角色
- `DELETE /api/characters/:id` - 删除角色

### 场景 API

- `GET /api/projects/:projectId/scenes` - 获取场景列表
- `POST /api/projects/:projectId/scenes` - 创建场景
- `PUT /api/scenes/:id` - 更新场景
- `DELETE /api/scenes/:id` - 删除场景

### 镜头 API

- `GET /api/projects/:projectId/shots` - 获取镜头列表
- `POST /api/projects/:projectId/shots` - 创建镜头
- `PUT /api/shots/:id` - 更新镜头
- `DELETE /api/shots/:id` - 删除镜头
- `POST /api/shots/:id/generate-both` - 生成起始和结束图像
- `POST /api/shots/:id/generate-video` - 生成视频

### AI 提供商 API

- `GET /api/ai/providers` - 获取提供商列表
- `POST /api/ai/providers` - 添加提供商
- `PUT /api/ai/providers/:id` - 更新提供商
- `DELETE /api/ai/providers/:id` - 删除提供商

### 剧本 API

- `POST /api/script/parse` - 解析剧本
- `POST /api/script/save` - 保存剧本
- `GET /api/script/:projectId` - 获取剧本

### 导演 Agent API

- `POST /api/projects/:projectId/director/generate-shots` - 从剧本生成分镜
- `POST /api/shots/:id/director/optimize-prompt` - 优化提示词

### 导出 API

- `GET /api/projects/:projectId/export` - 导出项目
- `POST /api/import` - 导入项目

---

## 安全架构

### 认证与授权

- JWT 令牌用于用户认证
- Cookie 存储 JWT 令牌
- Redis 存储会话信息
- RBAC 权限控制（Owner, Admin, Editor, Viewer）

### 数据加密

- API 密钥使用 AES-256-GCM 加密
- 密码使用 bcrypt 哈希
- HTTPS 传输

### 输入验证

- Express 验证中间件
- 参数类型检查
- 长度限制

### 日志与监控

- Winston 结构化日志
- Sentry 错误追踪
- Prometheus 指标收集

---

## 部署架构

### 开发环境

```
┌─────────────┐
│   Docker   │
│  Compose   │
└─────┬──────┘
      │
      ├── API Server (Port 4000)
      │   └── PostgreSQL (Port 5432)
      │   └── Redis (Port 6379)
      │
      └── Web Server (Port 3000)
          └── Vite Dev Server
```

### 生产环境

```
┌─────────────────────────────┐
│         Nginx            │
│   (Reverse Proxy)         │
└───────┬───────────────┘
        │
        ├── API Server Cluster
        │   └── PostgreSQL Primary
        │   └── Redis Cluster
        │   └── OSS Storage
        │
        └── Web Server
            └── CDN
```

---

## 扩展性

### 水平扩展

- API 服务可水平扩展
- Redis 集群支持
- 数据库读写分离

### 垂直扩展

- 微服务化准备
- AI 服务独立部署
- 视频处理服务独立部署

---

## 监控与维护

### 日志

- API 日志: Winston
- 前端日志: Sentry
- 系统日志: Docker logs

### 指标

- HTTP 请求
- 响应时间
- 错误率
- AI API 调用次数

### 告警

- Sentry 错误告警
- Prometheus 指标告警
- Uptime 监控

---

## 开发指南

### 环境变量

```bash
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/kaiyan

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# OSS
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret-key
OSS_BUCKET=kaiyan-bucket
OSS_REGION=oss-cn-hangzhou

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# AI Provider (可选)
OPENAI_API_KEY=sk-xxx
GOOGLE_API_KEY=xxx
```

### 运行命令

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行生产服务器
npm run start

# 运行测试
npm run test
```
