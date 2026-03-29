# Workspace 功能增强实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Workspace 从 Mock AI 升级为真实 AI 生成对接，支持用户选择 Provider、JSON Prompt 编辑、工作流模板和自动化触发

**Architecture:** 混合架构 - AI 处理器独立（`workspace/ai-processor.ts`），其余复用现有服务；前端拆分 WorkspacePage 为多个可复用组件

**Tech Stack:** React 19, TypeScript, Express, Prisma, Zustand, providerManager

---

## 文件结构

```
后端新增:
├── apps/api/src/services/workspace/
│   ├── ai-processor.ts         # AI 处理器
│   ├── prompt-builder.ts       # JSON prompt 构建器
│   └── automation.ts           # 自动化服务
├── apps/api/src/routes/workspace/
│   ├── ai.routes.ts           # AI 处理路由
│   ├── template.routes.ts     # 模板路由
│   └── automation.routes.ts   # 自动化路由
└── apps/api/src/prompts/workspace/
    ├── analyze-text.ts        # 文字分析 prompt
    └── enhance-prompt.ts      # Prompt 增强

前端新增:
├── apps/web/src/components/workspace/
│   ├── CanvasToolbar.tsx      # 工具栏
│   ├── CanvasWorkspace.tsx    # 画布容器
│   ├── CanvasNode.tsx         # 节点组件
│   ├── AIPromptEditor.tsx     # AI Prompt 编辑器
│   ├── ContextMenu.tsx        # 右键菜单
│   ├── StatusBar.tsx          # 状态栏
│   ├── SelectionBox.tsx        # 框选组件
│   ├── ConnectionLine.tsx      # 连线组件
│   └── hooks/
│       ├── useCanvasControls.ts
│       ├── useNodeDrag.ts
│       └── useAutoSave.ts
└── apps/web/src/types/workspace.ts

前端修改:
├── apps/web/src/pages/WorkspacePage.tsx  # 拆分为小组件
├── apps/web/src/components/workspace/NodeConfigPanel.tsx  # 增强
└── apps/web/src/components/workspace/MiniMap.tsx  # 适配
```

---

## Phase 1: 基础增强

### Task 1: 提取 Zustand Store

**Files:**
- Create: `apps/web/src/store/workspace-store.ts`
- Modify: `apps/web/src/pages/WorkspacePage.tsx`
- Test: N/A (手动测试)

- [ ] **Step 1: 创建 workspace store**

```typescript
// apps/web/src/store/workspace-store.ts
import { create } from 'zustand';

interface CanvasNode {
  id: string;
  type: 'text' | 'image' | 'video';
  position_x: number;
  position_y: number;
  content: { text?: string; url?: string; file?: File };
  output_url?: string;
  is_starred?: boolean;
  labels?: string[];
  config?: Record<string, any>;
  is_generating?: boolean;
  generation_progress?: number;
}

interface CanvasEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
}

interface WorkspaceState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodes: string[];
  selectedNode: CanvasNode | null;
  canvasOffset: { x: number; y: number };
  zoom: number;
  workspaceId: string | null;
  isSaving: boolean;
  lastSavedAt: Date | null;

  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, data: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  setSelectedNodes: (ids: string[]) => void;
  setSelectedNode: (node: CanvasNode | null) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setWorkspaceId: (id: string) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedNode: null,
  canvasOffset: { x: 0, y: 0 },
  zoom: 1,
  workspaceId: null,
  isSaving: false,
  lastSavedAt: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, ...data } : n)
  })),
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    edges: state.edges.filter(e => e.source_node_id !== id && e.target_node_id !== id)
  })),
  setSelectedNodes: (ids) => set({ selectedNodes: ids }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setCanvasOffset: (offset) => set({ canvasOffset: offset }),
  setZoom: (zoom) => set({ zoom }),
  setWorkspaceId: (id) => set({ workspaceId: id }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
}));
```

- [ ] **Step 2: 创建 hooks 目录和导出文件**

```typescript
// apps/web/src/components/workspace/hooks/index.ts
export { useCanvasControls } from './useCanvasControls';
export { useNodeDrag } from './useNodeDrag';
export { useAutoSave } from './useAutoSave';
```

- [ ] **Step 3: 创建 useAutoSave hook**

```typescript
// apps/web/src/components/workspace/hooks/useAutoSave.ts
import { useEffect, useRef, useCallback } from 'react';
import { useWorkspaceStore } from '../../../store/workspace-store';
import { apiClient } from '../../../lib/api';

export function useAutoSave() {
  const { workspaceId, nodes, edges, setIsSaving, setLastSavedAt } = useWorkspaceStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async () => {
    if (!workspaceId) return;
    setIsSaving(true);
    try {
      await apiClient.patch(`/workspace/${workspaceId}`, {
        snapshot: JSON.stringify({ nodes, edges }),
      });
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [workspaceId, nodes, edges, setIsSaving, setLastSavedAt]);

  useEffect(() => {
    if (!workspaceId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, workspaceId, save]);

  return { save };
}
```

- [ ] **Step 4: 创建 useCanvasControls hook**

