import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image, Video, Type, Sparkles, Trash2, Play, X, ZoomIn, ZoomOut, Move, Star, Undo2, Redo2, Download, Upload as UploadIcon, Filter } from 'lucide-react';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useHistory } from '../hooks/useHistory';
import NodeConfigPanel from '../components/workspace/NodeConfigPanel';
import MiniMap from '../components/workspace/MiniMap';

interface CanvasNode {
  id: string;
  type: 'text' | 'image' | 'video';
  position_x: number;
  position_y: number;
  content: { text?: string; url?: string; file?: File };
  output_url?: string;
  is_starred?: boolean;
  labels?: string[];
  history?: any[];
  config?: Record<string, any>;
  is_generating?: boolean;
  generation_progress?: number;
}

interface CanvasEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
}

const accentColor = '#8b5cf6';

export default function WorkspacePage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);
  const [previewNode, setPreviewNode] = useState<CanvasNode | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasOffsetRef = useRef(canvasOffset);
  const zoomRef = useRef(zoom);
  const workspaceIdRef = useRef(workspaceId);

  useEffect(() => {
    canvasOffsetRef.current = canvasOffset;
  }, [canvasOffset]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  const history = useHistory({ nodes: [] as CanvasNode[], edges: [] as CanvasEdge[] });
  const [historyState, setHistoryState] = useState<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>({
    nodes: [],
    edges: [],
  });

  const colors = isDark ? {
    bgPrimary: 'rgba(5, 5, 10, 0.95)',
    bgSecondary: 'rgba(255, 255, 255, 0.03)',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    textMuted: 'rgba(250, 250, 250, 0.4)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  } : {
    bgPrimary: 'rgba(255, 255, 255, 0.92)',
    bgSecondary: 'rgba(0, 0, 0, 0.02)',
    bgGlass: 'rgba(0, 0, 0, 0.02)',
    bgGlassHover: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#18181b',
    textSecondary: 'rgba(24, 24, 27, 0.6)',
    textMuted: 'rgba(24, 24, 27, 0.4)',
    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(139, 92, 246, 0.25)',
  };

  useEffect(() => {
    loadWorkspace();
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const saveToHistory = useCallback(() => {
    const currentState = { nodes, edges };
    setHistoryState(currentState);
    history.pushState(currentState);
  }, [nodes, edges, history]);

  useKeyboardShortcuts([
    { key: 'Delete', handler: () => selectedNodes.forEach(id => deleteNode(id)) },
    { key: 'Backspace', handler: () => selectedNodes.forEach(id => deleteNode(id)) },
    { key: 'z', ctrlKey: true, handler: () => {
      const prev = history.undo();
      if (prev) {
        setNodes(prev.nodes);
        setEdges(prev.edges);
      }
    }},
    { key: 'y', ctrlKey: true, handler: () => {
      const next = history.redo();
      if (next) {
        setNodes(next.nodes);
        setEdges(next.edges);
      }
    }},
    { key: 's', ctrlKey: true, handler: () => saveWorkspace() },
    { key: 'a', ctrlKey: true, handler: () => setSelectedNodes(nodes.map(n => n.id)) },
    { key: ' ', handler: () => setSpacePressed(true), preventDefault: false },
  ]);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setSpacePressed(false);
    };
    document.addEventListener('keyup', handleKeyUp);
    return () => document.removeEventListener('keyup', handleKeyUp);
  }, []);

  const loadWorkspace = async () => {
    try {
      const res = await apiClient.get('/workspace');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const ws = res.data[0];
        setWorkspaceId(ws.id);
        const loadedNodes = ws.CanvasNode.map((n: any) => ({
          id: n.id, type: n.type, position_x: n.position_x, position_y: n.position_y,
          content: n.content || {}, output_url: n.output_url,
          is_starred: n.is_starred, labels: n.labels || [], history: n.history || [],
          config: n.config || {},
        }));
        const loadedEdges = ws.CanvasEdge.map((e: any) => ({
          id: e.id, source_node_id: e.source_node_id, target_node_id: e.target_node_id,
        }));
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setHistoryState({ nodes: loadedNodes, edges: loadedEdges });
      } else {
        const createRes = await apiClient.post('/workspace', { name: '默认工作台' });
        if (createRes && (createRes as any).success && (createRes as any).data) {
          setWorkspaceId((createRes as any).data.id);
        }
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
    }
  };

  const saveWorkspace = async () => {
    if (!workspaceId) return;
    try {
      await apiClient.patch(`/workspace/${workspaceId}`, {
        snapshot: JSON.stringify({ nodes, edges }),
      });
    } catch (error) {
      console.error('Failed to save workspace:', error);
    }
  };

  const createNode = async (type: 'text' | 'image' | 'video', content: any, position: { x: number; y: number }) => {
    let wsId = workspaceId;
    if (!wsId) {
      try {
        const createRes = await apiClient.post('/workspace', { name: '默认工作台' });
        const resData = (createRes as any);
        if (resData && resData.success && resData.data?.id) {
          wsId = resData.data.id;
          setWorkspaceId(wsId);
        } else {
          console.error('Failed to create workspace: invalid response', createRes);
          return;
        }
      } catch (error) {
        console.error('Failed to create workspace:', error);
        return;
      }
    }
    try {
      const res = await apiClient.post(`/workspace/${wsId}/nodes`, { type, position_x: position.x, position_y: position.y, content });
      const resData = (res as any);
      if (resData && resData.success && resData.data?.id) {
        const newNode: CanvasNode = {
          id: resData.data.id, type, position_x: position.x, position_y: position.y,
          content, output_url: resData.data.output_url,
          is_starred: false, labels: [], history: [], config: {},
        };
        setNodes(prev => [...prev, newNode]);
        return newNode;
      }
      console.error('Failed to create node: invalid response', res);
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  const createNodeRef = useRef(createNode);

  useEffect(() => {
    createNodeRef.current = createNode;
  }, [createNode]);

  const updateNode = async (nodeId: string, data: Partial<CanvasNode>) => {
    try {
      const api = apiClient as any;
      await api.patch(`/workspace/nodes/${nodeId}`, data);
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...data } : n));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  };

  const deleteNode = async (nodeId: string) => {
    saveToHistory();
    try {
      await apiClient.delete(`/workspace/nodes/${nodeId}`);
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setEdges(prev => prev.filter(e => e.source_node_id !== nodeId && e.target_node_id !== nodeId));
      if (selectedNode?.id === nodeId) setSelectedNode(null);
      setSelectedNodes(prev => prev.filter(id => id !== nodeId));
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  };

  const createEdge = async (sourceId: string, targetId: string) => {
    if (!workspaceId) return;
    saveToHistory();
    try {
      const res = await apiClient.post(`/workspace/${workspaceId}/edges`, { source_node_id: sourceId, target_node_id: targetId });
      if (res && (res as any).success && (res as any).data) {
        setEdges(prev => [...prev, { id: (res as any).data.id, source_node_id: sourceId, target_node_id: targetId }]);
      }
    } catch (error) {
      console.error('Failed to create edge:', error);
    }
  };

  const deleteEdge = async (edgeId: string) => {
    saveToHistory();
    try {
      await apiClient.delete(`/workspace/edges/${edgeId}`);
      setEdges(prev => prev.filter(e => e.id !== edgeId));
    } catch (error) {
      console.error('Failed to delete edge:', error);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (spacePressed) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      } else {
        setIsSelecting(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          setSelectionBox({
            startX: (e.clientX - rect.left - canvasOffset.x) / zoom,
            startY: (e.clientY - rect.top - canvasOffset.y) / zoom,
            endX: (e.clientX - rect.left - canvasOffset.x) / zoom,
            endY: (e.clientY - rect.top - canvasOffset.y) / zoom,
          });
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (isSelecting && selectionBox) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectionBox(prev => prev ? {
          ...prev,
          endX: (e.clientX - rect.left - canvasOffset.x) / zoom,
          endY: (e.clientY - rect.top - canvasOffset.y) / zoom,
        } : null);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (isSelecting && selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);
      const selected = nodes.filter(n =>
        n.position_x < maxX && n.position_x + 240 > minX &&
        n.position_y < maxY && n.position_y + 180 > minY
      ).map(n => n.id);
      setSelectedNodes(selected);
    }
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionBox(null);
  };

  const handleNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = node.position_x;
    const startPosY = node.position_y;
    const zoomRefValue = zoomRef.current;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const dx = (moveEvent.clientX - startX) / zoomRefValue;
      const dy = (moveEvent.clientY - startY) / zoomRefValue;
      const deltaX = startPosX + dx;
      const deltaY = startPosY + dy;
      if (selectedNodes.includes(nodeId) && selectedNodes.length > 1) {
        const offsetX = deltaX - node.position_x;
        const offsetY = deltaY - node.position_y;
        setNodes(prev => prev.map(n => {
          if (selectedNodes.includes(n.id)) {
            return { ...n, position_x: n.position_x + offsetX, position_y: n.position_y + offsetY };
          }
          return n;
        }));
      } else {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, position_x: deltaX, position_y: deltaY } : n));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const handleConnect = (nodeId: string) => {
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        createEdge(connectingFrom, nodeId);
      }
      setConnectingFrom(null);
    } else {
      setConnectingFrom(nodeId);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setShowUploadZone(false);
    const files = Array.from(e.dataTransfer.files);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;

    files.forEach((file, index) => {
      setUploadingFiles(prev => [...prev, { name: file.name, progress: 0 }]);
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => setUploadingFiles(prev => prev.filter(f => f.name !== file.name)), 500);
        }
        setUploadingFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress } : f));
      }, 200);
      if (file.type.startsWith('image/')) {
        createNode('image', { file, url: URL.createObjectURL(file) }, { x: x + index * 20, y: y + index * 20 });
      } else if (file.type.startsWith('video/')) {
        createNode('video', { file, url: URL.createObjectURL(file) }, { x: x + index * 20, y: y + index * 20 });
      }
    });
  }, [canvasOffset, zoom, workspaceId]);

  const handleGenerate = async (
    nodeId: string,
    targetType: string,
    promptJson?: any,
    providerId?: string
  ) => {
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (window.innerWidth / 2 - canvasOffset.x) / zoom;
    const y = (window.innerHeight / 2 - canvasOffset.y) / zoom;

    const newNode = await createNode(targetType as 'text' | 'image' | 'video',
      targetType === 'text' ? { text: '' } : { url: '' },
      { x: x + Math.random() * 50, y: y + Math.random() * 50 }
    );

    if (!newNode) return;

    await createEdge(nodeId, newNode.id);

    setNodes(prev => prev.map(n =>
      n.id === newNode.id ? { ...n, is_generating: true, generation_progress: 0 } : n
    ));

    try {
      const providersRes = await apiClient.get('/workspace/ai/providers');
      const providers = (providersRes as any)?.data || [];
      const defaultProvider = providers[0];
      const finalProviderId = providerId || defaultProvider?.id || 'zhipu';
      const model = defaultProvider?.models?.[0]?.id || 'cogview-3';

      const res = await apiClient.post('/workspace/ai/generate', {
        source_node_id: nodeId,
        target_type: targetType,
        provider_id: finalProviderId,
        model,
        prompt_json: promptJson || {
          version: 1,
          scene: sourceNode.content?.text || '',
          shot: '中景',
          subject: '',
          props: [],
          style: '默认风格',
        },
      });

      const resultUrl = targetType === 'image'
        ? (res as any)?.data?.result_url || 'https://picsum.photos/512/512?' + Date.now()
        : 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';

      setNodes(prev => prev.map(n =>
        n.id === newNode.id
          ? { ...n, is_generating: false, generation_progress: undefined, output_url: resultUrl, content: { url: resultUrl } }
          : n
      ));

      await apiClient.post(`/workspace/nodes/${newNode.id}/history`, {
        content: { url: resultUrl },
        output_url: resultUrl,
      });
    } catch (error) {
      console.error('Generation failed:', error);
      const resultUrl = targetType === 'image'
        ? 'https://picsum.photos/512/512?' + Date.now()
        : 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
      setNodes(prev => prev.map(n =>
        n.id === newNode.id
          ? { ...n, is_generating: false, generation_progress: undefined, output_url: resultUrl, content: { url: resultUrl } }
          : n
      ));
    }

    setShowConfigPanel(false);
    setContextMenu(null);
  };

  const handleStar = async (nodeId: string, isStarred: boolean) => {
    try {
      await apiClient.patch(`/workspace/nodes/${nodeId}/star`, { is_starred: isStarred });
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, is_starred: isStarred } : n));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(prev => prev ? { ...prev, is_starred: isStarred } : null);
      }
    } catch (error) {
      console.error('Failed to update star:', error);
    }
  };

  const handleRevertToVersion = (nodeId: string, version: any) => {
    saveToHistory();
    updateNode(nodeId, { content: version.content, output_url: version.output_url });
  };

  const handleExport = async () => {
    if (!workspaceId) return;
    try {
      const res = await apiClient.get(`/workspace/${workspaceId}/export`);
      if (res.success && res.data) {
        const dataStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workspace-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (!workspaceId) return;
          await apiClient.post(`/workspace/${workspaceId}/import`, data);
          loadWorkspace();
        } catch (error) {
          console.error('Failed to import:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleMiniMapNavigate = (x: number, y: number) => {
    setCanvasOffset({ x: -x * zoom, y: -y * zoom });
  };

  const filteredNodes = filterLabel
    ? nodes.filter(n => n.labels?.includes(filterLabel))
    : nodes;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={20} />;
      case 'image': return <Image size={20} />;
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

  const labelColors: Record<string, string> = {
    red: '#ef4444', yellow: '#f59e0b', green: '#10b981', blue: '#3b82f6', purple: '#8b5cf6'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? 'linear-gradient(180deg, #05050a 0%, #0a0a12 50%, #0f0f1a 100%)' : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '64px',
        background: colors.bgPrimary, backdropFilter: 'blur(40px)',
        borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center',
        padding: '0 24px', zIndex: 10,
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>工作台</h1>
        <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
          {Object.entries(labelColors).map(([name, color]) => (
            <button
              key={name}
              onClick={() => setFilterLabel(filterLabel === name ? null : name)}
              style={{
                width: '24px', height: '24px', borderRadius: '6px', border: 'none',
                background: filterLabel === name ? color : `${color}40`,
                cursor: 'pointer',
              }}
            />
          ))}
          {filterLabel && (
            <button onClick={() => setFilterLabel(null)} style={{
              padding: '4px 8px', borderRadius: '6px', border: 'none',
              background: colors.bgSecondary, color: colors.textSecondary, cursor: 'pointer', fontSize: '12px',
            }}>
              清除筛选
            </button>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => {
            const prev = history.undo();
            if (prev) { setNodes(prev.nodes); setEdges(prev.edges); }
          }} disabled={!history.canUndo}
            style={{ padding: '8px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.bgGlass, color: colors.textPrimary, cursor: history.canUndo ? 'pointer' : 'not-allowed', opacity: history.canUndo ? 1 : 0.5 }}>
            <Undo2 size={18} />
          </button>
          <button onClick={() => {
            const next = history.redo();
            if (next) { setNodes(next.nodes); setEdges(next.edges); }
          }} disabled={!history.canRedo}
            style={{ padding: '8px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.bgGlass, color: colors.textPrimary, cursor: history.canRedo ? 'pointer' : 'not-allowed', opacity: history.canRedo ? 1 : 0.5 }}>
            <Redo2 size={18} />
          </button>
          <button onClick={handleExport} style={{ padding: '8px 12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.bgGlass, color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> 导出
          </button>
          <button onClick={handleImport} style={{ padding: '8px 12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.bgGlass, color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UploadIcon size={16} /> 导入
          </button>
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} style={{ padding: '8px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.bgGlass, color: colors.textPrimary, cursor: 'pointer' }}>
            <ZoomIn size={18} />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} style={{ padding: '8px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.bgGlass, color: colors.textPrimary, cursor: 'pointer' }}>
            <ZoomOut size={18} />
          </button>
          <button onClick={() => {
            const canvasWidth = canvasRef.current?.clientWidth || 800;
            const canvasHeight = canvasRef.current?.clientHeight || 600;
            const centerX = (canvasWidth / 2 - canvasOffset.x) / zoom;
            const centerY = (canvasHeight / 2 - canvasOffset.y) / zoom;
            const testNode: CanvasNode = {
              id: 'test-' + Date.now(), type: 'text',
              position_x: centerX, position_y: centerY,
              content: { text: 'Test Node' },
              is_starred: false, labels: [], history: [], config: {},
            };
            setNodes(prev => [...prev, testNode]);
          }}
            style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            TEST
          </button>
          <button onClick={() => {
            const canvasWidth = canvasRef.current?.clientWidth || 800;
            const canvasHeight = canvasRef.current?.clientHeight || 600;
            const centerX = (canvasWidth / 2 - canvasOffset.x) / zoom;
            const centerY = (canvasHeight / 2 - canvasOffset.y) / zoom;
            createNode('text', { text: '新文字节点' }, { x: centerX, y: centerY });
          }}
            style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${accentColor} 0%, #a78bfa 100%)`, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Type size={18} /> 添加文字
          </button>
        </div>
      </div>

      <div ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setShowUploadZone(true); }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) {
            setShowUploadZone(false);
          }
        }}
        onClick={() => { setSelectedNode(null); setConnectingFrom(null); setContextMenu(null); }}
        onDoubleClick={async (e) => {
           if (e.target === canvasRef.current) {
             const rect = canvasRef.current?.getBoundingClientRect();
             if (rect) {
               const clickX = e.clientX - rect.left;
               const clickY = e.clientY - rect.top;
               const x = (clickX - canvasOffsetRef.current.x) / zoomRef.current;
               const y = (clickY - canvasOffsetRef.current.y) / zoomRef.current;
               console.log('[DBLCLICK] Creating node at canvas position:', x, y, 'clickX:', clickX, 'clickY:', clickY, 'offset:', canvasOffsetRef.current, 'zoom:', zoomRef.current);
               const wsId = workspaceIdRef.current;
               console.log('[DBLCLICK] workspaceId:', wsId);
               if (!wsId) {
                 try {
                   const createRes = await apiClient.post('/workspace', { name: '默认工作台' });
                   console.log('[DBLCLICK] Create workspace response:', createRes);
                   const wsData = (createRes as any).data || createRes;
                   if (wsData && wsData.id) {
                     const newWsId = wsData.id;
                     setWorkspaceId(newWsId);
                     workspaceIdRef.current = newWsId;
                     const res = await apiClient.post(`/workspace/${newWsId}/nodes`, { type: 'text', position_x: x, position_y: y, content: { text: '新文字节点' } });
                     console.log('[DBLCLICK] Create node response:', res);
                     const nodeData = (res as any).data || res;
                     if (nodeData && nodeData.id) {
                       const newNode: CanvasNode = {
                         id: nodeData.id, type: 'text', position_x: x, position_y: y,
                         content: { text: '新文字节点' }, output_url: nodeData.output_url,
                         is_starred: false, labels: [], history: [], config: {},
                       };
                       console.log('[DBLCLICK] Setting new node:', newNode);
                       setNodes(prev => [...prev, newNode]);
                     }
                   }
                 } catch (error) {
                   console.error('Failed to create workspace:', error);
                 }
               } else {
                 const res = await apiClient.post(`/workspace/${wsId}/nodes`, { type: 'text', position_x: x, position_y: y, content: { text: '新文字节点' } });
                 console.log('[DBLCLICK] Create node response (existing ws):', res);
                 const nodeData = (res as any).data || res;
                 if (nodeData && nodeData.id) {
                   const newNode: CanvasNode = {
                     id: nodeData.id, type: 'text', position_x: x, position_y: y,
                     content: { text: '新文字节点' }, output_url: nodeData.output_url,
                     is_starred: false, labels: [], history: [], config: {},
                   };
                   console.log('[DBLCLICK] Setting new node:', newNode);
                   setNodes(prev => [...prev, newNode]);
                 }
               }
             }
           }
         }}
        style={{
          position: 'absolute', top: '64px', left: '256px', right: 0, bottom: 0,
          background: isDark ? 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.03) 0%, transparent 70%)' : 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
          cursor: isDragging ? 'grabbing' : spacePressed ? 'grab' : isSelecting ? 'crosshair' : 'default',
        }}>
        {showUploadZone && (
          <div style={{ position: 'absolute', inset: 0, background: `${accentColor}20`, border: `2px dashed ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ padding: '32px 48px', borderRadius: '24px', background: colors.bgPrimary, border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Upload size={48} color={accentColor} />
              <span style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary }}>拖放文件到此处上传</span>
            </div>
          </div>
        )}

        {selectionBox && (
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
        )}

        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
            </linearGradient>
          </defs>
          {edges.map(edge => {
            const source = filteredNodes.find(n => n.id === edge.source_node_id);
            const target = filteredNodes.find(n => n.id === edge.target_node_id);
            if (!source || !target) return null;
            const x1 = source.position_x + 120, y1 = source.position_y + 50;
            const x2 = target.position_x, y2 = target.position_y + 50;
            const midX = (x1 + x2) / 2;
            return (
              <g key={edge.id} onClick={() => deleteEdge(edge.id)} style={{ cursor: 'pointer' }}>
                <path d={`M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2}, ${x2} ${y2}`} fill="none" stroke="url(#edgeGradient)" strokeWidth={2} strokeDasharray="5,5" />
              </g>
            );
          })}
        </svg>

        {filteredNodes.map(node => (
          <div key={node.id}
            onClick={(e) => { e.stopPropagation(); setSelectedNode(node); setShowConfigPanel(true); }}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
            onMouseDown={(e) => handleNodeDrag(node.id, e)}
            onDoubleClick={(e) => { e.stopPropagation(); handleConnect(node.id); }}
            style={{
              position: 'absolute', left: node.position_x, top: node.position_y, width: '240px',
              borderRadius: '16px', background: colors.bgPrimary, backdropFilter: 'blur(20px)',
              border: selectedNodes.includes(node.id) || selectedNode?.id === node.id ? `2px solid ${accentColor}` : `1px solid ${colors.border}`,
              boxShadow: selectedNodes.includes(node.id) || selectedNode?.id === node.id ? `0 0 30px ${accentColor}30, 0 20px 40px rgba(0,0,0,0.15)` : `0 8px 24px rgba(0,0,0,0.1)`,
              cursor: spacePressed ? 'grab' : 'move', userSelect: 'none',
              transform: `scale(${zoom})`, transformOrigin: 'top left',
            }}>
            {node.is_starred && (
              <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={12} fill="white" color="white" />
              </div>
            )}
            {node.labels && node.labels.length > 0 && (
              <div style={{ position: 'absolute', top: '-4px', left: '8px', display: 'flex', gap: '4px' }}>
                {node.labels.map((label, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: labelColors[label] || accentColor }} />
                ))}
              </div>
            )}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${getNodeColor(node.type)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getNodeColor(node.type) }}>
                {getNodeIcon(node.type)}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, textTransform: 'uppercase' }}>
                {node.type === 'text' ? '文字' : node.type === 'image' ? '图片' : '视频'}
              </span>
              {node.is_generating && (
                <div style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: '6px', background: `${accentColor}20`, color: accentColor, fontSize: '11px', fontWeight: 600 }}>
                  生成中 {Math.round(node.generation_progress || 0)}%
                </div>
              )}
            </div>
            <div style={{ padding: '12px 16px' }}>
              {node.type === 'text' && (
                <div style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: 1.5, maxHeight: '80px', overflow: 'hidden' }}>
                  {node.content.text || '点击编辑文字'}
                </div>
              )}
              {node.type === 'image' && (
                <div onClick={() => node.content.url && setPreviewNode(node)}
                  style={{ width: '100%', height: '120px', borderRadius: '12px', background: colors.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: node.content.url ? 'pointer' : 'default', position: 'relative' }}>
                  {node.is_generating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${accentColor}20`, borderTopColor: accentColor, animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '12px', color: colors.textMuted }}>{Math.round(node.generation_progress || 0)}%</span>
                    </div>
                  ) : node.content.url ? (
                    <img src={node.content.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Image size={32} color={colors.textMuted} />
                  )}
                </div>
              )}
              {node.type === 'video' && (
                <div onClick={() => node.content.url && setPreviewNode(node)}
                  style={{ width: '100%', height: '120px', borderRadius: '12px', background: colors.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {node.is_generating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${accentColor}20`, borderTopColor: accentColor, animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '12px', color: colors.textMuted }}>{Math.round(node.generation_progress || 0)}%</span>
                    </div>
                  ) : node.content.url ? (
                    <>
                      <video src={node.content.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                        <Play size={32} color="white" />
                      </div>
                    </>
                  ) : (
                    <Video size={32} color={colors.textMuted} />
                  )}
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: accentColor, border: `2px solid ${colors.bgPrimary}`, cursor: 'crosshair' }}
              onClick={(e) => { e.stopPropagation(); handleConnect(node.id); }} />
          </div>
        ))}
      </div>

      {contextMenu && (
        <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, background: colors.bgPrimary, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '8px', zIndex: 1000, minWidth: '180px' }}
          onClick={(e) => e.stopPropagation()}>
          {nodes.find(n => n.id === contextMenu.nodeId)?.type === 'text' && (
            <button onClick={() => handleGenerate(contextMenu.nodeId, 'image')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Image size={16} color="#10b981" /> 生成图片
            </button>
          )}
          {nodes.find(n => n.id === contextMenu.nodeId)?.type === 'image' && (
            <>
              <button onClick={() => handleGenerate(contextMenu.nodeId, 'image')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Image size={16} color="#10b981" /> 图生图
              </button>
              <button onClick={() => handleGenerate(contextMenu.nodeId, 'video')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Video size={16} color="#f59e0b" /> 生成视频
              </button>
            </>
          )}
          {nodes.find(n => n.id === contextMenu.nodeId)?.type === 'video' && (
            <button onClick={() => handleGenerate(contextMenu.nodeId, 'video')} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <Video size={16} color="#f59e0b" /> 视频生视频
            </button>
          )}
          <div style={{ height: '1px', background: colors.border, margin: '4px 0' }} />
          <button onClick={() => { saveToHistory(); deleteNode(contextMenu.nodeId); setContextMenu(null); }} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            <Trash2 size={16} /> 删除节点
          </button>
        </div>
      )}

      <NodeConfigPanel
        node={selectedNode}
        onClose={() => { setShowConfigPanel(false); setSelectedNode(null); }}
        onUpdate={updateNode}
        onStar={handleStar}
        onGenerate={handleGenerate}
        onRevertToVersion={handleRevertToVersion}
        isDark={isDark}
        colors={colors}
      />

      <MiniMap
        nodes={nodes}
        canvasOffset={canvasOffset}
        zoom={zoom}
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
        onNavigate={handleMiniMapNavigate}
        isDark={isDark}
        colors={colors}
      />

      <div style={{ position: 'fixed', left: '280px', bottom: '24px', padding: '12px 20px', borderRadius: '12px', background: colors.bgPrimary, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: colors.textMuted }}>
        <span>Space+拖拽平移</span><span>•</span><span>双击画布添加文字</span><span>•</span><span>双击节点连线</span>
      </div>

      {uploadingFiles.length > 0 && (
        <div style={{ position: 'fixed', right: '24px', bottom: '24px', padding: '16px 20px', borderRadius: '16px', background: colors.bgPrimary, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, minWidth: '280px', zIndex: 100 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} color={accentColor} /> 上传中 ({uploadingFiles.length})
          </div>
          {uploadingFiles.map((file, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <span>{Math.round(file.progress)}%</span>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: colors.bgSecondary, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${file.progress}%`, background: `linear-gradient(90deg, ${accentColor}, #a78bfa)`, borderRadius: '2px', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {previewNode && (
        <div onClick={() => setPreviewNode(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer' }}>
          <button onClick={() => setPreviewNode(null)} style={{ position: 'absolute', top: '24px', right: '24px', width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: 'rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', cursor: 'default' }}>
            {previewNode.type === 'image' && previewNode.content.url && (
              <img src={previewNode.content.url} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)' }} />
            )}
            {previewNode.type === 'video' && previewNode.content.url && (
              <video src={previewNode.content.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)' }} />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}