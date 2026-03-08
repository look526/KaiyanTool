import React from 'react';
import { Search, Filter, Loader2, Images, Tag } from 'lucide-react';
import { Button } from '../../design-system';
import type { Asset, CategoryOption } from './types';

interface ImageSelectorLibraryProps {
  projectId: string;
  state: any;
  actions: any;
  showReferenceImagePicker: boolean;
  shouldUseThreeViews: boolean;
  type: 'character' | 'scene' | 'general';
  currentView: 'front' | 'side' | 'top';
  threeViewsValue: { front: string | null; side: string | null; top: string | null };
  onThreeViewsChange?: (views: { front: string | null; side: string | null; top: string | null }) => void;
  onChange: (url: string | null) => void;
  onClose: () => void;
}

/**
 * Library tab for ImageSelector - Browse project assets
 */
export function ImageSelectorLibrary({
  projectId,
  state,
  actions,
  showReferenceImagePicker,
  shouldUseThreeViews,
  type,
  currentView,
}: ImageSelectorLibraryProps) {
  const {
    assets,
    loadingAssets,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showCategoryMenu,
    setShowCategoryMenu,
    categories,
    editingAssetId,
    setEditingAssetId,
  } = state;

  const {
    handleSelectAsset,
    handleUpdateAssetCategory,
    handleDeleteAsset,
  } = actions;

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索素材..."
            className="w-full p-2.5 pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-primary-900 dark:text-primary-100 text-sm"
          />
        </div>
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          categories={categories}
          showCategoryMenu={showCategoryMenu}
          onToggle={() => setShowCategoryMenu(!showCategoryMenu)}
          onSelect={(category) => {
            setSelectedCategory(category);
            setShowCategoryMenu(false);
          }}
        />
        
        <Button onClick={() => {}} variant="outline" size="sm">
          刷新
        </Button>
      </div>

      {/* Assets Grid */}
      {loadingAssets ? (
        <LoadingState />
      ) : assets.length === 0 ? (
        <EmptyState />
      ) : (
        <AssetsGrid
          assets={assets}
          editingAssetId={editingAssetId}
          categories={categories}
          shouldUseThreeViews={shouldUseThreeViews}
          type={type}
          currentView={currentView}
          onSelect={(asset) => handleSelectAsset(asset)}
          onEditCategory={(assetId) => setEditingAssetId(editingAssetId === assetId ? null : assetId)}
          onUpdateCategory={handleUpdateAssetCategory}
          onDelete={handleDeleteAsset}
        />
      )}
    </div>
  );
}

// Sub-components

function CategoryFilter({
  selectedCategory,
  categories,
  showCategoryMenu,
  onToggle,
  onSelect,
}: {
  selectedCategory: string;
  categories: CategoryOption[];
  showCategoryMenu: boolean;
  onToggle: () => void;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="relative">
      <button onClick={onToggle} className="flex items-center gap-1.5 p-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-primary-900 dark:text-primary-100 text-sm cursor-pointer whitespace-nowrap">
        <Filter className="w-4 h-4" />
        {selectedCategory === 'all' ? '全部分类' : categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
      </button>
      
      {showCategoryMenu && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-[150px] overflow-hidden">
          <button
            onClick={() => onSelect('all')}
            className={`block w-full p-2.5 text-left text-sm cursor-pointer ${selectedCategory === 'all' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-primary-900 dark:text-primary-100'}`}
          >
            全部分类
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelect(cat.value)}
              className={`block w-full p-2.5 text-left text-sm cursor-pointer ${selectedCategory === cat.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-primary-900 dark:text-primary-100'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-10">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center p-10 text-gray-500 dark:text-gray-400">
      <Images className="w-12 h-12 mb-3 opacity-50" />
      <p>暂无素材</p>
    </div>
  );
}

function AssetsGrid({
  assets,
  editingAssetId,
  categories,
  shouldUseThreeViews,
  type,
  currentView,
  onSelect,
  onEditCategory,
  onUpdateCategory,
  onDelete,
}: {
  assets: Asset[];
  editingAssetId: string | null;
  categories: CategoryOption[];
  shouldUseThreeViews: boolean;
  type: string;
  currentView: string;
  onSelect: (asset: Asset) => void;
  onEditCategory: (assetId: string) => void;
  onUpdateCategory: (assetId: string, category: string) => void;
  onDelete: (assetId: string) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
      {assets.map((asset) => (
        <div key={asset.id} className="relative">
          <button
            onClick={() => onSelect(asset)}
            className="relative w-full aspect-square rounded-md overflow-hidden border-2 border-transparent cursor-pointer p-0 bg-transparent transition-all duration-200"
          >
            <img
              src={asset.thumbnailUrl || asset.url}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          </button>
          
          {asset.categoryLabel && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onEditCategory(asset.id);
              }}
              className="absolute bottom-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-xs bg-black/60 cursor-pointer"
            >
              <Tag className="w-2.5 h-2.5" />
              {asset.categoryLabel}
            </div>
          )}
          
          {editingAssetId === asset.id && (
            <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-20 min-w-[120px] overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onUpdateCategory(asset.id, cat.value)}
                  className={`block w-full px-3 py-2 text-left text-xs cursor-pointer ${asset.category === cat.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-primary-900 dark:text-primary-100'}`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                onClick={() => onDelete(asset.id)}
                className="block w-full px-3 py-2 border-t border-gray-300 dark:border-gray-700 text-left text-xs text-red-500 cursor-pointer"
              >
                删除素材
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
