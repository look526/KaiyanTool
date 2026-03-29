import { useState, useRef, useCallback } from 'react';
import { Upload, Image, Video, Play, X, Star } from 'lucide-react';
import { CanvasNode as CanvasNodeType, CanvasEdge } from '../../types/workspace';
import { CanvasNode } from './CanvasNode';
import { ConnectionLine } from './ConnectionLine';
import { SelectionBox } from './SelectionBox';

const accentColor = '#8b5cf6';

interface CanvasWorkspaceProps {
  nodes: CanvasNodeType[];
  edges: CanvasEdge[];
  selectedNode: CanvasNodeType | null;
  selectedNodes: string[];
  canvasOffset: { x: number; y: number };
  zoom: number;
  isDark: boolean;
  colors: Record<string, string>;
  spacePressed: boolean;
  onNodesUpdate: (nodes: CanvasNodeType[]) => void;
  onNodeSelect: (node: CanvasNodeType | null) => void;
  onNodesSelect: (ids: string[]) => void;
  onShowConfigPanel: () => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onNodeDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onConnect: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export function CanvasWorkspace({
  nodes,
  edges,
  selectedNode,
  selectedNodes,
  canvasOffset,
  zoom,
  isDark,
  colors,
  spacePressed,
  onNodesUpdate,
  onNodeSelect,
  onNodesSelect,
  onShowConfigPanel,
  onContextMenu,
  onNodeDragStart,
  onConnect,
  onDeleteEdge,
}: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  const filteredNodes = nodes;

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (e.button === 0) {
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
    if (isSelecting && selectionBox) {
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
      onNodesSelect(selected);
    }
    setIsSelecting(false);
    setSelectionBox(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setShowUploadZone(false);
  }, []);

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setShowUploadZone(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setShowUploadZone(false); }}
      onClick={() => { onNodeSelect(null); onNodesSelect([]); }}
      style={{
        position: 'absolute',
        top: '64px',
        left: '256px',
        right: 0,
        bottom: 0,
        background: isDark
          ? 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.03) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
        backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
        cursor: spacePressed ? 'grab' : isSelecting ? 'crosshair' : 'default',
      }}
    >
      {showUploadZone && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `${accentColor}20`,
          border: `2px dashed ${accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            padding: '32px 48px',
            borderRadius: '24px',
            background: colors.bgPrimary,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Upload size={48} color={accentColor} />
            <span style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary }}>
              拖放文件到此处上传
            </span>
          </div>
        </div>
      )}

      <SelectionBox selectionBox={selectionBox} />

      <ConnectionLine edges={edges} nodes={filteredNodes} onDeleteEdge={onDeleteEdge} />

      {filteredNodes.map(node => (
        <CanvasNode
          key={node.id}
          node={node}
          isSelected={selectedNodes.includes(node.id) || selectedNode?.id === node.id}
          isMultiSelected={selectedNodes.length > 1}
          zoom={zoom}
          onSelect={() => { onNodeSelect(node); onShowConfigPanel(); }}
          onDragStart={(e) => onNodeDragStart(node.id, e)}
          onDoubleClick={() => onConnect(node.id)}
          onContextMenu={(e) => onContextMenu(e, node.id)}
          isDark={isDark}
        />
      ))}
    </div>
  );
}
