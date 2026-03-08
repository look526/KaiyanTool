import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw, Download, Upload, AlertCircle, CheckCircle2, Loader2, Settings2, Play, X, History, CheckSquare, Square, BarChart3, Zap } from 'lucide-react'
import { ModelSelector, ContentType, BatchOperations, BatchModelItem } from '../components/ui/ModelSelector'
import { AIProviderModel } from '../components/ui/ModelSelector'
import { apiClient } from '../lib/api-client'
import { uiConfig } from '../config'

interface ModelConfiguration {
  contentType: ContentType
  label: string
  icon: string
  defaultModelId?: string
  lastUsedModelId?: string
}

const CONTENT_TYPES: ModelConfiguration[] = [
  { contentType: 'text', label: '文本生成', icon: '📝' },
  { contentType: 'image', label: '图像生成', icon: '🖼️' },
  { contentType: 'video', label: '视频生成', icon: '🎬' },
  { contentType: 'audio', label: '音频生成', icon: '🎵' },
  { contentType: 'script', label: '剧本生成', icon: '📋' },
  { contentType: 'novel', label: '小说生成', icon: '📚' },
  { contentType: 'storyline', label: '故事线生成', icon: '📖' },
  { contentType: 'outline', label: '大纲生成', icon: '📑' },
]

interface UsageStats {
  defaultModels: Record<string, string>
  lastUsedModels: Record<string, string>
  modelCount: number
  modelsByType: Record<string, number>
}

const contentTypeColors: Record<string, string> = {
  text: '#6366f1',
  image: '#ec4899',
  video: '#3b82f6',
  audio: '#14b8a6',
  script: '#f97316',
  novel: '#8b5cf6',
  storyline: '#06b6d4',
  outline: '#84cc16',
}

