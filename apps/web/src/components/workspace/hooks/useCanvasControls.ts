import { useState, useCallback, useRef } from 'react';
import { useWorkspaceStore } from '../../../store/workspace-store';

export function useCanvasControls() {
  const { canvasOffset, zoom, setCanvasOffset, setZoom } = useWorkspaceStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
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
    setZoom(zoom + 0.1);
  }, [zoom, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(zoom - 0.1);
  }, [zoom, setZoom]);

  const resetView = useCallback(() => {
    setCanvasOffset({ x: 0, y: 0 });
    setZoom(1);
  }, [setCanvasOffset, setZoom]);

  const zoomTo = useCallback((newZoom: number, centerX?: number, centerY?: number) => {
    if (centerX !== undefined && centerY !== undefined) {
      const canvasWidth = window.innerWidth - 256;
      const canvasHeight = window.innerHeight - 64;
      const scale = newZoom / zoom;
      const newOffsetX = centerX - (centerX - canvasOffset.x) * scale;
      const newOffsetY = centerY - (centerY - canvasOffset.y) * scale;
      setCanvasOffset({ x: newOffsetX, y: newOffsetY });
    }
    setZoom(newZoom);
  }, [zoom, canvasOffset, setCanvasOffset, setZoom]);

  return {
    isDragging,
    startDrag,
    updateDrag,
    endDrag,
    zoomIn,
    zoomOut,
    resetView,
    zoomTo,
  };
}
