import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronDown, Search, Star, Clock, AlertCircle, Loader2, Zap, Settings, Check } from 'lucide-react'
import { apiClient } from '../../../lib/api'
import { cacheUtils } from '../../../lib/modelCache'

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'script' | 'novel' | 'storyline' | 'outline'

export interface AIProviderModel {
  id: string
  name: string
  types: string[]
  description?: string
  capabilities?: string[]
}

export interface ModelSelectorProps {
  contentType: ContentType
  value?: string
  onChange: (modelId: string) => void
  showLastUsed?: boolean
  showDefault?: boolean
  allowCustom?: boolean
  onManageModels?: () => void
  onRefreshModels?: () => void
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  placeholder?: string
}

const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  text: '📝',
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  script: '📋',
  novel: '📚',
  storyline: '📖',
  outline: '📑',
}

export function ModelSelector({
  contentType,
  value,
  onChange,
  showLastUsed = true,
  showDefault = true,
  allowCustom = false,
  onManageModels,
  onRefreshModels,
  className,
  style,
  disabled = false,
  placeholder = '选择模型',
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [models, setModels] = useState<AIProviderModel[]>([])
  const [defaultModels, setDefaultModels] = useState<Record<string, string>>({})
  const [lastUsedModels, setLastUsedModels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [testingModel, setTestingModel] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadModels = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      const cachedData = cacheUtils.getModels()
      const shouldUseCache = !forceRefresh && cachedData && !cacheUtils.getCacheInfo().models.expired
      
      if (shouldUseCache) {
        const modelsByType = cachedData!.modelsByType
        const filteredModels = (modelsByType[contentType] || []).filter((m: any) => {
          const provider = cachedData!.providers.find((p: any) => 
            p.models?.some((pm: any) => pm.id === m.id)
          )
          return provider?.enabled
        })
        setModels(filteredModels)
        setLoading(false)
        return
      }
      
      const providers = await apiClient.getAIProviders()
      
      console.log('[ModelSelector] All providers:', providers)
      console.log('[ModelSelector] ContentType:', contentType)
      
      const enabledProviders = providers.providers.filter(p => p.enabled)
      
      console.log('[ModelSelector] Enabled providers:', enabledProviders)
      
      const allModels = enabledProviders
        .flatMap(provider => {
          console.log('[ModelSelector] Provider models:', provider.id, provider.type, provider.models)
          return (provider.models || []).filter(m => {
            const hasScript = m.types?.includes(contentType)
            console.log('[ModelSelector] Model filter:', m.name, m.types, 'includes', contentType, '=', hasScript)
            return hasScript
          })
        })
      
      console.log('[ModelSelector] Filtered models for', contentType, ':', allModels)
      
      const modelsByType: Record<string, typeof models> = {}
      providers.providers
        .filter(p => p.enabled)
        .forEach(provider => {
        provider.models?.forEach(model => {
          model.types?.forEach(type => {
            if (!modelsByType[type]) {
              modelsByType[type] = []
            }
            modelsByType[type].push(model as AIProviderModel)
          })
        })
      })
      
      cacheUtils.setModels({
        providers: providers.providers,
        modelsByType,
        lastUpdated: Date.now(),
      })
      
      setModels(allModels)
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoading(false)
    }
  }, [contentType])

  const loadPreferences = useCallback(async (forceRefresh = false) => {
    try {
      const cachedData = cacheUtils.getPreferences()
      const shouldUseCache = !forceRefresh && cachedData && !cacheUtils.getCacheInfo().preferences.expired
      
      if (shouldUseCache) {
        setDefaultModels(cachedData!.defaultModels)
        setLastUsedModels(cachedData!.lastUsedModels)
        return
      }
      
      const prefs = await apiClient.getModelPreferences()
      setDefaultModels(prefs.defaultModels)
      setLastUsedModels(prefs.lastUsedModels)
      
      cacheUtils.setPreferences({
        defaultModels: prefs.defaultModels,
        lastUsedModels: prefs.lastUsedModels,
        modelParameters: prefs.modelParameters,
        lastUpdated: Date.now(),
      })
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }, [])

  useEffect(() => {
    loadModels(true)
    loadPreferences(true)
  }, [loadModels, loadPreferences])

  const handleRefresh = () => {
    loadModels(true)
    loadPreferences(true)
    onRefreshModels?.()
  }

  const handleTestModel = async (modelId: string) => {
    try {
      setTestingModel(modelId)
      const result = await apiClient.testModel({ modelId })
      console.log('Model test result:', result)
    } catch (error) {
      console.error('Model test failed:', error)
    } finally {
      setTestingModel(null)
    }
  }

  const handleSelect = (modelId: string) => {
    onChange(modelId)
    setIsOpen(false)
    apiClient.recordModelUsage({
      modelId,
      contentType,
      success: true
    })
  }

  const getFilteredModels = () => {
    if (!searchValue) return models
    const searchLower = searchValue.toLowerCase()
    return models.filter(model =>
      model.name.toLowerCase().includes(searchLower) ||
      model.description?.toLowerCase().includes(searchLower)
    )
  }

  const getDisplayValue = () => {
    if (!value) return placeholder
    const model = models.find(m => m.id === value)
    return model?.name || value
  }

  const getDefaultModel = () => {
    const defaultId = defaultModels[contentType]
    return models.find(m => m.id === defaultId)
  }

  const getLastUsedModel = () => {
    const lastUsedId = lastUsedModels[contentType]
    return models.find(m => m.id === lastUsedId)
  }

  const handleSetDefault = async (modelId: string) => {
    try {
      const configurations = Object.entries({
        ...defaultModels,
        [contentType]: modelId
      }).map(([type, modelId]) => ({ type, modelId }));
      
      await apiClient.setDefaultModels(configurations);
      setDefaultModels(prev => ({ ...prev, [contentType]: modelId }))
    } catch (error) {
      console.error('Failed to set default model:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' && isOpen) {
      const filtered = getFilteredModels()
      if (filtered.length > 0) {
        handleSelect(filtered[0].id)
      }
    }
  }

  const filteredModels = getFilteredModels()
  const defaultModel = getDefaultModel()
  const lastUsedModel = getLastUsedModel()

  return (
    <ModelSelectorDropdown
      contentType={contentType}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      models={filteredModels}
      defaultModel={defaultModel}
      lastUsedModel={lastUsedModel}
      showDefault={showDefault}
      showLastUsed={showLastUsed}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      testingModel={testingModel}
      defaultModels={defaultModels}
      allowCustom={allowCustom}
      onManageModels={onManageModels}
      onRefreshModels={onRefreshModels}
      getDisplayValue={getDisplayValue}
      handleSelect={handleSelect}
      handleTestModel={handleTestModel}
      handleSetDefault={handleSetDefault}
      handleRefresh={handleRefresh}
      handleKeyDown={handleKeyDown}
      containerRef={containerRef}
      className={className}
      style={style}
    />
  )
}

interface ModelSelectorDropdownProps {
  contentType: ContentType
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  searchValue: string
  setSearchValue: (value: string) => void
  models: AIProviderModel[]
  defaultModel?: AIProviderModel
  lastUsedModel?: AIProviderModel
  showDefault: boolean
  showLastUsed: boolean
  value?: string
  placeholder: string
  disabled: boolean
  loading: boolean
  testingModel: string | null
  defaultModels: Record<string, string>
  allowCustom: boolean
  onManageModels?: () => void
  onRefreshModels?: () => void
  getDisplayValue: () => string
  handleSelect: (modelId: string) => void
  handleTestModel: (modelId: string) => void
  handleSetDefault: (modelId: string) => void
  handleRefresh: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  containerRef: React.RefObject<HTMLDivElement>
  className?: string
  style?: React.CSSProperties
}

export function ModelSelectorDropdown({
  contentType,
  isOpen,
  setIsOpen,
  searchValue,
  setSearchValue,
  models,
  defaultModel,
  lastUsedModel,
  showDefault,
  showLastUsed,
  value,
  placeholder,
  disabled,
  loading,
  testingModel,
  defaultModels,
  allowCustom,
  onManageModels,
  onRefreshModels,
  getDisplayValue,
  handleSelect,
  handleTestModel,
  handleSetDefault,
  handleRefresh,
  handleKeyDown,
  containerRef,
  className,
  style,
}: ModelSelectorDropdownProps) {
  return (
    <div
      className={className}
      ref={containerRef}
      style={{ position: 'relative', ...style }}
      onKeyDown={handleKeyDown}
    >
      <ModelSelectorTrigger
        contentType={contentType}
        isOpen={isOpen}
        disabled={disabled}
        onManageModels={onManageModels}
        getDisplayValue={getDisplayValue}
        setIsOpen={setIsOpen}
        placeholder={placeholder}
      />

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '400px',
            overflow: 'auto',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'dropdown-enter 0.15s ease-out',
          }}
        >
          <ModelSelectorSearch
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            loading={loading}
            onRefreshModels={onRefreshModels}
            handleRefresh={handleRefresh}
          />

          {showDefault && defaultModel && (
            <ModelSelectorSpecialItem
              model={defaultModel}
              icon={<Star style={{ width: '16px', height: '16px', color: '#fbbf24' }} />}
              label="默认模型"
              isSelected={value === defaultModel.id}
              onSelect={() => handleSelect(defaultModel.id)}
            />
          )}

          {showLastUsed && lastUsedModel && lastUsedModel.id !== defaultModel?.id && (
            <ModelSelectorSpecialItem
              model={lastUsedModel}
              icon={<Clock style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />}
              label="最近使用"
              isSelected={value === lastUsedModel.id}
              onSelect={() => handleSelect(lastUsedModel.id)}
            />
          )}

          {models.length > 0 && (
            <div style={{
              padding: '8px 12px 4px',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              可用模型 ({models.length})
            </div>
          )}

          {models.map((model) => (
            <ModelSelectorItem
              key={model.id}
              model={model}
              isSelected={value === model.id}
              testingModel={testingModel}
              isDefault={defaultModels[contentType] === model.id}
              onSelect={() => handleSelect(model.id)}
              onTest={() => handleTestModel(model.id)}
              onSetDefault={() => handleSetDefault(model.id)}
            />
          ))}

          {models.length === 0 && !loading && (
            <ModelSelectorEmpty
              allowCustom={allowCustom}
              onManageModels={onManageModels}
              setIsOpen={setIsOpen}
            />
          )}

          {loading && (
            <ModelSelectorLoading />
          )}
        </div>
      )}

      <ModelSelectorStyles />
    </div>
  )
}

