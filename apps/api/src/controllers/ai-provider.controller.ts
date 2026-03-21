import { Request, Response } from 'express'
import * as crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import logger from '../lib/logger'

const providerModelSchema = z.object({
  name: z.string().min(1, '模型名称至少1位').max(100, '模型名称最多100位'),
  model_id: z.string().min(1, '模型ID至少1位').max(100, '模型ID最多100位'),
  type: z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline']).optional(),
  types: z.array(z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline'])).optional().default([]),
  description: z.string().optional(),
  capabilities: z.array(z.string()).optional().default([])
})

export class AIProviderController {
  async getProviders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        logger.warn('getProviders: No user_id found', { hasSession: !!req.session })
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      logger.info('getProviders: Fetching providers', { user_id: req.user_id })
      const providers = await prisma.aIProvider.findMany({
        where: { user_id: req.user_id },
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

      const providersWithModels = providers.map(provider => ({
        ...provider,
        models: provider.AIProviderModel,
      }))

      res.json({ providers: providersWithModels, pagination: { total: providers.length, page: 1, limit: providers.length } })
    } catch (error: any) {
      logger.error('Failed to get AI providers', { user_id: req.user_id, error: error?.message, stack: error?.stack })
      res.status(500).json({ error: error?.message || 'Failed to get AI providers' })
    }
  }

  async createProvider(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { type, api_key, base_url, enabled } = req.body

      if (!type || !api_key) {
        logger.warn('Create provider with missing fields', { user_id: req.user_id, type })
        res.status(400).json({ error: 'Type and api_key are required' })
        return
      }

      const provider = await prisma.aIProvider.create({
        data: {
          id: crypto.randomUUID(),
          user_id: req.user_id,
          type,
          api_key,
          base_url,
          enabled: enabled ?? true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      res.status(201).json({
        id: provider.id,
        type: provider.type,
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
      const { api_key, base_url, enabled } = req.body

      const provider = await prisma.aIProvider.findFirst({
        where: {
          id,
          user_id: req.user_id,
        },
      })

      if (!provider) {
        logger.warn('Provider not found for update', { user_id: req.user_id, provider_id: id })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      const updateData: any = {}
      if (api_key) updateData.api_key = api_key
      if (base_url) updateData.base_url = base_url
      if (enabled !== undefined) updateData.enabled = enabled

      const updated = await prisma.aIProvider.update({
        where: { id },
        data: updateData,
      })

      res.json({
        id: updated.id,
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
        where: {
          id,
          user_id: req.user_id,
        },
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
        where: {
          id: provider_id,
          user_id: req.user_id,
        },
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
      if (rawData.model_id) {
        updateData.model_id = rawData.model_id
        delete updateData.model_id
      }
      
      if (rawData.types && rawData.types.length > 0) {
        updateData.types = rawData.types
      }
      delete updateData.type

      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: model_id,
          AIProvider: {
            user_id: req.user_id,
          },
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
          AIProvider: {
            user_id: req.user_id,
          },
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
        where: {
          id,
          user_id: req.user_id,
        },
      })

      if (!provider) {
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      res.json({
        success: true,
        message: 'Provider is accessible',
        provider: {
          id: provider.id,
          type: provider.type,
          enabled: provider.enabled,
        },
      })
      logger.info('AI provider tested successfully', { user_id: req.user_id, provider_id: id })
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
          AIProvider: {
            user_id: req.user_id,
          },
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

      let testResult: any = null
      let testError: string | null = null

      try {
        const { ZhipuProvider } = await import('../services/ai/zhipu.provider')
        const { OpenAIProvider } = await import('../services/ai/openai.provider')
        const { GoogleProvider } = await import('../services/ai/google.provider')
        const { AntSKProvider } = await import('../services/ai/antsk.provider')
        const { SeedreamProvider } = await import('../services/ai/seedream.provider')
        const { ToapisProvider } = await import('../services/ai/toapis.provider')

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
          default:
            throw new Error(`Unknown provider type: ${provider.type}`)
        }

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
          AIProvider: {
            user_id: req.user_id,
          },
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