```typescript
// apps/web/src/components/workspace/hooks/useCanvasControls.ts
import { useState, useCallback, useRef } from 'react';
import { useWorkspaceStore } from '../../../store/workspace-store';

export function useCanvasControls() {
  const { canvasOffset, zoom, setCanvasOffset, setZoom } = useWorkspaceStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    dragStartRef.current = { x: clientX, y: clientY, offsetX: canvasOffset.x, offsetY: canvasOffset.y };
  }, [canvasOffset]);

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    setCanvasOffset({
      x: dragStartRef.current.offsetX + dx,
      y: dragStartRef.current.offsetY + dy,
    });
  }, [isDragging, setCanvasOffset]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(Math.min(zoom + 0.1, 2));
  }, [zoom, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  }, [zoom, setZoom]);

  const resetView = useCallback(() => {
    setCanvasOffset({ x: 0, y: 0 });
    setZoom(1);
  }, [setCanvasOffset, setZoom]);

  return {
    isDragging,
    startDrag,
    updateDrag,
    endDrag,
    zoomIn,
    zoomOut,
    resetView,
  };
}
```

- [ ] **Step 5: 创建 useNodeDrag hook**

```typescript
// apps/web/src/components/workspace/hooks/useNodeDrag.ts
import { useCallback, useRef } from 'react';
import { useWorkspaceStore } from '../../../store/workspace-store';

export function useNodeDrag() {
  const { nodes, selectedNodes, zoom, updateNode, setNodes } = useWorkspaceStore();
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    startPositions: Map<string, { x: number; y: number }>;
  } | null>(null);

  const startDrag = useCallback((nodeId: string, clientX: number, clientY: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const startPositions = new Map<string, { x: number; y: number }>();
    if (selectedNodes.includes(nodeId) && selectedNodes.length > 1) {
      selectedNodes.forEach(id => {
        const n = nodes.find(n => n.id === id);
        if (n) startPositions.set(id, { x: n.position_x, y: n.position_y });
      });
    } else {
      startPositions.set(nodeId, { x: node.position_x, y: node.position_y });
    }

    dragStateRef.current = { startX: clientX, startY: clientY, startPositions };
  }, [nodes, selectedNodes]);

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragStateRef.current) return;

    const { startX, startY, startPositions } = dragStateRef.current;
    const dx = (clientX - startX) / zoom;
    const dy = (clientY - startY) / zoom;

    setNodes(nodes.map(n => {
      const startPos = startPositions.get(n.id);
      if (startPos) {
        return { ...n, position_x: startPos.x + dx, position_y: startPos.y + dy };
      }
      return n;
    }));
  }, [zoom, setNodes, nodes]);

  const endDrag = useCallback(() => {
    if (!dragStateRef.current) return;

    const { startPositions } = dragStateRef.current;
    startPositions.forEach((pos, nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        updateNode(nodeId, { position_x: node.position_x, position_y: node.position_y });
      }
    });

    dragStateRef.current = null;
  }, [nodes, updateNode]);

  return { startDrag, updateDrag, endDrag };
}
```

- [ ] **Step 6: 创建组件类型文件**

```typescript
// apps/web/src/types/workspace.ts
export interface CanvasNode {
  id: string;
  type: 'text' | 'image' | 'video';
  position_x: number;
  position_y: number;
  content: { text?: string; url?: string; file?: File };
  output_url?: string;
  is_starred?: boolean;
  labels?: string[];
  history?: NodeHistoryEntry[];
  config?: Record<string, any>;
  is_generating?: boolean;
  generation_progress?: number;
}

export interface CanvasEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
}

export interface NodeHistoryEntry {
  content: any;
  output_url?: string;
  timestamp: Date;
}

export interface WorkspacePromptJson {
  version: number;
  scene?: string | SceneObject;
  shot?: string | ShotObject;
  subject?: string | SubjectObject;
  props?: string[] | PropObject[];
  style?: string | StyleObject;
  audio?: string | AudioObject;
  extra?: Record<string, any>;
}

export interface SceneObject {
  id?: string;
  description?: string;
  time?: string;
  location?: string;
  atmosphere?: string;
}

export interface ShotObject {
  type?: string;
  description?: string;
  camera_movement?: string;
}

export interface SubjectObject {
  id?: string;
  role?: string;
  type?: string;
  name?: string;
  description?: string;
  position?: string;
  action?: string;
  expression?: string;
}

export interface PropObject {
  id?: string;
  description?: string;
  position?: string;
}

export interface StyleObject {
  art_style?: string;
  mood?: string;
  color_palette?: string;
  lighting?: string;
}

export interface AudioObject {
  bgm?: string;
  sfx?: string[];
}
```

- [ ] **Step 7: 提交 Phase 1 基础代码**

```bash
git add apps/web/src/store/workspace-store.ts
git add apps/web/src/components/workspace/hooks/
git add apps/web/src/types/workspace.ts
git commit -m "feat(workspace): add Zustand store and hooks for state management"
```

---

### Task 2: 拆分 WorkspacePage 为小组件

**Files:**
- Create: `apps/web/src/components/workspace/CanvasToolbar.tsx`
- Create: `apps/web/src/components/workspace/CanvasWorkspace.tsx`
- Create: `apps/web/src/components/workspace/StatusBar.tsx`
- Create: `apps/web/src/components/workspace/SelectionBox.tsx`
- Create: `apps/web/src/components/workspace/ConnectionLine.tsx`
- Modify: `apps/web/src/pages/WorkspacePage.tsx`
- Test: N/A (手动测试)

- [ ] **Step 1: 创建 CanvasToolbar 组件**

