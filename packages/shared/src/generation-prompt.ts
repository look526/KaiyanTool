/**
 * 统一图片/视频生成用的结构化提示（可序列化为纯文本发给模型）。
 */
export const GENERATION_PROMPT_VERSION = 1 as const

export interface GenerationLensSlice {
  description: string
  camera_movement: string
}

export interface GenerationCharacterSlice {
  id: string
  name: string
  notes: string
}

export interface GenerationSceneSlice {
  id: string
  location: string
  time: string
  notes: string
}

export interface GenerationPromptV1 {
  version: typeof GENERATION_PROMPT_VERSION
  lens: GenerationLensSlice
  character: GenerationCharacterSlice
  action: string
  scene: GenerationSceneSlice
  dialogue: string
  style: string
  extra: Record<string, unknown>
}

export function emptyGenerationPromptV1(): GenerationPromptV1 {
  return {
    version: GENERATION_PROMPT_VERSION,
    lens: { description: '', camera_movement: '' },
    character: { id: '', name: '', notes: '' },
    action: '',
    scene: { id: '', location: '', time: '', notes: '' },
    dialogue: '',
    style: '',
    extra: {},
  }
}

export type ShotLikeForPrompt = {
  action_summary?: string | null
  camera_movement?: string | null
  visual_style?: string | null
  subtitle_text?: string | null
  Character?: { id?: string; name?: string | null; appearance?: string | null; description?: string | null } | null
  Scene?: { id?: string; location?: string | null; time?: string | null; description?: string | null } | null
}

export function generationPromptFromShot(shot: ShotLikeForPrompt): GenerationPromptV1 {
  const base = emptyGenerationPromptV1()
  base.action = (shot.action_summary || '').trim()
  base.lens.description = base.action
  base.lens.camera_movement = (shot.camera_movement || '').trim()
  base.dialogue = (shot.subtitle_text || '').trim()
  base.style = (shot.visual_style || '').trim()
  if (shot.Character) {
    base.character.id = shot.Character.id || ''
    base.character.name = (shot.Character.name || '').trim()
    base.character.notes = (
      shot.Character.appearance ||
      shot.Character.description ||
      ''
    ).trim()
  }
  if (shot.Scene) {
    base.scene.id = shot.Scene.id || ''
    base.scene.location = (shot.Scene.location || '').trim()
    base.scene.time = (shot.Scene.time || '').trim()
    base.scene.notes = (shot.Scene.description || '').trim()
  }
  return base
}

/** 将结构化提示转为发给图像/视频模型的纯文本（中文为主，便于现有管线）。 */
export function generationPromptToPlainText(p: GenerationPromptV1): string {
  const parts: string[] = []
  if (p.lens.description) parts.push(`镜头：${p.lens.description}`)
  if (p.lens.camera_movement) parts.push(`镜头运动：${p.lens.camera_movement}`)
  if (p.character.name) {
    let c = `角色：${p.character.name}`
    if (p.character.notes) c += `（${p.character.notes}）`
    parts.push(c)
  }
  if (p.action && p.action !== p.lens.description) parts.push(`动作：${p.action}`)
  if (p.scene.location || p.scene.time) {
    const loc = [p.scene.location, p.scene.time].filter(Boolean).join(' · ')
    if (loc) parts.push(`场景：${loc}`)
    if (p.scene.notes) parts.push(`场景细节：${p.scene.notes}`)
  }
  if (p.dialogue) parts.push(`对白/口播：${p.dialogue}`)
  if (p.style) parts.push(`视觉风格：${p.style}`)
  if (p.extra && Object.keys(p.extra).length > 0) {
    try {
      parts.push(`附加：${JSON.stringify(p.extra)}`)
    } catch {
      /* ignore */
    }
  }
  return parts.join('\n').trim() || 'cinematic shot, high quality'
}

export function parseGenerationPromptJson(raw: unknown): GenerationPromptV1 | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (o.version !== GENERATION_PROMPT_VERSION) return null
  try {
    const lens = (o.lens as GenerationLensSlice) || { description: '', camera_movement: '' }
    const character = (o.character as GenerationCharacterSlice) || { id: '', name: '', notes: '' }
    const scene = (o.scene as GenerationSceneSlice) || { id: '', location: '', time: '', notes: '' }
    return {
      version: GENERATION_PROMPT_VERSION,
      lens: {
        description: String(lens.description || ''),
        camera_movement: String(lens.camera_movement || ''),
      },
      character: {
        id: String(character.id || ''),
        name: String(character.name || ''),
        notes: String(character.notes || ''),
      },
      action: String(o.action || ''),
      scene: {
        id: String(scene.id || ''),
        location: String(scene.location || ''),
        time: String(scene.time || ''),
        notes: String(scene.notes || ''),
      },
      dialogue: String(o.dialogue || ''),
      style: String(o.style || ''),
      extra:
        o.extra && typeof o.extra === 'object' && !Array.isArray(o.extra)
          ? (o.extra as Record<string, unknown>)
          : {},
    }
  } catch {
    return null
  }
}
