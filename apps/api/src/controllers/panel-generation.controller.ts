import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { aiProviderService } from '../services/ai/provider.service'
import logger from '../lib/logger'
import crypto from 'crypto'
import { buildCharacterImagePrompt } from '../config/prompt-templates'

class PanelGenerationController {
  async generatePanelImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { provider_id } = req.body
      const resolved_provider_id = await this.resolveProviderId(provider_id)

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
        include: {
          Shot: {
            include: {
              Scene: true,
              Character: true,
            },
          },
        },
      })

      if (!panel) {
        logger.warn('九宫格不存在', { user_id: req.user_id, panel_id: id })
        res.status(404).json({ error: 'Panel not found' })
        return
      }

      if (!resolved_provider_id) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const prompt = panel.prompt || this.buildImagePrompt(panel)

      const response = await aiProviderService.createImage(resolved_provider_id, {
        prompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      })

      const updatedPanel = await prisma.nineGridPanel.update({
        where: { id },
        data: { image_url: response.url },
      })

      await prisma.asset.create({
        data: {
          id: crypto.randomUUID(),
          type: 'image',
          url: response.url,
          project_id: panel.Shot.project_id,
          metadata: {
            name: `九宫格 - 第 ${panel.position} 格`,
            prompt,
            revised_prompt: response.revisedPrompt,
            panel_id: id,
            shot_id: panel.shot_id,
            type: 'nine-grid-panel'
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      res.json({
        image_url: response.url,
        revised_prompt: response.revisedPrompt,
        panel: updatedPanel,
      })
      logger.info('九宫格图像生成成功', { user_id: req.user_id, panel_id: id, provider_id: resolved_provider_id })
    } catch (error) {
      logger.error('生成九宫格图像失败', { user_id: req.user_id, panel_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate panel image' })
    }
  }

  async generateBatchImages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params
      const { provider_id } = req.body
      const resolved_provider_id = await this.resolveProviderId(provider_id)

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
        include: {
          Scene: true,
          Character: true,
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!resolved_provider_id) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const panels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
        orderBy: { position: 'asc' },
      })

      if (panels.length === 0) {
        res.status(400).json({ error: 'No panels found for this shot' })
        return
      }

      const generatePromises = panels.map((panel: any) => {
        const prompt = panel.prompt || this.buildImagePrompt(panel, shot)
        return aiProviderService.createImage(resolved_provider_id, {
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
          data: { image_url: response.url },
        }),
        prisma.asset.create({
          data: {
            id: crypto.randomUUID(),
            type: 'image',
            url: response.url,
            project_id: shot.project_id,
            metadata: {
              name: `九宫格 - 第 ${panel.position} 格`,
              prompt,
              revised_prompt: response.revisedPrompt,
              panel_id: panel.id,
              shot_id: shot.id,
              type: 'nine-grid-panel'
            },
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
      ]).flat()

      await Promise.all(updateAndAssetPromises)

      const updatedPanels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
        orderBy: { position: 'asc' },
      })

      res.json({
        images: results.map(r => r.response.url),
        panels: updatedPanels,
      })
      logger.info('批量生成九宫格图像成功', { user_id: req.user_id, shot_id, count: panels.length, provider_id: resolved_provider_id })
    } catch (error) {
      logger.error('批量生成九宫格图像失败', { user_id: req.user_id, shot_id: req.params.shot_id, error })
      res.status(500).json({ error: 'Failed to generate batch images' })
    }
  }

  async exportNineGrid(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params

      const panels = await prisma.nineGridPanel.findMany({
        where: { shot_id },
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
      logger.error('导出九宫格失败', { user_id: req.user_id, shot_id: req.params.shot_id, error })
      res.status(500).json({ error: 'Failed to export nine-grid' })
    }
  }


  private async resolveProviderId(providerId?: string): Promise<string | null> {
    if (!providerId) {
      return null
    }

    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
      select: { type: true },
    })

    return provider?.type || providerId
  }
  private buildImagePrompt(panel: any, shot?: any): string {
    const character = shot?.Character?.name || ''
    const scene = shot?.Scene?.location || ''
    const action = panel.prompt || shot?.action_summary || ''
    const camera = shot?.camera_movement || ''

    return buildCharacterImagePrompt(character, scene, action, camera, 'cinematic')
  }
}

export const panelGenerationController = new PanelGenerationController()
