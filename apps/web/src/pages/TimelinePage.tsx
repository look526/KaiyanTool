import React from 'react'
import { useParams } from 'react-router-dom'
import { StandardPageHeader } from '../components/ui/StandardPageHeader'
import { TimelinePreview } from '../components/ai/TimelinePreview'

export default function TimelinePage() {
  const { id, episodeId } = useParams()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <StandardPageHeader
        title="时间轴"
        subtitle={id && episodeId ? `项目 ${id} · 分集 ${episodeId}` : '时间轴预览与编辑'}
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <TimelinePreview />
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 12,
              padding: 16,
              color: 'var(--text-muted)',
            }}
          >
            当前页面为占位实现：后续可在此接入关键帧、字幕、配音与 BGM 的时间轴编辑能力。
          </div>
        </div>
      </div>
    </div>
  )
}