```typescript
// apps/web/src/components/workspace/CanvasToolbar.tsx
import { useTheme } from '../../contexts/ThemeContext';
import { Undo2, Redo2, Download, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspace-store';
import { useHistory } from '../../hooks/useHistory';

const accentColor = '#8b5cf6';

interface CanvasToolbarProps {
  onExport: () => void;
  onImport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function CanvasToolbar({ onExport, onImport, onZoomIn, onZoomOut }: CanvasToolbarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { zoom, isSaving, lastSavedAt } = useWorkspaceStore();
  const history = useHistory({ nodes: [], edges: [] });

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
  };

  return (
    <header style={{
      height: '64px',
      background: colors.bgPrimary,
      backdropFilter: 'blur(40px)',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
    }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
        工作台
      </h1>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => history.undo()}
          disabled={!history.canUndo()}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: history.canUndo() ? 'pointer' : 'not-allowed',
            opacity: history.canUndo() ? 1 : 0.5,
          }}
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={() => history.redo()}
          disabled={!history.canRedo()}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: history.canRedo() ? 'pointer' : 'not-allowed',
            opacity: history.canRedo() ? 1 : 0.5,
          }}
        >
          <Redo2 size={18} />
        </button>

        <button
          onClick={onExport}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={16} /> 导出
        </button>

        <button
          onClick={onImport}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Upload size={16} /> 导入
        </button>

        <button
          onClick={onZoomOut}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          <ZoomOut size={18} />
        </button>

        <span style={{ fontSize: '13px', color: colors.textSecondary, minWidth: '50px', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          style={{
            padding: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgGlass,
            color: colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          <ZoomIn size={18} />
        </button>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.textSecondary }}>
        {isSaving ? (
          <span style={{ color: accentColor }}>保存中...</span>
        ) : lastSavedAt ? (
          <span>已保存 {lastSavedAt.toLocaleTimeString()}</span>
        ) : null}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 创建 StatusBar 组件**

```typescript
// apps/web/src/components/workspace/StatusBar.tsx
import { useTheme } from '../../contexts/ThemeContext';

export function StatusBar() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.06)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(0, 0, 0, 0.06)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
  };

  return (
    <div style={{
      position: 'fixed',
      left: '280px',
      bottom: '24px',
      padding: '12px 20px',
      borderRadius: '12px',
      background: colors.bgPrimary,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontSize: '13px',
      color: colors.textMuted,
    }}>
      <span>Space+拖拽平移</span>
      <span>•</span>
      <span>双击画布添加文字</span>
      <span>•</span>
      <span>双击节点连线</span>
    </div>
  );
}
```

- [ ] **Step 3: 创建 SelectionBox 组件**

```typescript
// apps/web/src/components/workspace/SelectionBox.tsx
const accentColor = '#8b5cf6';

interface SelectionBoxProps {
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
}

export function SelectionBox({ selectionBox }: SelectionBoxProps) {
  if (!selectionBox) return null;

  return (
    <div style={{
      position: 'absolute',
      left: Math.min(selectionBox.startX, selectionBox.endX),
      top: Math.min(selectionBox.startY, selectionBox.endY),
      width: Math.abs(selectionBox.endX - selectionBox.startX),
      height: Math.abs(selectionBox.endY - selectionBox.startY),
      background: `${accentColor}20`,
      border: `1px solid ${accentColor}`,
      borderRadius: '8px',
      pointerEvents: 'none',
    }} />
  );
}
```

- [ ] **Step 4: 创建 ConnectionLine 组件**

```typescript
// apps/web/src/components/workspace/ConnectionLine.tsx
import { CanvasNode, CanvasEdge } from '../../types/workspace';

const accentColor = '#8b5cf6';

interface ConnectionLineProps {
  edges: CanvasEdge[];
  nodes: CanvasNode[];
  onDeleteEdge: (edgeId: string) => void;
}

