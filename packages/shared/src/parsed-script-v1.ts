/**
 * 剧本解析 API 契约 v1（JSON 响应使用 snake_case，与项目 API 规范一致）。
 *
 * 与前端预览（ScriptPreviewPanel）映射：
 * - scene.heading / description → 直接展示
 * - scene.dialogues[].character_name → 预览用 characterName
 * - scene.dialogues[].text → 预览用 text（或 lines: [text]）
 * - scene.character_names → 预览用 characters
 */
export const PARSE_SCHEMA_VERSION = 1 as const

export type ScriptKind = 'standard' | 'film' | string

export interface ParsedShotHintV1 {
  type?: string
  movement?: string
  angle?: string
  description?: string
  duration?: number
  transition?: string
}

export interface ParsedDialogueV1 {
  character_name: string
  text: string
  shot?: ParsedShotHintV1
}

export interface ParsedActionV1 {
  description: string
  type: string
  shot?: ParsedShotHintV1
}

export interface ParsedItemV1 {
  name: string
  size?: string
  shape?: string
  color?: string
  scene_ids?: string[]
}

export interface ParsedSceneV1 {
  id: string | number
  number: number
  heading?: string
  location?: string
  time?: string
  description?: string
  character_names: string[]
  dialogues: ParsedDialogueV1[]
  actions: ParsedActionV1[]
  items?: ParsedItemV1[]
  segment_id?: string
}

export interface ParsedCharacterV1 {
  id?: string
  name: string
  description?: string
  lines?: number
  personality?: string[]
  costume?: Record<string, string | undefined>
  appearance?: Record<string, unknown> | string
}

export interface ParsedScriptMetadataV1 {
  total_scenes: number
  total_characters: number
  total_dialogues: number
  estimated_duration: number
  segment_count?: number
  warnings?: string[]
}

export interface ParsedScriptV1 {
  parse_schema_version: typeof PARSE_SCHEMA_VERSION
  script_kind?: ScriptKind
  title?: string
  scenes: ParsedSceneV1[]
  characters: ParsedCharacterV1[]
  items: ParsedItemV1[]
  metadata: ParsedScriptMetadataV1
}
