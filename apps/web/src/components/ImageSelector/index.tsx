import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Wand2, Images, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { ModelSelector } from '@/components/ui/ModelSelector/ModelSelector';
import { Button } from '@/components/ui/button-new';
import { useImageSelectorState } from './hooks/useImageSelectorState';
import { useImageSelectorActions } from './hooks/useImageSelectorActions';
import { ImageSelectorTabs } from './ImageSelectorTabs';
import { ImageSelectorUpload } from './ImageSelectorUpload';
import { ImageSelectorGenerate } from './ImageSelectorGenerate';
import { ImageSelectorLibrary } from './ImageSelectorLibrary';
import type { ImageSelectorProps, ThreeViewsMode, TabType } from './types';

/**
 * ImageSelector provides a unified interface for image selection,
 * supporting upload, AI generation, and library browsing.
 * 
 * Features:
 * - Drag & drop upload
 * - AI image generation with style presets
 * - Project asset library with search
 * - Three-view generation for characters
 * 
 * @example
 * ```tsx
 * <ImageSelector
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   projectId={project.id}
 *   type="character"
 *   enableThreeViews={true}
 * />
 * ```
 */
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
  const { addToast } = useToast();
  
  const state = useImageSelectorState({
    value,
    type,
    enableThreeViews,
    threeViewsMode,
    characterDescription,
    autoCategoryFilter,
  });

  const actions = useImageSelectorActions({
    projectId,
    type,
    maxSize,
    disabled,
    value,
    onChange,
    threeViewsValue,
    onThreeViewsChange,
    shouldUseThreeViews: state.shouldUseThreeViews,
    effectiveThreeViewsMode: state.effectiveThreeViewsMode,
    currentView: state.currentView,
    activeTab: state.activeTab,
    prompt: state.prompt,
    selectedModel: state.selectedModel ?? undefined,
    style: state.style,
    negativePrompt: state.negativePrompt,
    referenceImage: state.referenceImage,
    imageCount: state.imageCount,
    selectedCategory: state.selectedCategory,
    setGeneratedImages: state.setGeneratedImages,
    setSelectedImage: state.setSelectedImage,
    setGenerating: state.setGenerating,
    setPrompt: state.setPrompt,
    setSelectedModel: (model) => state.setSelectedModel(model ?? undefined),
    setReferenceImage: state.setReferenceImage,
    setStyle: state.setStyle,
    setNegativePrompt: state.setNegativePrompt,
    setImageCount: state.setImageCount,
    setLocalThreeViewsMode: state.setLocalThreeViewsMode,
    setCurrentView: state.setCurrentView,
    loadAssets: state.loadAssets,
    addToast,
  });

  const handleModalClose = useCallback(() => {
    state.setShowModal(false);
    state.setShowReferenceImagePicker(false);
  }, [state]);

  return (
    <div className="image-selector">
      {/* Main Display */}
      {state.shouldUseThreeViews && type !== 'character' ? (
        <ThreeViewsDisplay
          value={threeViewsValue}
          disabled={disabled}
          currentView={state.currentView}
          onViewSelect={actions.handleViewSelect}
          onRemove={actions.handleThreeViewsRemove}
        />
      ) : value ? (
        <SingleImageDisplay
          value={value}
          disabled={disabled}
          onRemove={actions.handleRemove}
          onClick={() => state.setShowModal(true)}
        />
      ) : (
        <ImageSelectorTrigger
          onClick={() => !disabled && state.setShowModal(true)}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}

      {/* Modal */}
      {state.showModal && (
        <ImageSelectorModal
          onClose={handleModalClose}
          showReferenceImagePicker={state.showReferenceImagePicker}
          activeTab={state.activeTab}
          effectiveThreeViewsMode={state.effectiveThreeViewsMode}
          currentView={state.currentView}
        >
          <ImageSelectorTabs
            activeTab={state.activeTab as TabType}
            onTabChange={state.setActiveTab}
          />
          
          <div className="image-selector__content">
            {state.activeTab === 'upload' && (
              <ImageSelectorUpload
                projectId={projectId}
                currentView={state.currentView}
                shouldUseThreeViews={state.shouldUseThreeViews}
                threeViewsValue={threeViewsValue}
                onThreeViewsChange={onThreeViewsChange}
                onChange={onChange}
                onClose={handleModalClose}
              />
            )}
            
            {state.activeTab === 'generate' && (
              <ImageSelectorGenerate
                state={state}
                actions={actions}
                enableReferenceImage={enableReferenceImage}
                enableMultipleGeneration={enableMultipleGeneration}
                enableThreeViews={enableThreeViews}
                type={type}
              />
            )}
            
            {state.activeTab === 'library' && (
              <ImageSelectorLibrary
                projectId={projectId}
                state={state}
                actions={actions}
                showReferenceImagePicker={state.showReferenceImagePicker}
                shouldUseThreeViews={state.shouldUseThreeViews}
                type={type}
                currentView={state.currentView}
                threeViewsValue={threeViewsValue}
                onThreeViewsChange={onThreeViewsChange}
                onChange={onChange}
                onClose={handleModalClose}
              />
            )}
          </div>
        </ImageSelectorModal>
      )}
    </div>
  );
}

