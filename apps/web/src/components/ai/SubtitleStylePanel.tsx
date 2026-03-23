import { useEffect, useMemo, useState } from 'react'

export interface SubtitleStylePanelProps {
  style: Record<string, any>
  onChange: (next: Record<string, any>) => void
}

type SubtitleAlignment = 'top' | 'center' | 'bottom'

const DEFAULT_STYLE: Record<string, any> = {
  font_size: 48,
  color: '#FFFFFF',
  shadow: 2,
  outline: 1,
  alignment: 'bottom' satisfies SubtitleAlignment,
}

export function SubtitleStylePanel({ style, onChange }: SubtitleStylePanelProps) {
  const [draft, setDraft] = useState<Record<string, any>>({ ...DEFAULT_STYLE, ...(style || {}) })

  useEffect(() => {
    setDraft({ ...DEFAULT_STYLE, ...(style || {}) })
  }, [style])

  const alignmentOptions: { id: SubtitleAlignment; label: string }[] = useMemo(
    () => [
      { id: 'top', label: '顶部' },
      { id: 'center', label: '居中' },
      { id: 'bottom', label: '底部' },
    ],
    []
  )

  const patch = (patchStyle: Record<string, any>) => {
    const next = { ...draft, ...patchStyle }
    setDraft(next)
    onChange(next)
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>字号（font_size）</div>
        <input
          type="number"
          value={draft.font_size ?? DEFAULT_STYLE.font_size}
          min={10}
          max={200}
          onChange={(e) => patch({ font_size: Number(e.target.value) })}
          style={{
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            padding: '0 12px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>颜色（color）</div>
        <input
          type="text"
          value={draft.color ?? DEFAULT_STYLE.color}
          onChange={(e) => patch({ color: e.target.value })}
          placeholder="#FFFFFF"
          style={{
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            padding: '0 12px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>阴影强度（shadow）</div>
        <input
          type="number"
          value={draft.shadow ?? DEFAULT_STYLE.shadow}
          min={0}
          max={20}
          onChange={(e) => patch({ shadow: Number(e.target.value) })}
          style={{
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            padding: '0 12px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>描边强度（outline）</div>
        <input
          type="number"
          value={draft.outline ?? DEFAULT_STYLE.outline}
          min={0}
          max={10}
          onChange={(e) => patch({ outline: Number(e.target.value) })}
          style={{
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            padding: '0 12px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>位置（alignment）</div>
        <select
          value={(draft.alignment as SubtitleAlignment) ?? 'bottom'}
          onChange={(e) => patch({ alignment: e.target.value })}
          style={{
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            padding: '0 12px',
          }}
        >
          {alignmentOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

