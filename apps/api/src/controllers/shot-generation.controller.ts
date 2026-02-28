import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { aiProviderService } from '../services/ai/provider.service'
import logger from '../lib/logger'
import { buildCharacterImagePrompt } from '../config/prompt-templates'

class ShotGenerationController {
  async generateStartImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { providerId, style, quality } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
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
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.userId, shotId: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!providerId) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const prompt = shot.startPrompt || this.buildImagePrompt(shot, 'start', style)

      const response = await aiProviderService.createImage(providerId, {
        prompt,
        size: shot.aspectRatio === '16:9' ? '1920x1080' : shot.aspectRatio === '4:3' ? '1536x1024' : '1024x1792',
        quality: quality || 'standard',
        style: 'vivid',
      })

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: { startImageUrl: response.url },
      })

      await prisma.asset.create({
        data: {
          type: 'image',
          url: response.url,
          projectId: shot.projectId,
          metadata: {
            name: `起始帧 - ${shot.actionSummary.substring(0, 30)}...`,
            prompt,
            revisedPrompt: response.revisedPrompt,
            shotId: id,
            frameType: 'start',
            type: 'shot-frame'
          },
        },
      })

      res.json({
        imageUrl: response.url,
        revisedPrompt: response.revisedPrompt,
        shot: updatedShot,
      })
      logger.info('起始帧生成成功', { userId: req.userId, shotId: id, providerId })
    } catch (error) {
      logger.error('生成起始帧失败', { userId: req.userId, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate start image' })
    }
  }

  async generateEndImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { providerId, style, quality } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
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
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.userId, shotId: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!providerId) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const prompt = shot.endPrompt || this.buildImagePrompt(shot, 'end', style)

      const response = await aiProviderService.createImage(providerId, {
        prompt,
        size: shot.aspectRatio === '16:9' ? '1920x1080' : shot.aspectRatio === '4:3' ? '1536x1024' : '1024x1792',
        quality: quality || 'standard',
        style: 'vivid',
      })

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: { endImageUrl: response.url },
      })

      await prisma.asset.create({
        data: {
          type: 'image',
          url: response.url,
          projectId: shot.projectId,
          metadata: {
            name: `结束帧 - ${shot.actionSummary.substring(0, 30)}...`,
            prompt,
            revisedPrompt: response.revisedPrompt,
            shotId: id,
            frameType: 'end',
            type: 'shot-frame'
          },
        },
      })

      res.json({
        imageUrl: response.url,
        revisedPrompt: response.revisedPrompt,
        shot: updatedShot,
      })
      logger.info('结束帧生成成功', { userId: req.userId, shotId: id, providerId })
    } catch (error) {
      logger.error('生成结束帧失败', { userId: req.userId, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate end image' })
    }
  }

  async generateBothImages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { providerId, style, quality } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
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
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.userId, shotId: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!providerId) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const startPrompt = shot.startPrompt || this.buildImagePrompt(shot, 'start', style)
      const endPrompt = shot.endPrompt || this.buildImagePrompt(shot, 'end', style)
      
      const [startResponse, endResponse] = await Promise.all([
        aiProviderService.createImage(providerId, {
          prompt: startPrompt,
          size: shot.aspectRatio === '16:9' ? '1920x1080' : shot.aspectRatio === '4:3' ? '1536x1024' : '1024x1792',
          quality: quality || 'standard',
          style: 'vivid',
        }),
        aiProviderService.createImage(providerId, {
          prompt: endPrompt,
          size: shot.aspectRatio === '16:9' ? '1920x1080' : shot.aspectRatio === '4:3' ? '1536x1024' : '1024x1792',
          quality: quality || 'standard',
          style: 'vivid',
        }),
      ])

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: {
          startImageUrl: startResponse.url,
          endImageUrl: endResponse.url,
        },
      })

      await Promise.all([
        prisma.asset.create({
          data: {
            type: 'image',
            url: startResponse.url,
            projectId: shot.projectId,
            metadata: {
              name: `起始帧 - ${shot.actionSummary.substring(0, 30)}...`,
              prompt: startPrompt,
              revisedPrompt: startResponse.revisedPrompt,
              shotId: id,
              frameType: 'start',
              type: 'shot-frame'
            },
          },
        }),
        prisma.asset.create({
          data: {
            type: 'image',
            url: endResponse.url,
            projectId: shot.projectId,
            metadata: {
              name: `结束帧 - ${shot.actionSummary.substring(0, 30)}...`,
              prompt: endPrompt,
              revisedPrompt: endResponse.revisedPrompt,
              shotId: id,
              frameType: 'end',
              type: 'shot-frame'
            },
          },
        })
      ])

      res.json({
        startImage: startResponse.url,
        endImage: endResponse.url,
        shot: updatedShot,
      })
      logger.info('双帧生成成功', { userId: req.userId, shotId: id, providerId })
    } catch (error) {
      logger.error('生成双帧失败', { userId: req.userId, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate images' })
    }
  }

  async generateVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { providerId } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          project: {
            OR: [
              { ownerId: req.userId },
              { members: { some: { userId: req.userId } } },
            ],
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { userId: req.userId, shotId: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!shot.startImageUrl || !shot.endImageUrl) {
        res.status(400).json({ error: 'Start and end images must be generated first' })
        return
      }

      if (!providerId) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const response = await aiProviderService.createVideo(providerId, {
        imageUrl: shot.startImageUrl,
        prompt: shot.actionSummary,
        duration: shot.duration,
        aspectRatio: shot.aspectRatio,
      })

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: { videoUrl: response.url },
      })

      res.json({
        videoUrl: response.url,
        duration: response.duration,
        resolution: response.resolution,
        shot: updatedShot,
      })
      logger.info('视频生成成功', { userId: req.userId, shotId: id, providerId })
    } catch (error) {
      logger.error('生成视频失败', { userId: req.userId, shotId: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate video' })
    }
  }

  private buildImagePrompt(shot: any, type: 'start' | 'end', style?: string): string {
    const character = shot?.character?.name || ''
    const scene = shot?.scene?.location || ''
    const action = shot?.actionSummary || ''
    const camera = shot?.cameraMovement || ''
    const selectedStyle = style || 'cinematic'

    let prompt = buildCharacterImagePrompt(character, scene, action, camera, selectedStyle)

    if (type === 'start') {
      prompt = 'Start frame: ' + prompt
    } else {
      prompt = 'End frame: ' + prompt
    }

    return prompt
  }
}

export const shotGenerationController = new ShotGenerationController()