export function ConnectionLine({ edges, nodes, onDeleteEdge }: ConnectionLineProps) {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </linearGradient>
      </defs>
      {edges.map(edge => {
        const source = nodes.find(n => n.id === edge.source_node_id);
        const target = nodes.find(n => n.id === edge.target_node_id);
        if (!source || !target) return null;

        const x1 = source.position_x + 120;
        const y1 = source.position_y + 50;
        const x2 = target.position_x;
        const y2 = target.position_y + 50;
        const midX = (x1 + x2) / 2;

        return (
          <g key={edge.id} onClick={() => onDeleteEdge(edge.id)} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
            <path
              d={`M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="url(#edgeGradient)"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 5: 精简 WorkspacePage**

```typescript
// apps/web/src/pages/WorkspacePage.tsx (精简版)
import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image, Video, Type, Sparkles, Trash2, Play, X, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useWorkspaceStore } from '../store/workspace-store';
import { useAutoSave } from '../components/workspace/hooks/useAutoSave';
import { useCanvasControls } from '../components/workspace/hooks/useCanvasControls';
import { CanvasToolbar } from '../components/workspace/CanvasToolbar';
import { CanvasWorkspace } from '../components/workspace/CanvasWorkspace';
import { NodeConfigPanel } from '../components/workspace/NodeConfigPanel';
import { MiniMap } from '../components/workspace/MiniMap';
import { StatusBar } from '../components/workspace/StatusBar';

const accentColor = '#8b5cf6';

export default function WorkspacePage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const canvasRef = useRef<HTMLDivElement>(null);

  const {
    nodes, setNodes, edges, setEdges,
    selectedNode, setSelectedNode,
    selectedNodes, setSelectedNodes,
    workspaceId, setWorkspaceId,
    canvasOffset, zoom,
  } = useWorkspaceStore();

  const { saveToHistory } = useHistory();
  const { zoomIn, zoomOut } = useCanvasControls();
  useAutoSave();

  // ... 精简后的事件处理逻辑
  // ... 保留原有核心功能，移除 UI 组件代码

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <CanvasToolbar
        onExport={handleExport}
        onImport={handleImport}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      <CanvasWorkspace
        ref={canvasRef}
        nodes={nodes}
        edges={edges}
        selectedNode={selectedNode}
        selectedNodes={selectedNodes}
        canvasOffset={canvasOffset}
        zoom={zoom}
        onNodeSelect={setSelectedNode}
        onNodesUpdate={setNodes}
      />

      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={updateNode}
          onStar={handleStar}
          onGenerate={handleGenerate}
          isDark={isDark}
        />
      )}

      <MiniMap nodes={nodes} canvasOffset={canvasOffset} zoom={zoom} isDark={isDark} />
      <StatusBar />
    </div>
  );
}
```

- [ ] **Step 6: 提交拆分代码**

```bash
git add apps/web/src/components/workspace/CanvasToolbar.tsx
git add apps/web/src/components/workspace/StatusBar.tsx
git add apps/web/src/components/workspace/SelectionBox.tsx
git add apps/web/src/components/workspace/ConnectionLine.tsx
git add apps/web/src/pages/WorkspacePage.tsx
git commit -m "feat(workspace): split WorkspacePage into modular components"
```

---

### Task 3: 实现节点内联编辑

**Files:**
- Modify: `apps/web/src/components/workspace/CanvasNode.tsx`
- Test: N/A (手动测试)

- [ ] **Step 1: 创建 CanvasNode 组件（支持内联编辑）**

```typescript
// apps/web/src/components/workspace/CanvasNode.tsx
import { useState, useRef, useEffect } from 'react';
import { Type, Image as ImageIcon, Video, Star } from 'lucide-react';
import { CanvasNode as CanvasNodeType } from '../../types/workspace';

const accentColor = '#8b5cf6';

const labelColors: Record<string, string> = {
  red: '#ef4444', yellow: '#f59e0b', green: '#10b981', blue: '#3b82f6', purple: '#8b5cf6'
};

interface CanvasNodeProps {
  node: CanvasNodeType;
  isSelected: boolean;
  isMultiSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onTextChange?: (text: string) => void;
  isDark: boolean;
}

export function CanvasNode({
  node,
  isSelected,
  isMultiSelected,
  zoom,
  onSelect,
  onDragStart,
  onDoubleClick,
  onContextMenu,
  onTextChange,
  isDark,
}: CanvasNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.content.text || '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={20} />;
      case 'image': return <ImageIcon size={20} />;
      case 'video': return <Video size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'text': return '#8b5cf6';
      case 'image': return '#10b981';
      case 'video': return '#f59e0b';
      default: return accentColor;
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClickForEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'text') {
      setIsEditing(true);
      setEditText(node.content.text || '');
    } else {
      onDoubleClick();
    }
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    if (onTextChange && editText !== node.content.text) {
      onTextChange(editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditComplete();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(node.content.text || '');
    }
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onContextMenu={onContextMenu}
      onMouseDown={onDragStart}
      onDoubleClick={handleDoubleClickForEdit}
      style={{
        position: 'absolute',
        left: node.position_x,
        top: node.position_y,
        width: '240px',
        borderRadius: '16px',
        background: colors.bgPrimary,
        backdropFilter: 'blur(20px)',
        border: isSelected || isMultiSelected ? `2px solid ${accentColor}` : `1px solid ${colors.border}`,
        boxShadow: isSelected || isMultiSelected
          ? `0 0 30px ${accentColor}30, 0 20px 40px rgba(0,0,0,0.15)`
          : `0 8px 24px rgba(0,0,0,0.1)`,
        cursor: 'move',
        userSelect: 'none',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
    >
      {node.is_starred && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Star size={12} fill="white" color="white" />
        </div>
      )}

      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: `${getNodeColor(node.type)}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getNodeColor(node.type),
        }}>
          {getNodeIcon(node.type)}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
          {node.type === 'text' ? '文字' : node.type === 'image' ? '图片' : '视频'}
        </span>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {node.type === 'text' && (
          isEditing ? (
            <textarea
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                minHeight: '80px',
                background: 'transparent',
                border: `1px solid ${accentColor}`,
                borderRadius: '8px',
                padding: '8px',
                color: colors.textPrimary,
                fontSize: '13px',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
              }}
            />
          ) : (
            <div style={{
              fontSize: '13px',
              color: colors.textSecondary,
              lineHeight: 1.5,
              maxHeight: '80px',
              overflow: 'hidden',
              cursor: 'text',
            }}>
              {node.content.text || '双击编辑文字'}
            </div>
          )
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交内联编辑代码**

```bash
git add apps/web/src/components/workspace/CanvasNode.tsx
git commit -m "feat(workspace): add inline text editing for text nodes"
```

---

## Phase 2: AI 对接

### Task 4: 创建 AI 处理器服务

**Files:**
- Create: `apps/api/src/services/workspace/ai-processor.ts`
- Create: `apps/api/src/services/workspace/prompt-builder.ts`
- Create: `apps/api/src/routes/workspace/ai.routes.ts`
- Test: N/A (手动测试)

- [ ] **Step 1: 创建 prompt-builder.ts**

```typescript
// apps/api/src/services/workspace/prompt-builder.ts
import { WorkspacePromptJson } from '../../types/workspace';

export function buildPromptFromJson(promptJson: WorkspacePromptJson): string {
  const parts: string[] = [];

  if (typeof promptJson.scene === 'string') {
    parts.push(`场景: ${promptJson.scene}`);
  } else if (promptJson.scene?.description) {
    parts.push(`场景: ${promptJson.scene.description}`);
    if (promptJson.scene.time) parts.push(`时间: ${promptJson.scene.time}`);
    if (promptJson.scene.atmosphere) parts.push(`氛围: ${promptJson.scene.atmosphere}`);
  }

  if (typeof promptJson.shot === 'string') {
    parts.push(`镜头: ${promptJson.shot}`);
  } else if (promptJson.shot?.description) {
    parts.push(`镜头: ${promptJson.shot.description}`);
    if (promptJson.shot.camera_movement) parts.push(`镜头运动: ${promptJson.shot.camera_movement}`);
  }

  if (typeof promptJson.subject === 'string') {
    parts.push(`主体: ${promptJson.subject}`);
  } else if (promptJson.subject?.description) {
    parts.push(`主体: ${promptJson.subject.description}`);
    if (promptJson.subject.action) parts.push(`动作: ${promptJson.subject.action}`);
    if (promptJson.subject.expression) parts.push(`表情: ${promptJson.subject.expression}`);
  }

  if (Array.isArray(promptJson.props)) {
    const propsStr = promptJson.props.map(p =>
      typeof p === 'string' ? p : p.description
    ).join(', ');
    if (propsStr) parts.push(`道具: ${propsStr}`);
  }

  if (typeof promptJson.style === 'string') {
    parts.push(`风格: ${promptJson.style}`);
  } else if (promptJson.style?.art_style) {
    parts.push(`艺术风格: ${promptJson.style.art_style}`);
    if (promptJson.style.mood) parts.push(`情绪: ${promptJson.style.mood}`);
    if (promptJson.style.color_palette) parts.push(`色彩: ${promptJson.style.color_palette}`);
  }

  if (typeof promptJson.audio === 'string') {
    parts.push(`音频: ${promptJson.audio}`);
  } else if (promptJson.audio?.bgm) {
    parts.push(`背景音乐: ${promptJson.audio.bgm}`);
    if (promptJson.audio.sfx?.length) {
      parts.push(`音效: ${promptJson.audio.sfx.join(', ')}`);
    }
  }

  return parts.join('，') + '。';
}

export function isSimplePrompt(promptJson: WorkspacePromptJson): boolean {
  return (
    typeof promptJson.scene === 'string' &&
    typeof promptJson.shot === 'string' &&
    typeof promptJson.subject === 'string' &&
    (!promptJson.props || typeof promptJson.props[0] === 'string') &&
    typeof promptJson.style === 'string'
  );
}
```

- [ ] **Step 2: 创建 ai-processor.ts**

```typescript
// apps/api/src/services/workspace/ai-processor.ts
import { prisma } from '../../lib/prisma';
import { providerManager } from '../ai/provider.manager';
import { buildPromptFromJson, isSimplePrompt } from './prompt-builder';
import { WorkspacePromptJson } from '../../types/workspace';

export interface AnalyzeTextResult {
  prompt_json: WorkspacePromptJson;
  confidence: number;
}

export async function analyzeTextToPrompt(
  text: string,
  styleHint?: string
): Promise<AnalyzeTextResult> {
  const systemPrompt = `你是一个专业的分镜生成AI。请将用户提供的文字描述转换为专业的JSON分镜格式。

输出格式（简化版）：
{
  "version": 1,
  "scene": "场景描述",
  "shot": "镜头描述",
  "subject": "主体描述",
  "props": ["道具1", "道具2"],
  "style": "风格描述",
  "audio": "音频描述（可选）"
}

请直接输出JSON，不要有其他内容。`;

  const provider = providerManager.getProvider('zhipu');
  if (!provider) {
    throw new Error('No AI provider available');
  }

  const response = await provider.chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `描述: ${text}\n风格提示: ${styleHint || '默认风格'}` }
  ], { model: 'glm-4' });

  const content = response.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      prompt_json: {
        version: 1,
        scene: text,
        shot: '中景',
        subject: '',
        props: [],
        style: styleHint || '默认风格',
      },
      confidence: 0.5,
    };
  }

  try {
    const promptJson = JSON.parse(jsonMatch[0]) as WorkspacePromptJson;
    return {
      prompt_json: { ...promptJson, version: 1 },
      confidence: 0.85,
    };
  } catch {
    return {
      prompt_json: {
        version: 1,
        scene: text,
        shot: '中景',
        subject: '',
        props: [],
        style: styleHint || '默认风格',
      },
      confidence: 0.5,
    };
  }
}

