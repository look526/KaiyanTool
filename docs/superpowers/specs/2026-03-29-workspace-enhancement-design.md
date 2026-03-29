# Workspace 功能增强设计方案

**版本**: 1.0
**日期**: 2026-03-29
**作者**: AI Assistant
**状态**: 待实施

---

## 1. 概述

本文档描述 Workspace 功能的完整增强方案，包括 AI 真实对接、Prompt 智能分析、用户编辑确认、工作流模板和自动化触发能力。

### 1.1 目标

- 将 Workspace 从 Mock AI 升级为真实 AI 生成对接
- 支持用户选择 AI Provider 和 Model
- 提供智能 Prompt 分析和专业 JSON Prompt 编辑
- 实现工作流模板和自动化触发能力
- 拆分前端组件以符合 UI 设计规范（单文件不超过 200 行）

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端 (React)                            │
├─────────────────────────────────────────────────────────────────┤
│  WorkspacePage (拆分后的组件群)                                   │
│  ├── CanvasToolbar      # 工具栏（缩放、导入导出等）              │
│  ├── CanvasWorkspace    # 画布核心（拖拽、缩放、网格）            │
│  ├── CanvasNode         # 节点组件（text/image/video）           │
│  ├── NodeConfigPanel    # 节点配置面板（含 JSON prompt 编辑）    │
│  ├── ContextMenu        # 右键菜单                               │
│  ├── MiniMap            # 缩略导航                               │
│  ├── AIPromptEditor     # AI prompt 编辑器（JSON 格式）          │
│  └── StatusBar          # 状态栏（快捷键提示）                   │
└─────────────────────────────────────────────────────────────────┘
                              │ API 调用
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         后端 (Express)                           │
├─────────────────────────────────────────────────────────────────┤
│  routes/workspace.routes.ts      # 工作区路由                    │
│  services/workspace.service.ts   # 现有服务（增强）              │
│  services/workspace/                                             │
│  │   ├── ai-processor.ts         # AI 处理器（新）               │
│  │   ├── prompt-builder.ts       # JSON prompt 构建器（新）     │
│  │   └── automation.ts           # 自动化服务（新）               │
│  prompts/                                                    │
│  │   └── workspace/               # 工作区专用 prompts（新）      │
│  │       ├── analyze-text.ts     # 文字分析 → JSON prompt       │
│  │       └── enhance-prompt.ts   # Prompt 增强                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Provider (providerManager)                  │
│  ├── OpenAI    ├── Zhipu    ├── Google    ├── Seedream  ...     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 方案选择

**推荐方案：混合架构（C）**

理由：
1. AI 处理逻辑独立，便于后续扩展
2. 前端组件拆分符合 UI 设计规范
3. 自动化复用现有基础设施
4. 平衡开发效率和架构清晰度

---

## 3. AI 处理流程

### 3.1 文字 → 图片/视频 流程

```
┌─────────────┐     用户右键"生成图片"      ┌──────────────────┐
│  文字节点    │ ──────────────────────────▶ │  NodeConfigPanel  │
│  content    │                              │  显示:            │
│  {text}     │                              │  1. 来源预览       │
└─────────────┘                              │  2. JSON Prompt  │
                                              │     编辑器        │
                                              │  3. Provider 选择 │
                                              │  4. 风格选择      │
                                              │  5. [生成] 按钮   │
                                              └────────┬─────────┘
                                                       │ 用户点击"生成"
                                                       ▼
                                              ┌──────────────────┐
                                              │  /workspace/ai/  │
                                              │  analyze-text    │
                                              │  API Route       │
                                              └────────┬─────────┘
                                                       │ 调用 AI
                                                       ▼
┌─────────────┐     AI 生成完成      ┌──────────────────┐
│  图片节点    │◀─────────────────── │  ai-processor.ts │
│  content    │                     │  1. 调用         │
│  {url}      │                     │     providerManager│
└─────────────┘                     │  2. 存储 Asset   │
                                     │  3. 更新节点状态 │
                                     └──────────────────┘
```