interface ModelSelectorTriggerProps {
  contentType: ContentType
  isOpen: boolean
  disabled: boolean
  onManageModels?: () => void
  getDisplayValue: () => string
  setIsOpen: (open: boolean) => void
  placeholder: string
}

function ModelSelectorTrigger({
  contentType,
  isOpen,
  disabled,
  onManageModels,
  getDisplayValue,
  setIsOpen,
  placeholder,
}: ModelSelectorTriggerProps) {
  return (
    <div
      onClick={() => !disabled && setIsOpen(!isOpen)}
      style={{
        height: '40px',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border-primary)',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--border-primary)'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <span style={{ fontSize: '16px' }}>{CONTENT_TYPE_ICONS[contentType]}</span>
        <span style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: !getDisplayValue() ? 'var(--text-tertiary)' : 'var(--text-primary)',
        }}>
          {getDisplayValue()}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {onManageModels && (
          <Settings
            style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }}
            onClick={(e) => {
              e.stopPropagation()
              onManageModels()
            }}
          />
        )}
        <ChevronDown
          style={{
            width: '18px',
            height: '18px',
            color: 'var(--text-tertiary)',
            transition: 'transform 0.15s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </div>
    </div>
  )
}

interface ModelSelectorSearchProps {
  searchValue: string
  setSearchValue: (value: string) => void
  loading: boolean
  onRefreshModels?: () => void
  handleRefresh: () => void
}

