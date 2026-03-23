import { useEffect, useMemo, useState } from 'react'

export type SubtitleEntry = {
  id: number
  start_time: number
  end_time: number
  text: string
  speaker?: string
}

export interface SubtitleEditorProps {
  entries: SubtitleEntry[]
  onChange: (next: SubtitleEntry[]) => void
}

function formatTime(ms: number): string {
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const millis = Math.floor(ms % 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`
}

export function SubtitleEditor({ entries, onChange }: SubtitleEditorProps) {
  const [draft, setDraft] = useState<SubtitleEntry[]>(entries)

  useEffect(() => {
    setDraft(entries)
  }, [entries])

  const canEdit = useMemo(() => draft.length > 0, [draft.length])

  const updateEntry = (id: number, patch: Partial<SubtitleEntry>) => {
    const next = draft.map(e => (e.id === id ? { ...e, ...patch } : e))
    setDraft(next)
    onChange(next)
  }

  return (
    <div style={{ width: '100%' }}>
      {!canEdit ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>暂无字幕条目</div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {draft.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-hover)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)' }}>
                  #{entry.id} {entry.speaker ? `· ${entry.speaker}` : ''}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {formatTime(entry.start_time)} ~ {formatTime(entry.end_time)}
                </div>
              </div>

              <textarea
                value={entry.text}
                onChange={(e) => updateEntry(entry.id, { text: e.target.value })}
                style={{
                  width: '100%',
                  minHeight: '64px',
                  resize: 'vertical',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>开始时间（ms）</span>
                  <input
                    type="number"
                    value={entry.start_time}
                    onChange={(e) => updateEntry(entry.id, { start_time: Number(e.target.value) })}
                    style={{
                      height: '36px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      padding: '0 12px',
                      fontSize: '13px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>结束时间（ms）</span>
                  <input
                    type="number"
                    value={entry.end_time}
                    onChange={(e) => updateEntry(entry.id, { end_time: Number(e.target.value) })}
                    style={{
                      height: '36px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      padding: '0 12px',
                      fontSize: '13px',
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

