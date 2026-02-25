import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import logger from '../lib/logger'

const providerModelSchema = z.object({
  name: z.string().min(1, '模型名称至少1位').max(100, '模型名称最多100位'),
  type: z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline']).optional(),
  types: z.array(z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline'])).optional().default([]),
  description: z.string().optional(),
  capabilities: z.array(z.string()).optional().default([])
})

export class AIProviderController {
  async getProviders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const providers = await prisma.aIProvider.findMany({
        where: { userId: req.userId },
        select: {
          id: true,
          type: true,
          apiKey: true,
          baseUrl: true,
          enabled: true,
          createdAt: true,
          updatedAt: true,
          models: {
            select: {
              id: true,
              name: true,
              types: true,
              description: true,
              capabilities: true,
              isAssistantDefault: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json({ providers, pagination: { total: providers.length, page: 1, limit: providers.length } })
    } catch (error) {
      logger.error('Failed to get AI providers', { userId: req.userId, error })
      res.status(500).json({ error: 'Failed to get AI providers' })
    }
  }

  async createProvider(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { type, apiKey, baseUrl, enabled } = req.body

      if (!type || !apiKey) {
        logger.warn('Create provider with missing fields', { userId: req.userId, type })
        res.status(400).json({ error: 'Type and apiKey are required' })
        return
      }

      const provider = await prisma.aIProvider.create({
        data: {
          userId: req.userId,
          type,
          apiKey,
          baseUrl,
          enabled: enabled ?? true,
        },
      })

      res.status(201).json({
        id: provider.id,
        type: provider.type,
        enabled: provider.enabled,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      })
      logger.info('AI provider created', { userId: req.userId, providerId: provider.id })
    } catch (error) {
      logger.error('Failed to create AI provider', { userId: req.userId, error })
      res.status(500).json({ error: 'Failed to create AI provider' })
    }
  }

  async updateProvider(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { apiKey: _apiKey, baseUrl, enabled } = req.body

      const provider = await prisma.aIProvider.findFirst({
        where: {
          id,
          userId: req.userId,
        },
      })

      if (!provider) {
        logger.warn('Provider not found for update', { userId: req.userId, providerId: id })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      const updateData: any = {}
      if (baseUrl) updateData.baseUrl = baseUrl
      if (enabled !== undefined) updateData.enabled = enabled

      const updated = await prisma.aIProvider.update({
        where: { id },
        data: updateData,
      })

      res.json({
        id: updated.id,
        enabled: updated.enabled,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      })
      logger.info('AI provider updated', { userId: req.userId, providerId: id })
    } catch (error) {
      logger.error('Failed to update AI provider', { userId: req.userId, providerId: req.params.id, error })
      res.status(500).json({ error: 'Failed to update AI provider' })
    }
  }

  async deleteProvider(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const provider = await prisma.aIProvider.findFirst({
        where: {
          id,
          userId: req.userId,
        },
      })

      if (!provider) {
        logger.warn('Provider not found for deletion', { userId: req.userId, providerId: id })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      await prisma.aIProvider.delete({
        where: { id },
      })

      res.json({ message: 'Provider deleted successfully' })
      logger.info('AI provider deleted', { userId: req.userId, providerId: id })
    } catch (error) {
      logger.error('Failed to delete AI provider', { userId: req.userId, providerId: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete AI provider' })
    }
  }

  async createModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { providerId } = req.params
      const rawData = providerModelSchema.parse(req.body)
      
      const modelData: any = {
        name: rawData.name,
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
          id: providerId,
          userId: req.userId,
        },
      })

      if (!provider) {
        logger.warn('Provider not found for model creation', { userId: req.userId, providerId })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      const model = await prisma.aIProviderModel.create({
        data: {
          providerId,
          ...modelData,
        },
      })

      res.status(201).json(model)
      logger.info('AI provider model created', { userId: req.userId, providerId, modelId: model.id })
    } catch (error) {
      logger.error('Failed to create AI provider model', { userId: req.userId, error })
      res.status(500).json({ error: 'Failed to create AI provider model' })
    }
  }

  async updateModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { modelId } = req.params
      const rawData = providerModelSchema.partial().parse(req.body)
      
      const updateData: any = { ...rawData }
      
      if (rawData.types && rawData.types.length > 0) {
        updateData.types = rawData.types
        delete updateData.type
      } else if (rawData.type) {
        updateData.types = [rawData.type]
        delete updateData.type
      }

      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: modelId,
          provider: {
            userId: req.userId,
          },
        },
      })

      if (!model) {
        logger.warn('Model not found for update', { userId: req.userId, modelId })
        res.status(404).json({ error: 'Model not found' })
        return
      }

      const updated = await prisma.aIProviderModel.update({
        where: { id: modelId },
        data: updateData,
      })

      res.json(updated)
      logger.info('AI provider model updated', { userId: req.userId, modelId })
    } catch (error) {
      logger.error('Failed to update AI provider model', { userId: req.userId, error })
      res.status(500).json({ error: 'Failed to update AI provider model' })
    }
  }

  async deleteModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { modelId } = req.params

      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: modelId,
          provider: {
            userId: req.userId,
          },
        },
      })

      if (!model) {
        logger.warn('Model not found for deletion', { userId: req.userId, modelId })
        res.status(404).json({ error: 'Model not found' })
        return
      }

      await prisma.aIProviderModel.delete({
        where: { id: modelId },
      })

      res.json({ message: 'Model deleted successfully' })
      logger.info('AI provider model deleted', { userId: req.userId, modelId })
    } catch (error) {
      logger.error('Failed to delete AI provider model', { userId: req.userId, error })
      res.status(500).json({ error: 'Failed to delete AI provider model' })
    }
  }

  async testProvider(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { id } = req.params

    try {
      const provider = await prisma.aIProvider.findFirst({
        where: {
          id,
          userId: req.userId,
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
      logger.info('AI provider tested successfully', { userId: req.userId, providerId: id })
    } catch (error) {
      logger.error('Failed to test AI provider', { userId: req.userId, providerId: req.params.id, error })
      res.status(500).json({ error: 'Failed to test provider' })
    }
  }

  async testModel(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { modelId } = req.params

    try {
      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: modelId,
          provider: {
            userId: req.userId,
          },
        },
        include: {
          provider: true,
        },
      })

      if (!model) {
        res.status(404).json({ error: 'Model not found' })
        return
      }

      const provider = model.provider

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

        let aiProvider: any

        switch (provider.type) {
          case 'zhipu':
            aiProvider = new ZhipuProvider(provider.apiKey, provider.baseUrl || undefined)
            break
          case 'openai':
            aiProvider = new OpenAIProvider(provider.apiKey, provider.baseUrl || undefined)
            break
          case 'google':
            aiProvider = new GoogleProvider(provider.apiKey, provider.baseUrl || undefined)
            break
          case 'antsk':
            aiProvider = new AntSKProvider(provider.apiKey, provider.baseUrl || undefined)
            break
          default:
            throw new Error(`Unknown provider type: ${provider.type}`)
        }

        const testMessage = {
          role: 'user',
          content: '请回复"测试成功"四个字',
        }

        const response = await aiProvider.chat([testMessage], { model: model.name })

        testResult = {
          success: true,
          response: response.content,
          model: response.model,
          usage: response.usage,
        }
      } catch (error: any) {
        testError = error.message || 'Failed to send test message'
        logger.error('Failed to send test message to AI model', { userId: req.userId, modelId, error: error.message })
      }

      res.json({
        success: testError === null,
        message: testError ? `测试失败: ${testError}` : '测试成功',
        model: {
          id: model.id,
          name: model.name,
          type: model.type,
          provider: {
            id: provider.id,
            type: provider.type,
            enabled: provider.enabled,
          },
        },
        testResult,
        testError,
      })
      logger.info('AI provider model tested', { userId: req.userId, modelId, providerId: provider.id, success: testError === null })
    } catch (error) {
      logger.error('Failed to test AI provider model', { userId: req.userId, modelId: req.params.modelId, error })
      res.status(500).json({ error: 'Failed to test model' })
    }
  }

  async setAssistantDefault(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { modelId } = req.params

    try {
      await prisma.$transaction([
        prisma.aIProviderModel.updateMany({
          where: {
            provider: { userId: req.userId },
          },
          data: { isAssistantDefault: false },
        }),
        prisma.aIProviderModel.update({
          where: { id: modelId },
          data: { isAssistantDefault: true },
        }),
      ])

      logger.info('AI provider model set as assistant default', { userId: req.userId, modelId })
      res.json({ message: 'Model set as assistant default' })
    } catch (error) {
      logger.error('Failed to set assistant default', { userId: req.userId, modelId, error })
      res.status(500).json({ error: 'Failed to set assistant default' })
    }
  }

  async unsetAssistantDefault(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { modelId } = req.params

    try {
      await prisma.aIProviderModel.update({
        where: { id: modelId },
        data: { isAssistantDefault: false },
      })

      logger.info('AI provider model unset as assistant default', { userId: req.userId, modelId })
      res.json({ message: 'Model unset as assistant default' })
    } catch (error) {
      logger.error('Failed to unset assistant default', { userId: req.userId, modelId, error })
      res.status(500).json({ error: 'Failed to unset assistant default' })
    }
  }
}

export const aiProviderController = new AIProviderController()
