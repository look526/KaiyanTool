import crypto from 'crypto'
import { prisma } from '../../lib/prisma'

export type ApplyParseMode = 'append_scenes' | 'fill_empty_only'

export interface ApplyParseInput {
  user_id: string
  episode_id: string
  parse_result: unknown
  mode: ApplyParseMode
  create_shot_drafts: boolean
}

export interface ApplyParseResult {
  created_scene_ids: string[]
  updated_scene_ids: string[]
  created_shot_ids: string[]
}

function extractScenes(parse_result: unknown): Record<string, unknown>[] {
  if (!parse_result || typeof parse_result !== 'object') return []
  const pr = parse_result as Record<string, unknown>
  const scenes = pr.scenes
  if (!Array.isArray(scenes)) return []
  return scenes.filter(
    (s): s is Record<string, unknown> => s !== null && typeof s === 'object' && !Array.isArray(s)
  )
}

/** 从 V1 / 预览结构提取 DB 字段 */
export function sceneInputToDbFields(s: Record<string, unknown>): {
  location: string
  time: string
  description: string
  action_summary: string
} {
  const heading = typeof s.heading === 'string' ? s.heading.trim() : ''
  const loc = typeof s.location === 'string' ? s.location.trim() : ''
  const location = (loc || heading || '待补充').slice(0, 500)
  const time = String(s.time ?? '未指定').slice(0, 200)

  let description = typeof s.description === 'string' ? s.description.trim() : ''

  const dialogues = Array.isArray(s.dialogues) ? s.dialogues : []
  if (!description && dialogues.length > 0) {
    const parts = dialogues.slice(0, 8).map((d: Record<string, unknown>) => {
      const name = String(d.character_name ?? d.characterName ?? d.character ?? '').trim()
      const text =
        typeof d.text === 'string'
          ? d.text
          : Array.isArray(d.lines)
            ? d.lines.filter((x): x is string => typeof x === 'string').join(' ')
            : ''
      return name ? `${name}：${text}` : text
    })
    description = parts.filter(Boolean).join(' / ')
  }
  if (!description) description = heading
  if (!description) description = '（解析场景）'
  description = description.slice(0, 8000)

  const actions = Array.isArray(s.actions) ? s.actions : []
  const actionLines = actions
    .slice(0, 4)
    .map((a: Record<string, unknown>) => String(a.description ?? '').trim())
    .filter(Boolean)
  const action_summary = [description.slice(0, 400), ...actionLines]
    .filter(Boolean)
    .join(' | ')
    .slice(0, 2000)

  return { location, time, description, action_summary }
}

async function loadEpisodeForUser(user_id: string, episode_id: string) {
  return prisma.episode.findFirst({
    where: {
      id: episode_id,
      Project: {
        OR: [{ owner_id: user_id }, { ProjectMember: { some: { user_id } } }],
      },
    },
    select: { id: true, project_id: true, episode_number: true },
  })
}

export async function applyParseToEpisode(input: ApplyParseInput): Promise<ApplyParseResult> {
  const { user_id, episode_id, parse_result, mode, create_shot_drafts } = input

  const episode = await loadEpisodeForUser(user_id, episode_id)
  if (!episode) {
    const err = new Error('分集不存在或无权访问') as Error & { statusCode?: number }
    err.statusCode = 404
    throw err
  }

  const scenesIn = extractScenes(parse_result)
  if (scenesIn.length === 0) {
    const err = new Error('parse_result.scenes 不能为空') as Error & { statusCode?: number }
    err.statusCode = 400
    throw err
  }

  const project_id = episode.project_id
  const normalized = scenesIn.map((s) => sceneInputToDbFields(s))

  return prisma.$transaction(async (tx) => {
    const created_scene_ids: string[] = []
    const updated_scene_ids: string[] = []
    const created_shot_ids: string[] = []

    const insertSceneAtOrder = async (row: (typeof normalized)[0], scene_order: number) => {
      const id = crypto.randomUUID()
      await tx.scene.create({
        data: {
          id,
          episode_id,
          project_id,
          location: row.location,
          time: row.time,
          description: row.description,
          scene_order,
          updated_at: new Date(),
        },
      })
      created_scene_ids.push(id)

      if (create_shot_drafts) {
        const shotId = crypto.randomUUID()
        const now = new Date()
        await tx.shot.create({
          data: {
            id: shotId,
            project_id,
            episode_id,
            scene_id: id,
            episode_number: episode.episode_number,
            action_summary: row.action_summary || row.description.slice(0, 500),
            status: 'pending',
            duration: 8,
            aspect_ratio: '16:9',
            resolution: '1080p',
            created_at: now,
            updated_at: now,
          },
        })
        created_shot_ids.push(shotId)
      }
    }

    if (mode === 'append_scenes') {
      const maxRow = await tx.scene.findFirst({
        where: { episode_id },
        orderBy: { scene_order: 'desc' },
        select: { scene_order: true },
      })
      let nextOrder = (maxRow?.scene_order ?? 0) + 1
      for (const row of normalized) {
        await insertSceneAtOrder(row, nextOrder++)
      }
    } else {
      const existing = await tx.scene.findMany({
        where: { episode_id },
        orderBy: { scene_order: 'asc' },
        select: { id: true, description: true },
      })

      const isEmptyDesc = (desc: string | null | undefined) => !desc || !String(desc).trim()
      const empties = existing.filter((e) => isEmptyDesc(e.description))
      let pi = 0

      for (const e of empties) {
        if (pi >= normalized.length) break
        const row = normalized[pi]!
        pi += 1
        await tx.scene.update({
          where: { id: e.id },
          data: {
            location: row.location,
            time: row.time,
            description: row.description,
            updated_at: new Date(),
          },
        })
        updated_scene_ids.push(e.id)
      }

      const maxRowAfter = await tx.scene.findFirst({
        where: { episode_id },
        orderBy: { scene_order: 'desc' },
        select: { scene_order: true },
      })
      let nextOrder = (maxRowAfter?.scene_order ?? 0) + 1
      while (pi < normalized.length) {
        const row = normalized[pi]!
        pi += 1
        await insertSceneAtOrder(row, nextOrder++)
      }
    }

    return { created_scene_ids, updated_scene_ids, created_shot_ids }
  })
}