function ModelSelectorSearch({
  searchValue,
  setSearchValue,
  loading,
  onRefreshModels,
  handleRefresh,
}: ModelSelectorSearchProps) {
  return (
    <div style={{
      padding: '8px',
      borderBottom: '1px solid var(--border-primary)',
      position: 'sticky',
      top: 0,
      background: 'var(--bg-base)',
      zIndex: 1,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        background: 'var(--bg-hover)',
        borderRadius: '6px',
      }}>
        <Search style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="搜索模型..."
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '14px',
            color: 'var(--text-primary)',
          }}
        />
        {onRefreshModels && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-tertiary)',
            }}
          >
            {loading ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Zap style={{ width: '16px', height: '16px' }} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

interface ModelSelectorSpecialItemProps {
  model: AIProviderModel
  icon: React.ReactNode
  label: string
  isSelected: boolean
  onSelect: () => void
}

function ModelSelectorSpecialItem({
  model,
  icon,
  label,
  isSelected,
  onSelect,
}: ModelSelectorSpecialItemProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--accent-bg)' : 'transparent',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {icon}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: '13px' }}>{model.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{label}</div>
      </div>
      {isSelected && <Check style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />}
    </div>
  )
}

interface ModelSelectorItemProps {
  model: AIProviderModel
  isSelected: boolean
  testingModel: string | null
  isDefault: boolean
  onSelect: () => void
  onTest: () => void
  onSetDefault: () => void
}

