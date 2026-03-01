import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Wand2, Images, X, Loader2, Search, Check, Filter, Tag, Image } from 'lucide-react';
import { apiClient } from '../lib/api';
import { useToast } from './ui/Toast';
import { ModelSelector } from './ui/ModelSelector/ModelSelector';
import { Button } from './ui/button-new';

const getFullUrl = (path: string) => {
  if (!path) return path;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const apiHost = baseUrl.replace('/api', '');
  return `${apiHost}${path}`;
};

type TabType = 'upload' | 'generate' | 'library';
type ThreeViewsMode = 'separate' | 'combined';

interface CategoryOption {
  value: string;
  label: string;
}

interface ImageSelectorProps {
  value: string | null;
  onChange: (url: string | null) => void;
  projectId: string;
  type?: 'character' | 'scene' | 'general';
  placeholder?: string;
  maxSize?: number;
  disabled?: boolean;
  characterDescription?: string;
  enableReferenceImage?: boolean;
  enableMultipleGeneration?: boolean;
  enableThreeViews?: boolean;
  threeViewsMode?: ThreeViewsMode;
  threeViewsValue?: { front: string | null; side: string | null; top: string | null };
  onThreeViewsChange?: (views: { front: string | null; side: string | null; top: string | null }) => void;
  autoCategoryFilter?: boolean;
}

const TYPE_TO_CATEGORY: Record<string, string> = {
  character: 'character',
  scene: 'scene',
  general: 'all'
};

