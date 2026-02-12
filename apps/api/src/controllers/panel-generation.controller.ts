import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { aiProviderService } from '../services/ai/provider.service'
import logger from '../lib/logger'

class PanelGenerationController {
  async generatePanelImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { providerId } = req.body

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
        include: {
          shot: {
            include: {
              scene: true,
              character: true,
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在', { userId: req.userId, panelId: id })
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      if (!providerId) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const prompt = panel.prompt || this.buildImagePrompt(panel)

      const response = await aiProviderService.createImage(providerId, {
        prompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      })

      const updatedPanel = await prisma.nineGridPanel.update({
        where: { id },
        data: { imageUrl: response.url },
      })

      res.json({
        imageUrl: response.url,
        revisedPrompt: response.revisedPrompt,
        panel: updatedPanel,
      })
      logger.info('九宫格图像生成成功', { userId: req.userId, panelId: id, providerId })
    } catch (error) {
      logger.error('生成九宫格图像失败', { userId: req.userId, panelId: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate panel image' })
    }
  }

  async generateBatchImages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params
      const { providerId } = req.body

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
        include: {
          scene: true,
          character: true,
          panels: {
            orderBy: { position: 'asc' },
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.userId, shotId })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!providerId) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const panels = shot.panels || []

      if (panels.length === 0) {
        res.status(400).json({ error: 'No panels found for this shot' })
        return
      }

      const generatePromises = panels.map((panel) => {
        const prompt = panel.prompt || this.buildImagePrompt(panel, shot)
        return aiProviderService.createImage(providerId, {
          prompt,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        })
      })

      const results = await Promise.all(generatePromises)

      const updatePromises = results.map((result, index) =>
        prisma.nineGridPanel.update({
          where: { id: panels[index].id },
          data: { imageUrl: result.url },
        })
      )

      await Promise.all(updatePromises)

      const updatedPanels = await prisma.nineGridPanel.findMany({
        where: { shotId },
        orderBy: { position: 'asc' },
      })

      res.json({
        images: results.map(r => r.url),
        panels: updatedPanels,
      })
      logger.info('批量生成九宫格图像成功', { userId: req.userId, shotId, count: panels.length, providerId })
    } catch (error) {
      logger.error('批量生成九宫格图像失败', { userId: req.userId, shotId: req.params.shotId, error })
      res.status(500).json({ error: 'Failed to generate batch images' })
    }
  }

  async exportNineGrid(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shotId } = req.params

      const panels = await prisma.nineGridPanel.findMany({
        where: { shotId },
        orderBy: { position: 'asc' },
      })

      if (panels.length === 0) {
        res.status(404).json({ error: 'No panels found' })
        return
      }

      res.status(501).json({ 
        error: 'Export not implemented yet',
        message: 'Nine-grid export will be available in a future update'
      })
    } catch (error) {
      logger.error('导出九宫格失败', { userId: req.userId, shotId: req.params.shotId, error })
      res.status(500).json({ error: 'Failed to export nine-grid' })
    }
  }

  private buildImagePrompt(panel: any, shot?: any): string {
    const parts = []

    if (shot?.visualStyle) {
      parts.push(shot.visualStyle)
    }

    if (shot?.scene) {
      parts.push(`Scene: ${shot.scene.location}, ${shot.scene.time}`)
    }

    if (shot?.character) {
      parts.push(`Character: ${shot.character.name}`)
    }

    if (panel.prompt) {
      parts.push(`Panel: ${panel.prompt}`)
    }

    if (shot?.cameraMovement) {
      parts.push(`Camera: ${shot.cameraMovement}`)
    }

    return parts.join(', ') + ', high quality, detailed, consistent style'
  }
}

export const panelGenerationController = new PanelGenerationController()
