import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { providerManager } from '../services/ai/provider.manager'
import { AIProvider } from '../services/ai/provider.interface'
import logger from '../lib/logger'
import { buildCharacterImagePrompt } from '../config/prompt-templates'
import { buildConsistencyParams, enhancePromptWithCharacter } from '../services/character-consistency.service'
import crypto from 'crypto'
import { generationPromptFromShot, generationPromptToPlainText } from '@ai-content-platform/shared'
import {
  resolveVideoPromptFlags,
  type VideoPromptFlags,
  type VideoPromptFlagsBody,
} from '../lib/video-prompt-flags'

class ShotGenerationController {
  private async getManagedProvider(provider_id: string): Promise<AIProvider> {
    const providerDb = await prisma.aIProvider.findUnique({
      where: { id: provider_id },
    })

    if (!providerDb) {
      throw new Error(`Provider not found: ${provider_id}`)
    }

    providerManager.addProvider({
      id: providerDb.id,
      name: providerDb.type,
      type: providerDb.type,
      apiKey: providerDb.api_key,
      baseUrl: providerDb.base_url || undefined,
    })

    const provider = providerManager.getProvider(providerDb.id)
    if (!provider) {
      throw new Error(`Failed to initialize provider: ${provider_id}`)
    }

    return provider
  }

  private modelSupportsType(model: any, type: 'image' | 'video'): boolean {
    const types = Array.isArray(model?.types) ? model.types.map((item: unknown) => String(item).toLowerCase()) : []
    const capabilities = Array.isArray(model?.capabilities) ? model.capabilities.map((item: unknown) => String(item).toLowerCase()) : []
    const hint = `${model?.name || ''} ${model?.model_id || ''}`.toLowerCase()

    if (types.includes(type)) return true
    if (capabilities.some((capability: string) => capability.includes(type))) return true
    if (type === 'video') return /video|视频|sora|veo|seedance|kling|runway/.test(hint)
    return /image|图片|图像|文生图|图生图|seedream|qwen-image|flux|dall|imagen/.test(hint)
  }

  private async getProviderModelForType(provider_id: string, type: 'image' | 'video') {
    const providerDb = await prisma.aIProvider.findUnique({
      where: { id: provider_id },
      include: { AIProviderModel: true },
    })

    if (!providerDb) {
      const error = new Error(`Provider not found: ${provider_id}`)
      ;(error as any).status = 404
      throw error
    }

    if (!providerDb.enabled) {
      const error = new Error(`Provider is disabled: ${provider_id}`)
      ;(error as any).status = 400
      throw error
    }

    const model = providerDb.AIProviderModel.find((item: any) => this.modelSupportsType(item, type))
    if (!model) {
      const error = new Error(`该 Provider 未配置${type === 'video' ? '视频' : '图片'}模型，请在后台模型类型中勾选 ${type}`)
      ;(error as any).status = 400
      throw error
    }

    return {
      providerDb,
      model,
      modelName: model.model_id || model.name,
    }
  }

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

