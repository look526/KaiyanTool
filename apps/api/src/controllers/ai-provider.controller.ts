import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { aiProviderService } from '../services/ai/provider.service'
import { AIProviderConfig } from '../types/ai.types'
import { encrypt, decrypt } from '../lib/encryption'
import logger from '../lib/logger'

class AIProviderController {
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
          enabled: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      res.json(providers)
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

      const { type, apiKey, baseUrl } = req.body

      if (!type || !apiKey) {
        logger.warn('Create provider with missing fields', { userId: req.userId, type })
        res.status(400).json({ error: 'Type and apiKey are required' })
        return
      }

      const encryptedKey = this.encryptApiKey(apiKey)

      const provider = await prisma.aIProvider.create({
        data: {
          userId: req.userId,
          type,
          apiKey: encryptedKey,
          baseUrl,
          enabled: true,
        },
      })

      const config: AIProviderConfig = {
        type,
        apiKey,
        baseUrl,
      }

      aiProviderService.addProvider(provider.id, config)

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
      const { apiKey, baseUrl, enabled } = req.body

      const existing = await prisma.aIProvider.findFirst({
        where: {
          id,
          userId: req.userId,
        },
      })

      if (!existing) {
        logger.warn('Provider not found for update', { userId: req.userId, providerId: id })
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      const updateData: any = {}
      if (baseUrl) updateData.baseUrl = baseUrl
      if (enabled !== undefined) updateData.enabled = enabled
      if (apiKey) {
        updateData.apiKey = this.encryptApiKey(apiKey)
      }

      const updated = await prisma.aIProvider.update({
        where: { id },
        data: updateData,
      })

      const config: AIProviderConfig = {
        type: existing.type as any,
        apiKey: apiKey || this.decryptApiKey(existing.apiKey),
        baseUrl: baseUrl || existing.baseUrl || undefined,
      }

      if (apiKey || !aiProviderService.hasProvider(id)) {
        aiProviderService.addProvider(id, config)
      }

      res.json({
        id: updated.id,
        type: updated.type,
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

      aiProviderService.removeProvider(id)

      res.json({ message: 'Provider deleted successfully' })
      logger.info('AI provider deleted', { userId: req.userId, providerId: id })
    } catch (error) {
      logger.error('Failed to delete AI provider', { userId: req.userId, providerId: req.params.id, error })
      res.status(500).json({ error: 'Failed to delete AI provider' })
    }
  }

  async testProvider(req: Request, res: Response): Promise<void> {
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
        res.status(404).json({ error: 'Provider not found' })
        return
      }

      const apiKey = this.decryptApiKey(provider.apiKey)
      const config: AIProviderConfig = {
        type: provider.type as any,
        apiKey,
        baseUrl: provider.baseUrl || undefined,
      }

      aiProviderService.addProvider(id, config)

      const result = await aiProviderService.chat(id, [
        { role: 'user', content: 'Hello' }
      ], 'gpt-3.5-turbo')

      res.json({ success: true, usage: result.usage })
      logger.info('AI provider test successful', { userId: req.userId, providerId: id, type: provider.type })
    } catch (error) {
      logger.error('Failed to test AI provider', { userId: req.userId, providerId: req.params.id, error })
      res.status(500).json({ success: false, error: 'Connection failed' })
    }
  }

  private encryptApiKey(apiKey: string): string {
    return encrypt(apiKey)
  }

  private decryptApiKey(encryptedValue: string): string {
    return decrypt(encryptedValue)
  }
}

export const aiProviderController = new AIProviderController()
