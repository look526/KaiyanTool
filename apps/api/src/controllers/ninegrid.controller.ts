import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'
import * as crypto from 'crypto'

class NineGridController {
  async getPanelsByShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
        orderBy: { position: 'asc' },
      })

      res.json(panels)
    } catch (error) {
      logger.error('获取九宫格面板失败', { error, shot_id: req.params.shot_id })
      res.status(500).json({ error: 'Failed to get panels' })
    }
  }

  async createPanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params
      const { position, prompt } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const existingPanels = await prisma.nineGridPanel.count({ where: { shot_id } })
      if (existingPanels >= 9) {
        res.status(400).json({ error: 'Maximum 9 panels allowed' })
        return
      }

      const panel = await prisma.nineGridPanel.create({
        data: {
          id: crypto.randomUUID(),
          shot_id,
          position: position ?? existingPanels,
          prompt,
          created_at: new Date(),
        },
      })

      logger.info('九宫格面板创建成功', { user_id: req.user_id, shot_id, panel_id: panel.id })
      res.status(201).json(panel)
    } catch (error) {
      logger.error('创建九宫格面板失败', { error, shot_id: req.params.shot_id })
      res.status(500).json({ error: 'Failed to create panel' })
    }
  }

  async updatePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id, panel_id } = req.params
      const { prompt, image_url } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panel = await prisma.nineGridPanel.findUnique({
        where: { id: panel_id },
      })

      if (!panel || panel.shot_id !== shot_id) {
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      const updatedPanel = await prisma.nineGridPanel.update({
        where: { id: panel_id },
        data: {
          prompt,
          image_url,
        },
      })

      res.json(updatedPanel)
    } catch (error) {
      logger.error('更新九宫格面板失败', { error, panel_id: req.params.panel_id })
      res.status(500).json({ error: 'Failed to update panel' })
    }
  }

  async deletePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id, panel_id } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panel = await prisma.nineGridPanel.findUnique({
        where: { id: panel_id },
      })

      if (!panel || panel.shot_id !== shot_id) {
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      await prisma.nineGridPanel.delete({
        where: { id: panel_id },
      })

      logger.info('九宫格面板删除成功', { user_id: req.user_id, panel_id })
      res.json({ message: 'Panel deleted successfully' })
    } catch (error) {
      logger.error('删除九宫格面板失败', { error, panel_id: req.params.panel_id })
      res.status(500).json({ error: 'Failed to delete panel' })
    }
  }

  async generateAllPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const existingPanels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
        orderBy: { position: 'asc' },
      })

      if (existingPanels.length === 0) {
        res.status(400).json({ error: 'No panels to generate' })
        return
      }

      const results = await Promise.allSettled(
        existingPanels.map(async (panel: any, _index: number) => {
          return prisma.nineGridPanel.update({
            where: { id: panel.id },
            data: {
              image_url: `https://placeholder.example.com/panel-${panel.id}.jpg`,
            },
          })
        })
      )

      const successful = results.filter((r: any) => r.status === 'fulfilled').length
      const failed = results.filter((r: any) => r.status === 'rejected').length

      logger.info('九宫格面板生成完成', { user_id: req.user_id, shot_id, successful, failed })
      res.json({
        message: 'Generation completed',
        total: existingPanels.length,
        successful,
        failed,
      })
    } catch (error) {
      logger.error('生成九宫格面板失败', { error, shot_id: req.params.shot_id })
      res.status(500).json({ error: 'Failed to generate panels' })
    }
  }

  async reorderPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params
      const { panel_ids } = req.body

      if (!Array.isArray(panel_ids) || panel_ids.length === 0) {
        res.status(400).json({ error: 'panel_ids must be a non-empty array' })
        return
      }

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const existingPanels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
      })

      const existingIds = new Set(existingPanels.map((p: any) => p.id))
      const invalidIds = panel_ids.filter(id => !existingIds.has(id))
      if (invalidIds.length > 0) {
        res.status(400).json({ error: 'Invalid panel IDs', invalidIds })
        return
      }

      await prisma.$transaction(
        panel_ids.map((id: string, index: number) =>
          prisma.nineGridPanel.update({
            where: { id },
            data: { position: index },
          })
        )
      )

      logger.info('九宫格面板排序成功', { user_id: req.user_id, shot_id })
      res.json({ message: 'Panels reordered successfully' })
    } catch (error) {
      logger.error('排序九宫格面板失败', { error, shot_id: req.params.shot_id })
      res.status(500).json({ error: 'Failed to reorder panels' })
    }
  }
}

export const nineGridController = new NineGridController()