export function ImageSelector({
  value,
  onChange,
  projectId,
  type = 'general',
  placeholder = '点击选择图片',
  maxSize = 5,
  disabled = false,
  characterDescription,
  enableReferenceImage = false,
  enableMultipleGeneration = false,
  enableThreeViews = false,
  threeViewsMode = 'separate',
  threeViewsValue = { front: null, side: null, top: null },
  onThreeViewsChange,
  autoCategoryFilter = true,
}: ImageSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(4);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'front' | 'side' | 'top'>('front');
  const [localThreeViewsMode, setLocalThreeViewsMode] = useState<ThreeViewsMode>(threeViewsMode || (enableThreeViews ? 'combined' : 'separate'));
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [showReferenceImagePicker, setShowReferenceImagePicker] = useState(false);
  const { addToast } = useToast();

  const shouldUseThreeViews = enableThreeViews || type === 'character';
  const effectiveThreeViewsMode = type === 'character' ? 'combined' : localThreeViewsMode;

  const styleOptions = [
    { value: 'cinematic', label: '电影' },
    { value: 'anime', label: '动漫' },
    { value: 'realistic', label: '写实' },
    { value: 'illustration', label: '插画' },
    { value: 'watercolor', label: '水彩' },
    { value: '3d', label: '3D建模' },
    { value: 'cartoon', label: '卡通' },
    { value: 'comic', label: '漫画' },
    { value: 'fantasy', label: '奇幻' },
    { value: 'scifi', label: '科幻' },
    { value: 'steampunk', label: '蒸汽朋克' },
    { value: 'cyberpunk', label: '赛博朋克' },
  ];

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

  useEffect(() => {
    if (autoCategoryFilter && type) {
      const category = TYPE_TO_CATEGORY[type] || 'all';
      setSelectedCategory(category);
    }
  }, [type, autoCategoryFilter]);

  const loadAssets = useCallback(async () => {
    if (!projectId) return;
    setLoadingAssets(true);
    try {
      const categoryFilter = selectedCategory !== 'all' ? selectedCategory : undefined;
      const data = await apiClient.getProjectAssets(
        projectId, 
        'image', 
        searchQuery || undefined,
        categoryFilter
      );
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  }, [projectId, searchQuery, selectedCategory]);

  useEffect(() => {
    if (showModal && activeTab === 'library') {
      loadAssets();
    }
  }, [showModal, activeTab, loadAssets]);

  useEffect(() => {
    if (characterDescription && !prompt) {
      setPrompt(characterDescription);
    }
  }, [characterDescription]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setShowModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      addToast({
        type: 'error',
        title: '上传失败',
        message: '请稍后重试',
      });
    }
  };

  const handleGenerate = async () => {
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
        message: '请先选择一个AI图像生成模型',
      });
      return;
    }

    setGenerating(true);
    try {
      if (enableMultipleGeneration) {
        const stylePrompt = getStylePrompt(prompt.trim(), style);
        
        const results = await apiClient.batchGenerateImages({
          prompt: stylePrompt,
          count: imageCount,
        });
        const imageUrls = results.assets.map((asset: any) => asset.url);
        
        setGeneratedImages(imageUrls);
        setSelectedImage(null);
        loadAssets();
        addToast({
          type: 'success',
          title: '生成成功',
          message: `已生成 ${imageUrls.length} 张图片，请选择满意的结果`,
        });
      } else {
        let finalPrompt = getStylePrompt(prompt.trim(), style);
        
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
          image_urls: referenceImage ? [getFullUrl(referenceImage)] : undefined,
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
              setShowModal(false);
            } else {
              handleThreeViewsSelect(currentView, result.asset.url);
            }
          } else {
            onChange(result.asset.url);
            setShowModal(false);
          }
          loadAssets();
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
  };

  const getStylePrompt = (basePrompt: string, style: string): string => {
    switch (style) {
      case 'cinematic':
        return `电影级品质，好莱坞大片风格，专业灯光，高清细节，${basePrompt}`;
      case 'anime':
        return `日本动漫风格，细腻线条，鲜明色彩，${basePrompt}`;
      case 'realistic':
        return `超写实风格，照片级真实感，光线自然，材质真实，细节丰富，与真实世界完全一致，${basePrompt}`;
      case 'illustration':
        return `精美插画风格，手绘质感，艺术感强，${basePrompt}`;
      case 'watercolor':
        return `水彩画风格，柔和色彩，透明质感，艺术笔触，${basePrompt}`;
      case '3d':
        return `3D建模风格，CG渲染，立体感强，材质细腻，${basePrompt}`;
      case 'cartoon':
        return `卡通风格，夸张表现，明亮色彩，${basePrompt}`;
      case 'comic':
        return `漫画风格，黑白线条，网点效果，${basePrompt}`;
      case 'fantasy':
        return `奇幻风格，魔法元素，史诗感，${basePrompt}`;
      case 'scifi':
        return `科幻风格，未来科技，金属质感，${basePrompt}`;
      case 'steampunk':
        return `蒸汽朋克风格，机械元素，复古科技，${basePrompt}`;
      case 'cyberpunk':
        return `赛博朋克风格，霓虹灯，未来都市，${basePrompt}`;
      default:
        return basePrompt;
    }
  };

  const getNegativePrompt = (style: string): string => {
    const baseNegative = '低质量，模糊，失真，比例错误，透视错误';
    switch (style) {
      case 'realistic':
        return `${baseNegative}，卡通风格，动画效果，线条粗糙`;
      case 'anime':
        return `${baseNegative}，写实风格，照片效果`;
      case 'watercolor':
        return `${baseNegative}，数字感强，生硬线条`;
      default:
        return baseNegative;
    }
  };

  const getThreeViewsPrompt = (basePrompt: string, style: string): string => {
    return `专业工程制图，${getStyleName(style)}风格，${basePrompt}的标准三视图，必须包含正视图、侧视图和俯视图三个视角，严格按照工程制图标准布局，正视图在左，侧视图在中，俯视图在右，保持严格的投影关系，清晰的尺寸标注，比例准确，线条清晰，白色背景，技术图纸风格，光线自然，材质真实，细节丰富，三个视角必须同时出现在同一张图像中`;
  };

  const getStyleName = (style: string): string => {
    const styleMap: Record<string, string> = {
      cinematic: '电影',
      anime: '动漫',
      realistic: '写实',
      illustration: '插画',
      watercolor: '水彩',
      '3d': '3D建模',
      cartoon: '卡通',
      comic: '漫画',
      fantasy: '奇幻',
      scifi: '科幻',
      steampunk: '蒸汽朋克',
      cyberpunk: '赛博朋克',
    };
    return styleMap[style] || style;
  };

  const handleSelectGeneratedImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (!shouldUseThreeViews) {
      onChange(imageUrl);
      setShowModal(false);
      loadAssets();
      addToast({
        type: 'success',
        title: '选择成功',
        message: '图片已选择',
      });
    }
  };

  const handleThreeViewsSelect = (view: 'front' | 'side' | 'top', imageUrl: string) => {
    if (onThreeViewsChange) {
      onThreeViewsChange({
        ...threeViewsValue,
        [view]: imageUrl
      });
    }
  };

  const handleThreeViewsRemove = (view: 'front' | 'side' | 'top') => {
    if (onThreeViewsChange) {
      onThreeViewsChange({
        ...threeViewsValue,
        [view]: null
      });
    }
  };

  const handleSelectAsset = (asset: any) => {
    if (showReferenceImagePicker) {
      setReferenceImage(asset.url);
      setShowReferenceImagePicker(false);
      return;
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
      setShowModal(false);
    }
  };

  const handleUpdateAssetCategory = async (assetId: string, newCategory: string) => {
    try {
      await apiClient.updateAssetCategory(assetId, newCategory);
      setAssets(assets.map(a => 
        a.id === assetId 
          ? { ...a, category: newCategory, categoryLabel: categories.find(c => c.value === newCategory)?.label || newCategory }
          : a
      ));
      setEditingAssetId(null);
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
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await apiClient.deleteAsset(assetId);
      setAssets(assets.filter(a => a.id !== assetId));
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
  };

  return (
    <div className="image-selector">
      {enableThreeViews && type !== 'character' ? (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { key: 'front', label: '正视图' },
            { key: 'side', label: '侧视图' },
            { key: 'top', label: '俯视图' }
          ].map((view) => (
            <div key={view.key} style={{ flex: '1 1 220px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
              }}>
                {view.label}
              </label>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                {threeViewsValue[view.key as keyof typeof threeViewsValue] ? (
                  <>
                    <div style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      <img
                        src={threeViewsValue[view.key as keyof typeof threeViewsValue] || ''}
                        alt={view.label}
                        style={{
                          width: '100%',
                          maxWidth: '220px',
                          height: 'auto',
                          cursor: disabled ? 'default' : 'pointer',
                        }}
                        onClick={() => {
                          if (!disabled) {
                            setCurrentView(view.key as 'front' | 'side' | 'top');
                            setShowModal(true);
                          }
                        }}
                      />
                    </div>
                    {!disabled && (
                      <button
                        onClick={() => handleThreeViewsRemove(view.key as 'front' | 'side' | 'top')}
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--error)',
                          border: '3px solid var(--bg-elevated)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          boxShadow: 'var(--shadow-glow)',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-glow-strong)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                        }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (!disabled) {
                        setCurrentView(view.key as 'front' | 'side' | 'top');
                        setShowModal(true);
                      }
                    }}
                    disabled={disabled}
                    style={{
                      width: '100%',
                      minHeight: '140px',
                      padding: '24px',
                      border: '2px dashed var(--border-primary)',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(139, 92, 246, 0.05)',
                      color: 'var(--text-muted)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled) {
                        e.currentTarget.style.borderColor = 'var(--primary-500)';
                        e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Images style={{ width: '36px', height: '36px', color: 'var(--primary-500)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>上传或生成{view.label}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        value ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <img
                src={value}
                alt="已选择"
                style={{
                  width: '100%',
                  maxWidth: '220px',
                  height: 'auto',
                  cursor: disabled ? 'default' : 'pointer',
                }}
                onClick={() => !disabled && setShowModal(true)}
              />
            </div>
            {!disabled && (
              <button
                onClick={handleRemove}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  border: '3px solid var(--bg-elevated)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => !disabled && setShowModal(true)}
            disabled={disabled}
            style={{
              width: '100%',
              minHeight: '140px',
              padding: '24px',
              border: '2px dashed var(--border-primary)',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              color: 'var(--text-muted)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Images style={{ width: '36px', height: '36px', color: 'var(--primary-500)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{placeholder}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              上传 / AI生成 / 素材库
            </span>
          </button>
        )
      )}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => { setShowModal(false); setShowReferenceImagePicker(false); }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '850px',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-primary)',
              animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {showReferenceImagePicker ? '选择参考图' : (enableThreeViews && type !== 'character' ? `选择${currentView === 'front' ? '正视图' : currentView === 'side' ? '侧视图' : '俯视图'}` : '选择图片')}
              </h3>
              <button
                onClick={() => { setShowModal(false); setShowReferenceImagePicker(false); }}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              {[
                { id: 'upload', label: '本地上传', icon: Upload },
                { id: 'generate', label: 'AI生成', icon: Wand2 },
                { id: 'library', label: '素材库', icon: Images },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    background: 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab.id ? '2px solid #8b5cf6' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <tab.icon style={{ width: '16px', height: '16px' }} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {activeTab === 'upload' && (
                <div style={{
                  border: '2px dashed var(--border-primary)',
                  borderRadius: '8px',
                  padding: '40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => document.getElementById('image-upload-input')?.click()}
                >
                  <Upload style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                    点击或拖拽上传图片
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                    支持 JPG、PNG、WebP、GIF 格式，最大 {maxSize}MB
                  </p>
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const result = await apiClient.uploadImage(file, projectId);
                        if (shouldUseThreeViews && type !== 'character') {
                          if (onThreeViewsChange) {
                            onThreeViewsChange({
                              ...threeViewsValue,
                              [currentView]: result.url
                            });
                          }
                        } else {
                          onChange(result.url);
                          setShowModal(false);
                        }
                      } catch (error) {
                        console.error('Upload failed:', error);
                        addToast({
                          type: 'error',
                          title: '上传失败',
                          message: '请稍后重试',
                        });
                      }
                    }}
                  />
                </div>
              )}

              {activeTab === 'generate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {enableThreeViews && type !== 'character' && localThreeViewsMode === 'separate' && (
                    <>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                        }}>
                          三视图模式
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[
                            { key: 'separate', label: '分开生成' },
                            { key: 'combined', label: '单张包含' }
                          ].map((mode) => (
                            <Button
                              key={mode.key}
                              onClick={() => setLocalThreeViewsMode(mode.key as ThreeViewsMode)}
                              variant={localThreeViewsMode === mode.key ? 'primary' : 'outline'}
                              size="sm"
                              fullWidth
                            >
                              {mode.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {localThreeViewsMode === 'separate' && (
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            marginBottom: '8px',
                          }}>
                            视图选择
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                              { key: 'front', label: '正视图' },
                              { key: 'side', label: '侧视图' },
                              { key: 'top', label: '俯视图' }
                            ].map((view) => (
                              <Button
                                key={view.key}
                                onClick={() => setCurrentView(view.key as 'front' | 'side' | 'top')}
                                variant={currentView === view.key ? 'primary' : 'outline'}
                                size="sm"
                                fullWidth
                              >
                                {view.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}>
                      AI 模型
                    </label>
                    <ModelSelector
                      contentType="image"
                      value={selectedModel}
                      onChange={setSelectedModel}
                      placeholder="选择图片生成模型"
                    />
                  </div>

                  {enableReferenceImage && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                      }}>
                        参考图片
                      </label>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        {referenceImage ? (
                          <>
                            <img
                              src={referenceImage}
                              alt="参考图片"
                              style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid var(--border-primary)',
                              }}
                            />
                            <button
                              onClick={() => setReferenceImage(null)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#ef4444',
                                border: '2px solid var(--bg-elevated)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              <X style={{ width: '14px', height: '14px' }} />
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => document.getElementById('reference-upload-input')?.click()}
                              style={{
                                width: '120px',
                                height: '120px',
                                border: '2px dashed var(--border-primary)',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-primary)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Upload style={{ width: '20px', height: '20px' }} />
                              <span style={{ fontSize: '12px' }}>上传</span>
                            </button>
                            <button
                              onClick={() => { setActiveTab('library'); setShowModal(true); setShowReferenceImagePicker(true); }}
                              style={{
                                width: '120px',
                                height: '120px',
                                border: '2px dashed var(--border-primary)',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-primary)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Image style={{ width: '20px', height: '20px' }} />
                              <span style={{ fontSize: '12px' }}>素材库</span>
                            </button>
                          </div>
                        )}
                        <input
                          id="reference-upload-input"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const result = await apiClient.uploadImage(file, projectId);
                              setReferenceImage(result.url);
                            } catch (error) {
                              console.error('Upload failed:', error);
                              addToast({
                                type: 'error',
                                title: '上传失败',
                                message: '请稍后重试',
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}>
                      提示词 *
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="描述你想要生成的图片..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}>
                      负面提示词
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="不想出现的内容..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}>
                      风格
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {styleOptions.map((opt) => (
                        <Button
                          key={opt.value}
                          type="button"
                          onClick={() => setStyle(opt.value)}
                          variant={style === opt.value ? 'primary' : 'outline'}
                          size="sm"
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {enableMultipleGeneration && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                      }}>
                        生成数量
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Button
                          onClick={() => setImageCount(Math.max(1, imageCount - 1))}
                          variant="outline"
                          size="sm"
                        >
                          -
                        </Button>
                        <span style={{ minWidth: '40px', textAlign: 'center' }}>{imageCount}</span>
                        <Button
                          onClick={() => setImageCount(Math.min(8, imageCount + 1))}
                          variant="outline"
                          size="sm"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={generating}
                    icon={!generating && <Wand2 />}
                  >
                    {generating ? '生成中...' : (
                      shouldUseThreeViews ? (
                        effectiveThreeViewsMode === 'combined' ? '生成三视图' : `生成${currentView === 'front' ? '正视图' : currentView === 'side' ? '侧视图' : '俯视图'}`
                      ) : enableMultipleGeneration ? `生成${imageCount}张图片` : '生成图片'
                    )}
                  </Button>

                  {enableMultipleGeneration && generatedImages.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
                        选择生成结果
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                        {generatedImages.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectGeneratedImage(imageUrl)}
                            style={{
                              position: 'relative',
                              aspectRatio: '1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: selectedImage === imageUrl ? '2px solid #8b5cf6' : '2px solid transparent',
                              cursor: 'pointer',
                              padding: 0,
                              background: 'none',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`生成结果 ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            {selectedImage === imageUrl && (
                              <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#8b5cf6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Check style={{ width: '12px', height: '12px', color: 'white' }} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'library' && (
                <div>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      flex: 1,
                      minWidth: '200px',
                      position: 'relative',
                    }}>
                      <Search style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: 'var(--text-muted)',
                      }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索素材..."
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 40px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-primary)',
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-primary)',
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Filter style={{ width: '16px', height: '16px' }} />
                        {selectedCategory === 'all' ? '全部分类' : categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
                      </button>
                      
                      {showCategoryMenu && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '4px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 10,
                          minWidth: '150px',
                          overflow: 'hidden',
                        }}>
                          <button
                            onClick={() => {
                              setSelectedCategory('all');
                              setShowCategoryMenu(false);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '10px 14px',
                              border: 'none',
                              background: selectedCategory === 'all' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                              color: selectedCategory === 'all' ? '#8b5cf6' : 'var(--text-primary)',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                            }}
                          >
                            全部分类
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat.value}
                              onClick={() => {
                                setSelectedCategory(cat.value);
                                setShowCategoryMenu(false);
                              }}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px 14px',
                                border: 'none',
                                background: selectedCategory === cat.value ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                color: selectedCategory === cat.value ? '#8b5cf6' : 'var(--text-primary)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '14px',
                              }}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={loadAssets}
                      variant="outline"
                      size="sm"
                    >
                      刷新
                    </Button>
                  </div>

                  {loadingAssets ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px',
                    }}>
                      <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
                    </div>
                  ) : assets.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: 'var(--text-muted)',
                    }}>
                      <Images style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5 }} />
                      <p>暂无素材</p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '12px',
                    }}>
                      {assets.map((asset) => (
                        <div
                          key={asset.id}
                          style={{ position: 'relative' }}
                        >
                          <button
                            onClick={() => handleSelectAsset(asset)}
                            style={{
                              position: 'relative',
                              width: '100%',
                              aspectRatio: '1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: value === asset.url ? '2px solid #8b5cf6' : '2px solid transparent',
                              cursor: 'pointer',
                              padding: 0,
                              background: 'none',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (value !== asset.url) {
                                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (value !== asset.url) {
                                e.currentTarget.style.borderColor = 'transparent';
                              }
                            }}
                          >
                            <img
                              src={asset.thumbnailUrl || asset.url}
                              alt={asset.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            {value === asset.url && (
                              <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#8b5cf6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Check style={{ width: '12px', height: '12px', color: 'white' }} />
                              </div>
                            )}
                          </button>
                          
                          {asset.categoryLabel && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAssetId(editingAssetId === asset.id ? null : asset.id);
                              }}
                              style={{
                                position: 'absolute',
                                bottom: '4px',
                                left: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                fontSize: '10px',
                                cursor: 'pointer',
                              }}
                            >
                              <Tag style={{ width: '10px', height: '10px' }} />
                              {asset.categoryLabel}
                            </div>
                          )}
                          
                          {editingAssetId === asset.id && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: 0,
                                marginBottom: '4px',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 20,
                                minWidth: '120px',
                                overflow: 'hidden',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {categories.map((cat) => (
                                <button
                                  key={cat.value}
                                  onClick={() => handleUpdateAssetCategory(asset.id, cat.value)}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: asset.category === cat.value ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    color: asset.category === cat.value ? '#8b5cf6' : 'var(--text-primary)',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                  }}
                                >
                                  {cat.label}
                                </button>
                              ))}
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  borderTop: '1px solid var(--border-primary)',
                                  background: 'transparent',
                                  color: '#ef4444',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                }}
                              >
                                删除素材
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
