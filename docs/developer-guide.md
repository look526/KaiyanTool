# 开演AI (KaiyanAI) 功能开发文档

> 适用于开发者和维护者的完整功能说明指南

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [核心功能模块](#3-核心功能模块)
4. [后端 API 接口](#4-后端-api-接口)
5. [前端页面功能](#5-前端页面功能)
6. [AI 能力与 Agents](#6-ai-能力与-agents)
7. [数据库模型](#7-数据库模型)
8. [开发指南](#8-开发指南)
9. [部署指南](#9-部署指南)
10. [常见问题](#10-常见问题)

---

## 1. 项目概述

**开演AI (KaiyanAI)** 是一个专为影视创作者打造的 AI 内容创作平台，支持从剧本创作到视频制作的全流程。

### 1.1 项目类型

- **Monorepo** 结构：使用 Turborepo 管理
- **两个主要应用**：
  - `apps/api` - Express + TypeScript 后端服务
  - `apps/web` - React 19 + Vite 前端应用

### 1.2 核心能力

| 能力 | 说明 |
|------|------|
| 剧本创作 | Monaco Editor 专业剧本编辑器，AI 场景解析 |
| 角色管理 | 角色库维护，AI 一致性保持 |
| 分镜系统 | 智能分镜生成，九宫格可视化 |
| 图像生成 | 多 AI 提供商支持，批量生成 |
| 视频生成 | 关键帧转视频，多格式导出 |
| 项目协作 | 团队成员管理，权限控制 |

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Monaco Editor, Zustand, React Query |
| **后端** | Node.js 24, Express 4, TypeScript, Prisma ORM |
| **数据库** | PostgreSQL 16 |
| **缓存/队列** | Redis 7, Bull Queue |
| **AI 提供商** | OpenAI, Google AI, 智谱AI (GLM), AntSK |
| **部署** | Docker, Docker Compose |

### 2.2 项目结构

```
kaiyanTool/
├── apps/
│   ├── api/                    # 后端 API 服务
│   │   ├── src/
│   │   │   ├── controllers/   # 控制器层
│   │   │   ├── services/      # 业务逻辑层
│   │   │   ├── agents/        # AI Agents
│   │   │   ├── routes/        # 路由定义
│   │   │   ├── prompts/       # AI 提示词管理
│   │   │   ├── middleware/    # 中间件
│   │   │   ├── types/         # 类型定义
│   │   │   └── utils/         # 工具函数
│   │   ├── prisma/            # 数据库 Schema
│   │   └── uploads/           # 上传文件存储
│   │
│   └── web/                    # 前端应用
│       ├── src/
│       │   ├── pages/         # 页面组件
│       │   ├── components/    # UI 组件
│       │   ├── hooks/         # 自定义 Hooks
│       │   ├── services/      # API 服务
│       │   ├── stores/        # Zustand 状态
│       │   ├── types/         # 类型定义
│       │   └── utils/         # 工具函数
│       └── tests/             # 测试文件
│
├── packages/
│   └── shared/                 # 共享代码包
│
├── docs/                       # 项目文档
├── docker-compose.yml          # Docker 配置
└── turbo.json                  # Turborepo 配置
```

### 2.3 服务端口

| 服务 | 端口 | 环境变量 |
|------|------|----------|
| Web 前端 | 3000 | `VITE_API_URL` |
| API 后端 | 3001 | `PORT` |
| PostgreSQL | 5432 | `DATABASE_URL` |
| Redis | 6379 | `REDIS_URL` |

---

## 3. 核心功能模块

### 3.1 认证与授权

- **用户注册/登录**：邮箱 + 密码，bcrypt 加密
- **JWT Token**：7 天有效期
- **会话管理**：支持多设备登录
- **权限控制**：项目级别的 RBAC（所有者/编辑者/查看者）

### 3.2 项目管理

- **项目创建**：支持剧本/小说/混合类型
- **项目模板**：预定义项目模板快速创建
- **成员协作**：邀请团队成员，角色分配
- **项目设置**：自定义配置存储

### 3.3 剧本管理

- **剧本编辑器**：Monaco Editor，支持语法高亮
- **AI 解析**：自动识别场景、角色、对话
- **版本控制**：历史版本记录与回滚
- **模板库**：预设剧本模板

### 3.4 角色管理

- **角色库**：项目内角色集中管理
- **角色画像**：姓名、年龄、性别、外貌描述
- **参考图像**：多张参考图保持一致性
- **AI 一致性**：Character Consistency Service

### 3.5 场景与分镜

- **场景管理**：场景列表，时间地点氛围
- **分镜生成**：AI 自动从剧本生成分镜
- **九宫格面板**：9 格可视化布局
- **拖拽排序**：分镜顺序调整

### 3.6 图像生成

- **多提供商支持**：OpenAI DALL-E, Google Imagen, 智谱 CogView
- **批量生成**：一次生成多个变体
- **提示词优化**：AI 自动优化提示词
- **图像增强**：超分辨率、画质提升

### 3.7 视频生成

- **关键帧转视频**：从图像生成视频
- **视频合并**：多段视频拼接
- **格式导出**：MP4、WebM 等格式
- **Premiere 导出**：支持 Premiere Pro 格式

### 3.8 文档管理

- **项目文档**：项目相关文档存储
- **小说创作**：独立的小说创作模块
- **大纲管理**：故事大纲管理

### 3.9 系统管理

- **AI 提供商配置**：用户自定义 API Key
- **模型配置**：选择默认 AI 模型
- **审计日志**：操作记录追踪
- **系统监控**：Prometheus + Grafana

---

## 4. 后端 API 接口

### 4.1 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 退出登录 |
| POST | `/api/auth/refresh` | 刷新 Token |
| GET | `/api/auth/me` | 获取当前用户 |

### 4.2 项目接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/projects` | 获取项目列表 |
| POST | `/api/projects` | 创建项目 |
| GET | `/api/projects/:id` | 获取项目详情 |
| PUT | `/api/projects/:id` | 更新项目 |
| DELETE | `/api/projects/:id` | 删除项目 |
| GET | `/api/projects/:id/members` | 获取成员列表 |
| POST | `/api/projects/:id/members` | 添加成员 |

### 4.3 剧本接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/scripts` | 获取剧本列表 |
| POST | `/api/scripts` | 创建剧本 |
| GET | `/api/scripts/:id` | 获取剧本详情 |
| PUT | `/api/scripts/:id` | 更新剧本 |
| DELETE | `/api/scripts/:id` | 删除剧本 |
| POST | `/api/scripts/:id/analyze` | AI 分析剧本 |

### 4.4 角色接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/characters` | 获取角色列表 |
| POST | `/api/characters` | 创建角色 |
| GET | `/api/characters/:id` | 获取角色详情 |
| PUT | `/api/characters/:id` | 更新角色 |
| DELETE | `/api/characters/:id` | 删除角色 |

### 4.5 场景接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/scenes` | 获取场景列表 |
| POST | `/api/scenes` | 创建场景 |
| GET | `/api/scenes/:id` | 获取场景详情 |
| PUT | `/api/scenes/:id` | 更新场景 |
| DELETE | `/api/scenes/:id` | 删除场景 |

### 4.6 分镜接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/shots` | 获取分镜列表 |
| POST | `/api/shots` | 创建分镜 |
| POST | `/api/shots/generate` | AI 生成分镜 |
| GET | `/api/shots/:id` | 获取分镜详情 |
| PUT | `/api/shots/:id` | 更新分镜 |
| DELETE | `/api/shots/:id` | 删除分镜 |

### 4.7 面板接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/panels` | 获取九宫格面板 |
| POST | `/api/panels` | 创建面板 |
| POST | `/api/panels/generate` | AI 生成面板 |
| PUT | `/api/panels/:id` | 更新面板 |

### 4.8 图像生成接口

| 方法 | 路径 |说明 |
|------|------|------|
| POST | `/api/image-generation/generate` | 生成图像 |
| POST | `/api/image-generation/batch` | 批量生成 |
| POST | `/api/image-enhancement/enhance` | 增强图像 |
| POST | `/api-image-super-resolution/upscale` | 超分辨率 |

### 4.9 视频生成接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/video-generation/generate` | 生成视频 |
| POST | `/api/video-generation/merge` | 合并视频 |
| GET | `/api/video-generation/status/:id` | 获取生成状态 |

### 4.10 AI 提供商接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ai-providers` | 获取提供商列表 |
| POST | `/api/ai-providers` | 添加提供商 |
| PUT | `/api/ai-providers/:id` | 更新提供商 |
| DELETE | `/api/ai-providers/:id` | 删除提供商 |
| GET | `/api/ai-providers/:id/models` | 获取模型列表 |

### 4.11 其他接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload` | 文件上传 |
| GET | `/api/analytics` | 数据分析 |
| GET | `/api/audit-logs` | 审计日志 |
| GET | `/api/health` | 健康检查 |

---

## 5. 前端页面功能

### 5.1 认证页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | `/login` | 用户登录 |
| 注册页 | `/register` | 用户注册 |
| 忘记密码 | `/forgot-password` | 密码找回 |

### 5.2 项目页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 项目列表 | `/projects` | 所有项目列表 |
| 创建项目 | `/projects/create` | 新建项目 |
| 项目详情 | `/projects/:id` | 项目概览 |
| 项目设置 | `/projects/:id/settings` | 项目配置 |
| 项目成员 | `/projects/:id/members` | 成员管理 |

### 5.3 内容编辑页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 剧本编辑器 | `/projects/:id/script` | Monaco 剧本编辑 |
| 剧本预览 | `/projects/:id/script/view` | 只读预览 |
| 统一编辑器 | `/projects/:id/editor` | 综合性编辑器 |
| 小说编辑 | `/projects/:id/novel` | 小说创作 |
| 大纲管理 | `/projects/:id/outline` | 故事大纲 |

### 5.4 资源管理页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 角色管理 | `/projects/:id/characters` | 角色库 |
| 场景管理 | `/projects/:id/scenes` | 场景列表 |
| 分镜管理 | `/projects/:id/shots` | 分镜列表 |
| 九宫格 | `/projects/:id/panels` | 面板管理 |

### 5.5 媒体生成页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 图像生成 | `/projects/:id/images` | AI 图像生成 |
| 视频生成 | `/projects/:id/video` | AI 视频生成 |
| 视频合并 | `/projects/:id/video/merge` | 视频合并 |

### 5.6 系统设置页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 个人资料 | `/settings/profile` | 账户信息 |
| 安全设置 | `/settings/security` | 密码修改 |
| 外观设置 | `/settings/appearance` | 主题配置 |
| 通知设置 | `/settings/notifications` | 通知偏好 |
| AI 提供商 | `/settings/ai-providers` | API 配置 |
| 模型配置 | `/settings/models` | 默认模型 |

### 5.7 管理后台

| 页面 | 路径 | 说明 |
|------|------|------|
| 管理登录 | `/admin/login` | 管理员登录 |
| 管理仪表盘 | `/admin` | 系统概览 |
| 用户管理 | `/admin/users` | 用户列表 |
| 资源管理 | `/admin/assets` | 资源文件 |
| 日志查看 | `/admin/logs` | 系统日志 |

### 5.8 其他页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 引导页 |
| 仪表盘 | `/dashboard` | 用户仪表盘 |
| 分析页 | `/analytics` | 数据分析 |
| 文档页 | `/documents` | 文档管理 |
| 资产库 | `/assets` | 资源库 |
| 团队页 | `/team` | 团队管理 |
| API 文档 | `/api-dashboard` | API 使用统计 |
| 帮助页 | `/help` | 帮助文档 |

---

## 6. AI 能力与 Agents

### 6.1 AI 提供商

系统支持多个 AI 提供商，通过 `providerManager` 统一管理：

| 提供商 | 类型标识 | 支持模型 |
|--------|----------|----------|
| OpenAI | `openai` | GPT-4, DALL-E-3 |
| Google AI | `google` | Gemini, Imagen |
| 智谱AI | `zhipu` | GLM-4, CogView-3 |
| AntSK | `antsk` | 自定义模型 |

### 6.2 AI Agents

| Agent | 文件 | 功能 |
|-------|------|------|
| Director Agent | `director.agent.ts` | 分镜生成，镜头规划 |
| Script Analysis Agent | `script-analysis.agent.ts` | 剧本解析，场景提取 |

### 6.3 AI 服务

| 服务 | 功能 |
|------|------|
| `script-analysis.service.ts` | 剧本智能分析 |
| `image-generation.service.ts` | 图像生成 |
| `video-generation.service.ts` | 视频生成 |
| `character-consistency.service.ts` | 角色一致性保持 |
| `scene-concept.service.ts` | 场景概念生成 |

### 6.4 提示词管理

所有 AI 提示词存储在 `apps/api/src/prompts/`：

```
prompts/
├── agents/           # Agent 提示词
├── routes/           # 路由提示词
├── services/         # 服务提示词
├── templates/        # 风格模板
└── loader.ts        # 提示词加载器
```

**使用方式**：通过 `loadPrompt()` 函数加载

```typescript
const prompt = await loadPrompt('agents/director', { 
  variables: { scriptContent: '...' } 
});
```

---

## 7. 数据库模型

### 7.1 核心表

| 表名 | 说明 |
|------|------|
| `User` | 用户账户 |
| `Session` | 登录会话 |
| `Project` | 项目 |
| `ProjectMember` | 项目成员 |
| `Script` | 剧本 |
| `Novel` | 小说 |
| `Chapter` | 章节 |
| `Character` | 角色 |
| `Scene` | 场景 |
| `Shot` | 分镜 |
| `NineGridPanel` | 九宫格面板 |
| `Video` | 视频 |
| `AIProvider` | AI 提供商配置 |
| `AgentTask` | AI 任务记录 |
| `AuditLog` | 审计日志 |
| `QualityReport` | 质量报告 |

### 7.2 枚举类型

```prisma
enum ProjectType {
  script    # 剧本项目
  novel     # 小说项目
  mixed     # 混合项目
}

enum MemberRole {
  owner     # 所有者
  editor    # 编辑者
  viewer    # 查看者
}

enum AgentType {
  storyline   # 故事线
  outline     # 大纲
  director    # 导演
  segment     # 片段
  shot        # 分镜
}

enum TaskStatus {
  pending     # 等待中
  processing  # 处理中
  completed   # 已完成
  failed      # 失败
}
```

---

## 8. 开发指南

### 8.1 环境要求

```bash
Node.js >= 24.0.0
Docker & Docker Compose
PostgreSQL 16
Redis 7+
```

### 8.2 本地开发

```bash
# 1. 克隆项目
git clone <repository-url>
cd kaiyanTool

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 4. 启动数据库
docker-compose up postgres redis -d

# 5. 运行数据库迁移
cd apps/api
npx prisma migrate dev

# 6. 启动 API 服务
npm run dev
# 服务运行在 http://localhost:3001

# 7. 启动前端 (新终端)
cd apps/web
npm run dev
# 服务运行在 http://localhost:3000
```

### 8.3 常用命令

```bash
# 项目根目录
npm run dev          # 启动所有开发服务
npm run build        # 构建所有项目
npm run lint         # 代码检查
npm run format       # 代码格式化
npm run test         # 运行测试

# API 目录 (apps/api)
npm run dev          # 启动 API 开发服务器
npm run build        # 构建 API
npm run migrate      # 运行数据库迁移
npm run seed         # 填充测试数据
npm run test         # 运行测试
npm run lint         # 代码检查

# Web 目录 (apps/web)
npm run dev          # 启动 Web 开发服务器
npm run build        # 构建生产版本
npm run e2e          # 运行 E2E 测试
npm run e2e:open    # 打开 E2E 测试 UI
```

### 8.4 代码规范

| 规范 | 说明 |
|------|------|
| 语言 | TypeScript 5.8+ |
| 代码风格 | ESLint + Prettier |
| 命名 | 驼峰命名 |
| 组件 | 函数式组件 + Hooks |
| 状态 | Server State (React Query) + Client State (Zustand) |

### 8.5 API 调用规范

**必须使用 providerManager**：

```typescript
// 1. 从数据库获取配置
const providers = await prisma.aIProvider.findMany({
  where: { enabled: true },
  include: { models: true },
});

// 2. 添加到 manager
providerManager.addProvider({
  id: provider.id,
  type: provider.type,
  apiKey: provider.apiKey,
  baseUrl: provider.baseUrl || undefined,
});

// 3. 调用 AI (必须传递 model 参数!)
const result = await aiProvider.chat(messages, { model: modelName });
```

### 8.6 前端状态管理

- **Server State**：React Query（服务器数据）
- **Client State**：Zustand（用户偏好、UI 状态）
- **禁止**：在 Zustand 中存储服务器数据

---

## 9. 部署指南

### 9.1 Docker 部署

```bash
# 1. 构建并启动所有服务
docker-compose up -d --build

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f api
docker-compose logs -f web
```

### 9.2 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接 | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | Redis 连接 | `redis://localhost:6379` |
| `JWT_SECRET` | JWT 密钥 | 随机字符串 |
| `NODE_ENV` | 运行环境 | `production` |
| `SENTRY_DSN` | Sentry 监控 | Sentry 项目 DSN |

### 9.3 监控配置

项目包含 Prometheus + Grafana 监控：

```bash
# 启动监控服务
docker-compose -f monitoring/docker-compose.yml up -d
```

访问 Grafana：http://localhost:3002（默认 admin/admin）

---

## 10. 常见问题

### 10.1 开发问题

**Q: 如何添加新的 AI 提供商？**

A: 实现 `AIProvider` 接口，添加到 `providerManager`。

**Q: 如何创建新的前端页面？**

A: 在 `apps/web/src/pages/` 创建组件，添加到路由配置。

**Q: 如何修改数据库 Schema？**

A: 修改 `apps/api/prisma/schema.prisma`，运行 `npx prisma migrate dev`。

### 10.2 功能问题

**Q: 图像生成失败怎么办？**

A: 检查：
1. AI 提供商 API Key 是否正确
2. 账户余额是否充足
3. 网络是否能访问 AI 服务

**Q: 如何导出视频？**

A: 在视频生成页面，选择导出格式（MP4/WebM），点击导出按钮。

### 10.3 部署问题

**Q: Docker 构建失败？**

A: 检查：
1. Node 版本是否 >= 24
2. 依赖是否完整安装
3. 端口是否被占用

**Q: 数据库连接失败？**

A: 检查：
1. PostgreSQL 是否运行
2. `DATABASE_URL` 是否正确
3. 防火墙是否允许连接

---

## 附录

### A. 重要文件

| 文件 | 说明 |
|------|------|
| `apps/api/src/index.ts` | API 入口 |
| `apps/api/prisma/schema.prisma` | 数据库 Schema |
| `apps/web/src/App.tsx` | 前端入口 |
| `docker-compose.yml` | Docker 配置 |
| `.env.example` | 环境变量示例 |

### B. 第三方服务

| 服务 | 用途 | 官网 |
|------|------|------|
| OpenAI | GPT-4, DALL-E | openai.com |
| Google AI | Gemini, Imagen | ai.google |
| 智谱AI | GLM, CogView | zhipuai.cn |
| Sentry | 错误追踪 | sentry.io |
| Prometheus | 指标收集 | prometheus.io |
| Grafana | 可视化监控 | grafana.com |

---

**文档版本**：1.0.0  
**最后更新**：2026-03-05
