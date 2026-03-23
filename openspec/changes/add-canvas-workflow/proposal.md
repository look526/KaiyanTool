# Change: 添加画布工作台 - 节点式 AI 创作画布

## Why

当前平台侧边栏包含独立的"AI 图像"和"AI 视频"两个入口，功能分散。用户无法将文字、图片、视频串联成一个完整的工作流进行创作。

需要提供一个统一的**画布工作台**，用户可以在画布上上传文字、图片、视频素材，通过节点连线的方式，将素材串联成处理流程，每个节点支持 AI 转换操作（文字→图片、图片→图片、图片→视频、视频→视频）。

## What Changes

### 侧边栏合并

- 移除独立的"AI 图像"菜单项 (`/image-generation`)
- 移除独立的"AI 视频"菜单项 (`/video-generation`)
- 新增统一的"工作台"菜单项 (`/workspace`)

### 画布工作台功能

| 模块 | 功能描述 |
|------|----------|
| **画布** | 无限画布，支持拖拽、缩放、网格背景 |
| **节点类型** | 文字节点、图片节点、视频节点 |
| **节点操作** | 文字→图片、图片→图片、图片→视频、视频→视频 |
| **连线** | 节点间可拖拽连线表示数据流向 |
| **预览** | 节点输出实时预览 |

### 数据模型

- 新增 `Workspace` 模型（画布配置）
- 新增 `CanvasNode` 模型（节点：类型、位置、配置）
- 新增 `CanvasEdge` 模型（连线：源节点、目标节点）

### API

- RESTful API: `/api/workspace`, `/api/workspace/nodes`, `/api/workspace/edges`
- WebSocket: 实时同步多人编辑

## Impact

- Affected specs: `canvas-workflow`(新)
- Affected code:
  - `apps/web/src/components/layout/Sidebar.tsx` — 菜单合并
  - `apps/web/src/pages/WorkspacePage.tsx` — 新建画布页面
  - `apps/web/src/components/workspace/` — 节点、连线、画布组件
  - `apps/api/prisma/schema.prisma` — 新增 3 个模型
  - `apps/api/src/routes/workspace.routes.ts` — 新建
  - `apps/api/src/services/workspace.service.ts` — 新建

## 依赖关系

```
画布基础（节点渲染、拖拽） ──→ 连线功能（Edge） ──→ AI 转换节点 ──→ 预览输出
侧边栏修改 ──→ 路由配置 ──→ 页面创建（可并行）
数据库模型 ──→ API（可并行）──→ 前端集成
```