import React, { useState, useCallback } from 'react'
import { FileText, Plus, Check, Trash2, Download, Upload, Copy, Star, Clock, X } from 'lucide-react'
import { ContentType } from './types'

export interface ConfigTemplate {
  id: string
  name: string
  description?: string
  isPreset: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  config: {
    defaultModels: Record<ContentType, string>
    modelParameters: Record<ContentType, Record<string, any>>
  }
}

export interface ConfigTemplatesProps {
  templates: ConfigTemplate[]
  currentConfig: {
    defaultModels: Record<ContentType, string>
    modelParameters: Record<ContentType, Record<string, any>>
  }
  onApplyTemplate: (template: ConfigTemplate) => void
  onSaveTemplate: (template: Omit<ConfigTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteTemplate: (templateId: string) => void
  onToggleFavorite: (templateId: string) => void
  onExportTemplate: (template: ConfigTemplate) => void
  onImportTemplate: (template: ConfigTemplate) => void
  className?: string
  style?: React.CSSProperties
}

const PRESET_TEMPLATES: ConfigTemplate[] = [
  {
    id: 'preset-fast',
    name: '快速模式',
    description: '优先选择响应速度最快的模型，适合快速迭代和测试',
    isPreset: true,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      defaultModels: {
        text: 'gpt-3.5-turbo',
        image: 'dall-e-2',
        video: 'stable-video-fast',
        audio: 'tts-fast',
        script: 'gpt-3.5-turbo',
        novel: 'gpt-3.5-turbo',
        storyline: 'gpt-3.5-turbo',
        outline: 'gpt-3.5-turbo',
      },
      modelParameters: {
        text: { temperature: 0.7, maxTokens: 1000 },
        image: { quality: 'standard', size: '512x512' },
        video: { quality: 'standard', duration: 5 },
        audio: { speed: 1.0 },
        script: { temperature: 0.8, maxTokens: 2000 },
        novel: { temperature: 0.9, maxTokens: 3000 },
        storyline: { temperature: 0.7, maxTokens: 1500 },
        outline: { temperature: 0.6, maxTokens: 2000 },
      },
    },
  },
  {
    id: 'preset-quality',
    name: '高质量模式',
    description: '优先选择输出质量最高的模型，适合最终交付',
    isPreset: true,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      defaultModels: {
        text: 'gpt-4',
        image: 'dall-e-3',
        video: 'stable-video-hd',
        audio: 'tts-hd',
        script: 'gpt-4',
        novel: 'gpt-4',
        storyline: 'gpt-4',
        outline: 'gpt-4',
      },
      modelParameters: {
        text: { temperature: 0.5, maxTokens: 2000 },
        image: { quality: 'hd', size: '1024x1024' },
        video: { quality: 'hd', duration: 10 },
        audio: { speed: 0.9 },
        script: { temperature: 0.6, maxTokens: 4000 },
        novel: { temperature: 0.7, maxTokens: 5000 },
        storyline: { temperature: 0.5, maxTokens: 2000 },
        outline: { temperature: 0.5, maxTokens: 3000 },
      },
    },
  },
  {
    id: 'preset-economy',
    name: '经济模式',
    description: '优先选择成本最低的模型，适合大规模批量处理',
    isPreset: true,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      defaultModels: {
        text: 'gpt-3.5-turbo',
        image: 'stable-diffusion',
        video: 'stable-video-basic',
        audio: 'tts-basic',
        script: 'gpt-3.5-turbo',
        novel: 'gpt-3.5-turbo',
        storyline: 'gpt-3.5-turbo',
        outline: 'gpt-3.5-turbo',
      },
      modelParameters: {
        text: { temperature: 0.7, maxTokens: 500 },
        image: { quality: 'standard', size: '512x512' },
        video: { quality: 'standard', duration: 3 },
        audio: { speed: 1.2 },
        script: { temperature: 0.7, maxTokens: 1000 },
        novel: { temperature: 0.8, maxTokens: 2000 },
        storyline: { temperature: 0.7, maxTokens: 1000 },
        outline: { temperature: 0.6, maxTokens: 1500 },
      },
    },
  },
]

