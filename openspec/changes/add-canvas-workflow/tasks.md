# 实施任务清单

## 1. 侧边栏修改

- [x] 1.1 修改 Sidebar.tsx：移除 "AI 图像" 和 "AI 视频" 菜单项
- [x] 1.2 新增 "工作台" 菜单项，图标用 `dashboard` 或 `view_module`
- [x] 1.3 路由配置：工作台页面路径 `/workspace`

## 2. 数据库模型

- [x] 2.1 Prisma schema 新增 `Workspace` 模型（id, name, userId, config, createdAt, updatedAt）
- [x] 2.2 Prisma schema 新增 `CanvasNode` 模型（id, workspaceId, type, position, config, content, outputUrl, createdAt, updatedAt）
- [x] 2.3 Prisma schema 新增 `CanvasEdge` 模型（id, workspaceId, sourceNodeId, targetNodeId, createdAt）

## 3. 后端 API

- [x] 3.1 创建 Workspace Service `apps/api/src/services/workspace.service.ts`
- [x] 3.2 创建 Workspace 路由 `apps/api/src/routes/workspace.routes.ts`
- [x] 3.3 实现 CRUD API：
  - GET/POST `/api/workspace` - 获取/创建工作空间
  - GET/POST `/api/workspace/:id/nodes` - 获取/创建节点
  - GET/POST `/api/workspace/:id/edges` - 获取/创建连线
  - PATCH `/api/workspace/nodes/:nodeId` - 更新节点
  - DELETE `/api/workspace/nodes/:nodeId` - 删除节点
  - DELETE `/api/workspace/edges/:edgeId` - 删除连线

## 4. 前端 - 画布基础组件

- [x] 4.1 创建 WorkspacePage.tsx 页面
- [x] 4.2 创建 Canvas.tsx 画布组件（React Flow 或自实现）
- [x] 4.3 创建节点组件：
  - TextNode.tsx - 文字节点
  - ImageNode.tsx - 图片节点
  - VideoNode.tsx - 视频节点
- [x] 4.4 实现节点拖拽、缩放、选择

## 5. 前端 - 连线功能

- [x] 5.1 实现节点间连线（Edge）拖拽
- [x] 5.2 连线样式：Bezier 曲线，渐变色
- [x] 5.3 删除连线功能

## 6. 前端 - AI 转换节点

- [x] 6.1 实现文字→图片转换节点（TextToImageNode）
- [x] 6.2 实现图片→图片转换节点（ImageToImageNode）
- [x] 6.3 实现图片→视频转换节点（ImageToVideoNode）
- [x] 6.4 实现视频→视频转换节点（VideoToVideoNode）
- [x] 6.5 右键菜单：节点可转换为其他类型

## 7. 前端 - 素材上传

- [x] 7.1 实现拖拽上传到画布
- [x] 7.2 支持文字、图片（jpg/png/gif）、视频（mp4）格式
- [x] 7.3 上传进度显示

## 8. 前端 - 预览功能

- [x] 8.1 节点输出预览（图片/视频播放器）
- [x] 8.2 全屏预览模式

## 9. 验证

- [ ] 9.1 侧边栏菜单正确显示
- [ ] 9.2 可以创建节点、连线
- [ ] 9.3 AI 转换功能正常工作
- [ ] 9.4 数据正确保存到数据库