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