export function ConfigTemplates({
  templates: userTemplates,
  currentConfig,
  onApplyTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onToggleFavorite,
  onExportTemplate,
  onImportTemplate,
  className,
  style,
}: ConfigTemplatesProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [importJson, setImportJson] = useState('')

  const allTemplates = [...PRESET_TEMPLATES, ...userTemplates]
  const favoriteTemplates = allTemplates.filter(t => t.isFavorite)
  const recentTemplates = userTemplates
    .filter(t => !t.isFavorite)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('请输入模板名称')
      return
    }

    onSaveTemplate({
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || undefined,
      isPreset: false,
      isFavorite: false,
      config: currentConfig,
    })

    setNewTemplateName('')
    setNewTemplateDescription('')
    setShowSaveDialog(false)
  }

  const handleImportTemplate = () => {
    try {
      const template = JSON.parse(importJson) as ConfigTemplate
      if (!template.name || !template.config) {
        throw new Error('Invalid template format')
      }
      onImportTemplate(template)
      setImportJson('')
      setShowImportDialog(false)
    } catch (error) {
      alert('模板格式无效，请检查JSON格式')
    }
  }

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)',
        borderRadius: '12px',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FileText style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              配置模板
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              快速应用预设配置或保存自定义模板
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowImportDialog(true)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
          >
            <Upload style={{ width: '14px', height: '14px' }} />
            导入
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'white',
            }}
          >
            <Plus style={{ width: '14px', height: '14px' }} />
            保存当前配置
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
            预设模板
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {PRESET_TEMPLATES.map(template => (
              <div
                key={template.id}
                onClick={() => onApplyTemplate(template)}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.backgroundColor = 'var(--accent-bg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {template.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {template.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {favoriteTemplates.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
              收藏模板
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {favoriteTemplates.map(template => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  onApply={() => onApplyTemplate(template)}
                  onDelete={() => onDeleteTemplate(template.id)}
                  onToggleFavorite={() => onToggleFavorite(template.id)}
                  onExport={() => onExportTemplate(template)}
                />
              ))}
            </div>
          </div>
        )}

        {recentTemplates.length > 0 && (
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
              最近使用
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {recentTemplates.map(template => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  onApply={() => onApplyTemplate(template)}
                  onDelete={() => onDeleteTemplate(template.id)}
                  onToggleFavorite={() => onToggleFavorite(template.id)}
                  onExport={() => onExportTemplate(template)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showSaveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                保存配置模板
              </h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                模板名称 *
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="输入模板名称"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                描述（可选）
              </label>
              <textarea
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                placeholder="输入模板描述"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '12px',
            padding: '24px',
            width: '500px',
            maxWidth: '90%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                导入配置模板
              </h3>
              <button
                onClick={() => setShowImportDialog(false)}
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                模板JSON
              </label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='粘贴模板JSON...'
                rows={8}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowImportDialog(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                }}
              >
                取消
              </button>
              <button
                onClick={handleImportTemplate}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateItem({
  template,
  onApply,
  onDelete,
  onToggleFavorite,
  onExport,
}: {
  template: ConfigTemplate
  onApply: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onExport: () => void
}) {
  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'var(--bg-hover)',
      border: '1px solid var(--border-primary)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
          {template.name}
        </div>
        {template.description && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {template.description}
          </div>
        )}
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          <Clock style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />
          {new Date(template.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={onToggleFavorite}
          style={{
            padding: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: template.isFavorite ? '#F59E0B' : 'var(--text-tertiary)',
          }}
          title={template.isFavorite ? '取消收藏' : '收藏'}
        >
          <Star style={{ width: '16px', height: '16px', fill: template.isFavorite ? 'currentColor' : 'none' }} />
        </button>
        <button
          onClick={onExport}
          style={{
            padding: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
          }}
          title="导出"
        >
          <Download style={{ width: '16px', height: '16px' }} />
        </button>
        {!template.isPreset && (
          <button
            onClick={onDelete}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
            }}
            title="删除"
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        )}
        <button
          onClick={onApply}
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--accent)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'white',
            fontWeight: '500',
          }}
        >
          应用
        </button>
      </div>
    </div>
  )
}
