import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import logger from '../lib/logger'

const setDefaultModelsSchema = z.object({
  defaultModels: z.object({
    text: z.string().optional(),
    image: z.string().optional(),
    video: z.string().optional(),
    audio: z.string().optional(),
    script: z.string().optional(),
    novel: z.string().optional(),
    storyline: z.string().optional(),
    outline: z.string().optional()
  }).strict()
})

const recordUsageSchema = z.object({
  modelId: z.string(),
  contentType: z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline']),
  success: z.boolean().optional(),
  duration: z.number().optional(),
  tokensUsed: z.number().optional()
})



const setParametersSchema = z.object({
  contentType: z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline']),
  parameters: z.record(z.string(), z.any())
})

const testModelSchema = z.object({
  modelId: z.string(),
  testPrompt: z.string().optional()
})

export class ModelPreferenceController {
  private async recordHistory(userId: string, changeType: string, changeDetails: any, previousValue: any, newValue: any): Promise<void> {
    try {
      await prisma.configurationHistory.create({
        data: {
          userId,
          changeType,
          changeDetails,
          previousValue,
          newValue
        }
      })
    } catch (error: any) {
      logger.error('Failed to record configuration history', { 
        userId, 
        changeType, 
        error: error.message || error.toString(),
        stack: error.stack 
      })
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const history = await prisma.configurationHistory.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      res.json({ history, total: history.length })
    } catch (error: any) {
      logger.error('Failed to get configuration history', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get configuration history' })
    }
  }

  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      let preferences = await prisma.userPreferences.findUnique({
        where: { userId: req.userId }
      })

      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: { userId: req.userId }
        })
      }

      const modelParameters = await prisma.modelParameters.findMany({
        where: { userId: req.userId }
      })

      res.json({
        defaultModels: preferences.defaultModels as Record<string, string>,
        lastUsedModels: preferences.lastUsedModels as Record<string, string>,
        modelParameters: modelParameters.reduce((acc, mp) => {
          acc[mp.contentType] = mp.parameters as Record<string, any>
          return acc
        }, {} as Record<string, any>)
      })
    } catch (error: any) {
      logger.error('Failed to get user preferences', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get user preferences' })
    }
  }

  async setDefaultModels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { defaultModels } = setDefaultModelsSchema.parse(req.body)

      const existingPreferences = await prisma.userPreferences.findUnique({
        where: { userId: req.userId }
      })

      const preferences = await prisma.userPreferences.upsert({
        where: { userId: req.userId },
        update: { defaultModels },
        create: {
          userId: req.userId,
          defaultModels
        }
      })

      await this.recordHistory(
        req.userId,
        'default_models',
        { contentType: 'all' },
        existingPreferences?.defaultModels || {},
        defaultModels
      )

      res.json({ defaultModels: preferences.defaultModels })
      logger.info('Default models updated', { userId: req.userId, defaultModels })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors })
        return
      }
      logger.error('Failed to set default models', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to set default models' })
    }
  }

  async recordUsage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { modelId, contentType, success } = recordUsageSchema.parse(req.body)

      const preferences = await prisma.userPreferences.upsert({
        where: { userId: req.userId },
        update: {
          lastUsedModels: {
            ...((await prisma.userPreferences.findUnique({ where: { userId: req.userId } }))?.lastUsedModels as Record<string, any> || {}),
            [contentType]: modelId
          }
        },
        create: {
          userId: req.userId,
          lastUsedModels: { [contentType]: modelId }
        }
      })

      res.json({ lastUsedModels: preferences.lastUsedModels })
      logger.info('Model usage recorded', { userId: req.userId, modelId, contentType, success })
    } catch (error: any) {
      logger.error('Failed to record model usage', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to record model usage' })
    }
  }

  async getParameters(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { contentType } = req.params

      const modelParams = await prisma.modelParameters.findUnique({
        where: {
          userId_contentType: {
            userId: req.userId,
            contentType: contentType as any
          }
        }
      })

      res.json({ parameters: modelParams?.parameters || {} })
    } catch (error: any) {
      logger.error('Failed to get model parameters', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get model parameters' })
    }
  }

  async setParameters(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { contentType, parameters } = setParametersSchema.parse(req.body)

      const existingParams = await prisma.modelParameters.findUnique({
        where: {
          userId_contentType: {
            userId: req.userId,
            contentType
          }
        }
      })

      const modelParams = await prisma.modelParameters.upsert({
        where: {
          userId_contentType: {
            userId: req.userId,
            contentType
          }
        },
        update: { parameters },
        create: {
          userId: req.userId,
          contentType,
          parameters
        }
      })

      await this.recordHistory(
        req.userId,
        'model_parameters',
        { contentType },
        existingParams?.parameters || {},
        parameters
      )

      res.json({ parameters: modelParams.parameters })
      logger.info('Model parameters updated', { userId: req.userId, contentType })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        logger.error('Zod validation error', { 
          userId: req.userId, 
          errors: error.errors,
          requestBody: req.body 
        })
        res.status(400).json({ error: 'Validation failed', details: error.errors })
        return
      }
      logger.error('Failed to set model parameters', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to set model parameters' })
    }
  }

  async testModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { modelId } = testModelSchema.parse(req.body)

      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: modelId,
          provider: {
            userId: req.userId
          }
        },
        include: {
          provider: true
        }
      })

      if (!model) {
        res.status(404).json({ error: 'Model not found' })
        return
      }

      res.json({
        success: true,
        message: 'Model is accessible',
        model: {
          id: model.id,
          name: model.name,
          type: model.type,
          capabilities: model.capabilities
        }
      })
      logger.info('Model tested successfully', { userId: req.userId, modelId })
    } catch (error: any) {
      logger.error('Failed to test model', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to test model' })
    }
  }

  async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: req.userId }
      })

      const models = await prisma.aIProviderModel.findMany({
        where: {
          provider: {
            userId: req.userId
          }
        }
      })

      const lastUsedModels = preferences?.lastUsedModels as Record<string, string> || {}
      const defaultModels = preferences?.defaultModels as Record<string, string> || {}

      res.json({
        defaultModels,
        lastUsedModels,
        modelCount: models.length,
        modelsByType: models.reduce((acc, model) => {
          acc[model.type] = (acc[model.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })
    } catch (error: any) {
      logger.error('Failed to get usage stats', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get usage stats' })
    }
  }

  async getDetailedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: req.userId }
      })

      const models = await prisma.aIProviderModel.findMany({
        where: {
          provider: {
            userId: req.userId
          }
        },
        include: {
          provider: true
        }
      })

      const history = await prisma.configurationHistory.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      })

      const lastUsedModels = preferences?.lastUsedModels as Record<string, string> || {}
      const defaultModels = preferences?.defaultModels as Record<string, string> || {}

      const modelUsageCount: Record<string, number> = {}
      Object.values(lastUsedModels).forEach(modelId => {
        modelUsageCount[modelId] = (modelUsageCount[modelId] || 0) + 1
      })

      const typeUsageCount: Record<string, number> = {}
      Object.entries(lastUsedModels).forEach(([type, _]) => {
        typeUsageCount[type] = (typeUsageCount[type] || 0) + 1
      })

      const historyByType: Record<string, number> = {}
      history.forEach(h => {
        historyByType[h.changeType] = (historyByType[h.changeType] || 0) + 1
      })

      const recentActivity = history.slice(0, 10).map(h => ({
        id: h.id,
        type: h.changeType,
        timestamp: h.createdAt,
        details: h.changeDetails
      }))

      const topUsedModels = Object.entries(modelUsageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([modelId, count]) => {
          const model = models.find(m => m.id === modelId)
          return {
            id: modelId,
            name: model?.name || 'Unknown',
            type: model?.type || 'unknown',
            count
          }
        })

      const modelDetails = models.map(model => ({
        id: model.id,
        name: model.name,
        type: model.type,
        provider: model.provider.type,
        capabilities: model.capabilities,
        isDefault: Object.values(defaultModels).includes(model.id),
        isLastUsed: Object.values(lastUsedModels).includes(model.id),
        usageCount: modelUsageCount[model.id] || 0
      }))

      res.json({
        summary: {
          totalModels: models.length,
          configuredDefaults: Object.keys(defaultModels).length,
          activeUsage: Object.keys(lastUsedModels).length,
          totalChanges: history.length
        },
        byType: {
          distribution: models.reduce((acc, model) => {
            acc[model.type] = (acc[model.type] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          usage: typeUsageCount
        },
        models: {
          topUsed: topUsedModels,
          details: modelDetails
        },
        history: {
          summary: historyByType,
          recent: recentActivity
        }
      })
    } catch (error: any) {
      logger.error('Failed to get detailed analytics', { 
        userId: req.userId, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get detailed analytics' })
    }
  }
}

export const modelPreferenceController = new ModelPreferenceController()