export async function generateFromPrompt(
  sourceNodeId: string,
  targetType: 'image' | 'video',
  providerId: string,
  model: string,
  promptJson: WorkspacePromptJson,
  style?: string
): Promise<{ taskId: string; status: string }> {
  const sourceNode = await prisma.canvasNode.findUnique({
    where: { id: sourceNodeId },
  });

  if (!sourceNode) {
    throw new Error('Source node not found');
  }

  const isSimple = isSimplePrompt(promptJson);
  const finalPrompt = isSimple
    ? buildPromptFromJson(promptJson)
    : JSON.stringify(promptJson);

  const task = await prisma.renderTask.create({
    data: {
      id: crypto.randomUUID(),
      type: targetType,
      status: 'processing',
      progress: 0,
      params: {
        prompt: finalPrompt,
        promptJson,
        providerId,
        model,
        style,
        sourceNodeId,
      },
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  try {
    providerManager.addProvider({
      id: providerId,
      name: providerId,
      type: providerId,
      apiKey: '',
    });

    const provider = providerManager.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    if (targetType === 'image') {
      const result = await provider.createImage({
        prompt: finalPrompt,
        size: '1:1',
        resolution: '2K',
        n: 1,
      });

      await prisma.renderTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          progress: 100,
          params: { ...task.params, resultUrl: result.url },
        },
      });

      await prisma.canvasNode.update({
        where: { id: sourceNodeId },
        data: {
          output_url: result.url,
          updated_at: new Date(),
        },
      });
    }

    return { taskId: task.id, status: 'completed' };
  } catch (error) {
    await prisma.renderTask.update({
      where: { id: task.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  }
}

export async function getAvailableProviders() {
  const providers = await prisma.aIProvider.findMany({
    where: { enabled: true },
    include: { models: true },
  });

  return providers.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    models: p.AIProviderModel?.map(m => ({
      id: m.id,
      name: m.name,
    })) || [],
  }));
}
```

- [ ] **Step 3: 创建 ai.routes.ts**

```typescript
// apps/api/src/routes/workspace/ai.routes.ts
import { Router } from 'express';
import { analyzeTextToPrompt, generateFromPrompt, getAvailableProviders } from '../../services/workspace/ai-processor';

