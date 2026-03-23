import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../lib/api';
import type { CategoryOption, ThreeViewsMode, ImageType } from '../types';

interface UseImageSelectorStateProps {
  value: string | null;
  type: ImageType;
  enableThreeViews: boolean;
  threeViewsMode: ThreeViewsMode;
  projectId: string;
  characterDescription?: string;
  autoCategoryFilter?: boolean;
  characterGender?: string;
  characterAge?: number;
  defaultTab?: 'upload' | 'generate' | 'library';
}

/**
 * Hook for managing ImageSelector component state
 */
export function useImageSelectorState({
  value,
  type,
  enableThreeViews,
  threeViewsMode,
  projectId,
  characterDescription,
  autoCategoryFilter = true,
  characterGender,
  characterAge,
  defaultTab = 'upload',
}: UseImageSelectorStateProps) {
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'generate' | 'library'>(defaultTab);
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
  const [imageCount, setImageCount] = useState(1); // 默认 1 张
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 新增状态
  const [gender, setGender] = useState(characterGender || '女'); // 默认女性
  const [age, setAge] = useState(characterAge?.toString() || '');
  const [resolution, setResolution] = useState<'2K' | '3K'>('2K');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [localEnableThreeViews, setLocalEnableThreeViews] = useState(false);
  
  // Computed values
  const shouldUseThreeViews = localEnableThreeViews || type === 'character';
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
  
  // Sync gender and age with character info
  useEffect(() => {
    if (characterGender) {
      setGender(characterGender);
    }
  }, [characterGender]);
  
  useEffect(() => {
    if (characterAge) {
      setAge(characterAge.toString());
    }
  }, [characterAge]);

  // Load assets when library tab is opened
  const loadAssets = useCallback(async () => {
    if (!projectId) {
      setAssets([]);
      return;
    }

    try {
      setLoadingAssets(true);
      const result = await apiClient.getProjectAssets(
        projectId,
        type === 'general' ? undefined : type,
        searchQuery.trim() || undefined,
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setAssets(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  }, [projectId, searchQuery, selectedCategory, type]);

  useEffect(() => {
    if (showModal && activeTab === 'library') {
      void loadAssets();
    }
  }, [showModal, activeTab, loadAssets]);

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
    
    // 新增状态
    gender,
    setGender,
    age,
    setAge,
    resolution,
    setResolution,
    aspectRatio,
    setAspectRatio,
    enableThreeViews: localEnableThreeViews,
    setEnableThreeViews: setLocalEnableThreeViews,
    
    // Computed
    shouldUseThreeViews,
    
    // Utilities
    loadAssets,
  };
}
