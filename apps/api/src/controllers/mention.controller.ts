import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const MENTION_TYPES = ['character', 'scene', 'item', 'asset'] as const
type MentionType = (typeof MENTION_TYPES)[number]

function parseMentionType(raw: unknown): MentionType | 'all' {
  const s = String(raw ?? '').toLowerCase()
  if (!s || s === 'all') return 'all'
  if (MENTION_TYPES.includes(s as MentionType)) return s as MentionType
  return 'all'
}

export class MentionController {
  async getMentions(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params
      const qRaw = req.query.q
      const typeRaw = req.query.type
      const query = String(Array.isArray(qRaw) ? qRaw[0] : qRaw ?? '').trim()
      const filter = parseMentionType(Array.isArray(typeRaw) ? typeRaw[0] : typeRaw)

      if (!req.user_id) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
        })
        return
      }

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { owner_id: req.user_id },
            { ProjectMember: { some: { user_id: req.user_id } } },
          ],
        },
        select: { id: true },
      })

      if (!project) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
        })
        return
      }

      const episodes = await prisma.episode.findMany({
        where: { project_id: projectId },
        select: { id: true },
      })
      const episodeIds = episodes.map((e) => e.id)

      const needCharacter = filter === 'all' || filter === 'character'
      const needItem = filter === 'all' || filter === 'item'
      const needScene = filter === 'all' || filter === 'scene'
      const needAsset = filter === 'all' || filter === 'asset'

      const characters = needCharacter
        ? await prisma.character.findMany({
            where: {
              project_id: projectId,
              ...(query
                ? { name: { contains: query, mode: 'insensitive' as const } }
                : {}),
            },
            take: 8,
          })
        : []

      const items = needItem
        ? await prisma.item.findMany({
            where: {
              project_id: projectId,
              ...(query
                ? { name: { contains: query, mode: 'insensitive' as const } }
                : {}),
            },
            take: 8,
          })
        : []

      const scenes =
        needScene && episodeIds.length > 0
          ? await prisma.scene.findMany({
              where: {
                episode_id: { in: episodeIds },
                ...(query
                  ? {
                      OR: [
                        {
                          location: {
                            contains: query,
                            mode: 'insensitive' as const,
                          },
                        },
                        {
                          description: {
                            contains: query,
                            mode: 'insensitive' as const,
                          },
                        },
                      ],
                    }
                  : {}),
              },
              take: 8,
              include: {
                Episode: {
                  select: { title: true },
                },
              },
            })
        : []

      const imageCandidates = needAsset
        ? await prisma.asset.findMany({
            where: {
              project_id: projectId,
              type: 'image',
            },
            take: 40,
          })
        : []

      const assets = needAsset
        ? (
            query
              ? imageCandidates.filter((a) => {
                  const m = (a.metadata as Record<string, unknown>) || {}
                  const name = String(m.name ?? '')
                  const desc = String(m.description ?? '')
                  const ql = query.toLowerCase()
                  return (
                    name.toLowerCase().includes(ql) ||
                    desc.toLowerCase().includes(ql)
                  )
                })
              : imageCandidates
          ).slice(0, 8)
        : []

      const mentions = [
        ...characters.map((c) => ({
          id: c.id,
          type: 'character' as const,
          name: c.name,
          icon: 'user',
        })),
        ...items.map((i) => ({
          id: i.id,
          type: 'item' as const,
          name: i.name,
          icon: 'box',
        })),
        ...scenes.map((s) => ({
          id: s.id,
          type: 'scene' as const,
          name: `${s.location} (${s.time})`,
          icon: 'film',
        })),
        ...assets.map((a) => ({
          id: a.id,
          type: 'asset' as const,
          name: String((a.metadata as Record<string, unknown>)?.name ?? a.type),
          icon: 'image',
        })),
      ]

      res.json({ success: true, data: mentions })
    } catch (error) {
      console.error('Error getting mentions:', error)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get mentions',
        },
      })
    }
  }
}
