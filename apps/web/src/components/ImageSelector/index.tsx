import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Wand2, Images, X } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { ModelSelector } from '../ui/ModelSelector/index';
import { Button } from '../ui/button-new';
import { useTheme } from '../../contexts/ThemeContext';
import { useImageSelectorState } from './hooks/useImageSelectorState';
import { useImageSelectorActions } from './hooks/useImageSelectorActions';
import { ImageSelectorTabs } from './ImageSelectorTabs';
import { ImageSelectorUpload } from './ImageSelectorUpload';
import { ImageSelectorGenerate } from './ImageSelectorGenerate';
import { ImageSelectorLibrary } from './ImageSelectorLibrary';
import type { ImageSelectorProps, ThreeViewsMode, TabType } from './types';

const ACCENT_COLOR = '#8b5cf6';

export function ImageSelector({
  value,
  onChange,
  projectId,
  type = 'general',
  placeholder = '点击选择图片',
  maxSize = 5,
  disabled = false,
  characterDescription,
  characterGender,
  characterAge,
  enableReferenceImage = false,
  enableMultipleGeneration = false,
  enableThreeViews = false,
  threeViewsMode = 'separate',
  threeViewsValue = { front: null, side: null, top: null },
  onThreeViewsChange,
  autoCategoryFilter = true,
  defaultTab = 'upload',
}: ImageSelectorProps) {
  const { addToast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const state = useImageSelectorState({
    value,
    projectId,
    type,
    enableThreeViews,
    threeViewsMode,
    characterDescription,
    autoCategoryFilter,
    characterGender,
    characterAge,
    defaultTab,
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
    gender: state.gender,
    age: state.age,
    resolution: state.resolution,
    aspectRatio: state.aspectRatio,
    enableThreeViews: state.enableThreeViews,
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
    setGender: state.setGender,
    setAge: state.setAge,
    setResolution: state.setResolution,
    setAspectRatio: state.setAspectRatio,
    setEnableThreeViews: state.setEnableThreeViews,
    loadAssets: state.loadAssets,
    addToast,
  });

  const handleModalClose = useCallback(() => {
    state.setShowModal(false);
    state.setShowReferenceImagePicker(false);
  }, [state]);

  return (
    <div>
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
          
          <div style={{ padding: '20px', overflow: 'auto', flex: 1 }}>
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

function ThreeViewsDisplay({
  value,
  disabled,
  currentView,
  onViewSelect,
  onRemove,
  isDark = true
}: {
  value: { front: string | null; side: string | null; top: string | null };
  disabled: boolean;
  currentView: 'front' | 'side' | 'top';
  onViewSelect: (view: 'front' | 'side' | 'top') => void;
  onRemove: (view: 'front' | 'side' | 'top') => void;
  isDark?: boolean;
}) {
  const views = [
    { key: 'front' as const, label: '正视图' },
    { key: 'side' as const, label: '侧视图' },
    { key: 'top' as const, label: '俯视图' }
  ];

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {views.map((view) => (
        <div key={view.key} style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: isDark ? 'rgba(250,250,250,0.7)' : 'rgba(24,24,27,0.7)',
            marginBottom: '12px',
          }}>
            {view.label}
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            {value[view.key] ? (
              <>
                <div style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                }}>
                  <img
                    src={value[view.key] || ''}
                    alt={view.label}
                    style={{
                      width: '100%',
                      maxWidth: '220px',
                      height: 'auto',
                      cursor: disabled ? 'default' : 'pointer',
                      display: 'block',
                    }}
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
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: '3px solid',
                      borderColor: isDark ? '#1a1a2e' : '#ffffff',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    <X style={{ width: '14px', height: '14px' }} />
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
                style={{
                  width: '100%',
                  minHeight: '140px',
                  padding: '24px',
                  border: `2px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '16px',
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.02)',
                  color: isDark ? 'rgba(250,250,250,0.5)' : 'rgba(24,24,27,0.5)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease',
                }}
              >
                <Images style={{ width: '36px', height: '36px', color: ACCENT_COLOR }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>上传或生成{view.label}</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SingleImageDisplay({
  value,
  disabled,
  onRemove,
  onClick,
  isDark = true
}: {
  value: string;
  disabled: boolean;
  onRemove: () => void;
  onClick: () => void;
  isDark?: boolean;
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
      }}>
        <img
          src={value}
          alt="已选择"
          style={{
            width: '100%',
            maxWidth: '220px',
            height: 'auto',
            cursor: 'pointer',
            display: 'block',
          }}
          onClick={onClick}
        />
      </div>
      {!disabled && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#ef4444',
            border: '3px solid',
            borderColor: isDark ? '#1a1a2e' : '#ffffff',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      )}
    </div>
  );
}

function ImageSelectorTrigger({
  onClick,
  disabled,
  placeholder,
  isDark = true
}: {
  onClick: () => void;
  disabled: boolean;
  placeholder: string;
  isDark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        minHeight: '140px',
        padding: '24px',
        border: `2px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '16px',
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.02)',
        color: isDark ? 'rgba(250,250,250,0.5)' : 'rgba(24,24,27,0.5)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        transition: 'all 0.3s ease',
      }}
    >
      <Images style={{ width: '36px', height: '36px', color: ACCENT_COLOR }} />
      <span style={{ fontSize: '14px', fontWeight: '600' }}>{placeholder}</span>
      <span style={{ fontSize: '12px', opacity: 0.7 }}>
        上传 / AI 生成 / 素材库
      </span>
    </button>
  );
}

function ImageSelectorModal({
  onClose,
  children,
  showReferenceImagePicker,
  activeTab,
  effectiveThreeViewsMode,
  currentView,
  isDark = true
}: {
  onClose: () => void;
  children: React.ReactNode;
  showReferenceImagePicker: boolean;
  activeTab: string;
  effectiveThreeViewsMode: ThreeViewsMode;
  currentView: 'front' | 'side' | 'top';
  isDark?: boolean;
}) {
  const getTitle = () => {
    if (showReferenceImagePicker) return '选择参考图';
    if (activeTab === 'generate' && effectiveThreeViewsMode === 'combined') return '选择三视图';
    const viewLabels = { front: '正视图', side: '侧视图', top: '俯视图' };
    return `选择${viewLabels[currentView]}`;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          background: isDark ? 'rgba(10, 10, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          width: '90%',
          maxWidth: '850px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: isDark ? '#fafafa' : '#18181b',
          }}>
            {getTitle()}
          </h3>
          <button 
            onClick={onClose} 
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: isDark ? 'rgba(250,250,250,0.5)' : 'rgba(24,24,27,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
