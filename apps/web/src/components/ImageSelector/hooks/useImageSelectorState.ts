import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { CategoryOption, ThreeViewsMode, ImageType } from '../types';

interface UseImageSelectorStateProps {
  value: string | null;
  type: ImageType;
  enableThreeViews: boolean;
  threeViewsMode: ThreeViewsMode;
  characterDescription?: string;
  autoCategoryFilter?: boolean;
}

/**
 * Hook for managing ImageSelector component state
 */
export function useImageSelectorState({
  value,
  type,
  enableThreeViews,
  threeViewsMode,
  characterDescription,
  autoCategoryFilter = true,
}: UseImageSelectorStateProps) {
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'generate' | 'library'>('upload');
  const [showReferenceImagePicker, setShowReferenceImagePicker] = useState(false);
  
  // View State
  const [currentView, setCurrentView] = useState<'front' | 'side' | 'top'>('front');
  const [localThreeViewsMode, setLocalThreeViewsMode] = useState<ThreeViewsMode>(
    threeViewsMode || (enableThreeViews ? 'combined' : 'separate')
  );
  
  // Data State
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  
  // Generation State
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(4);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Computed values
  const shouldUseThreeViews = enableThreeViews || type === 'character';
  const effectiveThreeViewsMode = type === 'character' ? 'combined' : localThreeViewsMode;

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await apiClient.getAssetCategories();
        setCategories(result.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Auto-select category based on type
  useEffect(() => {
    if (autoCategoryFilter && type) {
      const TYPE_TO_CATEGORY: Record<string, string> = {
        character: 'character',
        scene: 'scene',
        general: 'all'
      };
      const category = TYPE_TO_CATEGORY[type] || 'all';
      setSelectedCategory(category);
    }
  }, [type, autoCategoryFilter]);

  // Sync prompt with character description
  useEffect(() => {
    if (characterDescription && !prompt) {
      setPrompt(characterDescription);
    }
  }, [characterDescription, prompt]);

  // Load assets when library tab is opened
  const loadAssets = useCallback(async () => {
    // This will be implemented in useImageSelectorActions
  }, []);

  return {
    // UI State
    showModal,
    setShowModal,
    activeTab,
    setActiveTab,
    showReferenceImagePicker,
    setShowReferenceImagePicker,
    
    // View State
    currentView,
    setCurrentView,
    localThreeViewsMode,
    setLocalThreeViewsMode,
    effectiveThreeViewsMode,
    
    // Data State
    assets,
    setAssets,
    loadingAssets,
    setLoadingAssets,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    showCategoryMenu,
    setShowCategoryMenu,
    editingAssetId,
    setEditingAssetId,
    
    // Generation State
    generating,
    setGenerating,
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    style,
    setStyle,
    selectedModel,
    setSelectedModel,
    referenceImage,
    setReferenceImage,
    generatedImages,
    setGeneratedImages,
    imageCount,
    setImageCount,
    selectedImage,
    setSelectedImage,
    
    // Computed
    shouldUseThreeViews,
    
    // Utilities
    loadAssets,
  };
}
