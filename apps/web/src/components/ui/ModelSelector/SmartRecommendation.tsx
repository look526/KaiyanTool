import React, { useState, useEffect, useMemo } from 'react'
import { Lightbulb, TrendingUp, Clock, Star, Zap, ChevronRight, X } from 'lucide-react'
import { AIProviderModel, ContentType } from './ModelSelector'

export interface ModelRecommendation {
  modelId: string
  modelName: string
  score: number
  reasons: string[]
  tags: ('popular' | 'fast' | 'quality' | 'cost-effective' | 'new')[]
}

export interface SmartRecommendationProps {
  models: AIProviderModel[]
  contentType: ContentType
  usageHistory: Record<string, number>
  defaultModel?: string
  onSelectModel: (modelId: string) => void
  onClose?: () => void
  className?: string
  style?: React.CSSProperties
}

export function SmartRecommendation({
  models,
  contentType,
  usageHistory,
  defaultModel,
  onSelectModel,
  onClose,
  className,
  style,
}: SmartRecommendationProps) {
  const [expanded, setExpanded] = useState(false)

  const recommendations = useMemo(() => {
    const scored = models.map(model => {
      let score = 0
      const reasons: string[] = []
      const tags: ModelRecommendation['tags'] = []

      const usageCount = usageHistory[model.id] || 0
      if (usageCount > 0) {
        score += Math.min(usageCount * 10, 30)
        reasons.push(`您已使用 ${usageCount} 次`)
        tags.push('popular')
      }

      if (model.capabilities?.includes('fast') || model.name.toLowerCase().includes('fast')) {
        score += 15
        reasons.push('响应速度快')
        tags.push('fast')
      }

      if (model.capabilities?.includes('quality') || model.name.toLowerCase().includes('pro')) {
        score += 20
        reasons.push('高质量输出')
        tags.push('quality')
      }

      if (model.capabilities?.includes('cost-effective')) {
        score += 10
        reasons.push('性价比高')
        tags.push('cost-effective')
      }

      if (model.id === defaultModel) {
        score += 25
        reasons.push('您的默认模型')
      }

      const isNew = Date.now() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000
      if (isNew) {
        score += 5
        tags.push('new')
      }

      return {
        modelId: model.id,
        modelName: model.name,
        score,
        reasons,
        tags: [...new Set(tags)],
      } as ModelRecommendation
    })

    return scored
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [models, usageHistory, defaultModel])

  const topRecommendation = recommendations[0]

  if (!topRecommendation) {
    return null
  }

  const getTagIcon = (tag: ModelRecommendation['tags'][0]) => {
    switch (tag) {
      case 'popular':
        return <TrendingUp style={{ width: '12px', height: '12px' }} />
      case 'fast':
        return <Zap style={{ width: '12px', height: '12px' }} />
      case 'quality':
        return <Star style={{ width: '12px', height: '12px' }} />
      case 'cost-effective':
        return <span style={{ fontSize: '10px' }}>¥</span>
      case 'new':
        return <span style={{ fontSize: '10px' }}>N</span>
    }
  }

  const getTagColor = (tag: ModelRecommendation['tags'][0]) => {
    switch (tag) {
      case 'popular':
        return { bg: '#fef3c7', color: '#d97706' }
      case 'fast':
        return { bg: '#dbeafe', color: '#2563eb' }
      case 'quality':
        return { bg: '#fce7f3', color: '#db2777' }
      case 'cost-effective':
        return { bg: '#d1fae5', color: '#059669' }
      case 'new':
        return { bg: '#e0e7ff', color: '#4f46e5' }
    }
  }

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Lightbulb style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            推荐模型
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {topRecommendation.modelName}
          </div>
        </div>
        <ChevronRight
          style={{
            width: '16px',
            height: '16px',
            color: 'var(--text-tertiary)',
            transition: 'transform 0.15s ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: '1px solid var(--border-primary)',
        }}>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendations.map((rec, index) => (
              <div
                key={rec.modelId}
                onClick={() => {
                  onSelectModel(rec.modelId)
                  setExpanded(false)
                }}
                style={{
                  padding: '10px 12px',
                  backgroundColor: index === 0 ? 'var(--accent-bg)' : 'var(--bg-hover)',
                  border: `1px solid ${index === 0 ? 'var(--accent)' : 'var(--border-primary)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                    {rec.modelName}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {rec.tags.slice(0, 2).map(tag => {
                      const colors = getTagColor(tag)
                      return (
                        <span
                          key={tag}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            backgroundColor: colors.bg,
                            color: colors.color,
                          }}
                        >
                          {getTagIcon(tag)}
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {rec.reasons.map((reason, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-base)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-primary)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                e.currentTarget.style.borderColor = 'var(--border-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'var(--border-primary)'
              }}
            >
              不显示推荐
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function useModelRecommendation(
  models: AIProviderModel[],
  contentType: ContentType,
  defaultModel?: string
) {
  const [usageHistory, setUsageHistory] = useState<Record<string, number>>({})

  useEffect(() => {
    const stored = localStorage.getItem(`model-usage-${contentType}`)
    if (stored) {
      try {
        setUsageHistory(JSON.parse(stored))
      } catch {
        setUsageHistory({})
      }
    }
  }, [contentType])

  const recordUsage = (modelId: string) => {
    setUsageHistory(prev => {
      const newHistory = {
        ...prev,
        [modelId]: (prev[modelId] || 0) + 1,
      }
      localStorage.setItem(`model-usage-${contentType}`, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const getTopRecommendation = () => {
    const scored = models.map(model => {
      let score = 0
      const usageCount = usageHistory[model.id] || 0
      score += Math.min(usageCount * 10, 30)
      
      if (model.id === defaultModel) {
        score += 25
      }

      return { modelId: model.id, score }
    })

    const sorted = scored.sort((a, b) => b.score - a.score)
    return sorted[0]?.modelId
  }

  return {
    usageHistory,
    recordUsage,
    getTopRecommendation,
  }
}