const router = Router();

router.get('/providers', async (req, res) => {
  try {
    const providers = await getAvailableProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    console.error('Failed to get providers:', error);
    res.status(500).json({
      success: false,
      error: { code: 'PROVIDER_ERROR', message: 'Failed to get providers' },
    });
  }
});

router.post('/analyze-text', async (req, res) => {
  try {
    const { text, source_node_id, style_hint } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Text is required' },
      });
    }

    const result = await analyzeTextToPrompt(text, style_hint);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to analyze text:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ANALYZE_ERROR', message: 'Failed to analyze text' },
    });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { source_node_id, target_type, provider_id, model, prompt_json, style } = req.body;

    if (!source_node_id || !target_type || !provider_id || !model || !prompt_json) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Missing required fields' },
      });
    }

    const result = await generateFromPrompt(
      source_node_id,
      target_type,
      provider_id,
      model,
      prompt_json,
      style
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to generate:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATE_ERROR',
        message: error instanceof Error ? error.message : 'Generation failed',
      },
    });
  }
});

export default router;
```

- [ ] **Step 4: 创建类型文件**

```typescript
// apps/api/src/types/workspace.ts
export interface WorkspacePromptJson {
  version: number;
  scene?: string | SceneObject;
  shot?: string | ShotObject;
  subject?: string | SubjectObject;
  props?: string[] | PropObject[];
  style?: string | StyleObject;
  audio?: string | AudioObject;
  extra?: Record<string, any>;
}

export interface SceneObject {
  id?: string;
  description?: string;
  time?: string;
  location?: string;
  atmosphere?: string;
}

export interface ShotObject {
  type?: string;
  description?: string;
  camera_movement?: string;
}

export interface SubjectObject {
  id?: string;
  role?: string;
  type?: string;
  name?: string;
  description?: string;
  position?: string;
  action?: string;
  expression?: string;
}

export interface PropObject {
  id?: string;
  description?: string;
  position?: string;
}

export interface StyleObject {
  art_style?: string;
  mood?: string;
  color_palette?: string;
  lighting?: string;
}

export interface AudioObject {
  bgm?: string;
  sfx?: string[];
}
```

- [ ] **Step 5: 注册路由**

```typescript
// apps/api/src/routes/workspace.routes.ts 添加
import aiRoutes from './workspace/ai.routes';

router.use('/ai', aiRoutes);
```

- [ ] **Step 6: 提交 AI 对接代码**

```bash
git add apps/api/src/services/workspace/
git add apps/api/src/routes/workspace/ai.routes.ts
git add apps/api/src/types/workspace.ts
git commit -m "feat(workspace): add AI processor and prompt builder"
```

---

## Phase 3: UI 增强

### Task 5: 实现 AIPromptEditor 组件

**Files:**
- Create: `apps/web/src/components/workspace/AIPromptEditor.tsx`
- Modify: `apps/web/src/components/workspace/NodeConfigPanel.tsx`
- Test: N/A (手动测试)

- [ ] **Step 1: 创建 AIPromptEditor 组件**

```typescript
// apps/web/src/components/workspace/AIPromptEditor.tsx
import { useState, useEffect } from 'react';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import { WorkspacePromptJson } from '../../types/workspace';
import { apiClient } from '../../lib/api';

