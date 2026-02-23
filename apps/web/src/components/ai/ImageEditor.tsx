import { useState, useRef, useEffect } from 'react';
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
  Sliders,
  Square
} from 'lucide-react';

interface EditHistory {
  id: string;
  action: string;
  data: any;
  imageData?: ImageData;
}

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImage: Blob) => void;
  onClose: () => void;
}

export function ImageEditor({ imageUrl, onSave, onClose }: ImageEditorProps) {
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [textToAdd, setTextToAdd] = useState('');

  const ctx = canvasRef.current?.getContext('2d');
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);

  const tools = [
    { id: 'select', icon: <MousePointer className="w-5 h-5" />, label: '选择' },
    { id: 'brush', icon: <Brush className="w-5 h-5" />, label: '画笔' },
    { id: 'eraser', icon: <Eraser className="w-5 h-5" />, label: '橡皮擦' },
    { id: 'text', icon: <Type className="w-5 h-5" />, label: '文字' },
    { id: 'crop', icon: <Crop className="w-5 h-5" />, label: '裁剪' }
  ];

  useEffect(() => {
    loadImage();
  }, [imageUrl]);

  const loadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setImageLoaded(true);
        saveToHistory('load', {});
      }
    };
    img.onerror = () => {
      console.error('Failed to load image');
    };
    img.src = imageUrl;
  };

  const saveToHistory = (action: string, data: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ id: Date.now().toString(), action, data, imageData });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const restoreFromHistory = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const historyItem = history[index];
    if (historyItem?.imageData) {
      ctx.putImageData(historyItem.imageData, 0, 0);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreFromHistory(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreFromHistory(newIndex);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 25, 400));
  const handleZoomOut = () => setZoom(Math.max(zoom - 25, 25));

  const applyFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const brightnessFactor = filters.brightness / 100;
    const contrastFactor = (filters.contrast - 100) / 100;
    const saturationFactor = filters.saturation / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      r = r * brightnessFactor;
      g = g * brightnessFactor;
      b = b * brightnessFactor;

      r = ((r - 128) * contrastFactor + 128);
      g = ((g - 128) * contrastFactor + 128);
      b = ((b - 128) * contrastFactor + 128);

      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + saturationFactor * (r - gray);
      g = gray + saturationFactor * (g - gray);
      b = gray + saturationFactor * (b - gray);

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imageData, 0, 0);

    if (filters.blur > 0) {
      applyBlur(filters.blur);
    }
  };

  const applyBlur = (blurAmount: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = `blur(${blurAmount}px)`;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0);
    }
    ctx.filter = 'none';
  };

  const handleRotateLeft = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate(-Math.PI / 2);
      tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      canvas.width = tempCanvas.width;
      canvas.height = tempCanvas.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(tempCanvas, 0, 0);
        saveToHistory('rotate', { angle: -90 });
      }
    }
  };

  const handleRotateRight = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate(Math.PI / 2);
      tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      canvas.width = tempCanvas.width;
      canvas.height = tempCanvas.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(tempCanvas, 0, 0);
        saveToHistory('rotate', { angle: 90 });
      }
    }
  };

  const handleFlipHorizontal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    saveToHistory('flip', { horizontal: true });
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const pos = getCanvasCoordinates(e);

    if (tool === 'crop') {
      setCropStart(pos);
      setCropEnd(pos);
      return;
    }

    if (tool === 'text') {
      const text = prompt('请输入文字:');
      if (text) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = `${brushSize * 2}px Arial`;
          ctx.fillStyle = brushColor;
          ctx.fillText(text, pos.x, pos.y);
          saveToHistory('text', { text, x: pos.x, y: pos.y });
        }
      }
      return;
    }

    if (tool === 'brush' || tool === 'eraser') {
      setIsDrawing(true);
      setLastPosition(pos);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const pos = getCanvasCoordinates(e);

    if (tool === 'crop' && cropStart) {
      setCropEnd(pos);
      return;
    }

    if ((tool === 'brush' || tool === 'eraser') && isDrawing && lastPosition) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        setLastPosition(pos);
      }
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPosition(null);
      saveToHistory('draw', { tool, brushSize, brushColor });
    }

    if (tool === 'crop' && cropStart && cropEnd) {
      handleCrop();
    }
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !cropStart || !cropEnd) return;

    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    if (width < 10 || height < 10) {
      setCropStart(null);
      setCropEnd(null);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const croppedData = ctx.getImageData(x, y, width, height);
      canvas.width = width;
      canvas.height = height;
      ctx.putImageData(croppedData, 0, 0);
      saveToHistory('crop', { x, y, width, height });
      setCropStart(null);
      setCropEnd(null);
      setTool('select');
    }
  };

  const handleFilterChange = (key: string, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    applyFilters();
    saveToHistory('filter', { ...filters, [key]: value });
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

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0
    });
    loadImage();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">图片编辑器</h2>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
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
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-gray-950">
            <div
              style={{ transform: `scale(${zoom / 100})` }}
              className="transition-transform relative"
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full shadow-2xl cursor-crosshair"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={() => setIsDrawing(false)}
              />
              {cropStart && cropEnd && tool === 'crop' && (
                <div
                  className="absolute border-2 border-blue-500 border-dashed pointer-events-none"
                  style={{
                    left: Math.min(cropStart.x, cropEnd.x),
                    top: Math.min(cropStart.y, cropEnd.y),
                    width: Math.abs(cropEnd.x - cropStart.x),
                    height: Math.abs(cropEnd.y - cropStart.y)
                  }}
                />
              )}
            </div>
          </div>

          {showFilters && (
            <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">图像调整</h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  重置
                </button>
              </div>

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

              <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                <h4 className="text-white text-sm font-semibold mb-2">使用提示</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• 画笔/橡皮擦：在画布上拖动</li>
                  <li>• 文字：点击画布输入文字</li>
                  <li>• 裁剪：拖动选择区域</li>
                  <li>• 使用撤销/重做回退操作</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
