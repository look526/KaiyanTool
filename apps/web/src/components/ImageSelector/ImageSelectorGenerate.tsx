import React, { useState } from 'react';
import { Wand2, Film, Sparkles, User, Palette, Droplets, Box, Smile, BookOpen, Ghost, Cog, Waves, Loader2, X, Check } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { ModelSelector } from '../ui/ModelSelector/index';
import { STYLE_OPTIONS } from './types';
import type { ImageSelectorState, ImageSelectorActions } from './types';
import { useTheme } from '../../contexts/ThemeContext';

const STYLE_ICONS: Record<string, React.ReactNode> = {
  cinematic: <Film style={{ width: 16, height: 16 }} />,
  anime: <Sparkles style={{ width: 16, height: 16 }} />,
  realistic: <User style={{ width: 16, height: 16 }} />,
  illustration: <Palette style={{ width: 16, height: 16 }} />,
  watercolor: <Droplets style={{ width: 16, height: 16 }} />,
  '3d': <Box style={{ width: 16, height: 16 }} />,
  cartoon: <Smile style={{ width: 16, height: 16 }} />,
  comic: <BookOpen style={{ width: 16, height: 16 }} />,
  fantasy: <Ghost style={{ width: 16, height: 16 }} />,
  scifi: <Cog style={{ width: 16, height: 16 }} />,
  steampunk: <Waves style={{ width: 16, height: 16 }} />,
  cyberpunk: <Cog style={{ width: 16, height: 16 }} />,
};

const STYLE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  cinematic: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.3)' },
  anime: { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)', glow: 'rgba(236, 72, 153, 0.3)' },
  realistic: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', glow: 'rgba(16, 185, 129, 0.3)' },
  illustration: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.3)' },
  watercolor: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)', glow: 'rgba(6, 182, 212, 0.3)' },
  '3d': { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.3)' },
  cartoon: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', glow: 'rgba(249, 115, 22, 0.3)' },
  comic: { bg: 'rgba(220, 38, 38, 0.15)', border: 'rgba(220, 38, 38, 0.4)', glow: 'rgba(220, 38, 38, 0.3)' },
  fantasy: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.3)' },
  scifi: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)', glow: 'rgba(6, 182, 212, 0.3)' },
  steampunk: { bg: 'rgba(180, 83, 9, 0.15)', border: 'rgba(180, 83, 9, 0.4)', glow: 'rgba(180, 83, 9, 0.3)' },
  cyberpunk: { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)', glow: 'rgba(236, 72, 153, 0.3)' },
};

const ACCENT_COLOR = '#8b5cf6';

interface ImageSelectorGenerateProps {
  state: ImageSelectorState;
  actions: ImageSelectorActions;
  enableReferenceImage: boolean;
  enableMultipleGeneration: boolean;
  enableThreeViews: boolean;
  type: 'character' | 'scene' | 'general';
}

