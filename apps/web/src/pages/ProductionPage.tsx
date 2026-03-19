import React from 'react'
import { useParams } from 'react-router-dom'
import { StandardPageHeader } from '../components/ui/StandardPageHeader'

export default function ProductionPage() {
  const { id } = useParams()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <StandardPageHeader title="制作" subtitle={id ? `项目 ${id}` : '制作流程'} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 12,
            padding: 16,
            color: 'var(--text-muted)',
          }}
        >
          当前页面为占位实现：后续可在此接入制作流水线（镜头生成、TTS 配音、字幕、时间轴合成等）。
        </div>
      </div>
    </div>
  )
}

