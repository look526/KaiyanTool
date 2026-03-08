import React from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '../../design-system';
import { ModelSelector } from '../ui/ModelSelector/ModelSelector';
import { STYLE_OPTIONS } from './types';
import type { ImageSelectorState, ImageSelectorActions } from './types';

interface ImageSelectorGenerateProps {
  state: ImageSelectorState;
  actions: ImageSelectorActions;
  enableReferenceImage: boolean;
  enableMultipleGeneration: boolean;
  enableThreeViews: boolean;
  type: 'character' | 'scene' | 'general';
}

/**
 * Generate tab for ImageSelector - AI image generation interface
 */
export function ImageSelectorGenerate({
  state,
  actions,
  enableReferenceImage,
  enableMultipleGeneration,
  enableThreeViews,
  type,
}: ImageSelectorGenerateProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Three-view mode selection */}
      {enableThreeViews && type !== 'character' && state.localThreeViewsMode === 'separate' && (
        <ThreeViewModeSelector
          mode={state.localThreeViewsMode}
          onModeChange={actions.setLocalThreeViewsMode}
          currentView={state.currentView}
          onViewChange={actions.setCurrentView}
        />
      )}

      {/* Model selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-primary-900 dark:text-primary-100">AI 模型</label>
        <ModelSelector
          contentType="image"
          value={state.selectedModel ?? undefined}
          onChange={(modelId) => actions.setSelectedModel?.(modelId)}
          placeholder="选择图片生成模型"
        />
      </div>

      {/* Reference image */}
      {enableReferenceImage && (
        <ReferenceImageSection
          referenceImage={state.referenceImage}
          onRemove={() => actions.setReferenceImage?.(null)}
        />
      )}

      {/* Prompt input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-primary-900 dark:text-primary-100">提示词 *</label>
        <textarea
          value={state.prompt}
          onChange={(e) => actions.setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          rows={4}
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-primary-900 dark:text-primary-100 text-sm resize-vertical font-sans"
        />
      </div>

      {/* Negative prompt */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-primary-900 dark:text-primary-100">负面提示词</label>
        <input
          type="text"
          value={state.negativePrompt}
          onChange={(e) => actions.setNegativePrompt(e.target.value)}
          placeholder="不想出现的内容..."
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-primary-900 dark:text-primary-100 text-sm"
        />
      </div>

      {/* Style selection */}
      <StyleSelector
        selectedStyle={state.style}
        onStyleChange={actions.setStyle}
      />

      {/* Generation count */}
      {enableMultipleGeneration && (
        <GenerationCountSelector
          count={state.imageCount}
          onCountChange={actions.setImageCount}
        />
      )}

      {/* Generate button */}
      <Button
        type="button"
        onClick={actions.handleGenerate}
        disabled={state.generating || !state.prompt.trim()}
        variant="primary"
        size="lg"
        fullWidth
        loading={state.generating}
      >
        {getGenerateButtonText(state, enableThreeViews, enableMultipleGeneration)}
      </Button>

      {/* Generated images preview */}
      {enableMultipleGeneration && state.generatedImages.length > 0 && (
        <GeneratedImagesGallery
          images={state.generatedImages}
          selectedImage={state.selectedImage}
          onSelect={actions.handleSelectGeneratedImage}
        />
      )}
    </div>
  );
}

// Sub-components for better organization

function ThreeViewModeSelector({ 
  mode, 
  onModeChange, 
  currentView, 
  onViewChange 
}: { 
  mode: 'separate' | 'combined';
  onModeChange: (mode: 'separate' | 'combined') => void;
  currentView: 'front' | 'side' | 'top';
  onViewChange: (view: 'front' | 'side' | 'top') => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-primary-900 dark:text-primary-100">三视图模式</label>
        <div className="flex gap-2">
          {(['separate', 'combined'] as const).map((m) => (
            <Button
              key={m}
              onClick={() => onModeChange(m)}
              variant={mode === m ? 'primary' : 'outline'}
              size="sm"
              fullWidth
            >
              {m === 'separate' ? '分开生成' : '单张包含'}
            </Button>
          ))}
        </div>
      </div>
      
      {mode === 'separate' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary-900 dark:text-primary-100">视图选择</label>
          <div className="flex gap-2">
            {(['front', 'side', 'top'] as const).map((view) => (
              <Button
                key={view}
                onClick={() => onViewChange(view)}
                variant={currentView === view ? 'primary' : 'outline'}
                size="sm"
                fullWidth
              >
                {view === 'front' ? '正视图' : view === 'side' ? '侧视图' : '俯视图'}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ReferenceImageSection({ 
  referenceImage, 
  onRemove 
}: { 
  referenceImage?: string | null;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary-900 dark:text-primary-100">参考图片</label>
      {referenceImage ? (
        <div className="relative inline-block">
          <img src={referenceImage} alt="参考图片" className="w-32 h-32 rounded-md object-cover border border-gray-300 dark:border-gray-700" />
          <button onClick={onRemove} className="absolute top-[-8px] right-[-8px] w-6 h-6 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 text-white flex items-center justify-center cursor-pointer p-0">
            ×
          </button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <p>参考图片上传功能</p>
        </div>
      )}
    </div>
  );
}

function StyleSelector({ 
  selectedStyle, 
  onStyleChange 
}: { 
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary-900 dark:text-primary-100">风格</label>
      <div className="flex gap-2 flex-wrap">
        {STYLE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            onClick={() => onStyleChange(opt.value)}
            variant={selectedStyle === opt.value ? 'primary' : 'outline'}
            size="sm"
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function GenerationCountSelector({ 
  count, 
  onCountChange 
}: { 
  count: number;
  onCountChange: (count: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-primary-900 dark:text-primary-100">生成数量</label>
      <div className="flex gap-2 items-center">
        <Button onClick={() => onCountChange(Math.max(1, count - 1))} variant="outline" size="sm">-</Button>
        <span className="min-w-10 text-center">{count}</span>
        <Button onClick={() => onCountChange(Math.min(8, count + 1))} variant="outline" size="sm">+</Button>
      </div>
    </div>
  );
}

function GeneratedImagesGallery({ 
  images, 
  selectedImage, 
  onSelect 
}: { 
  images: string[];
  selectedImage?: string | null;
  onSelect: (imageUrl: string) => void;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-3">选择生成结果</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((imageUrl, index) => (
          <button
            key={index}
            onClick={() => onSelect(imageUrl)}
            className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer p-0 bg-transparent ${selectedImage === imageUrl ? 'border-primary-500' : 'border-transparent'}`}
          >
            <img src={imageUrl} alt={`生成结果 ${index + 1}`} className="w-full h-full object-cover" />
            {selectedImage === imageUrl && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function getGenerateButtonText(
  state: any, 
  enableThreeViews: boolean, 
  enableMultipleGeneration: boolean
): string {
  if (state.generating) return '生成中...';
  if (enableThreeViews && state.effectiveThreeViewsMode === 'combined') {
    return '生成三视图';
  }
  if (enableMultipleGeneration) {
    return `生成${state.imageCount}张图片`;
  }
  return '生成图片';
}


