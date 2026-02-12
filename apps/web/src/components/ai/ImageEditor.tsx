import { useState, useRef } from 'react';
import {
  Brush,
  Eraser,
  Type,
  Crop,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Sliders
} from 'lucide-react';

interface EditHistory {
  id: string;
  action: string;
  data: any;
}

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImage: Blob) => void;
  onClose: () => void;
}

export function ImageEditor({ onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'select' | 'brush' | 'eraser' | 'text' | 'crop'>('select');
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });

  const tools = [
    { id: 'select', icon: <MousePointer className="w-5 h-5" />, label: '选择' },
    { id: 'brush', icon: <Brush className="w-5 h-5" />, label: '画笔' },
    { id: 'eraser', icon: <Eraser className="w-5 h-5" />, label: '橡皮擦' },
    { id: 'text', icon: <Type className="w-5 h-5" />, label: '文字' },
    { id: 'crop', icon: <Crop className="w-5 h-5" />, label: '裁剪' }
  ];

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 25, 400));
  const handleZoomOut = () => setZoom(Math.max(zoom - 25, 25));

  const handleRotateLeft = () => {
    addToHistory('rotate', { angle: -90 });
  };

  const handleRotateRight = () => {
    addToHistory('rotate', { angle: 90 });
  };

  const handleFlipHorizontal = () => {
    addToHistory('flip', { horizontal: true });
  };

  const addToHistory = (action: string, data: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ id: Date.now().toString(), action, data });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/png');
  };

  const handleFilterChange = (key: string, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    addToHistory('filter', { ...filters, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">图片编辑器</h2>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex < 0}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-30"
              title="撤销"
            >
              <Undo className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-30"
              title="重做"
            >
              <Redo className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-700 rounded"
              title="缩小"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <span className="text-white text-sm w-16 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-700 rounded"
              title="放大"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
          </div>

          <button
            onClick={handleRotateLeft}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
            title="左旋转"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleRotateRight}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
            title="右旋转"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleFlipHorizontal}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
            title="水平翻转"
          >
            <FlipHorizontal className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg flex items-center gap-2 ${
              showFilters ? 'bg-blue-500' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Sliders className="w-5 h-5 text-white" />
            <span className="text-white text-sm">滤镜</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            保存
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 bg-gray-900 border-r border-gray-700 p-2 flex flex-col gap-2">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as any)}
              className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                tool === t.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={t.label}
            >
              {t.icon}
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 flex">
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div
              style={{ transform: `scale(${zoom / 100})` }}
              className="transition-transform"
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full shadow-2xl"
              />
            </div>
          </div>

          {showFilters && (
            <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
              <h3 className="text-white font-semibold mb-4">图像调整</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>亮度</span>
                    <span>{filters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.brightness}
                    onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>对比度</span>
                    <span>{filters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.contrast}
                    onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>饱和度</span>
                    <span>{filters.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>模糊</span>
                    <span>{filters.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.blur}
                    onChange={(e) => handleFilterChange('blur', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <h3 className="text-white font-semibold mt-6 mb-4">画笔设置</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>大小</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <span className="text-sm text-gray-400 mb-2 block">颜色</span>
                  <div className="flex gap-2 flex-wrap">
                    {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        className={`w-8 h-8 rounded border-2 ${
                          brushColor === color ? 'border-blue-500' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
