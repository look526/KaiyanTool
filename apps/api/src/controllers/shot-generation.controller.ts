import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { aiProviderService } from '../services/ai/provider.service'
import logger from '../lib/logger'
import { buildCharacterImagePrompt } from '../config/prompt-templates'
import { buildConsistencyParams, enhancePromptWithCharacter } from '../services/character-consistency.service'
import crypto from 'crypto'

class ShotGenerationController {
  async generateStartImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { provider_id, style, quality } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
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
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!provider_id) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const bodyPrompt =
        typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''
      let prompt =
        bodyPrompt ||
        shot.start_prompt ||
        this.buildImagePrompt(shot, 'start', style)

      const consistencyData = shot.character_id
        ? await buildConsistencyParams(id)
        : null

      if (consistencyData?.appearance_prompt) {
        prompt = enhancePromptWithCharacter(prompt, consistencyData.appearance_prompt)
      }

      const response = await aiProviderService.createImage(provider_id, {
        prompt,
        size: shot.aspect_ratio === '16:9' ? '1920x1080' : shot.aspect_ratio === '4:3' ? '1536x1024' : '1024x1792',
        quality: quality || 'standard',
        style: 'vivid',
        image_urls: consistencyData?.image_urls,
      })

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: { start_image_url: response.url },
      })

      await prisma.asset.create({
        data: {
          id: crypto.randomUUID(),
          type: 'image',
          url: response.url,
          project_id: shot.project_id,
          metadata: {
            name: `起始帧 - ${(shot.action_summary || '分镜').slice(0, 30)}...`,
            prompt,
            revised_prompt: response.revisedPrompt,
            shot_id: id,
            frame_type: 'start',
            type: 'shot-frame'
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      res.json({
        imageUrl: response.url,
        revised_prompt: response.revisedPrompt,
        shot: updatedShot,
      })
      logger.info('起始帧生成成功', { user_id: req.user_id, shot_id: id, provider_id })
    } catch (error) {
      logger.error('生成起始帧失败', { user_id: req.user_id, shot_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate start image' })
    }
  }

  async generateEndImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { provider_id, style, quality } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
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
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!provider_id) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const bodyPromptEnd =
        typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''
      let prompt =
        bodyPromptEnd ||
        shot.end_prompt ||
        this.buildImagePrompt(shot, 'end', style)

      const consistencyData = shot.character_id
        ? await buildConsistencyParams(id)
        : null

      if (consistencyData?.appearance_prompt) {
        prompt = enhancePromptWithCharacter(prompt, consistencyData.appearance_prompt)
      }

      const response = await aiProviderService.createImage(provider_id, {
        prompt,
        size: shot.aspect_ratio === '16:9' ? '1920x1080' : shot.aspect_ratio === '4:3' ? '1536x1024' : '1024x1792',
        quality: quality || 'standard',
        style: 'vivid',
        image_urls: consistencyData?.image_urls,
      })

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: { end_image_url: response.url },
      })

      await prisma.asset.create({
        data: {
          id: crypto.randomUUID(),
          type: 'image',
          url: response.url,
          project_id: shot.project_id,
          metadata: {
            name: `结束帧 - ${(shot.action_summary || '分镜').slice(0, 30)}...`,
            prompt,
            revised_prompt: response.revisedPrompt,
            shot_id: id,
            frame_type: 'end',
            type: 'shot-frame'
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      res.json({
        imageUrl: response.url,
        revised_prompt: response.revisedPrompt,
        shot: updatedShot,
      })
      logger.info('结束帧生成成功', { user_id: req.user_id, shot_id: id, provider_id })
    } catch (error) {
      logger.error('生成结束帧失败', { user_id: req.user_id, shot_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate end image' })
    }
  }

  async generateBothImages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { provider_id, style, quality } = req.body

      const shot = await prisma.shot.findFirst({
        where: {
          id,
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
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!provider_id) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      let start_prompt = shot.start_prompt || this.buildImagePrompt(shot, 'start', style)
      let end_prompt = shot.end_prompt || this.buildImagePrompt(shot, 'end', style)

      const consistencyData = shot.character_id
        ? await buildConsistencyParams(id)
        : null

      if (consistencyData?.appearance_prompt) {
        start_prompt = enhancePromptWithCharacter(start_prompt, consistencyData.appearance_prompt)
        end_prompt = enhancePromptWithCharacter(end_prompt, consistencyData.appearance_prompt)
      }

      const imageSize = shot.aspect_ratio === '16:9' ? '1920x1080' : shot.aspect_ratio === '4:3' ? '1536x1024' : '1024x1792'
      
      const [startResponse, endResponse] = await Promise.all([
        aiProviderService.createImage(provider_id, {
          prompt: start_prompt,
          size: imageSize,
          quality: quality || 'standard',
          style: 'vivid',
          image_urls: consistencyData?.image_urls,
        }),
        aiProviderService.createImage(provider_id, {
          prompt: end_prompt,
          size: imageSize,
          quality: quality || 'standard',
          style: 'vivid',
          image_urls: consistencyData?.image_urls,
        }),
      ])

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: {
          start_image_url: startResponse.url,
          end_image_url: endResponse.url,
        },
      })

      await Promise.all([
        prisma.asset.create({
          data: {
            id: crypto.randomUUID(),
            type: 'image',
            url: startResponse.url,
            project_id: shot.project_id,
            metadata: {
              name: `起始帧 - ${(shot.action_summary || '分镜').slice(0, 30)}...`,
              prompt: start_prompt,
              revised_prompt: startResponse.revisedPrompt,
              shot_id: id,
              frame_type: 'start',
              type: 'shot-frame'
            },
            created_at: new Date(),
            updated_at: new Date(),
          },
        }),
        prisma.asset.create({
          data: {
            id: crypto.randomUUID(),
            type: 'image',
            url: endResponse.url,
            project_id: shot.project_id,
            metadata: {
              name: `结束帧 - ${(shot.action_summary || '分镜').slice(0, 30)}...`,
              prompt: end_prompt,
              revised_prompt: endResponse.revisedPrompt,
              shot_id: id,
              frame_type: 'end',
              type: 'shot-frame'
            },
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
      ])

      res.json({
        startImage: startResponse.url,
        endImage: endResponse.url,
        shot: updatedShot,
      })
      logger.info('双帧生成成功', { user_id: req.user_id, shot_id: id, provider_id })
    } catch (error) {
      logger.error('生成双帧失败', { user_id: req.user_id, shot_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate images' })
    }
  }

  async generateVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { provider_id, sync_audio_video, subtitle_text: body_subtitle } = req.body as {
        provider_id?: string
        sync_audio_video?: boolean
        subtitle_text?: string
      }

      const shot = await prisma.shot.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!shot) {
        logger.warn('分镜不存在', { user_id: req.user_id, shot_id: id })
        res.status(404).json({ error: 'Shot not found' })
        return
      }

      if (!shot.start_image_url || !shot.end_image_url) {
        res.status(400).json({ error: 'Start and end images must be generated first' })
        return
      }

      if (!provider_id) {
        res.status(400).json({ error: 'Provider ID is required' })
        return
      }

      const incoming_subtitle =
        typeof body_subtitle === 'string' ? body_subtitle.trim() : undefined
      const dialogue =
        (incoming_subtitle !== undefined ? incoming_subtitle : shot.subtitle_text || '')?.trim() || ''

      if (sync_audio_video === true && !dialogue) {
        res.status(400).json({
          error: '音画同出需要对白/口播文案，请先填写或保存到分镜后再生成',
        })
        return
      }

      let prompt = shot.action_summary || ''
      if (sync_audio_video === true && dialogue) {
        prompt = `${prompt}\n\n【音画同出】台词/口播：${dialogue}。要求：画面与对白同步，音画一体，口型与情绪自然。`
      }

      const response = await aiProviderService.createVideo(provider_id, {
        imageUrl: shot.start_image_url!,
        prompt,
        duration: shot.duration,
        aspectRatio: shot.aspect_ratio,
        subtitle_text: dialogue || undefined,
        sync_audio_video: !!sync_audio_video,
      })

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: {
          video_url: response.url,
          ...(incoming_subtitle !== undefined ? { subtitle_text: incoming_subtitle || null } : {}),
        },
      })

      res.json({
        video_url: response.url,
        duration: response.duration,
        resolution: response.resolution,
        shot: updatedShot,
      })
      logger.info('视频生成成功', { user_id: req.user_id, shot_id: id, provider_id })
    } catch (error) {
      logger.error('生成视频失败', { user_id: req.user_id, shot_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to generate video' })
    }
  }

  private buildImagePrompt(shot: any, type: 'start' | 'end', style?: string): string {
    const character = shot?.Character?.name || ''
    const scene = shot?.Scene?.location || ''
    const action = shot?.action_summary || ''
    const camera = shot?.camera_movement || ''
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
