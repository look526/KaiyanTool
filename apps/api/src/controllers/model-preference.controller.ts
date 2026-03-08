import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import logger from '../lib/logger'
import crypto from 'crypto'

const setDefaultModelsSchema = z.object({
  default_models: z.object({
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
  model_id: z.string(),
  content_type: z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline']),
  success: z.boolean().optional(),
  duration: z.number().optional(),
  tokens_used: z.number().optional()
})



const setParametersSchema = z.object({
  content_type: z.enum(['text', 'image', 'video', 'audio', 'script', 'novel', 'storyline', 'outline']),
  parameters: z.record(z.string(), z.any())
})

const testModelSchema = z.object({
  model_id: z.string(),
  test_prompt: z.string().optional()
})

export class ModelPreferenceController {
  private async recordHistory(userId: string, change_type: string, change_details: any, previous_value: any, new_value: any): Promise<void> {
    try {
      await prisma.configurationHistory.create({
        data: {
          id: crypto.randomUUID(),
          user_id: userId,
          change_type: change_type,
          change_details: change_details,
          previous_value: previous_value,
          new_value: new_value,
          created_at: new Date()
        }
      })
    } catch (error: any) {
      logger.error('Failed to record configuration history', { 
        userId, 
        change_type, 
        error: error.message || error.toString(),
        stack: error.stack 
      })
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const history = await prisma.configurationHistory.findMany({
        where: { user_id: req.user_id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      })

      res.json({ history, total: history.length })
    } catch (error: any) {
      logger.error('Failed to get configuration history', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get configuration history' })
    }
  }

  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      let preferences = await prisma.userPreferences.findUnique({
        where: { user_id: req.user_id }
      })

      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: {
            id: crypto.randomUUID(),
            user_id: req.user_id,
            default_models: {},
            last_used_models: {},
            created_at: new Date(),
            updated_at: new Date()
          }
        })
      }

      const model_parameters = await prisma.modelParameters.findMany({
        where: { user_id: req.user_id }
      })

      res.json({
        default_models: preferences.default_models as Record<string, string>,
        last_used_models: preferences.last_used_models as Record<string, string>,
        model_parameters: model_parameters.reduce((acc, mp) => {
          acc[mp.content_type] = mp.parameters as Record<string, any>
          return acc
        }, {} as Record<string, any>)
      })
    } catch (error: any) {
      logger.error('Failed to get user preferences', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get user preferences' })
    }
  }

  async setDefaultModels(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { default_models } = setDefaultModelsSchema.parse(req.body)

      const existingPreferences = await prisma.userPreferences.findUnique({
        where: { user_id: req.user_id }
      })

      const preferences = await prisma.userPreferences.upsert({
        where: { user_id: req.user_id },
        update: { default_models },
        create: {
          id: crypto.randomUUID(),
          user_id: req.user_id,
          default_models,
          last_used_models: {},
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      await this.recordHistory(
        req.user_id,
        'default_models',
        { content_type: 'all' },
        existingPreferences?.default_models || {},
        default_models
      )

      res.json({ default_models: preferences.default_models })
      logger.info('Default models updated', { user_id: req.user_id, default_models })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors })
        return
      }
      logger.error('Failed to set default models', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to set default models' })
    }
  }

  async recordUsage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { model_id, content_type, success } = recordUsageSchema.parse(req.body)

      logger.debug('Recording model usage', { user_id: req.user_id, model_id, content_type })

      const existingPreferences = await prisma.userPreferences.findUnique({
        where: { user_id: req.user_id }
      })

      const currentLastUsed = (existingPreferences?.last_used_models as Record<string, string> || {})
      const updatedLastUsed = {
        ...currentLastUsed,
        [content_type]: model_id
      }

      const preferences = await prisma.userPreferences.upsert({
        where: { user_id: req.user_id },
        update: {
          last_used_models: updatedLastUsed
        },
        create: {
          id: crypto.randomUUID(),
          user_id: req.user_id,
          last_used_models: { [content_type]: model_id },
          default_models: {},
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      res.json({ last_used_models: preferences.last_used_models })
      logger.info('Model usage recorded', { user_id: req.user_id, model_id, content_type, success })
    } catch (error: any) {
      logger.error('Failed to record model usage', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error),
        stack: error.stack
      })
      res.status(500).json({ error: 'Failed to record model usage' })
    }
  }

  async getParameters(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { content_type } = req.params

      const modelParams = await prisma.modelParameters.findUnique({
        where: {
          user_id_content_type: {
            user_id: req.user_id,
            content_type: content_type as any
          }
        }
      })

      res.json({ parameters: modelParams?.parameters || {} })
    } catch (error: any) {
      logger.error('Failed to get model parameters', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get model parameters' })
    }
  }

  async setParameters(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { content_type, parameters } = setParametersSchema.parse(req.body)

      const existingParams = await prisma.modelParameters.findUnique({
        where: {
          user_id_content_type: {
            user_id: req.user_id,
            content_type
          }
        }
      })

      const modelParams = await prisma.modelParameters.upsert({
        where: {
          user_id_content_type: {
            user_id: req.user_id,
            content_type
          }
        },
        update: { parameters },
        create: {
          id: crypto.randomUUID(),
          user_id: req.user_id,
          content_type,
          parameters,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      await this.recordHistory(
        req.user_id,
        'model_parameters',
        { content_type },
        existingParams?.parameters || {},
        parameters
      )

      res.json({ parameters: modelParams.parameters })
      logger.info('Model parameters updated', { user_id: req.user_id, content_type })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        logger.error('Zod validation error', { 
          user_id: req.user_id, 
          errors: error.errors,
          requestBody: req.body 
        })
        res.status(400).json({ error: 'Validation failed', details: error.errors })
        return
      }
      logger.error('Failed to set model parameters', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to set model parameters' })
    }
  }

  async testModel(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { model_id } = testModelSchema.parse(req.body)

      const model = await prisma.aIProviderModel.findFirst({
        where: {
          id: model_id,
          AIProvider: {
            user_id: req.user_id
          }
        },
        include: {
          AIProvider: true
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
          type: model.types[0] || 'unknown',
          capabilities: model.capabilities
        }
      })
      logger.info('Model tested successfully', { user_id: req.user_id, model_id })
    } catch (error: any) {
      logger.error('Failed to test model', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to test model' })
    }
  }

  async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const preferences = await prisma.userPreferences.findUnique({
        where: { user_id: req.user_id }
      })

      const models = await prisma.aIProviderModel.findMany({
        where: {
          AIProvider: {
            user_id: req.user_id
          }
        }
      })

      const last_used_models = preferences?.last_used_models as Record<string, string> || {}
      const default_models = preferences?.default_models as Record<string, string> || {}

      res.json({
        default_models,
        last_used_models,
        modelCount: models.length,
        modelsByType: models.reduce((acc, model) => {
          acc[model.types[0] || 'unknown'] = (acc[model.types[0] || 'unknown'] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })
    } catch (error: any) {
      logger.error('Failed to get usage stats', { 
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get usage stats' })
    }
  }

  async getDetailedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const preferences = await prisma.userPreferences.findUnique({
        where: { user_id: req.user_id }
      })

      const models = await prisma.aIProviderModel.findMany({
        where: {
          AIProvider: {
            user_id: req.user_id
          }
        },
        include: {
          AIProvider: true
        }
      })

      const history = await prisma.configurationHistory.findMany({
        where: { user_id: req.user_id },
        orderBy: { created_at: 'desc' },
        take: 100
      })

      const last_used_models = preferences?.last_used_models as Record<string, string> || {}
      const default_models = preferences?.default_models as Record<string, string> || {}

      const modelUsageCount: Record<string, number> = {}
      Object.values(last_used_models).forEach(model_id => {
        modelUsageCount[model_id] = (modelUsageCount[model_id] || 0) + 1
      })

      const typeUsageCount: Record<string, number> = {}
      Object.entries(last_used_models).forEach(([type, _]) => {
        typeUsageCount[type] = (typeUsageCount[type] || 0) + 1
      })

      const historyByType: Record<string, number> = {}
      history.forEach(h => {
        historyByType[h.change_type] = (historyByType[h.change_type] || 0) + 1
      })

      const recentActivity = history.slice(0, 10).map(h => ({
        id: h.id,
        type: h.change_type,
        timestamp: h.created_at,
        details: h.change_details
      }))

      const topUsedModels = Object.entries(modelUsageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([model_id, count]) => {
          const model = models.find(m => m.id === model_id)
          return {
            id: model_id,
            name: model?.name || 'Unknown',
            type: model?.types[0] || 'unknown',
            count
          }
        })

      const modelDetails = models.map(model => ({
        id: model.id,
        name: model.name,
        type: model.types[0] || 'unknown',
        provider: model.AIProvider.type,
        capabilities: model.capabilities,
        isDefault: Object.values(default_models).includes(model.id),
        isLastUsed: Object.values(last_used_models).includes(model.id),
        usageCount: modelUsageCount[model.id] || 0
      }))

      res.json({
        summary: {
          totalModels: models.length,
          configuredDefaults: Object.keys(default_models).length,
          activeUsage: Object.keys(last_used_models).length,
          totalChanges: history.length
        },
        byType: {
          distribution: models.reduce((acc, model) => {
            acc[model.types[0] || 'unknown'] = (acc[model.types[0] || 'unknown'] || 0) + 1
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
        user_id: req.user_id, 
        error: error?.message || error?.toString() || String(error) 
      })
      res.status(500).json({ error: 'Failed to get detailed analytics' })
    }
  }
}

export const modelPreferenceController = new ModelPreferenceController()
