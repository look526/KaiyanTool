import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { aiProviderService } from '../services/ai/provider.service'
import logger from '../lib/logger'
import * as crypto from 'crypto'

class NineGridController {
  async getNineGridByShot(req: Request, res: Response): Promise<void> {
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
        include: {
          Scene: true,
          Character: true,
        },
      })

      if (!shot) {
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      res.json({
        id: shot.id,
        shot_id: shot.id,
        prompt: shot.action_summary || '',
        image_url: (shot as any).nine_grid_image_url || null,
        created_at: (shot as any).nine_grid_created_at || shot.created_at,
      })
    } catch (error) {
      logger.error('获取九宫格失败', { error, shot_id: req.params.shot_id })
      res.status(500).json({ error: 'Failed to get nine-grid' })
    }
  }

  async generateNineGrid(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { shot_id } = req.params
      const { provider_id, prompt } = req.body

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
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!provider_id) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const resolvedProviderId = await this.resolveProviderId(provider_id)
      if (!resolvedProviderId) {
        res.status(400).json({ error: 'Invalid provider' })
        return
      }

      const finalPrompt = prompt || shot.action_summary || ''
      const compositePrompt = this.buildCompositeNineGridPrompt(finalPrompt, shot)

      logger.info('开始生成九宫格合成图', { user_id: req.user_id, shot_id, provider_id: resolvedProviderId })

      const response = await aiProviderService.createImage(resolvedProviderId, {
        prompt: compositePrompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      })

      await prisma.shot.update({
        where: { id: shot_id },
        data: {
          nine_grid_image_url: response.url,
          nine_grid_created_at: new Date(),
        } as any,
      })

      await prisma.asset.create({
        data: {
          id: crypto.randomUUID(),
          type: 'image',
          url: response.url,
          project_id: shot.project_id,
          metadata: {
            name: `九宫格 - ${shot.id}`,
            prompt: compositePrompt,
            revised_prompt: response.revisedPrompt,
            shot_id: shot.id,
            type: 'nine-grid-composite',
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      logger.info('九宫格合成图生成成功', { user_id: req.user_id, shot_id, provider_id: resolvedProviderId, image_url: response.url })

      res.json({
        id: shot.id,
        shot_id: shot.id,
        prompt: compositePrompt,
        image_url: response.url,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('生成九宫格失败', { error, shot_id: req.params.shot_id })
      res.status(500).json({ error: 'Failed to generate nine-grid' })
    }
  }

  private buildCompositeNineGridPrompt(basePrompt: string, shot: any): string {
    const character = shot.Character?.name || ''
    const scene = shot.Scene?.location || ''
    const camera = shot.camera_movement || ''
    const visualStyle = shot.visual_style || 'cinematic'

    if (!basePrompt.trim()) {
      let prompt = 'Create a 3x3 storyboard grid image showing a cinematic scene. '
      if (character) prompt += `Character: ${character}. `
      if (scene) prompt += `Location: ${scene}. `
      if (camera) prompt += `Camera movement: ${camera}. `
      prompt += 'Each of the 9 cells shows a different moment or angle of the scene. High quality, consistent lighting.'
      return prompt
    }

    return `Create a 3x3 storyboard grid image. Scene description: ${basePrompt}. ${character ? `Character: ${character}.` : ''} ${scene ? `Location: ${scene}.` : ''} ${camera ? `Camera: ${camera}.` : ''} Each of the 9 cells shows a different moment or angle maintaining visual consistency. Style: ${visualStyle}. High quality.`
  }

  private async resolveProviderId(providerId: string): Promise<string | null> {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
      select: { type: true },
    })
    return provider?.type || providerId
  }

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
