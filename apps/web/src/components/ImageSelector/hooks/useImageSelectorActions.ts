import { useCallback } from 'react';
import { apiClient } from '../../../lib/api';
import { useToast, type ToastContextType } from '../../ui/Toast';
import { 
  getFullUrl, 
  getStylePrompt, 
  getNegativePrompt, 
  getThreeViewsPrompt,
  getStyleName 
} from '../utils/imageUtils';

interface UseImageSelectorActionsProps {
  projectId: string;
  type: 'character' | 'scene' | 'general';
  maxSize: number;
  disabled: boolean;
  value: string | null;
  onChange: (url: string | null) => void;
  threeViewsValue: { front: string | null; side: string | null; top: string | null };
  onThreeViewsChange?: (views: { front: string | null; side: string | null; top: string | null }) => void;
  shouldUseThreeViews: boolean;
  effectiveThreeViewsMode: 'separate' | 'combined';
  currentView: 'front' | 'side' | 'top';
  activeTab: string;
  prompt: string;
  selectedModel: string | undefined;
  style: string;
  negativePrompt: string;
  referenceImage: string | null;
  imageCount: number;
  selectedCategory: string;
  // 新增状态
  gender: string;
  age: string;
  resolution: '2K' | '3K';
  aspectRatio: string;
  enableThreeViews: boolean;
  // Setter 函数
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (image: string | null) => void;
  setGenerating: (generating: boolean) => void;
  setPrompt: (prompt: string) => void;
  setSelectedModel: (model: string | null) => void;
  setReferenceImage: (url: string | null) => void;
  setStyle: (style: string) => void;
  setNegativePrompt: (prompt: string) => void;
  setImageCount: (count: number) => void;
  setLocalThreeViewsMode: (mode: 'separate' | 'combined') => void;
  setCurrentView: (view: 'front' | 'side' | 'top') => void;
  setGender: (gender: string) => void;
  setAge: (age: string) => void;
  setResolution: (resolution: '2K' | '3K') => void;
  setAspectRatio: (ratio: string) => void;
  setEnableThreeViews: (enabled: boolean) => void;
  loadAssets: () => Promise<void>;
  addToast: ToastContextType['addToast'];
}

/**
 * Hook for managing ImageSelector actions and handlers
 */