// Display Components

interface ThreeViewsDisplayProps {
  value: { front: string | null; side: string | null; top: string | null };
  disabled: boolean;
  currentView: 'front' | 'side' | 'top';
  onViewSelect: (view: 'front' | 'side' | 'top') => void;
  onRemove: (view: 'front' | 'side' | 'top') => void;
}

function ThreeViewsDisplay({ value, disabled, currentView, onViewSelect, onRemove }: ThreeViewsDisplayProps) {
  const views = [
    { key: 'front' as const, label: '正视图' },
    { key: 'side' as const, label: '侧视图' },
    { key: 'top' as const, label: '俯视图' }
  ];

  return (
    <div className="flex gap-5 flex-wrap">
      {views.map((view) => (
        <div key={view.key} className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
            {view.label}
          </label>
          <div className="relative inline-block w-full">
            {value[view.key] ? (
              <>
                <div className="relative rounded-xl overflow-hidden shadow-lg transition-all duration-300">
                  <img
                    src={value[view.key] || ''}
                    alt={view.label}
                    className="w-full max-w-[220px] h-auto cursor-pointer"
                    onClick={() => {
                      if (!disabled) {
                        onViewSelect(view.key);
                      }
                    }}
                  />
                </div>
                {!disabled && (
                  <button
                    onClick={() => onRemove(view.key)}
                    className="absolute top-[-10px] right-[-10px] w-7 h-7 rounded-full bg-red-500 border-3 border-white dark:border-gray-900 text-white flex items-center justify-center cursor-pointer p-0 shadow-lg transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  if (!disabled) {
                    onViewSelect(view.key);
                  }
                }}
                disabled={disabled}
                className="w-full min-h-[140px] p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 text-gray-500 dark:text-gray-400 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm"
              >
                <Images className="w-9 h-9 text-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">上传或生成{view.label}</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface SingleImageDisplayProps {
  value: string;
  disabled: boolean;
  onRemove: () => void;
  onClick: () => void;
}

function SingleImageDisplay({ value, disabled, onRemove, onClick }: SingleImageDisplayProps) {
  return (
    <div className="relative inline-block">
      <div className="relative rounded-xl overflow-hidden shadow-lg transition-all duration-300">
        <img
          src={value}
          alt="已选择"
          className="w-full max-w-[220px] h-auto cursor-pointer"
          onClick={onClick}
        />
      </div>
      {!disabled && (
        <button
          onClick={onRemove}
          className="absolute top-[-10px] right-[-10px] w-7 h-7 rounded-full bg-red-500 border-3 border-white dark:border-gray-900 text-white flex items-center justify-center cursor-pointer p-0 shadow-lg transition-all duration-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface ImageSelectorTriggerProps {
  onClick: () => void;
  disabled: boolean;
  placeholder: string;
}

function ImageSelectorTrigger({ onClick, disabled, placeholder }: ImageSelectorTriggerProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full min-h-[140px] p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 text-gray-500 dark:text-gray-400 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm"
    >
      <Images className="w-9 h-9 text-primary-500" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{placeholder}</span>
      <span className="text-xs text-gray-500 dark:text-gray-500">
        上传 / AI 生成 / 素材库
      </span>
    </button>
  );
}

interface ImageSelectorModalProps {
  onClose: () => void;
  children: React.ReactNode;
  showReferenceImagePicker: boolean;
  activeTab: string;
  effectiveThreeViewsMode: ThreeViewsMode;
  currentView: 'front' | 'side' | 'top';
}

function ImageSelectorModal({ onClose, children, showReferenceImagePicker, activeTab, effectiveThreeViewsMode, currentView }: ImageSelectorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 backdrop-blur-md rounded-xl w-9/10 max-w-[850px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="m-0 text-lg font-semibold text-primary-900 dark:text-primary-100">
            {showReferenceImagePicker ? '选择参考图' : (activeTab === 'generate' && effectiveThreeViewsMode === 'combined' ? `选择三视图` : `选择${currentView === 'front' ? '正视图' : currentView === 'side' ? '侧视图' : '俯视图'}`)}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md border-none bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
