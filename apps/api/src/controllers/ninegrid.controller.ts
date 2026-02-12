import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

class NineGridController {
  async getPanelsByShot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panels = await prisma.nineGridPanel.findMany({
        where: { shotId },
        orderBy: { position: 'asc' },
      })

      res.json(panels)
    } catch (error) {
      logger.error('获取九宫格面板失败', { error, shotId: req.params.shotId })
      res.status(500).json({ error: 'Failed to get panels' })
    }
  }

  async createPanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params
      const { position, prompt } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const existingPanels = await prisma.nineGridPanel.count({ where: { shotId } })
      if (existingPanels >= 9) {
        res.status(400).json({ error: 'Maximum 9 panels allowed' })
        return
      }

      const panel = await prisma.nineGridPanel.create({
        data: {
          shotId,
          position: position ?? existingPanels,
          prompt,
        },
      })

      logger.info('九宫格面板创建成功', { userId: req.userId, shotId, panelId: panel.id })
      res.status(201).json(panel)
    } catch (error) {
      logger.error('创建九宫格面板失败', { error, shotId: req.params.shotId })
      res.status(500).json({ error: 'Failed to create panel' })
    }
  }

  async updatePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId, panelId } = req.params
      const { prompt, imageUrl } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panel = await prisma.nineGridPanel.findUnique({
        where: { id: panelId },
      })

      if (!panel || panel.shotId !== shotId) {
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      const updatedPanel = await prisma.nineGridPanel.update({
        where: { id: panelId },
        data: {
          prompt,
          imageUrl,
        },
      })

      res.json(updatedPanel)
    } catch (error) {
      logger.error('更新九宫格面板失败', { error, panelId: req.params.panelId })
      res.status(500).json({ error: 'Failed to update panel' })
    }
  }

  async deletePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId, panelId } = req.params

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panel = await prisma.nineGridPanel.findUnique({
        where: { id: panelId },
      })

      if (!panel || panel.shotId !== shotId) {
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      await prisma.nineGridPanel.delete({
        where: { id: panelId },
      })

      logger.info('九宫格面板删除成功', { userId: req.userId, panelId })
      res.json({ message: 'Panel deleted successfully' })
    } catch (error) {
      logger.error('删除九宫格面板失败', { error, panelId: req.params.panelId })
      res.status(500).json({ error: 'Failed to delete panel' })
    }
  }

  async generateAllPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params
      const { providerId, model } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const existingPanels = await prisma.nineGridPanel.findMany({
        where: { shotId },
        orderBy: { position: 'asc' },
      })

      if (existingPanels.length === 0) {
        res.status(400).json({ error: 'No panels to generate' })
        return
      }

      const results = await Promise.allSettled(
        existingPanels.map(async (panel, index) => {
          return prisma.nineGridPanel.update({
            where: { id: panel.id },
            data: {
              imageUrl: `https://placeholder.example.com/panel-${panel.id}.jpg`,
            },
          })
        })
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      logger.info('九宫格面板生成完成', { userId: req.userId, shotId, successful, failed })
      res.json({
        message: 'Generation completed',
        total: existingPanels.length,
        successful,
        failed,
      })
    } catch (error) {
      logger.error('生成九宫格面板失败', { error, shotId: req.params.shotId })
      res.status(500).json({ error: 'Failed to generate panels' })
    }
  }

  async reorderPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params
      const { panelIds } = req.body

      if (!Array.isArray(panelIds) || panelIds.length === 0) {
        res.status(400).json({ error: 'panelIds must be a non-empty array' })
        return
      }

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId, role: { in: ['owner', 'editor'] } } } },
            ],
          },
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const existingPanels = await prisma.nineGridPanel.findMany({
        where: { shotId },
      })

      const existingIds = new Set(existingPanels.map(p => p.id))
      const invalidIds = panelIds.filter(id => !existingIds.has(id))
      if (invalidIds.length > 0) {
        res.status(400).json({ error: 'Invalid panel IDs', invalidIds })
        return
      }

      await prisma.$transaction(
        panelIds.map((id: string, index: number) =>
          prisma.nineGridPanel.update({
            where: { id },
            data: { position: index },
          })
        )
      )

      logger.info('九宫格面板排序成功', { userId: req.userId, shotId })
      res.json({ message: 'Panels reordered successfully' })
    } catch (error) {
      logger.error('排序九宫格面板失败', { error, shotId: req.params.shotId })
      res.status(500).json({ error: 'Failed to reorder panels' })
    }
  }
}

export const nineGridController = new NineGridController()
