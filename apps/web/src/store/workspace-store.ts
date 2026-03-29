import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  isLoading: boolean;
  error: string | null;
}

interface WorkspaceActions {
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, data: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: CanvasEdge) => void;
  deleteEdge: (id: string) => void;
  setSelectedNodes: (ids: string[]) => void;
  setSelectedNode: (node: CanvasNode | null) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setWorkspaceId: (id: string) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: WorkspaceState = {
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedNode: null,
  canvasOffset: { x: 0, y: 0 },
  zoom: 1,
  workspaceId: null,
  isSaving: false,
  lastSavedAt: null,
  isLoading: false,
  error: null,
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

      updateNode: (id, data) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, ...data } : n),
      })),

      deleteNode: (id) => set((state) => ({
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source_node_id !== id && e.target_node_id !== id),
        selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id),
        selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
      })),

      addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),

      deleteEdge: (id) => set((state) => ({
        edges: state.edges.filter(e => e.id !== id),
      })),

      setSelectedNodes: (ids) => set({ selectedNodes: ids }),
      setSelectedNode: (node) => set({ selectedNode: node }),

      setCanvasOffset: (offset) => set({ canvasOffset: offset }),
      setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

      setWorkspaceId: (id) => set({ workspaceId: id }),
      setIsSaving: (saving) => set({ isSaving: saving }),
      setLastSavedAt: (date) => set({ lastSavedAt: date }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'WorkspaceStore' }
  )
);
