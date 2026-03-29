import {
  PARSE_SCHEMA_VERSION,
  type ParsedScriptV1,
  type ParsedSceneV1,
  type ParsedCharacterV1,
  type ParsedDialogueV1,
  type ParsedActionV1,
  type ParsedItemV1,
  type ParsedScriptMetadataV1,
  type ScriptKind,
} from '@ai-content-platform/shared'
import type { ParsedScript, ScriptScene, ScriptDialogue, ScriptAction, ScriptCharacter } from './script-parser.types'
import type { ProcessResult } from '../large-text'

function mapDialogue(d: ScriptDialogue): ParsedDialogueV1 {
  return {
    character_name: d.characterName,
    text: d.text,
  }
}

function mapAction(a: ScriptAction): ParsedActionV1 {
  return {
    description: a.description,
    type: a.type,
  }
}

function mapScene(scene: ScriptScene): ParsedSceneV1 {
  return {
    id: scene.id,
    number: scene.number,
    heading: scene.heading,
    location: scene.location,
    time: scene.time,
    description: scene.description,
    character_names: scene.characters ?? [],
    dialogues: (scene.dialogues ?? []).map(mapDialogue),
    actions: (scene.actions ?? []).map(mapAction),
    items: [],
  }
}

function mapCharacter(c: ScriptCharacter): ParsedCharacterV1 {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    lines: c.lines,
  }
}

export function mapInternalParsedScriptToV1(
  parsed: ParsedScript,
  script_kind: ScriptKind = 'standard'
): ParsedScriptV1 {
  const metadata: ParsedScriptMetadataV1 = {
    total_scenes: parsed.metadata.totalScenes,
    total_characters: parsed.metadata.totalCharacters,
    total_dialogues: parsed.metadata.totalDialogues,
    estimated_duration: parsed.metadata.estimatedDuration,
  }
  return {
    parse_schema_version: PARSE_SCHEMA_VERSION,
    script_kind,
    title: parsed.title,
    scenes: (parsed.scenes ?? []).map(mapScene),
    characters: (parsed.characters ?? []).map(mapCharacter),
    items: mapItemsLoose(parsed.items),
    metadata,
  }
}

function mapItemsLoose(items: unknown[]): ParsedItemV1[] {
  if (!Array.isArray(items)) return []
  return items
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null
      const o = raw as Record<string, unknown>
      const name = typeof o.name === 'string' ? o.name : ''
      if (!name) return null
      const out: ParsedItemV1 = { name }
      if (typeof o.size === 'string') out.size = o.size
      if (typeof o.shape === 'string') out.shape = o.shape
      if (typeof o.color === 'string') out.color = o.color
      if (Array.isArray(o.scenes)) {
        out.scene_ids = o.scenes.filter((x): x is string => typeof x === 'string')
      }
      return out
    })
    .filter((x): x is ParsedItemV1 => x !== null)
}

