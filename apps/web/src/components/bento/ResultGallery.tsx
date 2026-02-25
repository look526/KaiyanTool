import React, { useState, useCallback } from 'react';
import { BentoCardLarge } from './BentoCardLarge';
import { ResultCard, GeneratedItem } from './ResultCard';
import { Grid, List, Filter, Search, SortAsc, RefreshCw, Loader2 } from 'lucide-react';

export type ViewMode = 'grid' | 'list';
export type SortOrder = 'newest' | 'oldest' | 'size';

interface ResultGalleryProps {
  results: GeneratedItem[];
  onLoadMore?: () => void;
  onDownload?: (item: GeneratedItem) => void;
  onFavorite?: (item: GeneratedItem) => void;
  onShare?: (item: GeneratedItem) => void;
  onPreview?: (item: GeneratedItem) => void;
  onRefresh?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  viewMode?: ViewMode;
  showMetadata?: boolean;
  className?: string;
}

export function ResultGallery({
  results,
  onLoadMore,
  onDownload,
  onFavorite,
  onShare,
  onPreview,
  onRefresh,
  loading = false,
  hasMore = false,
  viewMode = 'grid',
  showMetadata = true,
  className = ''
}: ResultGalleryProps) {
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const handleSelectItem = useCallback((item: GeneratedItem) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedItems.size === filteredResults.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredResults.map(item => item.id)));
    }
  };

  const handleDownloadSelected = () => {
    selectedItems.forEach(id => {
      const item = filteredResults.find(r => r.id === id);
      if (item) {
        onDownload?.(item);
      }
    });
  };

  const handleFavoriteSelected = () => {
    selectedItems.forEach(id => {
      const item = filteredResults.find(r => r.id === id);
      if (item) {
        onFavorite?.(item);
      }
    });
  };

  const filteredResults = results.filter(item => {
    const matchesSearch = !searchQuery || 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterFavorites || item.isFavorite;
    return matchesSearch && matchesFilter;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return (b.metadata?.createdAt || '').localeCompare(a.metadata?.createdAt || '');
      case 'oldest':
        return (a.metadata?.createdAt || '').localeCompare(b.metadata?.createdAt || '');
      case 'size':
        return (b.metadata?.size || 0) - (a.metadata?.size || 0);
      default:
        return 0;
    }
  });

  return (
    <BentoCardLarge className={`result-gallery ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">生成结果</h3>
          <span className="text-sm text-gray-500">({results.length})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setCurrentViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                currentViewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : ''
              }`}
              title="网格视图"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                currentViewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : ''
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索提示词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={`px-3 py-2 rounded-lg transition-colors ${
            filterFavorites 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {filterFavorites ? '已收藏' : '全部'}
        </button>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="size">大小</option>
        </select>
      </div>

      {selectedItems.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
          <span className="text-sm">已选择 {selectedItems.size} 项</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSelected}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              下载选中
            </button>
            <button
              onClick={handleFavoriteSelected}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              收藏选中
            </button>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      {loading && results.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : sortedResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Grid className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium mb-2">暂无生成结果</p>
          <p className="text-sm">输入描述并点击生成按钮开始创作</p>
        </div>
      ) : (
        <>
          <div
            className={`
              ${currentViewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4' 
                : 'space-y-3'
              }
            `}
          >
            {sortedResults.map((item, index) => (
              <ResultCard
                key={item.id}
                item={item}
                onDownload={onDownload}
                onFavorite={onFavorite}
                onShare={onShare}
                onPreview={onPreview}
                onSelect={handleSelectItem}
                isSelected={selectedItems.has(item.id)}
                animationDelay={index * 50}
                showMetadata={showMetadata}
                className={currentViewMode === 'list' ? 'flex-row' : ''}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  '加载更多'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </BentoCardLarge>
  );
}

export default ResultGallery;
