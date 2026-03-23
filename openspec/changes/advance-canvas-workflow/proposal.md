# Change: 进阶画布工作台功能

## Why

当前画布工作台已实现基础功能和增强功能，但仍需深化 AI 能力和用户体验优化：

1. **真实 AI 后端未对接**：AI 生成只是模拟，需要对接真实图片/视频生成服务
2. **缺少节点分组**：大型工作流难以组织和管理
3. **对齐辅助缺失**：手动对齐节点效率低
4. **模板系统缺失**：用户无法复用工作流
5. **性能优化空间**：大画布下可能存在卡顿

## What Changes

### 1. 真实 AI 后端对接
- 图片生成：对接图片生成服务
- 视频生成：对接视频生成服务
- 流式输出：SSE 实时推送生成进度

### 2. 节点分组
- 支持创建分组（分组可折叠）
- 分组内节点批量操作
- 分组颜色标识

### 3. 对齐辅助
- 节点对齐线（水平/垂直）
- 等间距分布
- 批量对齐（居左/居中/居右）

### 4. 模板系统
- 保存当前工作流为模板
- 模板列表管理
- 预设模板（文字转视频、图片批处理）

### 5. 性能优化
- 虚拟化渲染（只渲染可见节点）
- 缩略图缓存
- 防抖保存

### 6. 批量处理
- 选中多节点批量 AI 操作
- 任务队列管理
- 批量导出

## Impact

- Affected specs: `canvas-workflow-advance`(新)
- Affected code:
  - `apps/api/src/services/ai-generation.service.ts` — 新建 AI 生成服务
  - `apps/api/src/routes/ai-generation.routes.ts` — 新建 AI 路由
  - `apps/web/src/pages/WorkspacePage.tsx` — 分组、对齐、模板
  - `apps/web/src/components/workspace/NodeGroup.tsx` — 新建分组组件
  - `apps/web/src/components/workspace/TemplateManager.tsx` — 新建模板管理

## 依赖关系

```
AI 后端对接 ──→ 流式输出 ──→ 进度可视化（可并行）
分组功能 ──→ 批量操作（可并行）
对齐辅助 ──→ 模板系统（可并行）
虚拟化渲染 ──→ 性能监控（可并行）
```