### 3.2 Provider 选择（用户可配置）

在 NodeConfigPanel 中添加 Provider 选择器：

```
┌─────────────────────────────────────────────────────────┐
│  AI 生成配置                                              │
├─────────────────────────────────────────────────────────┤
│  来源节点: [文字节点 #1]  内容预览: "一只可爱的猫..."       │
│                                                          │
│  Provider: [▼ OpenAI        ]  Model: [▼ DALL-E 3    ]  │
│                                                          │
│  风格:     [▼ 皮克斯风格    ]                           │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  JSON Prompt (可编辑)                               │ │
│  │  {                                                  │ │
│  │    "scene": "阳光明媚的草地...",                     │ │
│  │    "shot": "中景，跟随镜头",                          │ │
│  │    "subject": "一只橘色短毛猫...",                    │ │
│  │    "props": ["绿色草地", "零星野花"],                 │ │
│  │    "style": "皮克斯3D风格，色彩鲜艳"                 │ │
│  │  }                                                  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [预览效果]  [一键优化]  [开始生成]                        │
└─────────────────────────────────────────────────────────┘
```

### 3.3 JSON Prompt 结构（专业分镜格式）

根据生成类型自动选择结构复杂度。

#### 简化版（简单任务）

```json
{
  "version": 1,
  "scene": "阳光明媚的森林草地，下午，温暖欢快的氛围",
  "shot": "中景，跟随镜头",
  "subject": "一只橙色短毛猫，大眼睛，在草地上欢快地奔跑，表情开心",
  "props": ["绿色草地", "零星野花"],
  "style": "皮克斯3D风格，色彩鲜艳，温暖阳光",
  "audio": "轻快钢琴曲配鸟鸣风声"
}
```

#### 完整版（复杂任务）

```json
{
  "version": 1,
  "scene": {
    "id": "scene_001",
    "description": "阳光明媚的森林草地",
    "time": "下午",
    "location": "户外-草地",
    "atmosphere": "温暖、欢快"
  },
  "shot": {
    "type": "MEDIUM_SHOT",
    "description": "跟随猫咪的中景镜头",
    "camera_movement": "FOLLOWING"
  },
  "subjects": [
    {
      "id": "cat_001",
      "role": "MAIN",
      "type": "CHARACTER",
      "name": "小橘",
      "description": "橙色短毛猫，大眼睛，表情活泼可爱",
      "position": "画面中央偏左",
      "action": "欢快地奔跑，四肢伸展",
      "expression": "开心、兴奋"
    }
  ],
  "props": [
    { "id": "grass_001", "description": "绿色草地，有露珠", "position": "地面" },
    { "id": "flowers_001", "description": "零星野花", "position": "草地上" }
  ],
  "style": {
    "art_style": "PIXAR_3D",
    "mood": "CHEERFUL",
    "color_palette": "VIBRANT_WARM",
    "lighting": "温暖的阳光，侧逆光"
  },
  "audio": {
    "bgm": "轻快的钢琴曲",
    "sfx": ["鸟鸣", "风声", "脚步声"]
  }
}
```

---

## 4. 工作流模板与自动化

### 4.1 工作流模板系统

```
┌─────────────────────────────────────────────────────────┐
│                    模板市场                              │
├─────────────────────────────────────────────────────────┤
│  [文字生图]  [图生图]  [图生视频]  [批量生成]  [自定义]  │
└─────────────────────────────────────────────────────────┘
```

**模板类型：**

| 模板 | 描述 | 节点结构 |
|------|------|---------|
| `text-to-image` | 文字 → 图片 | Text → [AI处理] → Image |
| `image-to-image` | 图片变换 | Image → [AI处理] → Image |
| `image-to-video` | 图片 → 视频 | Image → [AI处理] → Video |
| `storyboard` | 分镜制作 | Text × N → [AI处理] × N → Images |
| `batch-generate` | 批量生成 | Text × N → [批量AI处理] → Images |

