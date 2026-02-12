import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Crop,
  Download,
  Share2,
  Info,
  X,
  Maximize2,
  Minimize2,
  Grid,
  Layers,
  Eye,
  EyeOff,
  Compare,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  title?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    generatedAt?: string;
    prompt?: string;
  };
  comparisonSrc?: string;
  onClose?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function ImagePreview({
  src,
  alt = 'Preview',
  title,
  metadata,
  comparisonSrc,
  onClose,
  onDownload,
  onShare
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          if (compareMode) setCompareMode(false);
          break;
        case '+':
        case '=':
          setZoom(z => Math.min(z + 10, 500));
          break;
        case '-':
          setZoom(z => Math.max(z - 10, 10));
          break;
        case 'ArrowLeft':
          if (comparisonSrc) setCompareMode(true);
          break;
        case 'ArrowRight':
          if (comparisonSrc) setCompareMode(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, comparisonSrc]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(z => Math.max(10, Math.min(500, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      isDragging.current = true;
      lastPosition.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setPanPosition({
        x: e.clientX - lastPosition.current.x,
        y: e.clientY - lastPosition.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const ImageContent = () => (
    <div
      className="relative overflow-hidden"
      style={{
        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        cursor: zoom > 100 ? 'grab' : 'default'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative"
        style={{
          transform: zoom > 100 ? `translate(${panPosition.x}px, ${panPosition.y}px)` : undefined
        }}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[70vh] object-contain"
        />

        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black/95 z-50 flex flex-col ${
        isFullscreen ? '' : 'rounded-xl m-4'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-white font-medium">{title}</h3>}
          <span className="text-sm text-gray-400">{zoom}%</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(z - 10, 10))}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(z + 10, 500))}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={resetView}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="重置视图"
          >
            <Maximize2 className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="旋转"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors ${
              showGrid ? 'bg-blue-500' : 'hover:bg-gray-800'
            }`}
            title="显示网格"
          >
            <Grid className="w-5 h-5 text-white" />
          </button>
          {comparisonSrc && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`p-2 rounded-lg transition-colors ${
                compareMode ? 'bg-blue-500' : 'hover:bg-gray-800'
              }`}
              title="对比模式"
            >
              <Compare className="w-5 h-5 text-white" />
            </button>
          )}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-lg transition-colors ${
              showMetadata ? 'bg-blue-500' : 'hover:bg-gray-800'
            }`}
            title="显示信息"
          >
            <Info className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-white" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white" />
            )}
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="下载"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="分享"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="关闭"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {compareMode && comparisonSrc ? (
            <div className="grid grid-cols-2 gap-4 w-full h-full">
              <div className="relative">
                <span className="absolute top-2 left-2 text-xs bg-black/50 px-2 py-1 rounded text-white">
                  当前
                </span>
                <img src={src} alt="Current" className="max-w-full max-h-full object-contain mx-auto" />
              </div>
              <div className="relative">
                <span className="absolute top-2 left-2 text-xs bg-black/50 px-2 py-1 rounded text-white">
                  对比
                </span>
                <img src={comparisonSrc} alt="Comparison" className="max-w-full max-h-full object-contain mx-auto" />
              </div>
            </div>
          ) : (
            <ImageContent />
          )}
        </div>

        {showMetadata && metadata && (
          <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
            <h4 className="text-white font-medium mb-4">图像信息</h4>

            <div className="space-y-3">
              {metadata.width && metadata.height && (
                <div className="flex justify-between">
                  <span className="text-gray-400">尺寸</span>
                  <span className="text-white">{metadata.width} × {metadata.height}</span>
                </div>
              )}
              {metadata.format && (
                <div className="flex justify-between">
                  <span className="text-gray-400">格式</span>
                  <span className="text-white">{metadata.format.toUpperCase()}</span>
                </div>
              )}
              {metadata.size && (
                <div className="flex justify-between">
                  <span className="text-gray-400">大小</span>
                  <span className="text-white">{formatFileSize(metadata.size)}</span>
                </div>
              )}
              {metadata.generatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">生成时间</span>
                  <span className="text-white text-sm">{formatDate(metadata.generatedAt)}</span>
                </div>
              )}
            </div>

            {metadata.prompt && (
              <div className="mt-4">
                <h5 className="text-gray-400 text-sm mb-2">提示词</h5>
                <p className="text-white text-sm bg-gray-800 p-2 rounded">
                  {metadata.prompt}
                </p>
              </div>
            )}

            {comparisonSrc && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  按 ← → 键切换对比视图
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-2 bg-gray-900 border-t border-gray-700 text-center">
        <span className="text-xs text-gray-400">
          滚轮缩放 • 拖拽移动 • 按 ESC 退出
        </span>
      </div>
    </div>
  );
}

export function ImageComparisonSlider({
  beforeSrc,
  afterSrc,
  alt = 'Comparison'
}: {
  beforeSrc: string;
  afterSrc: string;
  alt?: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 select-none overflow-hidden cursor-ew-resize"
      onMouseDown={(e) => {
        isDragging.current = true;
        handleMove(e.clientX);
      }}
      onMouseMove={(e) => {
        if (isDragging.current) handleMove(e.clientX);
      }}
      onMouseUp={() => isDragging.current = false}
      onMouseLeave={() => isDragging.current = false}
    >
      <img
        src={afterSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth }}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
          <ArrowRight className="w-4 h-4 -ml-4" />
        </div>
      </div>

      <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded text-white">
        处理前
      </span>
      <span className="absolute bottom-2 right-2 text-xs bg-black/50 px-2 py-1 rounded text-white">
        处理后
      </span>
    </div>
  );
}
