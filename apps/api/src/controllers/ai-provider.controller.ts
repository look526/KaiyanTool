import { Request, Response } from 'express'
import * as crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import logger from '../lib/logger'

const ADMIN_ROLES = ['admin', 'super_admin']

const providerSchema = z.object({
  type: z.string().trim().min(1, '提供商类型不能为空').max(80, '提供商类型最多80位'),
  api_key: z.string().trim().min(1, 'API 密钥不能为空'),
  base_url: z.string().trim().max(500, '请求地址最多500位').optional().or(z.literal('')),
  enabled: z.boolean().optional(),
})

const providerUpdateSchema = providerSchema.partial().refine(
  data => Object.keys(data).length > 0,
  '至少需要提供一个更新字段'
)

const providerModelSchema = z.object({
  name: z.string().min(1, '模型名称至少1位').max(100, '模型名称最多100位'),
  model_id: z.string().min(1, '模型ID至少1位').max(100, '模型ID最多100位'),
  type: z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline']).optional(),
  types: z.array(z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline'])).optional().default([]),
  description: z.string().optional(),
  capabilities: z.array(z.string()).optional().default([])
})

const FIXED_PROVIDER_DEFAULT_MODELS: Record<string, Array<{
  name: string
  model_id: string
  types: string[]
  description: string
  capabilities: string[]
}>> = {
  'ecloud-seedance': [
    {
      name: 'Doubao Seedance 2.0',
      model_id: 'doubao-seedance-2.0',
      types: ['video'],
      description: '移动云 AICC-Doubao-Seedance 2.0 视频生成模型，支持文生视频、首帧/首尾帧图生视频、多模态参考生视频和有声视频。',
      capabilities: ['文生视频', '图生视频', '首尾帧', '参考图', '有声视频'],
    },
  ],
  'ecloud-qwen-image': [
    {
      name: '移动云千问 Image2 Pro',
      model_id: 'qwen/qwen-image-2.0-pro',
      types: ['image'],
      description: '移动云千问图像生成与编辑模型 Pro，支持文生图、图生图、多图参考和复杂文字渲染。',
      capabilities: ['文生图', '图生图', '图像编辑', '多图参考', '复杂文字渲染'],
    },
  ],
}

export class AIProviderController {
  private async getAdminProviderOwnerId(userId: string): Promise<string> {
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (adminUser && ADMIN_ROLES.includes(adminUser.role)) {
      return adminUser.id
    }

    const owner = await prisma.user.findFirst({
      where: { role: { in: ADMIN_ROLES } },
      orderBy: { created_at: 'asc' },
      select: { id: true },
    })

    if (!owner) {
      logger.warn('No admin user found for AI provider configuration')
      throw new Error('No admin AI provider configuration owner found')
    }

    return owner.id
  }

  private adminProviderWhere(extra: Record<string, unknown> = {}): any {
    return {
      ...extra,
      User: {
        role: { in: ADMIN_ROLES },
      },
    }
  }

  private serializeProvider(provider: any, includeSecret = false): any {
    const { AIProviderModel, api_key, ...rest } = provider
    return {
      ...rest,
      ...(includeSecret ? { api_key } : {}),
      models: AIProviderModel || [],
    }
  }

  async getProviders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        logger.warn('getProviders: No user_id found', { hasSession: !!req.session })
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      logger.info('getProviders: Fetching admin-managed providers', { user_id: req.user_id })
      const providers = await prisma.aIProvider.findMany({
        where: {
          enabled: true,
          User: {
            role: { in: ADMIN_ROLES },
          },
        },
        include: {
          AIProviderModel: {
            select: {
              id: true,
              name: true,
              model_id: true,
              types: true,
              description: true,
              capabilities: true,
              is_assistant_default: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })

      const providersWithModels = providers.map(provider => this.serializeProvider(provider, false))

      res.json({ providers: providersWithModels, pagination: { total: providers.length, page: 1, limit: providers.length } })
    } catch (error: any) {
      logger.error('Failed to get AI providers', { user_id: req.user_id, error: error?.message, stack: error?.stack })
      res.status(500).json({ error: error?.message || 'Failed to get AI providers' })
    }
  }

  async getAdminProviders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const providers = await prisma.aIProvider.findMany({
        where: this.adminProviderWhere(),
        include: {
          AIProviderModel: {
            select: {
              id: true,
              name: true,
              model_id: true,
              types: true,
              description: true,
              capabilities: true,
              is_assistant_default: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })

      const providersWithModels = providers.map(provider => this.serializeProvider(provider, true))
      res.json({ providers: providersWithModels, pagination: { total: providers.length, page: 1, limit: providers.length } })
    } catch (error: any) {
      logger.error('Failed to get admin AI providers', { user_id: req.user_id, error: error?.message, stack: error?.stack })
      res.status(500).json({ error: error?.message || 'Failed to get admin AI providers' })
    }
  }

  async createProvider(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { type, api_key, base_url, enabled } = providerSchema.parse(req.body)

      const provider = await prisma.aIProvider.create({
        data: {
          id: crypto.randomUUID(),
          user_id: req.user_id,
          type,
          api_key,
          base_url: base_url || null,
          enabled: enabled ?? true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      const defaultModels = FIXED_PROVIDER_DEFAULT_MODELS[type] || []
      if (defaultModels.length > 0) {
        await prisma.aIProviderModel.createMany({
          data: defaultModels.map(model => ({
            id: crypto.randomUUID(),
            ai_provider_id: provider.id,
            name: model.name,
            model_id: model.model_id,
            types: model.types,
            description: model.description,
            capabilities: model.capabilities,
            is_assistant_default: false,
            created_at: new Date(),
            updated_at: new Date(),
          })),
          skipDuplicates: true,
        })
      }

      res.status(201).json({
        id: provider.id,
        type: provider.type,
        base_url: provider.base_url,
        enabled: provider.enabled,
        created_at: provider.created_at,
        updated_at: provider.updated_at,
      })
      logger.info('AI provider created', { user_id: req.user_id, provider_id: provider.id })
    } catch (error) {
      logger.error('Failed to create AI provider', { user_id: req.user_id, error })
      res.status(500).json({ error: 'Failed to create AI provider' })
    }
  }

  async updateProvider(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { type, api_key, base_url, enabled } = providerUpdateSchema.parse(req.body)

      const provider = await prisma.aIProvider.findFirst({
        where: this.adminProviderWhere({ id }),
      })

      if (!provider) {
        logger.warn('Provider not found for update', { user_id: req.user_id, provider_id: id })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      const updateData: any = {}
      if (type) updateData.type = type
      if (api_key) updateData.api_key = api_key
      if (base_url !== undefined) updateData.base_url = base_url || null
      if (enabled !== undefined) updateData.enabled = enabled
      updateData.updated_at = new Date()

      const updated = await prisma.aIProvider.update({
        where: { id },
        data: updateData,
      })

      res.json({
        id: updated.id,
        type: updated.type,
        api_key: updated.api_key,
        base_url: updated.base_url,
        enabled: updated.enabled,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      })
      logger.info('AI provider updated', { user_id: req.user_id, provider_id: id })
    } catch (error) {
      logger.error('Failed to update AI provider', { user_id: req.user_id, provider_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to update AI provider' })
    }
  }

  async deleteProvider(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const provider = await prisma.aIProvider.findFirst({
        where: this.adminProviderWhere({ id }),
      })

      if (!provider) {
        logger.warn('Provider not found for deletion', { user_id: req.user_id, provider_id: id })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      await prisma.aIProvider.delete({
        where: { id },
      })

      res.json({ message: 'Provider deleted successfully' })
      logger.info('AI provider deleted', { user_id: req.user_id, provider_id: id })
    } catch (error) {
      logger.error('Failed to delete AI provider', { user_id: req.user_id, provider_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete AI provider' })
    }
  }

  async createModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { provider_id } = req.params
      const rawData = providerModelSchema.parse(req.body)
      
      const modelData: any = {
        name: rawData.name,
        model_id: rawData.model_id,
        description: rawData.description,
        capabilities: rawData.capabilities || [],
      }
      
      if (rawData.types && rawData.types.length > 0) {
        modelData.types = rawData.types
      } else if (rawData.type) {
        modelData.types = [rawData.type]
      }

      const provider = await prisma.aIProvider.findFirst({
        where: this.adminProviderWhere({ id: provider_id }),
      })

      if (!provider) {
        logger.warn('Provider not found for model creation', { user_id: req.user_id, provider_id })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      const model = await prisma.aIProviderModel.create({
        data: {
          id: crypto.randomUUID(),
          ai_provider_id: provider_id,
          ...modelData,
          is_assistant_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      res.status(201).json(model)
      logger.info('AI provider model created', { user_id: req.user_id, provider_id, model_id: model.id })
    } catch (error) {
      logger.error('Failed to create AI provider model', { user_id: req.user_id, error })
      res.status(500).json({ error: 'Failed to create AI provider model' })
    }
  }

  async updateModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { model_id } = req.params
      const rawData = providerModelSchema.partial().parse(req.body)
      
      const updateData: any = { ...rawData }
      
      if (rawData.types && rawData.types.length > 0) {
        updateData.types = rawData.types
      }
      delete updateData.type

      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: model_id,
          AIProvider: this.adminProviderWhere(),
        },
      })

      if (!model) {
        logger.warn('Model not found for update', { user_id: req.user_id, model_id })
        res.status(404).json({ error: 'Model not found' })
        return
      }

      const updated = await prisma.aIProviderModel.update({
        where: { id: model_id },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
      })

      res.json(updated)
      logger.info('AI provider model updated', { user_id: req.user_id, model_id })
    } catch (error) {
      logger.error('Failed to update AI provider model', { user_id: req.user_id, error })
      res.status(500).json({ error: 'Failed to update AI provider model' })
    }
  }

  async deleteModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { model_id } = req.params

      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: model_id,
          AIProvider: this.adminProviderWhere(),
        },
      })

      if (!model) {
        logger.warn('Model not found for deletion', { user_id: req.user_id, model_id })
        res.status(404).json({ error: 'Model not found' })
        return
      }

      await prisma.aIProviderModel.delete({
        where: { id: model_id },
      })

      res.json({ message: 'Model deleted successfully' })
      logger.info('AI provider model deleted', { user_id: req.user_id, model_id })
    } catch (error) {
      logger.error('Failed to delete AI provider model', { user_id: req.user_id, error })
      res.status(500).json({ error: 'Failed to delete AI provider model' })
    }
  }

  async testProvider(req: Request, res: Response): Promise<void> {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { id } = req.params

    try {
      const provider = await prisma.aIProvider.findFirst({
        where: this.adminProviderWhere({ id }),
        include: {
          AIProviderModel: {
            orderBy: { created_at: 'asc' },
            take: 1,
          },
        },
      })

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      if (!provider.enabled) {
        res.status(400).json({ error: 'Provider is not enabled' })
        return
      }

      const testModel = provider.AIProviderModel[0]
      if (!testModel?.model_id) {
        res.status(400).json({
          success: false,
          message: '请先为该提供商添加至少一个模型，再测试真实连接',
        })
        return
      }

      const modelTypes = testModel.types || []
      const supportsChatTest = modelTypes.length === 0 || modelTypes.some(type => ['text', 'script', 'novel', 'storyline', 'outline'].includes(type))
      const supportsImageTest = modelTypes.some(type => type === 'image')
      if (!supportsChatTest && !supportsImageTest) {
        res.status(400).json({
          success: false,
          message: `当前测试按钮支持文本和图片模型，模型类型是 ${modelTypes.join('、')}，请使用对应生成业务测试该模型`,
        })
        return
      }

      let testResult: any = null
      let testError: string | null = null

      try {
        const { ZhipuProvider } = await import('../services/ai/zhipu.provider')
        const { OpenAIProvider } = await import('../services/ai/openai.provider')
        const { GoogleProvider } = await import('../services/ai/google.provider')
        const { AntSKProvider } = await import('../services/ai/antsk.provider')
        const { SeedreamProvider } = await import('../services/ai/seedream.provider')
        const { ToapisProvider } = await import('../services/ai/toapis.provider')
        const { ECloudSeedanceProvider } = await import('../services/ai/ecloud-seedance.provider')
        const { ECloudQwenImageProvider } = await import('../services/ai/ecloud-qwen-image.provider')

        let aiProvider: any

        switch (provider.type) {
          case 'zhipu':
            aiProvider = new ZhipuProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'openai':
            aiProvider = new OpenAIProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'google':
            aiProvider = new GoogleProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'antsk':
            aiProvider = new AntSKProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'seedream':
            aiProvider = new SeedreamProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'toapis':
            aiProvider = new ToapisProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'ecloud-seedance':
            aiProvider = new ECloudSeedanceProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'ecloud-qwen-image':
            aiProvider = new ECloudQwenImageProvider(provider.api_key, provider.base_url || undefined)
            break
          default:
            aiProvider = new OpenAIProvider(provider.api_key, provider.base_url || undefined)
        }

        if (supportsImageTest && !supportsChatTest) {
          const response = await aiProvider.createImage({
            model: testModel.model_id,
            prompt: '一张简洁的白底测试图，画面中央写着“测试成功”四个中文字符',
            size: '1:1',
            n: 1,
          })

          testResult = {
            success: true,
            response: response.url,
            imageUrl: response.url,
            model: testModel.model_id,
          }
        } else {
          const response = await aiProvider.chat([
            {
              role: 'user',
              content: '请回复"测试成功"四个字',
            },
          ], { model: testModel.model_id })

          testResult = {
            success: true,
            response: response.content,
            model: response.model,
            usage: response.usage,
          }
        }
      } catch (error: any) {
        testError = error.message || 'Failed to send test message'
        logger.error('Failed to test AI provider with model', { user_id: req.user_id, provider_id: id, model_id: testModel.id, error: error.message })
      }

      res.json({
        success: testError === null,
        message: testError ? `测试失败: ${testError}` : '测试成功',
        provider: {
          id: provider.id,
          type: provider.type,
          enabled: provider.enabled,
        },
        model: {
          id: testModel.id,
          name: testModel.name,
          model_id: testModel.model_id,
        },
        testResult,
        testError,
      })
      logger.info('AI provider tested', { user_id: req.user_id, provider_id: id, success: testError === null })
    } catch (error) {
      logger.error('Failed to test AI provider', { user_id: req.user_id, provider_id: req.params.id, error })
      res.status(500).json({ error: 'Failed to test provider' })
    }
  }

  async testModel(req: Request, res: Response): Promise<void> {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { model_id } = req.params

    try {
      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: model_id,
          AIProvider: this.adminProviderWhere(),
        },
        include: {
          AIProvider: true,
        },
      })

      if (!model) {
        res.status(404).json({ error: 'Model not found' })
        return
      }

      const provider = model.AIProvider

      if (!provider.enabled) {
        res.status(400).json({ error: 'Provider is not enabled' })
        return
      }

      const modelTypes = model.types || []
      const supportsChatTest = modelTypes.length === 0 || modelTypes.some(type => ['text', 'script', 'novel', 'storyline', 'outline'].includes(type))
      const supportsImageTest = modelTypes.some(type => type === 'image')
      if (!supportsChatTest && !supportsImageTest) {
        res.status(400).json({
          success: false,
          message: `当前测试按钮支持文本和图片模型，模型类型是 ${modelTypes.join('、')}，请使用对应生成业务测试该模型`,
        })
        return
      }

      let testResult: any = null
      let testError: string | null = null

      try {
        const { ZhipuProvider } = await import('../services/ai/zhipu.provider')
        const { OpenAIProvider } = await import('../services/ai/openai.provider')
        const { GoogleProvider } = await import('../services/ai/google.provider')
        const { AntSKProvider } = await import('../services/ai/antsk.provider')
        const { SeedreamProvider } = await import('../services/ai/seedream.provider')
        const { ToapisProvider } = await import('../services/ai/toapis.provider')
        const { ECloudSeedanceProvider } = await import('../services/ai/ecloud-seedance.provider')
        const { ECloudQwenImageProvider } = await import('../services/ai/ecloud-qwen-image.provider')

        let aiProvider: any

        switch (provider.type) {
          case 'zhipu':
            aiProvider = new ZhipuProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'openai':
            aiProvider = new OpenAIProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'google':
            aiProvider = new GoogleProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'antsk':
            aiProvider = new AntSKProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'seedream':
            aiProvider = new SeedreamProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'toapis':
            aiProvider = new ToapisProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'ecloud-seedance':
            aiProvider = new ECloudSeedanceProvider(provider.api_key, provider.base_url || undefined)
            break
          case 'ecloud-qwen-image':
            aiProvider = new ECloudQwenImageProvider(provider.api_key, provider.base_url || undefined)
            break
          default:
            aiProvider = new OpenAIProvider(provider.api_key, provider.base_url || undefined)
        }

        if (supportsImageTest && !supportsChatTest) {
          const response = await aiProvider.createImage({
            model: model.model_id || undefined,
            prompt: '一张简洁的白底测试图，画面中央写着“测试成功”四个中文字符',
            size: '1:1',
            n: 1,
          })

          testResult = {
            success: true,
            response: response.url,
            imageUrl: response.url,
            model: model.model_id,
          }
        } else {
          const testMessage = {
            role: 'user',
            content: '请回复"测试成功"四个字',
          }

          const response = await aiProvider.chat([testMessage], { model: model.model_id })

          testResult = {
            success: true,
            response: response.content,
            model: response.model,
            usage: response.usage,
          }
        }
      } catch (error: any) {
        testError = error.message || 'Failed to send test message'
        logger.error('Failed to send test message to AI model', { user_id: req.user_id, model_id, error: error.message })
      }

      res.json({
        success: testError === null,
        message: testError ? `测试失败: ${testError}` : '测试成功',
        model: {
          id: model.id,
          name: model.name,
          types: model.types,
          provider: {
            id: provider.id,
            type: provider.type,
            enabled: provider.enabled,
          },
        },
        testResult,
        testError,
      })
      logger.info('AI provider model tested', { user_id: req.user_id, model_id, provider_id: provider.id, success: testError === null })
    } catch (error) {
      logger.error('Failed to test AI provider model', { user_id: req.user_id, model_id: req.params.model_id, error })
      res.status(500).json({ error: 'Failed to test model' })
    }
  }

  async setAssistantDefault(req: Request, res: Response): Promise<void> {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { model_id } = req.params

    try {
      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: model_id,
          AIProvider: this.adminProviderWhere(),
        },
      })

      if (!model) {
        res.status(404).json({ error: 'Model not found' })
        return
      }

      await prisma.aIProviderModel.update({
        where: { id: model_id },
        data: { is_assistant_default: true },
      })

      logger.info('AI provider model set as assistant default', { user_id: req.user_id, model_id })
      res.json({ message: 'Model set as assistant default' })
    } catch (error) {
      logger.error('Failed to set assistant default', { user_id: req.user_id, model_id, error })
      res.status(500).json({ error: 'Failed to set assistant default' })
    }
  }

  async unsetAssistantDefault(req: Request, res: Response): Promise<void> {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { model_id } = req.params

    try {
      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: model_id,
          AIProvider: this.adminProviderWhere(),
        },
      })

      if (!model) {
        res.status(404).json({ error: 'Model not found' })
        return
      }

      await prisma.aIProviderModel.update({
        where: { id: model_id },
        data: { is_assistant_default: false },
      })

      logger.info('AI provider model unset as assistant default', { user_id: req.user_id, model_id })
      res.json({ message: 'Model unset as assistant default' })
    } catch (error) {
      logger.error('Failed to unset assistant default', { user_id: req.user_id, model_id, error })
      res.status(500).json({ error: 'Failed to unset assistant default' })
    }
  }
}

export const aiProviderController = new AIProviderController()