const accentColor = '#8b5cf6';

interface AIPromptEditorProps {
  sourceText: string;
  initialPrompt?: WorkspacePromptJson;
  isDark: boolean;
  onPromptChange: (prompt: WorkspacePromptJson) => void;
  onGenerate: (prompt: WorkspacePromptJson) => void;
}

export function AIPromptEditor({
  sourceText,
  initialPrompt,
  isDark,
  onPromptChange,
  onGenerate,
}: AIPromptEditorProps) {
  const [prompt, setPrompt] = useState<WorkspacePromptJson>(
    initialPrompt || {
      version: 1,
      scene: '',
      shot: '',
      subject: '',
      props: [],
      style: '',
    }
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
  };

  const handleAnalyze = async () => {
    if (!sourceText) return;
    setIsAnalyzing(true);
    try {
      const res = await apiClient.post('/workspace/ai/analyze-text', {
        text: sourceText,
        source_node_id: '',
        style_hint: prompt.style as string || '默认',
      });
      if (res.success && res.data) {
        setPrompt(res.data.prompt_json);
        onPromptChange(res.data.prompt_json);
      }
    } catch (error) {
      console.error('Analyze failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const optimized = await apiClient.post('/workspace/ai/enhance-prompt', {
        prompt_json: prompt,
      });
      if (optimized.success && optimized.data) {
        setPrompt(optimized.data.prompt_json);
        onPromptChange(optimized.data.prompt_json);
      }
    } catch (error) {
      console.error('Optimize failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFieldChange = (field: keyof WorkspacePromptJson, value: any) => {
    const updated = { ...prompt, [field]: value };
    setPrompt(updated);
    onPromptChange(updated);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(prompt, null, 2));
  };

  return (
    <div style={{
      background: colors.bgSecondary,
      borderRadius: '16px',
      padding: '16px',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
          JSON Prompt 编辑器
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopyJson}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textSecondary,
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Copy size={14} /> 复制
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            场景
          </label>
          <input
            type="text"
            value={typeof prompt.scene === 'string' ? prompt.scene : prompt.scene?.description || ''}
            onChange={(e) => handleFieldChange('scene', e.target.value)}
            placeholder="描述场景..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            镜头
          </label>
          <input
            type="text"
            value={typeof prompt.shot === 'string' ? prompt.shot : prompt.shot?.description || ''}
            onChange={(e) => handleFieldChange('shot', e.target.value)}
            placeholder="中景/特写/远景等"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            主体
          </label>
          <textarea
            value={typeof prompt.subject === 'string' ? prompt.subject : prompt.subject?.description || ''}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            placeholder="描述主体..."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
              resize: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px', display: 'block' }}>
            风格
          </label>
          <input
            type="text"
            value={typeof prompt.style === 'string' ? prompt.style : prompt.style?.art_style || ''}
            onChange={(e) => handleFieldChange('style', e.target.value)}
            placeholder="皮克斯风格/写实风格等"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.bgPrimary,
              color: colors.textPrimary,
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !sourceText}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: isAnalyzing ? `${accentColor}50` : accentColor,
            color: 'white',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={16} />
          {isAnalyzing ? '分析中...' : 'AI 分析'}
        </button>

        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgPrimary,
            color: colors.textPrimary,
            cursor: isOptimizing ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={16} />
          {isOptimizing ? '优化中...' : '一键优化'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 增强 NodeConfigPanel**

在 NodeConfigPanel 中添加 Provider 选择和 AIPromptEditor 集成。

- [ ] **Step 3: 提交 UI 增强代码**

```bash
git add apps/web/src/components/workspace/AIPromptEditor.tsx
git add apps/web/src/components/workspace/NodeConfigPanel.tsx
git commit -m "feat(workspace): add AIPromptEditor and Provider selector"
```

---

## Phase 4: 自动化

### Task 6: 实现工作流模板和自动化

**Files:**
- Create: `apps/api/src/services/workspace/automation.ts`
- Create: `apps/api/src/routes/workspace/template.routes.ts`
- Create: `apps/api/src/routes/workspace/automation.routes.ts`
- Test: N/A (手动测试)

- [ ] **Step 1: 创建 automation.ts**

```typescript
// apps/api/src/services/workspace/automation.ts
import { prisma } from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'text-to-image' | 'image-to-image' | 'image-to-video' | 'storyboard' | 'batch-generate';
  node_count: number;
  config: Record<string, any>;
  created_at: Date;
}

export interface AutomationTrigger {
  id: string;
  workspace_id: string;
  workflow_id: string;
  trigger_type: 'schedule' | 'api' | 'webhook';
  schedule_cron?: string;
  enabled: boolean;
  last_triggered_at?: Date;
  created_at: Date;
}

export async function createWorkflowTemplate(
  userId: string,
  name: string,
  type: WorkflowTemplate['type'],
  config: Record<string, any>
): Promise<WorkflowTemplate> {
  const template = await prisma.workflowTemplate.create({
    data: {
      id: uuidv4(),
      user_id: userId,
      name,
      type,
      description: getTemplateDescription(type),
      node_count: getNodeCount(type),
      config,
      created_at: new Date(),
    },
  });

  return template;
}

export async function getWorkflowTemplates(userId: string): Promise<WorkflowTemplate[]> {
  return prisma.workflowTemplate.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
}

export async function createAutomationTrigger(
  workspaceId: string,
  workflowId: string,
  triggerType: AutomationTrigger['trigger_type'],
  scheduleCron?: string
): Promise<AutomationTrigger> {
  return prisma.automationTrigger.create({
    data: {
      id: uuidv4(),
      workspace_id: workspaceId,
      workflow_id: workflowId,
      trigger_type: triggerType,
      schedule_cron: scheduleCron,
      enabled: true,
      created_at: new Date(),
    },
  });
}

export async function triggerWorkflow(
  workflowId: string,
  params: Record<string, any>
): Promise<{ success: boolean; execution_id: string }> {
  const executionId = uuidv4();

  console.log(`[Automation] Triggering workflow ${workflowId} with execution ${executionId}`, params);

  return { success: true, execution_id: executionId };
}

export async function getAutomationLogs(
  workspaceId: string,
  limit: number = 50
): Promise<any[]> {
  return [];
}

function getTemplateDescription(type: WorkflowTemplate['type']): string {
  const descriptions = {
    'text-to-image': '将文字描述转换为图片',
    'image-to-image': '对图片进行变换或增强',
    'image-to-video': '将静态图片转换为视频',
    'storyboard': '批量生成分镜图片',
    'batch-generate': '批量生成多个资源',
  };
  return descriptions[type] || '';
}

function getNodeCount(type: WorkflowTemplate['type']): number {
  const counts = {
    'text-to-image': 2,
    'image-to-image': 2,
    'image-to-video': 2,
    'storyboard': 5,
    'batch-generate': 10,
  };
  return counts[type] || 3;
}
```

- [ ] **Step 2: 创建 template.routes.ts**

```typescript
// apps/api/src/routes/workspace/template.routes.ts
import { Router } from 'express';
import { createWorkflowTemplate, getWorkflowTemplates } from '../../services/workspace/automation';

const router = Router();

router.get('/templates', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    }

    const templates = await getWorkflowTemplates(userId);
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({ success: false, error: { code: 'TEMPLATE_ERROR' } });
  }
});

router.post('/from-template', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    }

    const { template_id, workspace_id, name } = req.body;
    res.json({ success: true, data: { template_id, workspace_id, name } });
  } catch (error) {
    console.error('Failed to create from template:', error);
    res.status(500).json({ success: false, error: { code: 'TEMPLATE_ERROR' } });
  }
});

export default router;
```

- [ ] **Step 3: 创建 automation.routes.ts**

```typescript
// apps/api/src/routes/workspace/automation.routes.ts
import { Router } from 'express';
import { createAutomationTrigger, triggerWorkflow, getAutomationLogs } from '../../services/workspace/automation';

const router = Router();

router.post('/trigger', async (req, res) => {
  try {
    const { workflow_id, trigger_type, params } = req.body;

    const result = await triggerWorkflow(workflow_id, params || {});
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to trigger workflow:', error);
    res.status(500).json({ success: false, error: { code: 'TRIGGER_ERROR' } });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { workspace_id, limit } = req.query;
    const logs = await getAutomationLogs(workspace_id as string, Number(limit) || 50);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Failed to get logs:', error);
    res.status(500).json({ success: false, error: { code: 'LOG_ERROR' } });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const { workspace_id, workflow_id, schedule_cron } = req.body;

    const trigger = await createAutomationTrigger(
      workspace_id,
      workflow_id,
      'schedule',
      schedule_cron
    );

    res.json({ success: true, data: trigger });
  } catch (error) {
    console.error('Failed to schedule workflow:', error);
    res.status(500).json({ success: false, error: { code: 'SCHEDULE_ERROR' } });
  }
});

export default router;
```

- [ ] **Step 4: 更新 Prisma Schema**

```prisma
// apps/api/prisma/schema.prisma 添加
model WorkflowTemplate {
  id          String   @id @default(uuid())
  user_id     String
  name        String
  description String?
  type        String
  node_count  Int      @default(1)
  config      Json?
  created_at  DateTime @default(now())
}

model AutomationTrigger {
  id                String    @id @default(uuid())
  workspace_id      String
  workflow_id       String
  trigger_type      String
  schedule_cron     String?
  enabled           Boolean   @default(true)
  last_triggered_at DateTime?
  created_at        DateTime  @default(now())
}
```

- [ ] **Step 5: 注册路由**

```typescript
// apps/api/src/routes/workspace.routes.ts 添加
import templateRoutes from './workspace/template.routes';
import automationRoutes from './workspace/automation.routes';

router.use('/template', templateRoutes);
router.use('/automation', automationRoutes);
```

- [ ] **Step 6: 提交自动化代码**

```bash
git add apps/api/src/services/workspace/automation.ts
git add apps/api/src/routes/workspace/template.routes.ts
git add apps/api/src/routes/workspace/automation.routes.ts
git add apps/api/prisma/schema.prisma
git commit -m "feat(workspace): add workflow templates and automation triggers"
```

---

## 验收检查

- [ ] 所有新建文件不超过 200 行
- [ ] WorkspacePage 及其子组件编译通过
- [ ] AI 生成可真实调用 providerManager
- [ ] Provider 选择器正常工作
- [ ] JSON Prompt 编辑器正常工作
- [ ] 自动保存功能正常
- [ ] 节点内联编辑正常
- [ ] 无 TypeScript 编译错误
- [ ] 符合 Glassmorphism UI 规范
