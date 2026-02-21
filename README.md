# 开演AI

> 基于AI的内容创作平台，支持剧本、小说、分镜、图像生成和视频制作。

## 功能特性

- 📝 **剧本创作** - Monaco编辑器 + AI结构化解析
- 📖 **小说创作** - 章节管理 + 富文本编辑
- 👥 **角色管理** - 角色档案 + 图像上传
- 🎬 **场景管理** - 场景设置 + 参考图
- 🎥 **分镜系统** - AI自动生成 + 手动编辑
- 🎨 **图像生成** - 多AI提供商（OpenAI/Google/智普/AntSK）
- 🎬 **视频生成** - 关键帧生成视频
- 🖼️ **九宫格** - 3x3面板布局 + 拖拽排序
- 📤 **导出功能** - 项目导出（JSON）、视频导出（多格式）
- 👥 **协作功能** - 项目成员 + RBAC权限

## 技术栈

### 后端
- **Node.js** 24.12.0 + Express 4.18.0
- **PostgreSQL** 16 + Prisma ORM
- **Redis** - 缓存 + 任务队列（Bull）
- **Winston** - 结构化日志
- **Sentry** - 错误监控

### 前端
- **React** 18.3.1 + TypeScript
- **Vite** 6.2.0 - 开发服务器
- **Tailwind CSS** 4.1.18 - UI样式
- **Monaco Editor** - 代码编辑器

## 快速开始

### 环境要求

- Node.js 24+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7+

### 安装部署

```bash
# 克隆仓库
git clone https://github.com/your-org/kaiyan-tool.git
cd kaiyan-tool

# 复制环境变量
cp .env.example .env
# 编辑.env文件，设置必要的环境变量

# 启动服务（Docker）
docker-compose up -d --build

# 访问应用
# Web: http://localhost:3000
# API: http://localhost:3001
# API文档: http://localhost:3001/api-docs
```

### 本地开发

```bash
# 安装依赖
npm install

# 启动PostgreSQL + Redis
docker-compose up postgres redis

# 运行数据库迁移
cd apps/api && npx prisma migrate dev

# 启动API服务
cd apps/api && npm run dev

# 启动Web服务（新终端）
cd apps/web && npm run dev
```

## 项目结构

```
开演AI/
├── apps/
│   ├── api/              # 后端API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── agents/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── lib/
│   │   └── prisma/
│   └── web/              # 前端应用
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── lib/
│       │   └── hooks/
│       └── public/
├── docs/                 # 文档
│   ├── architecture.md   # 系统架构
│   ├── data-model.md    # 数据模型
│   └── deployment.md    # 部署指南
├── openspec/             # OpenSpec配置
└── docker-compose.yml     # Docker编排
```

## API文档

访问 [http://localhost:3001/api-docs](http://localhost:3001/api-docs) 查看完整的API文档（Swagger UI）。

## 核心API端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 项目
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PATCH /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 剧本
- `GET /api/projects/:projectId/scripts` - 获取剧本列表
- `POST /api/projects/:projectId/scripts` - 创建剧本
- `POST /api/scripts/:id/parse` - 解析剧本

### 分镜
- `GET /api/projects/:projectId/shots` - 获取镜头列表
- `POST /api/projects/:projectId/shots/generate` - AI生成分镜
- `POST /api/shots/:id/generate-image` - 生成起始/结束图像
- `PATCH /api/shots/reorder` - 重新排序镜头

### 图像生成
- `POST /api/shots/:id/generate-image` - 生成图像
- `POST /api/shots/:id/optimize-prompt` - 优化提示词

### 视频生成
- `POST /api/shots/:id/generate-video` - 生成视频
- `GET /api/shots/:id/video-status` - 获取视频状态
- `GET /api/projects/:projectId/videos` - 获取项目视频列表

### 视频导出
- `GET /api/videos/:id/export?format=mp4&resolution=1080p` - 导出视频
- `GET /api/projects/:projectId/videos/export` - 导出项目所有视频

## 开发指南

### 运行测试

```bash
# API测试
cd apps/api && npm test

# Web测试
cd apps/web && npm test
```

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 使用Prettier格式化代码

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 数据库迁移

```bash
# 创建新迁移
cd apps/api && npx prisma migrate dev --name feature_name

# 应用迁移
cd apps/api && npx prisma migrate deploy

# 重置数据库（开发环境）
cd apps/api && npx prisma migrate reset
```

## 部署

详细的部署指南请参考 [docs/deployment.md](./docs/deployment.md)。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
