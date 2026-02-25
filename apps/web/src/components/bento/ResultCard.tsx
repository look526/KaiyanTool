import React, { useState } from 'react';
import { Download, Heart, Share2, Maximize2, Check } from 'lucide-react';

export interface GeneratedItem {
  id: string;
  url: string;
  prompt: string;
  thumbnail?: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    model?: string;
    createdAt?: string;
  };
  isFavorite?: boolean;
  isDownloading?: boolean;
}

interface ResultCardProps {
  item: GeneratedItem;
  onDownload?: (item: GeneratedItem) => void;
  onFavorite?: (item: GeneratedItem) => void;
  onShare?: (item: GeneratedItem) => void;
  onPreview?: (item: GeneratedItem) => void;
  onSelect?: (item: GeneratedItem) => void;
  isSelected?: boolean;
  animationDelay?: number;
  showMetadata?: boolean;
  className?: string;
}

export function ResultCard({
  item,
  onDownload,
  onFavorite,
  onShare,
  onPreview,
  onSelect,
  isSelected = false,
  animationDelay = 0,
  showMetadata = true,
  className = ''
}: ResultCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(item);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(item);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(item);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(item);
  };

  const handleSelect = () => {
    onSelect?.(item);
  };

  return (
    <div
      className={`
        result-card relative group rounded-xl overflow-hidden
        transition-all duration-300 cursor-pointer
        ${hovered ? 'shadow-lg scale-[1.02]' : 'shadow-md'}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${className}
      `}
      style={{
        animationDelay: `${animationDelay}ms`
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleSelect}
    >
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        <img
          src={item.thumbnail || item.url}
          alt={item.prompt}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        <div
          className={`
            absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
            transition-opacity duration-300 flex items-center justify-center gap-2
          `}
        >
          <button
            onClick={handlePreview}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="预览"
          >
            <Maximize2 className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="下载"
          >
            <Download className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleFavorite}
            className={`
              p-2 rounded-full transition-colors
              ${item.isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 hover:bg-white'
              }
            `}
            title={item.isFavorite ? '取消收藏' : '收藏'}
          >
            <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : 'text-gray-700'}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            title="分享"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {item.isDownloading && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              下载中
            </div>
          </div>
        )}
      </div>

      {showMetadata && (
        <div className="p-3 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
            {item.prompt}
          </p>
          {item.metadata && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {item.metadata.width && item.metadata.height && (
                <span>{item.metadata.width}×{item.metadata.height}</span>
              )}
              {item.metadata.size && (
                <>
                  <span>·</span>
                  <span>{(item.metadata.size / 1024).toFixed(1)}KB</span>
                </>
              )}
              {item.metadata.model && (
                <>
                  <span>·</span>
                  <span>{item.metadata.model}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultCard;