### 4.2 自动化触发机制

```
┌─────────────────────────────────────────────────────────────┐
│                      自动化触发器                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │ 定时触发  │    │  API触发  │    │  事件触发  │           │
│   │ ⏰ Cron   │    │ 🌐 HTTP  │    │ ⚡ Webhook│           │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘           │
│        │               │               │                   │
│        └───────────────┼───────────────┘                   │
│                        ▼                                    │
│              ┌──────────────────┐                          │
│              │  automation.ts   │                          │
│              │  - 触发条件检查   │                          │
│              │  - 执行工作流     │                          │
│              │  - 结果通知       │                          │
│              └────────┬─────────┘                          │
│                       ▼                                     │
│              ┌──────────────────┐                          │
│              │  执行日志 & 状态   │                          │
│              │  /workspace/      │                          │
│              │  automation/logs  │                          │
│              └──────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 前端组件拆分

### 5.1 组件目录结构

```
apps/web/src/components/workspace/
├── index.ts                      # 统一导出
├── WorkspacePage.tsx             # 主页面（精简，只做布局）
├── CanvasToolbar.tsx             # 顶部工具栏（< 150 行）
├── CanvasWorkspace.tsx           # 画布容器
├── CanvasNode.tsx                # 节点组件（text/image/video）
├── NodeConfigPanel.tsx           # 节点配置面板（增强）
├── AIPromptEditor.tsx            # AI Prompt 编辑器
├── ContextMenu.tsx               # 右键菜单
├── MiniMap.tsx                   # 缩略导航
├── StatusBar.tsx                 # 状态栏
├── SelectionBox.tsx               # 框选组件
├── ConnectionLine.tsx            # 连线组件
└── hooks/
    ├── useCanvasControls.ts       # 画布控制逻辑
    ├── useNodeDrag.ts            # 节点拖拽
    └── useAutoSave.ts            # 自动保存
```

### 5.2 状态管理

```typescript
// 使用 Zustand 管理 workspace 状态
interface WorkspaceState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodes: string[];
  canvasOffset: { x: number; y: number };
  zoom: number;
}

// 自动保存 hook
function useAutoSave(workspaceId: string, nodes: CanvasNode[], edges: CanvasEdge[]) {
  // debounce 500ms 自动保存
  // 显示保存状态指示器
}
```

---

## 6. API 接口设计

### 6.1 新增 API 路由

```
routes/
├── workspace.routes.ts           # 现有
└── workspace/
    ├── ai.routes.ts             # AI 处理相关 [新]
    │   ├── POST /analyze-text    # 分析文字 → JSON prompt
    │   ├── POST /generate        # 执行生成
    │   └── GET  /providers       # 获取可用 Provider
    ├── template.routes.ts        # 模板相关 [新]
    │   ├── GET  /templates       # 获取模板列表
    │   └── POST /from-template    # 从模板创建
    └── automation.routes.ts       # 自动化相关 [新]
        ├── POST /trigger         # 触发执行
        ├── GET  /logs            # 执行日志
        └── POST /schedule        # 设置定时任务