export function ImageSelectorGenerate({
  state,
  actions,
  enableReferenceImage,
  enableMultipleGeneration,
  enableThreeViews,
  type,
}: ImageSelectorGenerateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {enableThreeViews && type !== 'character' && state.localThreeViewsMode === 'separate' && (
        <ThreeViewModeSelector
          mode={state.localThreeViewsMode}
          onModeChange={actions.setLocalThreeViewsMode}
          currentView={state.currentView}
          onViewChange={actions.setCurrentView}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isDark ? '#fafafa' : '#18181b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Sparkles style={{ width: '16px', height: '16px', color: ACCENT_COLOR }} />
          选择模型
        </label>
        <ModelSelector
          content_type="image"
          value={state.selectedModel ?? undefined}
          on_change={(modelId) => actions.setSelectedModel?.(modelId)}
          placeholder="选择图片生成模型"
        />
      </div>

      {enableReferenceImage && (
        <ReferenceImageSection
          referenceImage={state.referenceImage}
          onRemove={() => actions.setReferenceImage?.(null)}
        />
      )}

      {/* 性别选择 */}
      <GenderSelector
        gender={state.gender}
        onGenderChange={(newGender) => actions.setGender?.(newGender)}
      />

      {/* 年龄输入 */}
      <AgeInput
        age={state.age}
        onAgeChange={(newAge) => actions.setAge?.(newAge)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isDark ? '#fafafa' : '#18181b',
        }}>
          描述您想要的图片 *
        </label>
        <textarea
          value={state.prompt}
          onChange={(e) => actions.setPrompt(e.target.value)}
          placeholder="详细描述图片内容、场景、人物特征..."
          rows={4}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            color: isDark ? '#fafafa' : '#18181b',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = ACCENT_COLOR;
            e.target.style.boxShadow = `0 0 0 3px ${ACCENT_COLOR}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isDark ? 'rgba(250,250,250,0.7)' : 'rgba(24,24,27,0.7)',
        }}>
          负面提示词（可选）
        </label>
        <input
          type="text"
          value={state.negativePrompt}
          onChange={(e) => actions.setNegativePrompt(e.target.value)}
          placeholder="不想要出现的元素..."
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            color: isDark ? '#fafafa' : '#18181b',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = ACCENT_COLOR;
            e.target.style.boxShadow = `0 0 0 3px ${ACCENT_COLOR}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <StyleSelector
        selectedStyle={state.style}
        onStyleChange={actions.setStyle}
      />

      {/* 分辨率选择 */}
      <ResolutionSelector
        resolution={state.resolution}
        onResolutionChange={state.setResolution}
      />

      {/* 宽高比选择 */}
      <AspectRatioSelector
        aspectRatio={state.aspectRatio}
        onAspectRatioChange={state.setAspectRatio}
      />

      {/* 图片数量选择 */}
      {enableMultipleGeneration && (
        <GenerationCountSelector
          count={state.imageCount}
          onCountChange={actions.setImageCount}
        />
      )}

      {/* 三视图选项 */}
      <ThreeViewsToggle
        enabled={state.enableThreeViews}
        onToggle={() => state.setEnableThreeViews(!state.enableThreeViews)}
      />

      <GenerateButton
        onClick={actions.handleGenerate}
        disabled={state.generating || !state.prompt.trim()}
        loading={state.generating}
        buttonText={getGenerateButtonText(state, enableThreeViews, enableMultipleGeneration)}
      />

      {state.generating && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
          border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Loader2 style={{
            width: '20px',
            height: '20px',
            color: ACCENT_COLOR,
            animation: 'spin 1s linear infinite',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isDark ? '#fafafa' : '#18181b',
              marginBottom: '4px',
            }}>
              正在生成图片...
            </div>
            <div style={{
              fontSize: '12px',
              color: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(24,24,27,0.6)',
            }}>
              AI 正在创作中，请稍候
            </div>
          </div>
        </div>
      )}

      {(enableMultipleGeneration || state.generatedImages.length > 0) && state.generatedImages.length > 0 && (
        <GeneratedImagesGallery
          images={state.generatedImages}
          selectedImage={state.selectedImage}
          onSelect={actions.handleSelectGeneratedImage}
        />
      )}
    </div>
  );
}

// ============ 新增组件 ============

