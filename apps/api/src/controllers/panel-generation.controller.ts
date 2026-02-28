import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { aiProviderService } from '../services/ai/provider.service'
import logger from '../lib/logger'
import { buildCharacterImagePrompt } from '../config/prompt-templates'

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

      await prisma.asset.create({
        data: {
          type: 'image',
          url: response.url,
          projectId: panel.shot.projectId,
          metadata: {
            name: `九宫格 - 第 ${panel.position} 格`,
            prompt,
            revisedPrompt: response.revisedPrompt,
            panelId: id,
            shotId: panel.shotId,
            type: 'nine-grid-panel'
          },
        },
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

      const generatePromises = panels.map((panel: any) => {
        const prompt = panel.prompt || this.buildImagePrompt(panel, shot)
        return aiProviderService.createImage(providerId, {
          prompt,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        }).then(response => ({ response, panel, prompt }))
      })

      const results = await Promise.all(generatePromises)

      const updateAndAssetPromises = results.map(({ response, panel, prompt }) => [
        prisma.nineGridPanel.update({
          where: { id: panel.id },
          data: { imageUrl: response.url },
        }),
        prisma.asset.create({
          data: {
            type: 'image',
            url: response.url,
            projectId: shot.projectId,
            metadata: {
              name: `九宫格 - 第 ${panel.position} 格`,
              prompt,
              revisedPrompt: response.revisedPrompt,
              panelId: panel.id,
              shotId: shot.id,
              type: 'nine-grid-panel'
            },
          },
        })
      ]).flat()

      await Promise.all(updateAndAssetPromises)

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
    const character = shot?.character?.name || ''
    const scene = shot?.scene?.location || ''
    const action = panel.prompt || shot?.actionSummary || ''
    const camera = shot?.cameraMovement || ''

    return buildCharacterImagePrompt(character, scene, action, camera, 'cinematic')
  }
}

export const panelGenerationController = new PanelGenerationController()
