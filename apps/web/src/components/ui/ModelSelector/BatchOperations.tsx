import React, { useState } from 'react'
import { CheckSquare, Square, Play, Trash2, Loader2, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { AIProviderModel } from './types'

export interface BatchOperationProps {
  models: AIProviderModel[]
  selectedModels: Set<string>
  onSelectionChange: (selected: Set<string>) => void
  onBatchTest?: (modelIds: string[]) => Promise<void>
  onBatchEnable?: (modelIds: string[]) => Promise<void>
  onBatchDisable?: (modelIds: string[]) => Promise<void>
  onBatchDelete?: (modelIds: string[]) => Promise<void>
  disabled?: boolean
}

export function BatchOperations({
  models,
  selectedModels,
  onSelectionChange,
  onBatchTest,
  onBatchEnable,
  onBatchDisable,
  onBatchDelete,
  disabled = false,
}: BatchOperationProps) {
  const [isOperating, setIsOperating] = useState(false)
  const [operationProgress, setOperationProgress] = useState<{ current: number; total: number } | null>(null)
  const [operationResults, setOperationResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const [showResults, setShowResults] = useState(false)

  const allSelected = models.length > 0 && selectedModels.size === models.length
  const someSelected = selectedModels.size > 0 && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(models.map(m => m.id)))
    }
  }

  const handleSelectModel = (modelId: string) => {
    const newSelected = new Set(selectedModels)
    if (newSelected.has(modelId)) {
      newSelected.delete(modelId)
    } else {
      newSelected.add(modelId)
    }
    onSelectionChange(newSelected)
  }

  const handleBatchOperation = async (
    operation: 'test' | 'enable' | 'disable' | 'delete',
    operationFn: (modelIds: string[]) => Promise<void>
  ) => {
    if (selectedModels.size === 0) {
      alert('请先选择要操作的模型')
      return
    }

    const confirmed = confirm(`确定要对选中的 ${selectedModels.size} 个模型执行${getOperationLabel(operation)}操作吗？`)
    if (!confirmed) return

    try {
      setIsOperating(true)
      setOperationProgress({ current: 0, total: selectedModels.size })
      setOperationResults({})
      setShowResults(true)

      const modelIds = Array.from(selectedModels)
      const results: Record<string, { success: boolean; message: string }> = {}

      for (let i = 0; i < modelIds.length; i++) {
        const modelId = modelIds[i]
        try {
          await operationFn([modelId])
          results[modelId] = { success: true, message: '操作成功' }
        } catch (error) {
          results[modelId] = { success: false, message: '操作失败' }
        }

        setOperationProgress({ current: i + 1, total: modelIds.length })
        setOperationResults({ ...results })
      }

      const successCount = Object.values(results).filter(r => r.success).length
      alert(`${getOperationLabel(operation)}完成：${successCount}/${modelIds.length} 个模型成功`)
    } catch (error) {
      console.error('批量操作失败:', error)
      alert('批量操作失败，请重试')
    } finally {
      setIsOperating(false)
      setOperationProgress(null)
    }
  }

  const getOperationLabel = (operation: string) => {
    const labels: Record<string, string> = {
      test: '测试',
      enable: '启用',
      disable: '禁用',
      delete: '删除',
    }
    return labels[operation] || operation
  }

  const getOperationIcon = (operation: string) => {
    const icons: Record<string, React.ReactNode> = {
      test: <Play style={{ width: '14px', height: '14px' }} />,
      enable: <CheckCircle2 style={{ width: '14px', height: '14px' }} />,
      disable: <XCircle style={{ width: '14px', height: '14px' }} />,
      delete: <Trash2 style={{ width: '14px', height: '14px' }} />,
    }
    return icons[operation]
  }

  return (
    <>
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={handleSelectAll}
          disabled={disabled || models.length === 0}
          style={{
            background: 'none',
            border: 'none',
            cursor: disabled || models.length === 0 ? 'not-allowed' : 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
          }}
          title={allSelected ? '取消全选' : '全选'}
        >
          {allSelected ? (
            <CheckSquare style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
          ) : (
            <Square style={{ width: '18px', height: '18px' }} />
          )}
        </button>

        <div style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          已选择 {selectedModels.size} / {models.length} 个模型
        </div>

        <div style={{ flex: 1 }} />

        {onBatchTest && (
          <button
            onClick={() => handleBatchOperation('test', onBatchTest)}
            disabled={disabled || isOperating || selectedModels.size === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: disabled || isOperating || selectedModels.size === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: disabled || isOperating || selectedModels.size === 0 ? 0.6 : 1,
            }}
          >
            {getOperationIcon('test')}
            批量测试
          </button>
        )}

        {onBatchEnable && (
          <button
            onClick={() => handleBatchOperation('enable', onBatchEnable)}
            disabled={disabled || isOperating || selectedModels.size === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--success)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: disabled || isOperating || selectedModels.size === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: disabled || isOperating || selectedModels.size === 0 ? 0.6 : 1,
            }}
          >
            {getOperationIcon('enable')}
            批量启用
          </button>
        )}

        {onBatchDisable && (
          <button
            onClick={() => handleBatchOperation('disable', onBatchDisable)}
            disabled={disabled || isOperating || selectedModels.size === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--warning)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: disabled || isOperating || selectedModels.size === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: disabled || isOperating || selectedModels.size === 0 ? 0.6 : 1,
            }}
          >
            {getOperationIcon('disable')}
            批量禁用
          </button>
        )}

        {onBatchDelete && (
          <button
            onClick={() => handleBatchOperation('delete', onBatchDelete)}
            disabled={disabled || isOperating || selectedModels.size === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--error)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: disabled || isOperating || selectedModels.size === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: disabled || isOperating || selectedModels.size === 0 ? 0.6 : 1,
            }}
          >
            {getOperationIcon('delete')}
            批量删除
          </button>
        )}
      </div>

      {showResults && Object.keys(operationResults).length > 0 && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-hover)',
          borderBottom: '1px solid var(--border-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              操作结果
            </div>
            <button
              onClick={() => setShowResults(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-tertiary)',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {operationProgress && (
            <div style={{
              marginBottom: '12px',
              padding: '8px 12px',
              backgroundColor: 'var(--accent-bg)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--accent)',
            }}>
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              <span>处理中... {operationProgress.current} / {operationProgress.total}</span>
            </div>
          )}

          <div style={{
            maxHeight: '200px',
            overflow: 'auto',
            display: 'grid',
            gap: '8px',
          }}>
            {Object.entries(operationResults).map(([modelId, result]) => {
              const model = models.find(m => m.id === modelId)
              return (
                <div
                  key={modelId}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: result.success ? 'var(--success-bg)' : 'var(--error-bg)',
                    border: `1px solid ${result.success ? 'var(--success)' : 'var(--error)'}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {result.success ? (
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--success)', flexShrink: 0 }} />
                  ) : (
                    <XCircle style={{ width: '16px', height: '16px', color: 'var(--error)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, marginBottom: '2px' }}>
                      {model?.name || modelId}
                    </div>
                    <div style={{ fontSize: '11px', color: result.success ? 'var(--success)' : 'var(--error)' }}>
                      {result.message}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export function BatchModelItem({
  model,
  isSelected,
  onSelect,
  disabled,
}: {
  model: AIProviderModel
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s ease',
      }}
      onClick={() => !disabled && onSelect()}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        disabled={disabled}
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
        }}
      >
        {isSelected ? (
          <CheckSquare style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
        ) : (
          <Square style={{ width: '18px', height: '18px' }} />
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>
          {model.name}
        </div>
        {model.description && (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {model.description}
          </div>
        )}
      </div>

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
  )
}
