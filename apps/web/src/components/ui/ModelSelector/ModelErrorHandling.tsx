import React, { useState, useCallback, createContext, useContext } from 'react'
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle, RefreshCw, Undo2 } from 'lucide-react'

export interface ModelError {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  details?: string
  action?: {
    label: string
    onClick: () => void
  }
  retryable?: boolean
  onRetry?: () => void
  undoable?: boolean
  onUndo?: () => void
  dismissible?: boolean
  autoDismiss?: number
}

interface ModelErrorContextType {
  errors: ModelError[]
  addError: (error: Omit<ModelError, 'id'>) => string
  removeError: (id: string) => void
  clearErrors: () => void
  showSuccess: (title: string, message: string, options?: Partial<ModelError>) => string
  showError: (title: string, message: string, options?: Partial<ModelError>) => string
  showWarning: (title: string, message: string, options?: Partial<ModelError>) => string
  showInfo: (title: string, message: string, options?: Partial<ModelError>) => string
}

const ModelErrorContext = createContext<ModelErrorContextType | null>(null)

export function useModelError() {
  const context = useContext(ModelErrorContext)
  if (!context) {
    throw new Error('useModelError must be used within ModelErrorProvider')
  }
  return context
}

export function ModelErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<ModelError[]>([])

  const addError = useCallback((error: Omit<ModelError, 'id'>) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newError = { ...error, id }
    
    setErrors(prev => [...prev, newError])

    if (error.autoDismiss) {
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== id))
      }, error.autoDismiss)
    }

    return id
  }, [])

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const showSuccess = useCallback((title: string, message: string, options?: Partial<ModelError>) => {
    return addError({ type: 'success', title, message, autoDismiss: 3000, dismissible: true, ...options })
  }, [addError])

  const showError = useCallback((title: string, message: string, options?: Partial<ModelError>) => {
    return addError({ type: 'error', title, message, dismissible: true, ...options })
  }, [addError])

  const showWarning = useCallback((title: string, message: string, options?: Partial<ModelError>) => {
    return addError({ type: 'warning', title, message, dismissible: true, ...options })
  }, [addError])

  const showInfo = useCallback((title: string, message: string, options?: Partial<ModelError>) => {
    return addError({ type: 'info', title, message, autoDismiss: 5000, dismissible: true, ...options })
  }, [addError])

  return (
    <ModelErrorContext.Provider value={{
      errors,
      addError,
      removeError,
      clearErrors,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    }}>
      {children}
      <ModelErrorDisplay errors={errors} onDismiss={removeError} />
    </ModelErrorContext.Provider>
  )
}

function ModelErrorDisplay({ 
  errors, 
  onDismiss 
}: { 
  errors: ModelError[]
  onDismiss: (id: string) => void 
}) {
  if (errors.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px',
    }}>
      {errors.map(error => (
        <ModelErrorCard key={error.id} error={error} onDismiss={() => onDismiss(error.id)} />
      ))}
    </div>
  )
}

function ModelErrorCard({ error, onDismiss }: { error: ModelError; onDismiss: () => void }) {
  const [expanded, setExpanded] = useState(false)

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--error)' }} />
      case 'warning':
        return <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--warning)' }} />
      case 'success':
        return <CheckCircle2 style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
      case 'info':
        return <Info style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
    }
  }

  const getBackgroundColor = () => {
    switch (error.type) {
      case 'error':
        return 'var(--error-bg)'
      case 'warning':
        return 'var(--warning-bg)'
      case 'success':
        return 'var(--success-bg)'
      case 'info':
        return 'var(--accent-bg)'
    }
  }

  const getBorderColor = () => {
    switch (error.type) {
      case 'error':
        return 'var(--error)'
      case 'warning':
        return 'var(--warning)'
      case 'success':
        return 'var(--success)'
      case 'info':
        return 'var(--accent)'
    }
  }

  return (
    <div style={{
      backgroundColor: getBackgroundColor(),
      border: `1px solid ${getBorderColor()}`,
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      animation: 'slideIn 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {error.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {error.message}
          </div>
          {error.details && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {expanded ? '隐藏详情' : '查看详情'}
              </button>
              {expanded && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: 'var(--bg-base)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {error.details}
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {error.action && (
              <button
                onClick={error.action.onClick}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {error.action.label}
              </button>
            )}
            {error.retryable && error.onRetry && (
              <button
                onClick={error.onRetry}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw style={{ width: '12px', height: '12px' }} />
                重试
              </button>
            )}
            {error.undoable && error.onUndo && (
              <button
                onClick={error.onUndo}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <Undo2 style={{ width: '12px', height: '12px' }} />
                撤销
              </button>
            )}
          </div>
        </div>
        {error.dismissible && (
          <button
            onClick={onDismiss}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>
    </div>
  )
}

export const ModelErrorMessages = {
  MODEL_LOAD_FAILED: {
    title: '模型加载失败',
    message: '无法加载模型列表，请检查网络连接',
    retryable: true,
  },
  MODEL_TEST_FAILED: (modelName: string) => ({
    title: '模型测试失败',
    message: `${modelName} 测试未通过`,
    retryable: true,
  }),
  MODEL_NOT_AVAILABLE: (modelName: string) => ({
    title: '模型不可用',
    message: `${modelName} 当前不可用，请选择其他模型`,
    type: 'warning' as const,
  }),
  CONFIG_SAVE_FAILED: {
    title: '配置保存失败',
    message: '无法保存您的配置，请稍后重试',
    retryable: true,
  },
  CONFIG_LOAD_FAILED: {
    title: '配置加载失败',
    message: '无法加载您的配置，将使用默认设置',
    type: 'warning' as const,
  },
  INVALID_API_KEY: (provider: string) => ({
    title: 'API密钥无效',
    message: `${provider} 的API密钥无效或已过期`,
    type: 'error' as const,
  }),
  RATE_LIMIT_EXCEEDED: (provider: string) => ({
    title: '请求频率超限',
    message: `${provider} API请求频率超限，请稍后重试`,
    type: 'warning' as const,
  }),
  NETWORK_ERROR: {
    title: '网络错误',
    message: '网络连接失败，请检查您的网络设置',
    retryable: true,
  },
  SUCCESS_MODEL_SAVED: (modelName: string) => ({
    title: '设置已保存',
    message: `${modelName} 已设为默认模型`,
    type: 'success' as const,
  }),
  SUCCESS_CONFIG_IMPORTED: {
    title: '配置导入成功',
    message: '您的模型配置已成功导入',
    type: 'success' as const,
  },
  SUCCESS_CONFIG_EXPORTED: {
    title: '配置导出成功',
    message: '配置文件已下载到您的设备',
    type: 'success' as const,
  },
}
