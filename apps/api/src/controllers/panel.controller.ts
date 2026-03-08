import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'
import crypto from 'crypto'

class PanelController {
  async getPanels(req: Request, res: Response): Promise<void> {
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
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const panels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
        orderBy: { position: 'asc' },
      })

      res.json(panels)
    } catch (error) {
      logger.error('获取九宫格失败', { user_id: req.user_id, shot_id: req.params.shot_id, error })
      res.status(500).json({ error: 'Failed to get panels' })
    }
  }

  async getPanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const panel = await prisma.nineGridPanel.findFirst({
        where: {
          id,
          Shot: {
            Project: {
              OR: [
                { owner_id: req.user_id },
                { ProjectMember: { some: { user_id: req.user_id } } },
              ],
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在', { user_id: req.user_id, panel_id: id })
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      res.json(panel)
    } catch (error) {
      logger.error('获取九宫格详情失败', { user_id: req.user_id, panel_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to get panel' })
    }
  }

  async createPanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params
      const { prompt, image_url, position } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: { owner_id: req.user_id },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { user_id: req.user_id, shot_id })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      const panel = await prisma.nineGridPanel.create({
        data: {
          id: crypto.randomUUID(),
          shot_id,
          prompt,
          image_url,
          position: position ?? 1,
          created_at: new Date(),
        },
      })

      res.status(201).json(panel)
      logger.info('九宫格创建成功', { user_id: req.user_id, shot_id, panel_id: panel.id })
    } catch (error) {
      logger.error('创建九宫格失败', { user_id: req.user_id, shot_id: req.params.shot_id, error })
      res.status(500).json({ error: 'Failed to create panel' })
    }
  }

  async createBatchPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params
      const { panels } = req.body

      if (!Array.isArray(panels) || panels.length === 0 || panels.length > 9) {
        res.status(400).json({ error: 'Panels must be an array of 1-9 items' })
        return
      }

      const shot = await prisma.shot.findFirst({
        where: {
          id: shot_id,
          Project: { owner_id: req.user_id },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在或无权限', { user_id: req.user_id, shot_id })
        res.status(404).json({ error: 'Shot not found or unauthorized' })
        return
      }

      const createdPanels = await prisma.nineGridPanel.createMany({
        data: panels.map((panel: any) => ({
          id: crypto.randomUUID(),
          shot_id,
          prompt: panel.prompt,
          image_url: panel.image_url,
          position: panel.position,
        })),
      })

      const allPanels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
        orderBy: { position: 'asc' },
      })

      res.status(201).json({
        created: createdPanels.count,
        panels: allPanels,
      })
      logger.info('批量创建九宫格成功', { user_id: req.user_id, shot_id, count: panels.length })
    } catch (error) {
      logger.error('批量创建九宫格失败', { user_id: req.user_id, shot_id: req.params.shot_id, error })
      res.status(500).json({ error: 'Failed to create panels' })
    }
  }

  async updatePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { prompt, image_url, position } = req.body

      const panel = await prisma.nineGridPanel.findFirst({
        where: {
          id,
          Shot: {
            Project: {
              OR: [
                { owner_id: req.user_id },
                { ProjectMember: { some: { user_id: req.user_id } } },
              ],
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在或无权限', { user_id: req.user_id, panel_id: id })
        res.status(404).json({ error: 'Panel not found or unauthorized' })
        return
      }

      const updated = await prisma.nineGridPanel.update({
        where: { id },
        data: {
          prompt: prompt !== undefined ? prompt : panel.prompt,
          image_url: image_url !== undefined ? image_url : panel.image_url,
          position: position !== undefined ? position : panel.position,
        },
      })

      res.json(updated)
      logger.info('九宫格更新成功', { user_id: req.user_id, panel_id: id })
    } catch (error) {
      logger.error('更新九宫格失败', { user_id: req.user_id, panel_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to update panel' })
    }
  }

  async deletePanel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const panel = await prisma.nineGridPanel.findFirst({
        where: {
          id,
          Shot: {
            Project: {
              OR: [
                { owner_id: req.user_id },
                { ProjectMember: { some: { user_id: req.user_id } } },
              ],
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在或无权限', { user_id: req.user_id, panel_id: id })
        res.status(404).json({ error: 'Panel not found or unauthorized' })
        return
      }

      await prisma.nineGridPanel.delete({
        where: { id },
      })

      res.json({ message: 'Panel deleted successfully' })
      logger.info('九宫格删除成功', { user_id: req.user_id, panel_id: id })
    } catch (error) {
      logger.error('删除九宫格失败', { user_id: req.user_id, panel_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete panel' })
    }
  }

  async reorderPanels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params
      const { panels } = req.body

      if (!Array.isArray(panels)) {
        res.status(400).json({ error: 'Invalid panels data' })
        return
      }

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
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      const updatePromises = panels.map((panel: any) =>
        prisma.nineGridPanel.updateMany({
          where: {
            id: panel.id,
            shot_id,
          },
          data: { position: panel.position },
        })
      )

      await Promise.all(updatePromises)

      res.json({ message: 'Panels reordered successfully' })
      logger.info('九宫格重新排序成功', { user_id: req.user_id, shot_id, count: panels.length })
    } catch (error) {
      logger.error('重新排序九宫格失败', { user_id: req.user_id, shot_id: req.params.shot_id, error })
      res.status(500).json({ error: 'Failed to reorder panels' })
    }
  }
}

export const panelController = new PanelController()
