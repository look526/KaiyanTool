import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

class PanelController {
  async getPanels(req: Request, res: Response): Promise<void> {
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
        logger.warn('分镜不存在', { userId: req.userId, shotId })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panels = await prisma.nineGridPanel.findMany({
        where: { shotId },
        orderBy: { position: 'asc' },
      })

      res.json(panels)
    } catch (error) {
      logger.error('获取九宫格失败', { userId: req.userId, shotId: req.params.shotId, error })
      res.status(500).json({ error: 'Failed to get panels' })
    }
  }

  async getPanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const panel = await prisma.nineGridPanel.findFirst({
        where: {
          id,
          shot: {
            project: {
              OR: [
                { ownerId: req.userId },
                { members: { some: { userId: req.userId } } },
              ],
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在', { userId: req.userId, panelId: id })
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      res.json(panel)
    } catch (error) {
      logger.error('获取九宫格详情失败', { userId: req.userId, panelId: req.params.id, error })
      res.status(500).json({ error: 'Failed to get panel' })
    }
  }

  async createPanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params
      const { prompt, imageUrl, position } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: { ownerId: req.userId },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { userId: req.userId, shotId })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      const panel = await prisma.nineGridPanel.create({
        data: {
          shotId,
          prompt,
          imageUrl,
          position: position ?? 1,
        },
      })

      res.status(201).json(panel)
      logger.info('九宫格创建成功', { userId: req.userId, shotId, panelId: panel.id })
    } catch (error) {
      logger.error('创建九宫格失败', { userId: req.userId, shotId: req.params.shotId, error })
      res.status(500).json({ error: 'Failed to create panel' })
    }
  }

  async createBatchPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params
      const { panels } = req.body

      if (!Array.isArray(panels) || panels.length === 0 || panels.length > 9) {
        res.status(400).json({ error: 'Panels must be an array of 1-9 items' })
        return
      }

      const shot = await prisma.shot.findFirst({
        where: {
          id: shotId,
          project: { ownerId: req.userId },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { userId: req.userId, shotId })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      const createdPanels = await prisma.nineGridPanel.createMany({
        data: panels.map((panel: any) => ({
          shotId,
          prompt: panel.prompt,
          imageUrl: panel.imageUrl,
          position: panel.position,
        })),
      })

      const allPanels = await prisma.nineGridPanel.findMany({
        where: { shotId },
        orderBy: { position: 'asc' },
      })

      res.status(201).json({
        created: createdPanels.count,
        panels: allPanels,
      })
      logger.info('批量创建九宫格成功', { userId: req.userId, shotId, count: panels.length })
    } catch (error) {
      logger.error('批量创建九宫格失败', { userId: req.userId, shotId: req.params.shotId, error })
      res.status(500).json({ error: 'Failed to create panels' })
    }
  }

  async updatePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { prompt, imageUrl, position } = req.body

      const panel = await prisma.nineGridPanel.findFirst({
        where: {
          id,
          shot: {
            project: {
              OR: [
                { ownerId: req.userId },
                { members: { some: { userId: req.userId } } },
              ],
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在或无权限', { userId: req.userId, panelId: id })
        res.status(404).json({ error: 'Panel not found or unauthorized' })
        return
      }

      const updated = await prisma.nineGridPanel.update({
        where: { id },
        data: {
          prompt: prompt !== undefined ? prompt : panel.prompt,
          imageUrl: imageUrl !== undefined ? imageUrl : panel.imageUrl,
          position: position !== undefined ? position : panel.position,
        },
      })

      res.json(updated)
      logger.info('九宫格更新成功', { userId: req.userId, panelId: id })
    } catch (error) {
      logger.error('更新九宫格失败', { userId: req.userId, panelId: req.params.id, error })
      res.status(500).json({ error: 'Failed to update panel' })
    }
  }

  async deletePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const panel = await prisma.nineGridPanel.findFirst({
        where: {
          id,
          shot: {
            project: {
              OR: [
                { ownerId: req.userId },
                { members: { some: { userId: req.userId } } },
              ],
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在或无权限', { userId: req.userId, panelId: id })
        res.status(404).json({ error: 'Panel not found or unauthorized' })
        return
      }

      await prisma.nineGridPanel.delete({
        where: { id },
      })

      res.json({ message: 'Panel deleted successfully' })
      logger.info('九宫格删除成功', { userId: req.userId, panelId: id })
    } catch (error) {
      logger.error('删除九宫格失败', { userId: req.userId, panelId: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete panel' })
    }
  }

  async reorderPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params
      const { panels } = req.body

      if (!Array.isArray(panels)) {
        res.status(400).json({ error: 'Invalid panels data' })
        return
      }

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
        logger.warn('分镜不存在', { userId: req.userId, shotId })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const updatePromises = panels.map((panel: any) =>
        prisma.nineGridPanel.updateMany({
          where: {
            id: panel.id,
            shotId,
          },
          data: { position: panel.position },
        })
      )

      await Promise.all(updatePromises)

      res.json({ message: 'Panels reordered successfully' })
      logger.info('九宫格重新排序成功', { userId: req.userId, shotId, count: panels.length })
    } catch (error) {
      logger.error('重新排序九宫格失败', { userId: req.userId, shotId: req.params.shotId, error })
      res.status(500).json({ error: 'Failed to reorder panels' })
    }
  }
}

export const panelController = new PanelController()