export default function ModelConfigurationPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [configurations, setConfigurations] = useState<Record<string, string>>({})
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [showBatchTest, setShowBatchTest] = useState(false)
  const [batchTesting, setBatchTesting] = useState<Set<string>>(new Set())
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showBatchMode, setShowBatchMode] = useState(false)
  const [allModels, setAllModels] = useState<AIProviderModel[]>([])
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())
  const [batchContentType, setBatchContentType] = useState<ContentType | 'all'>('all')
  const [resetHover, setResetHover] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const loadConfiguration = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const prefs = await apiClient.getModelPreferences() as { defaultModels?: Record<string, string> } | null
      setConfigurations(prefs?.defaultModels || {})
      
      const stats = await apiClient.getUsageStats() as UsageStats | null
      setUsageStats(stats)

      const providers = await apiClient.getAIProviders()
      const models = ((providers as any).providers || []).flatMap((p: any) => p.models || []) as AIProviderModel[]
      setAllModels(models)
    } catch (err: any) {
      setError(err.message || '加载配置失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfiguration()
  }, [loadConfiguration])

  const handleModelChange = (contentType: string, modelId: string) => {
    setConfigurations(prev => ({ ...prev, [contentType]: modelId }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await apiClient.setDefaultModels(Object.entries(configurations).map(([contentType, modelId]) => ({
        contentType,
        modelId
      })))
      setSuccess('配置保存成功')
      setTimeout(() => setSuccess(null), uiConfig.successMessageDuration)
      await loadConfiguration()
    } catch (err: any) {
      setError(err.message || '保存配置失败')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const data = {
      defaultModels: configurations,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `model-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          if (data.defaultModels) {
            setConfigurations(data.defaultModels)
            setSuccess('配置导入成功')
            setTimeout(() => setSuccess(null), uiConfig.successMessageDuration)
          } else {
            setError('无效的配置文件格式')
          }
        } catch (err) {
          setError('解析配置文件失败')
        }
      }
    }
    input.click()
  }

  const handleReset = () => {
    if (confirm('确定要重置所有默认模型配置吗？')) {
      setConfigurations({})
      setSuccess('配置已重置')
      setTimeout(() => setSuccess(null), uiConfig.successMessageDuration)
    }
  }

  const handleBatchTestByType = async (contentType: ContentType) => {
    try {
      const providers = await apiClient.getAIProviders()
      const models = ((providers as any).providers || []).flatMap((p: any) => p.models?.filter((m: any) => m.types?.includes(contentType)) || [])
      
      if (models.length === 0) {
        addToast?.({ type: 'warning', title: '无可用模型', message: `${CONTENT_TYPES.find(ct => ct.contentType === contentType)?.label}没有可用的模型` })
        return
      }

      setShowBatchTest(true)
      setTestResults({})
      
      for (const model of models) {
        setBatchTesting(prev => new Set(prev).add(model.id))
        try {
          await apiClient.testModel({ modelId: model.id })
          setTestResults(prev => ({ ...prev, [model.id]: { success: true, message: '测试成功' } }))
        } catch (err) {
          setTestResults(prev => ({ ...prev, [model.id]: { success: false, message: '测试失败' } }))
        }
        setBatchTesting(prev => {
          const newSet = new Set(prev)
          newSet.delete(model.id)
          return newSet
        })
        
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const successCount = Object.values(testResults).filter(r => r.success).length
      setSuccess(`批量测试完成：${successCount}/${models.length} 个模型测试成功`)
      setTimeout(() => setSuccess(null), uiConfig.successMessageDuration)
    } catch (err) {
      setError('批量测试失败')
    }
  }

  const addToast = (toast: any) => {
    console.log('Toast:', toast)
  }

  const loadHistory = async () => {
    try {
      setHistoryLoading(true)
      const result = await apiClient.getConfigurationHistory({ limit: '20' }) as { history: Array<{ id: string; timestamp: string; changes: string }> }
      setHistory(result.history)
    } catch (err: any) {
      setError(err.message || '加载历史记录失败')
    } finally {
      setHistoryLoading(false)
    }
  }

  const toggleHistory = () => {
    if (!showHistory) {
      loadHistory()
    }
    setShowHistory(!showHistory)
  }

  const handleBatchTest = async (modelIds: string[]) => {
    for (const modelId of modelIds) {
      await apiClient.testModel({ modelId })
    }
  }

  const handleBatchEnable = async (modelIds: string[]) => {
    console.log('批量启用模型:', modelIds)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handleBatchDisable = async (modelIds: string[]) => {
    console.log('批量禁用模型:', modelIds)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handleBatchDelete = async (modelIds: string[]) => {
    console.log('批量删除模型:', modelIds)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const getFilteredModelsForBatch = () => {
    if (batchContentType === 'all') {
      return allModels
    }
    return allModels.filter(m => m.types?.includes(batchContentType))
  }

  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'default_models': '默认模型',
      'model_parameters': '模型参数',
    }
    return labels[type] || type
  }

  const formatHistoryValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const buttonBaseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    whiteSpace: 'nowrap' as const,
  }

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
  }

  const outlineButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: 'transparent',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, var(--bg-page) 0%, var(--bg-base) 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', color: '#fff' }} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>加载配置中</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>正在获取模型配置信息...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, var(--bg-page) 0%, var(--bg-base) 100%)' }}>
      <header style={{
        height: '72px',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            to="/settings" 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              background: 'var(--bg-hover)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 4px 0',
            }}>AI 模型配置</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              为不同内容类型配置默认 AI 模型
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowBatchMode(!showBatchMode)
              setSelectedModels(new Set())
            }}
            style={{
              ...outlineButtonStyle,
              background: showBatchMode ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
              color: showBatchMode ? '#fff' : 'var(--text-primary)',
              borderColor: showBatchMode ? 'transparent' : 'var(--border-primary)',
            }}
          >
            <CheckSquare style={{ width: '16px', height: '16px' }} />
            {showBatchMode ? '退出批量' : '批量操作'}
          </button>
          <button onClick={toggleHistory} style={outlineButtonStyle}>
            <History style={{ width: '16px', height: '16px' }} />
            历史记录
          </button>
          <button onClick={handleExport} style={outlineButtonStyle}>
            <Download style={{ width: '16px', height: '16px' }} />
            导出
          </button>
          <button onClick={handleImport} style={outlineButtonStyle}>
            <Upload style={{ width: '16px', height: '16px' }} />
            导入
          </button>
          <button onClick={loadConfiguration} style={outlineButtonStyle}>
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            刷新
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...primaryButtonStyle,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save style={{ width: '16px', height: '16px' }} />
            )}
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#ef4444',
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <span style={{ fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '24px',
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#22c55e',
          }}>
            <CheckCircle2 style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <span style={{ fontSize: '14px' }}>{success}</span>
          </div>
        )}

        {usageStats && (
          <div style={{
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              padding: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Settings2 style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总模型数</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {usageStats?.modelCount || 0}
              </div>
            </div>
            <div style={{
              padding: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle2 style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>已配置默认模型</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {usageStats?.defaultModels ? Object.keys(usageStats.defaultModels).length : 0}/8
              </div>
            </div>
            {usageStats?.modelsByType && Object.entries(usageStats.modelsByType).slice(0, 2).map(([type, count]) => {
              const color = contentTypeColors[type] || '#6366f1'
              return (
                <div key={type} style={{
                  padding: '20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      {CONTENT_TYPES.find(ct => ct.contentType === type)?.icon || '📦'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {CONTENT_TYPES.find(ct => ct.contentType === type)?.label || type}
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showBatchTest && Object.keys(testResults).length > 0 && (
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  批量测试结果
                </div>
              </div>
              <button
                onClick={() => setShowBatchTest(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: 'var(--text-muted)',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div style={{
              maxHeight: '200px',
              overflow: 'auto',
              display: 'grid',
              gap: '10px',
            }}>
              {Object.entries(testResults).map(([modelId, result]) => (
                <div
                  key={modelId}
                  style={{
                    padding: '12px 16px',
                    background: result.success ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    border: `1px solid ${result.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '10px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <CheckCircle2
                    style={{
                      width: '18px',
                      height: '18px',
                      color: result.success ? '#22c55e' : '#ef4444',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: result.success ? '#22c55e' : '#ef4444' }}>
                    {result.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showBatchMode && (
          <div style={{
            marginBottom: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckSquare style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    批量操作模式
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    对多个模型执行批量操作
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={batchContentType}
                  onChange={(e) => {
                    setBatchContentType(e.target.value as ContentType | 'all')
                    setSelectedModels(new Set())
                  }}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">全部类型</option>
                  {CONTENT_TYPES.map(ct => (
                    <option key={ct.contentType} value={ct.contentType}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <BatchOperations
              models={getFilteredModelsForBatch()}
              selectedModels={selectedModels}
              onSelectionChange={setSelectedModels}
              onBatchTest={handleBatchTest}
              onBatchEnable={handleBatchEnable}
              onBatchDisable={handleBatchDisable}
              onBatchDelete={handleBatchDelete}
            />

            <div style={{
              maxHeight: '400px',
              overflow: 'auto',
            }}>
              {getFilteredModelsForBatch().length === 0 ? (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                }}>
                  暂无模型
                </div>
              ) : (
                getFilteredModelsForBatch().map((model) => (
                  <BatchModelItem
                    key={model.id}
                    model={model}
                    isSelected={selectedModels.has(model.id)}
                    onSelect={() => {
                      const newSelected = new Set(selectedModels)
                      if (newSelected.has(model.id)) {
                        newSelected.delete(model.id)
                      } else {
                        newSelected.add(model.id)
                      }
                      setSelectedModels(newSelected)
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-primary)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Settings2 style={{ width: '22px', height: '22px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  默认模型配置
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  为每种内容类型设置默认的 AI 模型
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              style={{
                ...outlineButtonStyle,
                background: resetHover ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                borderColor: resetHover ? '#ef4444' : 'var(--border-primary)',
                color: resetHover ? '#ef4444' : 'var(--text-primary)',
              }}
              onMouseEnter={() => setResetHover(true)}
              onMouseLeave={() => setResetHover(false)}
            >
              重置全部
            </button>
          </div>

          <div>
            {CONTENT_TYPES.map((config, index) => {
              const color = contentTypeColors[config.contentType] || '#6366f1'
              const isConfigured = !!configurations[config.contentType]
              const isHovered = hoveredItem === config.contentType
              
              return (
                <div
                  key={config.contentType}
                  style={{
                    padding: '20px 24px',
                    borderBottom: index < CONTENT_TYPES.length - 1 ? '1px solid var(--border-primary)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    background: isHovered ? 'var(--bg-hover)' : 'transparent',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredItem(config.contentType)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                    border: `1px solid ${color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                    position: 'relative',
                  }}>
                    {config.icon}
                    {isConfigured && (
                      <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CheckCircle2 style={{ width: '10px', height: '10px', color: '#fff' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {config.label}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {config.contentType}
                      {isConfigured && (
                        <span style={{ marginLeft: '8px', color: '#22c55e' }}>• 已配置</span>
                      )}
                    </div>
                  </div>
                  <div style={{ width: '320px' }}>
                    <ModelSelector
                      contentType={config.contentType}
                      value={configurations[config.contentType]}
                      onChange={(modelId) => handleModelChange(config.contentType, modelId)}
                      placeholder="选择默认模型"
                    />
                  </div>
                  <button
                    onClick={() => handleBatchTestByType(config.contentType)}
                    disabled={batchTesting.size > 0}
                    style={{
                      ...outlineButtonStyle,
                      opacity: batchTesting.size > 0 ? 0.5 : 1,
                      cursor: batchTesting.size > 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Play style={{ width: '14px', height: '14px' }} />
                    批量测试
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '12px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#6366f1' }} />
            <strong style={{ color: 'var(--text-primary)' }}>使用说明</strong>
          </div>
          <ul style={{ margin: '0', padding: '0 0 0 20px' }}>
            <li>为每种内容类型选择默认的 AI 模型</li>
            <li>模型配置会在所有相关功能中自动应用</li>
            <li>可以随时更改配置，更改后点击"保存配置"按钮生效</li>
            <li>支持导入和导出配置，方便在不同设备间同步</li>
            <li>点击模型选择器中的星号图标可以快速设置默认模型</li>
          </ul>
        </div>

        {showHistory && (
          <div style={{
            marginTop: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <History style={{ width: '22px', height: '22px', color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    配置历史记录
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    查看最近的配置变更历史
                  </div>
                </div>
              </div>
              <button
                onClick={loadHistory}
                disabled={historyLoading}
                style={{
                  ...outlineButtonStyle,
                  opacity: historyLoading ? 0.5 : 1,
                  cursor: historyLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw style={{ width: '14px', height: '14px' }} />
                刷新
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {historyLoading ? (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}>
                  <Loader2 style={{ width: '32px', height: '32px', margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#6366f1' }} />
                  <div>加载历史记录中...</div>
                </div>
              ) : history.length === 0 ? (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                }}>
                  暂无历史记录
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {history.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '20px 24px',
                        borderBottom: index < history.length - 1 ? '1px solid var(--border-primary)' : 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{
                          minWidth: '140px',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                        }}>
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <span style={{
                              padding: '5px 12px',
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                              color: '#6366f1',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}>
                              {getChangeTypeLabel(item.changeType)}
                            </span>
                          </div>
                          {item.previousValue && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>修改前：</div>
                              <pre style={{
                                margin: '0',
                                padding: '12px',
                                background: 'var(--bg-base)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '8px',
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                overflow: 'auto',
                                maxHeight: '100px',
                              }}>
                                {formatHistoryValue(item.previousValue)}
                              </pre>
                            </div>
                          )}
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>修改后：</div>
                            <pre style={{
                              margin: '0',
                              padding: '12px',
                              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: 'var(--text-primary)',
                              overflow: 'auto',
                              maxHeight: '100px',
                            }}>
                              {formatHistoryValue(item.newValue)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {usageStats && (
          <div style={{
            marginTop: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BarChart3 style={{ width: '22px', height: '22px', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  模型使用分析
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  查看详细的模型使用情况统计
                </div>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                marginBottom: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
              }}>
                <div style={{
                  padding: '18px',
                  background: 'var(--bg-hover)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    总模型数
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {usageStats?.modelCount || 0}
                  </div>
                </div>
                <div style={{
                  padding: '18px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    已配置默认
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '700', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {Object.keys(configurations).length}/8
                  </div>
                </div>
                <div style={{
                  padding: '18px',
                  background: 'var(--bg-hover)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    最近使用
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {Object.keys(usageStats.lastUsedModels || {}).length}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px' }}>
                  模型类型分布
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  {Object.entries(usageStats.modelsByType || {}).map(([type, count]) => {
                    const color = contentTypeColors[type] || '#6366f1'
                    return (
                      <div
                        key={type}
                        style={{
                          padding: '10px 18px',
                          background: `${color}10`,
                          border: `1px solid ${color}30`,
                          borderRadius: '24px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ fontWeight: '600', color }}>{count}</span> {type}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px' }}>
                  默认模型配置状态
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                }}>
                  {CONTENT_TYPES.map(ct => {
                    const isConfigured = !!configurations[ct.contentType]
                    const color = contentTypeColors[ct.contentType] || '#6366f1'
                    return (
                      <div
                        key={ct.contentType}
                        style={{
                          padding: '14px 18px',
                          background: isConfigured ? `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)` : 'var(--bg-hover)',
                          border: `1px solid ${isConfigured ? `${color}30` : 'var(--border-primary)'}`,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{ct.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                            {ct.label}
                          </div>
                          <div style={{ fontSize: '11px', color: isConfigured ? color : 'var(--text-muted)' }}>
                            {isConfigured ? '已配置' : '未配置'}
                          </div>
                        </div>
                        {isConfigured && (
                          <CheckCircle2 style={{ width: '20px', height: '20px', color }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