```

### 6.2 核心 API 详细设计

#### `POST /workspace/ai/analyze-text`

**请求：**
```json
{
  "text": "一只可爱的橘猫在草地上欢快地奔跑",
  "source_node_id": "node_xxx",
  "style_hint": "皮克斯风格"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "prompt_json": {
      "version": 1,
      "scene": "阳光明媚的草地，下午，温暖欢快",
      "shot": "中景，跟随镜头",
      "subject": "一只橘色短毛猫，大眼睛，表情活泼可爱，在草地上欢快地奔跑",
      "props": ["绿色草地", "零星野花"],
      "style": "皮克斯3D风格，色彩鲜艳",
      "audio": "轻快钢琴曲"
    },
    "confidence": 0.92
  }
}
```

#### `POST /workspace/ai/generate`

**请求：**
```json
{
  "source_node_id": "node_xxx",
  "target_type": "image",
  "provider_id": "zhipu",
  "model": "cogview-3",
  "prompt_json": { ... },
  "style": "cinematic"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "task_id": "task_xxx",
    "status": "processing",
    "progress": 0
  }
}
```

#### `POST /workspace/automation/trigger`

**请求：**
```json
{
  "workflow_id": "wf_xxx",
  "trigger_type": "api",
  "params": {
    "source_node_id": "node_xxx",
    "target_type": "image"
  }
}
```

### 6.3 错误处理

```typescript
// 统一错误格式
{
  "success": false,
  "error": {
    "code": "AI_PROVIDER_ERROR",
    "message": "AI 服务暂时不可用，请稍后重试",
    "details": { "provider": "openai", "retry_after": 30 }
  }
}
```

---

## 7. 文件清单

### 7.1 新建文件

**后端：**
- `apps/api/src/services/workspace/ai-processor.ts`
- `apps/api/src/services/workspace/prompt-builder.ts`
- `apps/api/src/services/workspace/automation.ts`
- `apps/api/src/routes/workspace/ai.routes.ts`
- `apps/api/src/routes/workspace/template.routes.ts`
- `apps/api/src/routes/workspace/automation.routes.ts`
- `apps/api/src/prompts/workspace/analyze-text.ts`
- `apps/api/src/prompts/workspace/enhance-prompt.ts`

**前端：**
- `apps/web/src/components/workspace/CanvasToolbar.tsx`
- `apps/web/src/components/workspace/CanvasWorkspace.tsx`
- `apps/web/src/components/workspace/CanvasNode.tsx`
- `apps/web/src/components/workspace/AIPromptEditor.tsx`
- `apps/web/src/components/workspace/ContextMenu.tsx`
- `apps/web/src/components/workspace/StatusBar.tsx`
- `apps/web/src/components/workspace/SelectionBox.tsx`
- `apps/web/src/components/workspace/ConnectionLine.tsx`
- `apps/web/src/components/workspace/hooks/useCanvasControls.ts`
- `apps/web/src/components/workspace/hooks/useNodeDrag.ts`
- `apps/web/src/components/workspace/hooks/useAutoSave.ts`
- `apps/web/src/types/workspace.ts`

### 7.2 修改文件

**后端：**
- `apps/api/src/routes/workspace.routes.ts` - 增强现有路由
- `apps/api/src/services/workspace.service.ts` - 增强现有服务

**前端：**
- `apps/web/src/pages/WorkspacePage.tsx` - 拆分为小组件
- `apps/web/src/components/workspace/NodeConfigPanel.tsx` - 增强 AI 配置
- `apps/web/src/components/workspace/MiniMap.tsx` - 适配新结构

---

## 8. 实施顺序

### Phase 1: 基础增强
1. 拆分 WorkspacePage 为小组件
2. 实现自动保存功能
3. 增强节点内联编辑

### Phase 2: AI 对接
4. 创建 AI 处理器服务
5. 创建 Prompt 构建器
6. 对接 Provider Manager
7. 实现文字 → JSON Prompt 分析

### Phase 3: UI 增强
8. 实现 AIPromptEditor 组件
9. 实现 Provider 选择器
10. 实现一键优化功能

### Phase 4: 自动化
11. 实现模板系统
12. 实现自动化触发
13. 实现定时任务

---

## 9. 验收标准

- [ ] WorkspacePage 及其子组件每个文件不超过 200 行
- [ ] AI 生成真实对接 providerManager
- [ ] 用户可选择 AI Provider 和 Model
- [ ] JSON Prompt 支持用户编辑
- [ ] 自动保存功能正常（debounce 500ms）
- [ ] 节点支持内联编辑
- [ ] 工作流模板可正常创建和应用
- [ ] 自动化触发可正常工作
- [ ] 无 TypeScript 编译错误
- [ ] 符合 Glassmorphism UI 规范