function ModelSelectorItem({
  model,
  isSelected,
  testingModel,
  isDefault,
  onSelect,
  onTest,
  onSetDefault,
}: ModelSelectorItemProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--accent-bg)' : 'transparent',
        transition: 'all 0.1s ease',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 500, fontSize: '14px' }}>{model.name}</span>
          {model.capabilities && model.capabilities.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {model.capabilities.slice(0, 2).map((cap, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>
        {model.description && (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            marginTop: '4px',
            lineHeight: 1.4,
          }}>
            {model.description}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTest()
          }}
          disabled={testingModel === model.id}
          style={{
            background: 'none',
            border: 'none',
            cursor: testingModel === model.id ? 'not-allowed' : 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-tertiary)',
          }}
          title="测试模型"
        >
          {testingModel === model.id ? (
            <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Zap style={{ width: '14px', height: '14px' }} />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSetDefault()
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: isDefault ? '#fbbf24' : 'var(--text-tertiary)',
          }}
          title="设为默认"
        >
          <Star style={{ width: '14px', height: '14px', fill: isDefault ? 'currentColor' : 'none' }} />
        </button>
        {isSelected && (
          <Check style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
        )}
      </div>
    </div>
  )
}

interface ModelSelectorEmptyProps {
  allowCustom: boolean
  onManageModels?: () => void
  setIsOpen: (open: boolean) => void
}

function ModelSelectorEmpty({
  allowCustom,
  onManageModels,
  setIsOpen,
}: ModelSelectorEmptyProps) {
  return (
    <div style={{
      padding: '24px',
      textAlign: 'center',
      color: 'var(--text-tertiary)',
      fontSize: '14px',
    }}>
      <AlertCircle style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: 'var(--text-tertiary)' }} />
      <div>未找到匹配的模型</div>
      {allowCustom && (
        <button
          onClick={() => {
            setIsOpen(false)
            onManageModels?.()
          }}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          添加新模型
        </button>
      )}
    </div>
  )
}

function ModelSelectorLoading() {
  return (
    <div style={{
      padding: '24px',
      textAlign: 'center',
      color: 'var(--text-tertiary)',
      fontSize: '14px',
    }}>
      <Loader2 style={{ width: '32px', height: '32px', margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
      <div>加载中...</div>
    </div>
  )
}

function ModelSelectorStyles() {
  return (
    <style>{`
      @keyframes dropdown-enter {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  )
}