export function useImageSelectorActions({
  projectId,
  type,
  maxSize,
  disabled,
  value,
  onChange,
  threeViewsValue,
  onThreeViewsChange,
  shouldUseThreeViews,
  effectiveThreeViewsMode,
  currentView,
  activeTab,
  prompt,
  selectedModel,
  style,
  negativePrompt,
  referenceImage,
  imageCount,
  selectedCategory,
  gender,
  age,
  resolution,
  aspectRatio,
  enableThreeViews,
  setGeneratedImages,
  setSelectedImage,
  setGenerating,
  setPrompt,
  setSelectedModel,
  setReferenceImage,
  setStyle,
  setNegativePrompt,
  setImageCount,
  setLocalThreeViewsMode,
  setCurrentView,
  setGender,
  setAge,
  setResolution,
  setAspectRatio,
  setEnableThreeViews,
  loadAssets,
  addToast,
}: UseImageSelectorActionsProps) {
  
  /**
   * Handle image upload
   */
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      addToast({
        type: 'error',
        title: '文件过大',
        message: `文件大小不能超过 ${maxSize}MB`,
      });
      return;
    }

    try {
      const result = await apiClient.uploadImage(file, projectId);
      onChange(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
      addToast({
        type: 'error',
        title: '上传失败',
        message: '请稍后重试',
      });
    }
  }, [projectId, maxSize, onChange, addToast]);

  /**
   * Handle AI image generation
   */
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      addToast({
        type: 'error',
        title: '请输入提示词',
        message: '提示词不能为空',
      });
      return;
    }

    if (!selectedModel) {
      addToast({
        type: 'error',
        title: '请选择模型',
        message: '请先选择一个 AI 图像生成模型',
      });
      return;
    }

    setGenerating(true);
    setGeneratedImages([]); // 清空之前的生成结果
    try {
      // 构建完整提示词：性别 + 年龄 + 外貌描述
      const buildFullPrompt = () => {
        const parts = [];
        
        // 性别（必填）
        if (gender) {
          parts.push(gender);
        }
        
        // 年龄（可选）
        if (age && age.trim() !== '') {
          parts.push(`${age}岁`);
        }
        
        // 外貌描述（必填）
        if (prompt) {
          parts.push(prompt);
        }
        
        return parts.join(',');
      };
      
      const fullPrompt = buildFullPrompt();
      const stylePrompt = getStylePrompt(fullPrompt, style);
      
      // 根据宽高比计算实际尺寸
      const getDimensions = () => {
        const [width, height] = aspectRatio.split(':').map(Number);
        const baseSize = width === height ? 1024 : (width > height ? 1920 : 1080);
        return {
          width: Math.round(baseSize * (width / height)),
          height: baseSize,
        };
      };
      
      const { width, height } = getDimensions();
      
      const referenceImageUrl = referenceImage
        ? getFullUrl(referenceImage) ?? undefined
        : undefined;

      if (true) { // eslint-disable-line no-constant-condition
        const results = await apiClient.batchGenerateImages({
          prompt: stylePrompt,
          count: imageCount,
          style: style,
          negativePrompt: getNegativePrompt(style),
          width,
          height,
          resolution,
          providerId: selectedModel,
          projectId,
          referenceImageUrl,
          three_view: enableThreeViews,
        });
        
        console.log('[DEBUG] Batch results:', results);
        console.log('[DEBUG] Results assets:', results.assets);
        
        if (!results.assets || results.assets.length === 0) {
          console.error('[DEBUG] No assets returned!');
          addToast({
            type: 'error',
            title: '生成失败',
            message: '未返回任何图片',
          });
          setGenerating(false);
          return;
        }
        
        const imageUrls = results.assets.map((asset: any) => asset.url);
        
        setGeneratedImages(imageUrls);
        setSelectedImage(null);
        await loadAssets();
        addToast({
          type: 'success',
          title: '生成成功',
          message: `已生成 ${imageUrls.length} 张图片，请选择满意的结果`,
        });
      } else {
        // Single generation mode
        let finalPrompt = stylePrompt;
        
        if (shouldUseThreeViews) {
          finalPrompt = getThreeViewsPrompt(finalPrompt, style);
        }
        
        const result = await apiClient.generateImage({
          prompt: prompt.trim(),
          negativePrompt: getNegativePrompt(style),
          width: shouldUseThreeViews ? 1920 : 1024,
          height: shouldUseThreeViews ? 1080 : 1024,
          style: style,
          projectId,
          category: type === 'character' ? 'character' : type === 'scene' ? 'scene' : 'general',
          model: selectedModel,
          image_urls: referenceImage ? [getFullUrl(referenceImage)].filter((url): url is string => url !== null) : undefined,
          threeView: shouldUseThreeViews,
        });
        
        if (result.asset?.url) {
          if (type === 'character' && shouldUseThreeViews) {
            setGeneratedImages([result.asset.url]);
            setSelectedImage(result.asset.url);
            addToast({
              type: 'success',
              title: '生成成功',
              message: '请选择生成结果',
            });
          } else if (shouldUseThreeViews) {
            if (effectiveThreeViewsMode === 'combined') {
              onChange(result.asset.url);
            }
          } else {
            onChange(result.asset.url);
          }
          await loadAssets();
          addToast({
            type: 'success',
            title: '生成成功',
            message: `${getStyleName(style)}风格图片已生成`,
          });
        } else {
          addToast({
            type: 'error',
            title: '生成失败',
            message: '生成成功但没有返回图片，请稍后重试',
          });
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      addToast({
        type: 'error',
        title: '生成失败',
        message: '请稍后重试',
      });
    } finally {
      setGenerating(false);
    }
  }, [
    prompt, selectedModel, style, imageCount, shouldUseThreeViews, 
    effectiveThreeViewsMode, type, referenceImage, projectId,
    gender, age, resolution, aspectRatio, enableThreeViews,
    setGenerating, setGeneratedImages, setSelectedImage, loadAssets, addToast, onChange
  ]);

  /**
   * Handle selecting a generated image
   */
  const handleSelectGeneratedImage = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (!shouldUseThreeViews) {
      onChange(imageUrl);
    }
    addToast({
      type: 'success',
      title: '选择成功',
      message: '图片已选择',
    });
  }, [shouldUseThreeViews, onChange, setSelectedImage, addToast]);

  /**
   * Handle three-view selection
   */
  const handleThreeViewsSelect = useCallback((view: 'front' | 'side' | 'top', imageUrl: string) => {
    if (onThreeViewsChange) {
      onThreeViewsChange({
        ...threeViewsValue,
        [view]: imageUrl
      });
    }
  }, [threeViewsValue, onThreeViewsChange]);

  /**
   * Handle three-view removal
   */
  const handleThreeViewsRemove = useCallback((view: 'front' | 'side' | 'top') => {
    if (onThreeViewsChange) {
      onThreeViewsChange({
        ...threeViewsValue,
        [view]: null
      });
    }
  }, [threeViewsValue, onThreeViewsChange]);

  /**
   * Handle view selection for three-view mode
   */
  const handleViewSelect = useCallback((view: 'front' | 'side' | 'top') => {
    // This would trigger opening the modal
    // Implementation depends on parent component state
  }, []);

  /**
   * Handle removing selected image
   */
  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  /**
   * Handle selecting asset from library
   */
  const handleSelectAsset = useCallback((asset: any) => {
    if (activeTab === 'library') {
      // Reference image picker mode would be handled separately
    }
    
    if (shouldUseThreeViews && type !== 'character') {
      if (onThreeViewsChange) {
        onThreeViewsChange({
          ...threeViewsValue,
          [currentView]: asset.url
        });
      }
    } else {
      onChange(asset.url);
    }
  }, [shouldUseThreeViews, type, currentView, threeViewsValue, onThreeViewsChange, onChange]);

  /**
   * Handle updating asset category
   */
  const handleUpdateAssetCategory = useCallback(async (assetId: string, newCategory: string) => {
    try {
      await apiClient.updateAssetCategory(assetId, newCategory);
      addToast({
        type: 'success',
        title: '分类已更新',
        message: '素材分类已成功修改',
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      addToast({
        type: 'error',
        title: '更新失败',
        message: '无法更新素材分类',
      });
    }
  }, [addToast]);

  /**
   * Handle deleting asset
   */
  const handleDeleteAsset = useCallback(async (assetId: string) => {
    try {
      await apiClient.deleteAsset(assetId);
      addToast({
        type: 'success',
        title: '删除成功',
        message: '素材已删除',
      });
    } catch (error) {
      console.error('Failed to delete asset:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        message: '无法删除素材',
      });
    }
  }, [addToast]);

  return {
    setPrompt,
    setSelectedModel,
    setReferenceImage,
    setStyle,
    setImageCount,
    setNegativePrompt,
    setLocalThreeViewsMode,
    setCurrentView,
    handleUpload,
    handleGenerate,
    handleSelectGeneratedImage,
    handleThreeViewsSelect,
    handleThreeViewsRemove,
    handleViewSelect,
    handleRemove,
    handleSelectAsset,
    handleUpdateAssetCategory,
    handleDeleteAsset,
    loadAssets,
  };
}