/** merger / processLargeText 输出的场景（内存中为 camelCase）→ V1 snake_case */
export function mapProcessResultToV1(
  result: ProcessResult,
  script_kind: ScriptKind = 'standard'
): ParsedScriptV1 {
  const scenes: ParsedSceneV1[] = (result.scenes ?? []).map((s: Record<string, unknown>, idx: number) => {
    const id = s.id != null ? String(s.id) : `scene_${idx + 1}`
    const number = typeof s.number === 'number' ? s.number : idx + 1
    const dialoguesRaw = Array.isArray(s.dialogues) ? s.dialogues : []
    const dialogues: ParsedDialogueV1[] = dialoguesRaw.map((d: Record<string, unknown>) => {
      const characterName =
        (typeof d.characterName === 'string' && d.characterName) ||
        (typeof d.character === 'string' && d.character) ||
        '未知角色'
      const text =
        (typeof d.text === 'string' && d.text) ||
        (Array.isArray(d.lines) ? d.lines.filter((x): x is string => typeof x === 'string').join('\n') : '') ||
        ''
      const out: ParsedDialogueV1 = { character_name: characterName, text }
      if (d.shot && typeof d.shot === 'object') {
        const sh = d.shot as Record<string, unknown>
        out.shot = {
          type: typeof sh.type === 'string' ? sh.type : undefined,
          movement: typeof sh.movement === 'string' ? sh.movement : undefined,
          angle: typeof sh.angle === 'string' ? sh.angle : undefined,
          description: typeof sh.description === 'string' ? sh.description : undefined,
          duration: typeof sh.duration === 'number' ? sh.duration : undefined,
          transition: typeof sh.transition === 'string' ? sh.transition : undefined,
        }
      }
      return out
    })
    const actionsRaw = Array.isArray(s.actions) ? s.actions : []
    const actions: ParsedActionV1[] = actionsRaw.map((a: Record<string, unknown>) => ({
      description: typeof a.description === 'string' ? a.description : '',
      type: typeof a.type === 'string' ? a.type : 'action',
      shot:
        a.shot && typeof a.shot === 'object'
          ? {
              type: typeof (a.shot as any).type === 'string' ? (a.shot as any).type : undefined,
              movement: typeof (a.shot as any).movement === 'string' ? (a.shot as any).movement : undefined,
              angle: typeof (a.shot as any).angle === 'string' ? (a.shot as any).angle : undefined,
              description:
                typeof (a.shot as any).description === 'string' ? (a.shot as any).description : undefined,
              duration: typeof (a.shot as any).duration === 'number' ? (a.shot as any).duration : undefined,
              transition: typeof (a.shot as any).transition === 'string' ? (a.shot as any).transition : undefined,
            }
          : undefined,
    }))
    const charNames = Array.isArray(s.characters)
      ? (s.characters as unknown[]).filter((x): x is string => typeof x === 'string')
      : []
    const itemsRaw = Array.isArray(s.items) ? s.items : []
    const items: ParsedItemV1[] = itemsRaw
      .map((it: Record<string, unknown>) => {
        const name = typeof it.name === 'string' ? it.name : ''
        if (!name) return null
        const pi: ParsedItemV1 = { name }
        if (typeof it.size === 'string') pi.size = it.size
        if (typeof it.shape === 'string') pi.shape = it.shape
        if (typeof it.color === 'string') pi.color = it.color
        return pi
      })
      .filter((x): x is ParsedItemV1 => x !== null)

    const segId = typeof s.segmentId === 'string' ? s.segmentId : undefined

    return {
      id,
      number,
      heading: typeof s.heading === 'string' ? s.heading : undefined,
      location: typeof s.location === 'string' ? s.location : undefined,
      time: typeof s.time === 'string' ? s.time : undefined,
      description: typeof s.description === 'string' ? s.description : undefined,
      character_names: charNames,
      dialogues,
      actions,
      items: items.length > 0 ? items : undefined,
      segment_id: segId,
    }
  })

  const characters: ParsedCharacterV1[] = (result.characters ?? []).map((c: Record<string, unknown>) => {
    const name = typeof c.name === 'string' ? c.name : '未命名'
    const out: ParsedCharacterV1 = {
      id: typeof c.id === 'string' ? c.id : undefined,
      name,
      description: typeof c.description === 'string' ? c.description : undefined,
      lines: typeof c.lines === 'number' ? c.lines : undefined,
    }
    if (Array.isArray(c.personality)) {
      out.personality = c.personality.filter((x): x is string => typeof x === 'string')
    }
    if (c.costume && typeof c.costume === 'object') {
      out.costume = c.costume as Record<string, string | undefined>
    }
    if (c.appearance !== undefined) {
      out.appearance = c.appearance as ParsedCharacterV1['appearance']
    }
    return out
  })

  const itemsTop: ParsedItemV1[] = mapItemsLoose(result.items ?? [])

  const warnings = [...(result.metadata.warnings ?? [])].filter(Boolean)
  const metadata: ParsedScriptMetadataV1 = {
    total_scenes: result.metadata.totalScenes,
    total_characters: result.metadata.totalCharacters,
    total_dialogues: result.metadata.totalDialogues,
    estimated_duration: result.metadata.estimatedDuration,
    segment_count: result.metadata.segmentCount,
    warnings: warnings.length > 0 ? warnings : undefined,
  }

  return {
    parse_schema_version: PARSE_SCHEMA_VERSION,
    script_kind,
    title: result.title,
    scenes,
    characters,
    items: itemsTop,
    metadata,
  }
}
