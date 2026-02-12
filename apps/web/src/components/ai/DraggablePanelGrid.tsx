import React, { useState, useCallback } from 'react';
import { GripVertical, Trash2, RefreshCw, Wand2 } from 'lucide-react';

interface PanelItem {
  id: string;
  position: number;
  prompt: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

interface DraggablePanelGridProps {
  panels: PanelItem[];
  onPanelsChange: (panels: PanelItem[]) => void;
  onGenerate: (panelId: string) => void;
  onDelete: (panelId: string) => void;
}

export function DraggablePanelGrid({ panels, onPanelsChange, onGenerate, onDelete }: DraggablePanelGridProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, panelId: string) => {
    setDraggedItem(panelId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    setDragOverItem(panelId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = panels.findIndex(p => p.id === draggedItem);
    const targetIndex = panels.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPanels = [...panels];
    const [removed] = newPanels.splice(draggedIndex, 1);
    newPanels.splice(targetIndex, 0, removed);

    const reorderedPanels = newPanels.map((panel, index) => ({
      ...panel,
      position: index + 1
    }));

    onPanelsChange(reorderedPanels);
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, panels, onPanelsChange]);

  const handleBulkGenerate = async () => {
    const pendingPanels = panels.filter(p => p.status === 'pending');
    for (const panel of pendingPanels) {
      await onGenerate(panel.id);
    }
  };

  const handleResetOrder = () => {
    const resetPanels = panels.map((panel, index) => ({
      ...panel,
      position: index + 1
    }));
    onPanelsChange(resetPanels);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">九宫格面板 ({panels.length}个)</h3>
        <div className="flex gap-2">
          <button
            onClick={handleResetOrder}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重置顺序
          </button>
          <button
            onClick={handleBulkGenerate}
            className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            批量生成
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {panels.map((panel) => (
          <div
            key={panel.id}
            draggable
            onDragStart={(e) => handleDragStart(e, panel.id)}
            onDragEnter={(e) => handleDragEnter(e, panel.id)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, panel.id)}
            className={`
              relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-move
              transition-all duration-200
              ${draggedItem === panel.id ? 'opacity-50 scale-95' : ''}
              ${dragOverItem === panel.id && draggedItem !== panel.id ? 'ring-2 ring-blue-500' : ''}
              hover:ring-2 hover:ring-blue-400
            `}
          >
            <div className="absolute top-1 left-1 z-10">
              <div className="flex items-center gap-1">
                <div className="p-1 bg-black/40 rounded cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3 h-3 text-white" />
                </div>
                <span className="px-1.5 py-0.5 bg-black/40 rounded text-xs text-white font-medium">
                  {panel.position}
                </span>
              </div>
            </div>

            {panel.imageUrl ? (
              <img src={panel.imageUrl} alt={`Panel ${panel.position}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xs">等待生成</span>
              </div>
            )}

            <div className="absolute top-1 right-1 z-10">
              {panel.status === 'completed' && (
                <span className="px-1.5 py-0.5 bg-green-500 rounded text-xs text-white">完成</span>
              )}
              {panel.status === 'generating' && (
                <span className="px-1.5 py-0.5 bg-blue-500 rounded text-xs text-white animate-pulse">生成中</span>
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-between p-2">
              <button
                onClick={() => onGenerate(panel.id)}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
              >
                生成
              </button>
              <button
                onClick={() => onDelete(panel.id)}
                className="p-1 bg-red-500/70 hover:bg-red-500 text-white rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <input
                type="text"
                value={panel.prompt}
                readOnly
                className="w-full px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50 truncate"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>💡 提示：拖拽面板可以调整顺序</span>
        <span>•</span>
        <span>点击面板可查看大图</span>
      </div>
    </div>
  );
}

export function SortableList<T extends { id: string }>({
  items,
  renderItem,
  onItemsChange,
  itemKey = 'id'
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemsChange: (items: T[]) => void;
  itemKey?: keyof T;
}) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverItem(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = items.findIndex(item => String(item[itemKey]) === draggedItem);
    const targetIndex = items.findIndex(item => String(item[itemKey]) === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    onItemsChange(newItems);
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, items, onItemsChange, itemKey]);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={String(item[itemKey])}
          draggable
          onDragStart={(e) => handleDragStart(e, String(item[itemKey]))}
          onDragEnter={(e) => handleDragEnter(e, String(item[itemKey]))}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, String(item[itemKey]))}
          className={`
            cursor-move transition-all
            ${draggedItem === String(item[itemKey]) ? 'opacity-50' : ''}
            ${dragOverItem === String(item[itemKey]) && draggedItem !== String(item[itemKey]) ? 'ring-2 ring-blue-500 rounded-lg' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
              <GripVertical className="w-4 h-4" />
            </div>
            {renderItem(item, index)}
          </div>
        </div>
      ))}
    </div>
  );
}