      const provider = await this.getManagedProvider(provider_id)
      const response = await provider.createImage({
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

      const provider = await this.getManagedProvider(provider_id)
      const response = await provider.createImage({
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
      const provider = await this.getManagedProvider(provider_id)
      
      const [startResponse, endResponse] = await Promise.all([
        provider.createImage({
          prompt: start_prompt,
          size: imageSize,
          quality: quality || 'standard',
          style: 'vivid',
          image_urls: consistencyData?.image_urls,
        }),
        provider.createImage({
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
      const body = req.body as {
        provider_id?: string
        sync_audio_video?: boolean
        subtitle_text?: string
        video_generation_mode?: string
        include_action_in_prompt?: boolean
        include_dialogue_in_prompt?: boolean
        include_camera_in_prompt?: boolean
        include_style_in_prompt?: boolean
      }

      const { provider_id, sync_audio_video, subtitle_text: body_subtitle } = body

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

      const mode =
        body.video_generation_mode === 'nine_grid'
          ? 'nine_grid'
          : (shot as any).video_generation_mode === 'nine_grid'
            ? 'nine_grid'
            : 'end_frame'

      const flagsBody: VideoPromptFlagsBody = {
        include_action_in_prompt: body.include_action_in_prompt,
        include_dialogue_in_prompt: body.include_dialogue_in_prompt,
        include_camera_in_prompt: body.include_camera_in_prompt,
        include_style_in_prompt: body.include_style_in_prompt,
      }
      const flags = resolveVideoPromptFlags((shot as any).video_prompt_flags, flagsBody, sync_audio_video)

      const incoming_subtitle =
        typeof body_subtitle === 'string' ? body_subtitle.trim() : undefined
      const dialogue =
        (incoming_subtitle !== undefined ? incoming_subtitle : shot.subtitle_text || '')?.trim() || ''

      if (flags.include_dialogue && !dialogue) {
        res.status(400).json({
          error: '已开启「对白并入视频提示」，请先填写对白/口播并保存后再生成',
        })
        return
      }

      let imageUrl: string
      let endImageUrl: string | undefined

      if (mode === 'end_frame') {
        if (!shot.start_image_url || !shot.end_image_url) {
          res.status(400).json({ error: 'Start and end images must be generated first' })
          return
        }
        imageUrl = shot.start_image_url
        endImageUrl = shot.end_image_url
      } else {
        const composite = (shot as any).nine_grid_image_url as string | null | undefined
        const panels = await prisma.nineGridPanel.findMany({
          where: { shot_id: id },
          orderBy: { position: 'asc' },
        })
        if (composite) {
          imageUrl = composite
          const last = panels.find((p) => p.position === 8)?.image_url
          endImageUrl = last || composite
        } else if (panels.length >= 9) {
          const sorted = [...panels].sort((a, b) => a.position - b.position)
          const first = sorted[0]?.image_url
          const last = sorted[8]?.image_url
          if (!first || !last) {
            res.status(400).json({
              error:
                '九宫格模式需先完成一键合成（推荐）或九格均已单独出图；当前参考图不完整',
            })
            return
          }
          imageUrl = first
          endImageUrl = last
        } else {
          res.status(400).json({
            error: '九宫格模式请先生成九宫格合成图，或为该分镜补齐九格分镜图',
          })
          return
        }
      }

      const prompt = this.buildVideoPromptFromFlags(shot, flags)

      const { modelName } = await this.getProviderModelForType(provider_id, 'video')
      const provider = await this.getManagedProvider(provider_id)
      if (!provider.createVideo) {
        res.status(400).json({ error: 'Provider does not support video generation' })
        return
      }

      const response = await provider.createVideo({
        model: modelName,
        imageUrl,
        endImageUrl,
        prompt,
        duration: shot.duration,
        aspectRatio: shot.aspect_ratio,
        subtitle_text: dialogue || undefined,
        sync_audio_video: flags.include_dialogue,
      })

      const updatedShot = await prisma.shot.update({
        where: { id },
        data: {
          video_url: response.url,
          ...(incoming_subtitle !== undefined ? { subtitle_text: incoming_subtitle || null } : {}),
        },
        include: {
          Scene: true,
          Character: true,
        },
      })

      res.json({
        video_url: response.url,
        duration: response.duration,
        resolution: response.resolution,
        shot: updatedShot,
      })
      logger.info('视频生成成功', { user_id: req.user_id, shot_id: id, provider_id, mode })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate video'
      const status = Number((error as any)?.status || 500)
      logger.error('生成视频失败', { user_id: req.user_id, shot_id: req.params.id, error })
      res.status(status >= 400 && status < 600 ? status : 500).json({ error: message })
    }
  }

  private buildVideoPromptFromFlags(shot: any, flags: VideoPromptFlags): string {
    const gp = generationPromptFromShot(shot)
    const lines: string[] = []
    if (flags.include_action) {
      if (gp.lens.description) lines.push(`镜头：${gp.lens.description}`)
      if (gp.action && gp.action !== gp.lens.description) lines.push(`动作：${gp.action}`)
      if (gp.character.name) {
        let c = `角色：${gp.character.name}`
        if (gp.character.notes) c += `（${gp.character.notes}）`
        lines.push(c)
      }
      const loc = [gp.scene.location, gp.scene.time].filter(Boolean).join(' · ')
      if (loc) lines.push(`场景：${loc}`)
      if (gp.scene.notes) lines.push(`场景细节：${gp.scene.notes}`)
    }
    if (flags.include_camera && gp.lens.camera_movement) {
      lines.push(`镜头运动：${gp.lens.camera_movement}`)
    }
    if (flags.include_style && gp.style) {
      lines.push(`视觉风格：${gp.style}`)
    }
    if (flags.include_dialogue && gp.dialogue) {
      lines.push(`台词/口播：${gp.dialogue}`)
      lines.push('要求：画面与对白同步，音画一体，口型与情绪自然。')
    }
    const built = lines.join('\n').trim()
    if (built) return built
    return generationPromptToPlainText(gp) || shot.action_summary || 'cinematic video'
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
