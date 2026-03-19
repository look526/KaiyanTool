import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../../lib/api-client'
import { useCharacters } from '../../modules/character/hooks/useCharacters'

type Voice = {
  id: string
  name: string
  language?: string
  gender?: string
  style?: string
}

type VoiceProfile = {
  id: string
  project_id: string
  character_id: string | null
  name: string
  provider: string
  voice_id: string
  sample_url?: string | null
  language?: string | null
  gender?: string | null
  style?: string | null
}

type AIProvider = {
  id: string
  type: string
  name?: string
  enabled?: boolean
  models?: Array<{ id: string; name: string; types?: string[] }>
}

export function VoiceProfilePanel({
  project_id,
  onProviderChange,
}: {
  project_id: string
  onProviderChange?: (provider_id: string) => void
}) {
  const { data: characters } = useCharacters(project_id)

  const [providers, setProviders] = useState<AIProvider[]>([])
  const [selected_provider_id, setSelectedProviderId] = useState<string>('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([])

  const [selectedVoiceByCharacter, setSelectedVoiceByCharacter] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const audioProviders = useMemo(() => {
    return providers.filter(p => {
      if (!p.enabled) return false
      return (p.models || []).some(m => (m.types || []).includes('audio'))
    })
  }, [providers])

  // 1) load AI providers + existing voice profiles
  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await apiClient.getAIProviders()
        if (!mounted) return
        const allProviders = res.providers || []
        setProviders(allProviders)

        const profileRes = await apiClient.getVoiceProfiles(project_id)
        const profiles = profileRes || []
        setVoiceProfiles(profiles)

        if (!selected_provider_id) {
          const first = allProviders.find(p => p.enabled && (p.models || []).some(m => (m.types || []).includes('audio')))
          if (first) setSelectedProviderId(first.id)
        }
      } catch (e) {
        console.error('VoiceProfilePanel load failed:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [project_id, selected_provider_id])

  // 2) load voices for the selected provider
  useEffect(() => {
    let mounted = true
    async function loadVoices() {
      if (!selected_provider_id) return
      try {
        const list = await apiClient.listTTSVoices(selected_provider_id)
        if (!mounted) return
        setVoices(list || [])
      } catch (e) {
        console.error('VoiceProfilePanel load voices failed:', e)
        if (!mounted) return
        setVoices([])
      }
    }
    loadVoices()
    return () => {
      mounted = false
    }
  }, [selected_provider_id])

  // 3) init selected voices map from existing profiles
  useEffect(() => {
    const map: Record<string, string> = {}
    for (const p of voiceProfiles) {
      if (!p.character_id) continue
      map[p.character_id] = p.voice_id
    }
    setSelectedVoiceByCharacter(map)
  }, [voiceProfiles])

  const selectedProvider = useMemo(() => audioProviders.find(p => p.id === selected_provider_id), [audioProviders, selected_provider_id])

  // 向父组件同步当前 provider_id（用于批量配音）
  useEffect(() => {
    if (!selected_provider_id) return
    onProviderChange?.(selected_provider_id)
  }, [selected_provider_id, onProviderChange])

  const handleSave = async () => {
    if (!selectedProvider) return
    if (!characters) return

    setSaving(true)
    try {
      // 保存当前 provider 下的角色 voice 绑定
      const results = await Promise.all(
        characters.map(async c => {
          const voice_id = selectedVoiceByCharacter[c.id]
          if (!voice_id) return null

          const voice = voices.find(v => v.id === voice_id)
          const profile = await apiClient.upsertVoiceProfile(project_id, {
            character_id: c.id,
            name: voice?.name || c.name,
            provider: selectedProvider.type,
            voice_id,
          })
          return profile
        })
      )

      const nextProfiles = results.filter(Boolean) as VoiceProfile[]
      // 重新拉取一次，保证 UI 和后端一致（包含样式/语言等字段）
      const refreshed = await apiClient.getVoiceProfiles(project_id)
      setVoiceProfiles(refreshed || nextProfiles)
    } catch (e) {
      console.error('VoiceProfilePanel save failed:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--border-primary)',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            声音配置（角色 → 音色绑定）
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            选择 TTS Provider 后，为每个角色绑定音色
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || saving || !selectedProvider}
          style={{
            height: '38px',
            padding: '0 16px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '700',
            cursor: loading || saving || !selectedProvider ? 'not-allowed' : 'pointer',
            opacity: loading || saving ? 0.8 : 1,
          }}
        >
          {saving ? '保存中...' : '保存绑定'}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              TTS Provider
            </label>
            <select
              value={selected_provider_id}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                padding: '0 12px',
              }}
            >
              <option value="" disabled>
                请选择
              </option>
              {audioProviders.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name || p.type}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {(characters || []).map((c: any) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-hover)',
                }}
              >
                <div style={{ width: 160, fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </div>

                <select
                  value={selectedVoiceByCharacter[c.id] || ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setSelectedVoiceByCharacter(prev => ({ ...prev, [c.id]: v }))
                  }}
                  style={{
                    flex: 1,
                    height: '38px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    padding: '0 12px',
                  }}
                >
                  <option value="">未配置</option>
                  {voices.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {!audioProviders.length && (
            <div style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
              当前没有启用的音频模型 Provider（请在「AI提供商设置」中启用支持 audio 类型的模型）
            </div>
          )}
        </>
      )}
    </div>
  )
}

