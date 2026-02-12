# AI内容创作平台 - 系统架构文档

## 目录
- [1. 架构概览](#1-架构概览)
- [2. 技术栈](#2-技术栈)
- [3. 系统组件](#3-系统组件)
- [4. 数据流](#4-数据流)
- [5. 服务间通信](#5-服务间通信)
- [6. 扩展性设计](#6-扩展性设计)
- [7. 安全性设计](#7-安全性设计)

---

## 1. 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    用户 (浏览器)                          │
│                                                          │
└──────────────────────────────────────────┬───────────────┘
                                   │ HTTPS
                                   │
                    ┌──────────────────────────────────┐
                    │      Web 应用 (React)     │
                    │   - 用户界面               │
                    │   - 状态管理              │
                    │   - API客户端               │
                    └──────────────────────────────────┘
                                   │ HTTP/REST API
                                   │
                    ┌──────────────────────────────────┐
                    │     API 服务 (Express)      │
                    │  - 认证中间件            │
                    │  - 权限中间件            │
                    │  - 控制器层              │
                    │  - 服务层                │
                    │  - AI提供商抽象           │
                    └──────────────────────────────────┘
                                   │
        ┌──────────────────┼──────────────────┐
        │                 │                  │
┌───────┴─────┐   │    ┌───────────┴────────┐
│  PostgreSQL  │   │    │    Redis              │
│  (主数据库)   │   │    │  (缓存 + 队列)   │
└──────────────┘   │    └─────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
┌─────┴───┐  │   ┌─────┴─────┐
│ AI提供商  │  │   │  Sentry     │
│ - OpenAI  │  │   │  (监控)     │
│ - Google  │  │   └─────────────┘
│ - 智普AI │  │
│ - AntSK   │  │
└──────────┘  │
              │
        ┌─────┴─────┐
        │  日志文件   │
        └────────────┘
```

---

## 2. 技术栈

### 后端技术栈
| 组件 | 技术 | 版本 | 用途 |
|--------|--------|--------|------|
| 运行时 | Node.js | 24.12.0 | JavaScript运行环境 |
| 框架 | Express | 4.18.0 | Web框架 |
| ORM | Prisma | 5.9.0 | 数据库ORM |
| 数据库 | PostgreSQL | 16 | 主数据库 |
| 缓存 | Redis | 7+ | 缓存和队列 |
| 任务队列 | Bull | 4.11.0 | 异步任务处理 |
| 日志 | Winston | 3.19.0 | 结构化日志 |
| 监控 | Sentry | 10.38.0 | 错误追踪 |
| AI SDK | OpenAI/Google/Zhipu | - | 多提供商支持 |

### 前端技术栈
| 组件 | 技术 | 版本 | 用途 |
|--------|--------|--------|------|
| 框架 | React | 18.3.1 | UI框架 |
| 构建工具 | Vite | 6.2.0 | 开发服务器 |
| 语言 | TypeScript | 5.8.0 | 类型安全 |
| 样式 | Tailwind CSS | 4.1.18 | UI样式 |
| 编辑器 | Monaco Editor | - | 代码编辑器 |
| 状态管理 | React Hooks | - | 组件状态 |
| HTTP客户端 | fetch API | - | API请求 |

---

## 3. 系统组件

### 3.1 API服务层
```
apps/api/src/
├── controllers/          # 控制器层
│   ├── auth.controller.ts
│   ├── project.controller.ts
│   ├── script.controller.ts
│   ├── character.controller.ts
│   ├── scene.controller.ts
│   ├── shot-generation.controller.ts
│   ├── video-generation.controller.ts
│   ├── novel.controller.ts
│   └── director.controller.ts
│
├── services/             # 服务层
│   ├── ai/              # AI服务
│   │   ├── provider.interface.ts
│   │   ├── provider.service.ts
│   │   ├── openai.provider.ts
│   │   ├── google.provider.ts
│   │   ├── antsk.provider.ts
│   │   └── zhipu.provider.ts
│   ├── script/          # 剧本服务
│   │   └── script-parser.service.ts
│   ├── cache/           # 缓存服务
│   │   └── cache.service.ts
│   ├── queue/           # 队列服务
│   │   └── inference-queue.service.ts
│   ├── quality/         # 质量服务
│   │   └── quality-scoring.service.ts
│   └── export.service.ts
│
├── agents/              # AI Agent
│   └── director.agent.ts
│
├── middleware/          # 中间件
│   ├── auth.middleware.ts
│   └── permission.middleware.ts
│
├── routes/              # 路由
│   ├── auth.routes.ts
│   ├── project.routes.ts
│   ├── script.routes.ts
│   ├── shot-generation.routes.ts
│   ├── video-generation.routes.ts
│   ├── novel.routes.ts
│   └── director.routes.ts
│
├── lib/                 # 工具库
│   ├── prisma.ts
│   ├── logger.ts
│   └── sentry.ts
│
└── index.ts             # 应用入口
```

### 3.2 前端应用层
```
apps/web/src/
├── pages/               # 页面
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectListPage.tsx
│   ├── ProjectPage.tsx
│   ├── ScriptEditorPage.tsx
│   ├── NovelEditorPage.tsx
│   ├── ShotListPage.tsx
│   └── VideoExportPage.tsx
│
├── components/           # 组件
│   ├── ui/             # UI组件
│   ├── Sidebar.tsx
│   ├── TopNav.tsx
│   └── NineGrid.tsx
│
├── lib/                 # 工具库
│   ├── api.ts
│   └── auth.ts
│
├── hooks/               # Hooks
│   └── useAuth.ts
│
└── App.tsx              # 应用入口
```

---

## 4. 数据流

### 4.1 用户注册登录流程
```
用户提交表单
    ↓
POST /api/auth/register
    ↓
bcrypt加密密码
    ↓
存储到PostgreSQL
    ↓
返回JWT Token
    ↓
存储到LocalStorage
    ↓
后续请求携带Token
```

### 4.2 剧本生成流程
```
用户上传剧本
    ↓
POST /api/projects/:projectId/scripts
    ↓
解析剧本
    ↓
调用AI Provider (chat)
    ↓
保存结构化数据
    ↓
返回场景列表
```

### 4.3 图像生成流程
```
用户选择镜头 + AI提供商
    ↓
POST /api/shots/:id/generate-image
    ↓
构建提示词
    ↓
调用AI Provider (createImage)
    ↓
保存图片URL
    ↓
更新Shot记录
    ↓
返回图片URL
```

### 4.4 质量评分流程
```
图像生成完成
    ↓
调用qualityScoringService.scoreImage()
    ↓
计算清晰度、构图、技术质量
    ↓
保存到QualityReport
    ↓
返回评分和建议
```

---

## 5. 服务间通信

### 5.1 同步通信
- Controller → Service：直接调用
- Service → Prisma：数据库操作
- Service → AI Provider：HTTP请求

### 5.2 异步通信
- Service → Queue：添加任务
- Queue Worker：处理任务
- Queue → Service：更新状态

### 5.3 缓存通信
- Service → Redis：读取缓存
- Service → Redis：写入缓存
- Redis：自动过期TTL

---

## 6. 扩展性设计

### 6.1 水平扩展
| 组件 | 扩展方式 |
|--------|----------|
| API | 多实例 + 负载均衡 |
| PostgreSQL | 主从复制 / 读写分离 |
| Redis | 集群模式 |
| AI Provider | 多提供商负载分配 |

### 6.2 垂直扩展
| 功能 | 扩展点 |
|--------|--------|
| 新AI提供商 | 实现AIProvider接口 |
| 新内容类型 | 添加新的ContentType |
| 新Agent | 继承Agent基类 |

---

## 7. 安全性设计

### 7.1 认证安全
- JWT Token有效期控制（7天）
- Token自动刷新机制
- 密码bcrypt加密（salt rounds: 10）

### 7.2 授权安全
- 项目成员权限检查（RBAC）
- 资源所有权验证
- 操作权限中间件

### 7.3 数据安全
- SQL注入防护（Prisma参数化查询）
- XSS防护（输入验证）
- 敏感信息加密（API Key）

### 7.4 API安全
- CORS配置
- Rate Limiting（待实现）
- HTTPS强制

---

## 附录

### A. 环境变量
| 变量 | 说明 | 默认值 |
|--------|--------|--------|
| `DATABASE_URL` | PostgreSQL连接字符串 | - |
| `REDIS_URL` | Redis连接字符串 | redis://localhost:6379 |
| `JWT_SECRET` | JWT签名密钥 | - |
| `SENTRY_DSN` | Sentry DSN | - |
| `NODE_ENV` | 运行环境 | development |

### B. 端口配置
| 服务 | 端口 |
|--------|--------|
| API | 3001 |
| Web | 3000 |
| Redis | 6379 |
| PostgreSQL | 5432 |