// 1. 性别选择器
function GenderSelector({ 
  gender, 
  onGenderChange 
}: { 
  gender: string;
  onGenderChange: (gender: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const GENDER_OPTIONS = [
    { value: '男', label: '男' },
    { value: '女', label: '女' },
    { value: '其他', label: '其他' },
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
      }}>
        性别 *
      </label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {GENDER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onGenderChange(option.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '12px',
              border: gender === option.value 
                ? `2px solid ${ACCENT_COLOR}` 
                : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: gender === option.value 
                ? `${ACCENT_COLOR}20` 
                : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              color: isDark ? '#fafafa' : '#18181b',
              fontSize: '14px',
              fontWeight: gender === option.value ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 2. 年龄输入框
function AgeInput({ 
  age, 
  onAgeChange 
}: { 
  age: string;
  onAgeChange: (age: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
      }}>
        年龄（可选）
      </label>
      <input
        type="number"
        value={age}
        onChange={(e) => onAgeChange(e.target.value)}
        placeholder="例如：25"
        min="1"
        max="100"
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '12px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          color: isDark ? '#fafafa' : '#18181b',
          fontSize: '14px',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = ACCENT_COLOR;
          e.target.style.boxShadow = `0 0 0 3px ${ACCENT_COLOR}20`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

// 3. 分辨率选择器
function ResolutionSelector({
  resolution,
  onResolutionChange,
}: {
  resolution: '2K' | '3K';
  onResolutionChange: (resolution: '2K' | '3K') => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const RESOLUTION_OPTIONS = [
    { value: '2K', label: '2K 标准' },
    { value: '3K', label: '3K 高清' },
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
      }}>
        分辨率
      </label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {RESOLUTION_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onResolutionChange(option.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '12px',
              border: resolution === option.value 
                ? `2px solid ${ACCENT_COLOR}` 
                : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: resolution === option.value 
                ? `${ACCENT_COLOR}20` 
                : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              color: isDark ? '#fafafa' : '#18181b',
              fontSize: '14px',
              fontWeight: resolution === option.value ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 4. 宽高比选择器
function AspectRatioSelector({
  aspectRatio,
  onAspectRatioChange,
}: {
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const ASPECT_RATIOS = [
    { value: '1:1', label: '1:1 方形' },
    { value: '16:9', label: '16:9 宽屏' },
    { value: '9:16', label: '9:16 竖屏' },
    { value: '4:3', label: '4:3 横向' },
    { value: '3:4', label: '3:4 竖向' },
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
      }}>
        宽高比
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onAspectRatioChange(ratio.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              border: aspectRatio === ratio.value 
                ? `2px solid ${ACCENT_COLOR}` 
                : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: aspectRatio === ratio.value 
                ? `${ACCENT_COLOR}20` 
                : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              color: isDark ? '#fafafa' : '#18181b',
              fontSize: '13px',
              fontWeight: aspectRatio === ratio.value ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {ratio.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 5. 三视图开关
function ThreeViewsToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: '12px',
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <Box style={{ width: '18px', height: '18px', color: ACCENT_COLOR }} />
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDark ? '#fafafa' : '#18181b',
          }}>
            生成三视图
          </div>
          <div style={{
            fontSize: '12px',
            color: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(24,24,27,0.6)',
          }}>
            包含正面、侧面、顶面视角
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: '48px',
          height: '26px',
          borderRadius: '13px',
          border: 'none',
          background: enabled ? ACCENT_COLOR : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '3px',
          left: enabled ? '25px' : '3px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ffffff',
          transition: 'left 0.2s ease',
        }} />
      </button>
    </div>
  );
}

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const modeOptions = [
    { value: 'separate', label: '分开生成' },
    { value: 'combined', label: '单张包含' },
  ];

  const viewOptions = [
    { value: 'front', label: '正视图' },
    { value: 'side', label: '侧视图' },
    { value: 'top', label: '俯视图' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isDark ? '#fafafa' : '#18181b',
        }}>
          三视图模式
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {modeOptions.map((opt) => {
            const isActive = mode === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => onModeChange(opt.value as 'separate' | 'combined')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `2px solid ${isActive ? ACCENT_COLOR : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  background: isActive ? 'rgba(139, 92, 246, 0.1)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isActive ? ACCENT_COLOR : isDark ? '#fafafa' : '#18181b',
                }}>
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {mode === 'separate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDark ? '#fafafa' : '#18181b',
          }}>
            视图选择
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {viewOptions.map((opt) => {
              const isActive = currentView === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => onViewChange(opt.value as 'front' | 'side' | 'top')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${isActive ? ACCENT_COLOR : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    background: isActive ? 'rgba(139, 92, 246, 0.1)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isActive ? ACCENT_COLOR : isDark ? '#fafafa' : '#18181b',
                  }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ReferenceImageSection({ 
  referenceImage, 
  onRemove 
}: { 
  referenceImage?: string | null;
  onRemove: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
      }}>
        参考图片
      </label>
      {referenceImage ? (
        <div style={{ position: 'relative', display: 'inline-block', width: '120px' }}>
          <img 
            src={referenceImage} 
            alt="参考图片" 
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }} 
          />
          <button 
            onClick={onRemove}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#ef4444',
              border: '2px solid',
              borderColor: isDark ? '#1a1a2e' : '#ffffff',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        }}>
          <p style={{ fontSize: '13px', color: isDark ? 'rgba(250,250,250,0.5)' : 'rgba(24,24,27,0.5)' }}>
            点击上传参考图片
          </p>
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <Palette style={{ width: '16px', height: '16px', color: ACCENT_COLOR }} />
        风格
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {STYLE_OPTIONS.map((opt) => {
          const isSelected = selectedStyle === opt.value;
          const icon = STYLE_ICONS[opt.value] || <Palette style={{ width: 16, height: 16 }} />;
          const styleColor = STYLE_COLORS[opt.value];
          
          return (
            <div
              key={opt.value}
              onClick={() => onStyleChange(opt.value)}
              style={{
                padding: '12px 8px',
                borderRadius: '12px',
                border: `2px solid ${isSelected ? ACCENT_COLOR : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                background: isSelected 
                  ? 'rgba(139, 92, 246, 0.1)' 
                  : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ color: isSelected ? ACCENT_COLOR : isDark ? '#fafafa' : '#18181b' }}>
                {icon}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isSelected ? ACCENT_COLOR : isDark ? 'rgba(250,250,250,0.7)' : 'rgba(24,24,27,0.7)',
              }}>
                {opt.label}
              </span>
            </div>
          );
        })}
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
      }}>
        生成数量
      </label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((num) => {
          const isSelected = count === num;
          return (
            <div
              key={num}
              onClick={() => onCountChange(num)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `2px solid ${isSelected ? ACCENT_COLOR : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                background: isSelected 
                  ? 'rgba(139, 92, 246, 0.15)' 
                  : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: '600',
                color: isSelected ? ACCENT_COLOR : isDark ? '#fafafa' : '#18181b',
                transition: 'all 0.2s ease',
              }}
            >
              {num}
            </div>
          );
        })}
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [loadingImages, setLoadingImages] = React.useState<Record<number, boolean>>({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#fafafa' : '#18181b',
      }}>
        选择生成结果
      </label>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '12px',
      }}>
        {images.map((imageUrl, index) => {
          const isSelected = selectedImage === imageUrl;
          const isLoading = loadingImages[index];
          
          return (
            <div
              key={index}
              onClick={() => onSelect(imageUrl)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                border: `3px solid ${isSelected ? ACCENT_COLOR : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}>
                  <Loader2 style={{
                    width: '24px',
                    height: '24px',
                    color: ACCENT_COLOR,
                    animation: 'spin 1s linear infinite',
                  }} />
                </div>
              )}
              <img 
                src={imageUrl} 
                alt={`生成结果 ${index + 1}`} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }}
                onLoad={() => {
                  setLoadingImages(prev => ({ ...prev, [index]: false }));
                }}
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  setLoadingImages(prev => ({ ...prev, [index]: false }));
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}; color: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};">
                      <div style="text-align: center; padding: 12px;">
                        <p style="margin: 0; font-size: 12px;">图片加载失败</p>
                      </div>
                    </div>
                  `;
                }}
              />
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: ACCENT_COLOR,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}>
                  <Check style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                </div>
              )}
            </div>
          );
        })}
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

function GenerateButton({ 
  onClick, 
  disabled, 
  loading, 
  buttonText,
  progress = 0
}: { 
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  buttonText: string;
  progress?: number;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{ width: '100%' }}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          width: '100%',
          padding: '16px 24px',
          borderRadius: '14px',
          border: 'none',
          background: disabled || loading
            ? isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'
            : `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #a78bfa 100%)`,
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.25s ease',
          boxShadow: disabled || loading ? 'none' : `0 8px 24px ${ACCENT_COLOR}40`,
        }}
      >
        {loading ? (
          <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
        ) : (
          <Wand2 style={{ width: '20px', height: '20px' }} />
        )}
        {buttonText}
      </button>
      {loading && progress > 0 && (
        <div style={{
          marginTop: '12px',
          width: '100%',
          height: '6px',
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${ACCENT_COLOR} 0%, #a78bfa 100%)`,
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
      {loading && progress > 0 && (
        <p style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '13px',
          color: isDark ? 'rgba(250,250,250,0.6)' : 'rgba(24,24,27,0.6)',
        }}>
          正在生成... {progress}%
        </p>
      )}
    </div>
  );
}
