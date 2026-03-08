import { IntelligentSegmenter } from './intelligent-segmenter'
import { ParallelProcessor } from './parallel-processor'
import { AIProcessor } from './ai-processor'
import { ResultMerger } from './result-merger'
import { prisma } from '../../lib/prisma'
import logger from '../../lib/logger'
import { providerManager } from '../ai/provider.manager'
import { AIProviderHelper } from '../ai/provider-helper.service'

export interface LargeTextProcessOptions {
  useCache?: boolean
  maxConcurrency?: number
  onProgress?: (progress: number, message: string) => void
  maxSegmentTokens?: number
  contextWindowTokens?: number
  temperature?: number
  maxTokens?: number
  model?: string
  providerId?: string
}

export interface ProcessResult {
  title?: string
  scenes: any[]
  characters: any[]
  items: any[]
  metadata: {
    totalScenes: number
    totalCharacters: number
    totalDialogues: number
    estimatedDuration: number
    segmentCount: number
  }
}

export class LargeTextProcessingService {
  private segmenter = new IntelligentSegmenter()
  private processor = new ParallelProcessor()
  private aiProcessor = new AIProcessor()
  private merger = new ResultMerger()
  private resultCache = new Map<string, { result: ProcessResult; timestamp: number }>()
  private cacheTimeout = 30 * 60 * 1000

  configure(options: {
    maxSegmentTokens?: number
    contextWindowTokens?: number
    maxConcurrency?: number
    maxRetries?: number
    temperature?: number
    maxTokens?: number
    cacheTimeout?: number
  }) {
    if (options.maxSegmentTokens !== undefined) {
      this.segmenter.setMaxSegmentTokens(options.maxSegmentTokens)
    }
    if (options.contextWindowTokens !== undefined) {
      this.segmenter.setContextWindowTokens(options.contextWindowTokens)
    }
    if (options.maxConcurrency !== undefined) {
      this.processor.setMaxConcurrency(options.maxConcurrency)
    }
    if (options.maxRetries !== undefined) {
      this.processor.setMaxRetries(options.maxRetries)
    }
    if (options.temperature !== undefined) {
      this.aiProcessor.setTemperature(options.temperature)
    }
    if (options.maxTokens !== undefined) {
      this.aiProcessor.setMaxTokens(options.maxTokens)
    }
    if (options.cacheTimeout !== undefined) {
      this.cacheTimeout = options.cacheTimeout
    }
  }

  setDefaultModel(model: string) {
    this.aiProcessor.setDefaultModel(model)
  }

  async processLargeText(
    userId: string,
    text: string,
    options: LargeTextProcessOptions = {}
  ): Promise<ProcessResult> {
    const startTime = Date.now()
    logger.info('[大文本处理] 开始处理', { userId, textLength: text.length })

    if (options.useCache !== false) {
      const cached = this.getCachedResult(text)
      if (cached) {
        logger.info('[大文本处理] 使用缓存结果')

        if (!cached.result.scenes || cached.result.scenes.length === 0) {
          logger.warn('[大文本处理] 缓存结果为空，清除并重新处理')
          const cacheKey = this.generateCacheKey(text)
          this.resultCache.delete(cacheKey)
        } else {
          return cached.result
        }
      }
    }

    const progressTracker = {
      total: 100,
      current: 0,
      update: (step: number, message: string) => {
        progressTracker.current = step
        options.onProgress?.(step, message)
        logger.info(`[大文本处理] [进度 ${step}%] ${message}`)
      }
    }

    try {
      progressTracker.update(5, '开始智能分段...')
      const segments = await this.segmenter.segmentText(text)
      logger.info(`[大文本处理] 分段完成，共 ${segments.length} 个片段`)

      progressTracker.update(15, '查找AI提供商...')
      
      let providerDb;
      let providerIdForSegment: string;
      
      if (options.providerId) {
        console.log('[DEBUG large-text] Using provided providerId:', options.providerId);
        providerDb = await prisma.aIProvider.findUnique({
          where: { id: options.providerId },
        });
        if (!providerDb) {
          throw new Error('指定的 AI 提供商不存在')
        }
        providerIdForSegment = options.providerId;
      } else {
        console.log('[DEBUG large-text] options.model:', options.model);
        const providerSelection = await AIProviderHelper.getProviderForUser(userId, options.model);
        console.log('[DEBUG large-text] providerSelection:', providerSelection.providerId, providerSelection.providerType);
        providerDb = await prisma.aIProvider.findUnique({
          where: { id: providerSelection.providerId },
        });
        if (!providerDb) {
          throw new Error('未找到启用的 AI 提供商')
        }
        providerIdForSegment = providerDb.id;
      }

      if (!providerManager.getProvider(providerDb.id)) {
        console.log(`[大文本处理] 注册AI提供商: ${providerDb.id} (${providerDb.type})`)
        providerManager.addProvider({
          id: providerDb.id,
          name: providerDb.type,
          type: providerDb.type,
          apiKey: providerDb.api_key,
          baseUrl: providerDb.base_url || undefined,
        });
      }

      progressTracker.update(20, '开始并行处理...')
      console.log('[DEBUG large-text] providerIdForSegment:', providerIdForSegment);
      const segmentResults = await this.processor.processSegments(
        segments,
        async (segment) => {
          console.log('[DEBUG large-text] Calling processSegment with providerId:', providerIdForSegment);
          return await this.aiProcessor.processSegment(segment, providerIdForSegment, options.model)
        }
      )
      logger.info(`[大文本处理] 并行处理完成`)

      progressTracker.update(80, '开始合并结果...')
      const merged = await this.merger.mergeResults(segmentResults, segments)
      logger.info(`[大文本处理] 结果合并完成`)

      const finalResult: ProcessResult = this.merger.convertToArrayFormat(merged)

      if (options.useCache !== false) {
        this.cacheResult(text, finalResult)
      }

      const duration = Date.now() - startTime
      logger.info('[大文本处理] 完成', {
        duration,
        scenesCount: finalResult.scenes.length,
        charactersCount: finalResult.characters.length
      })

      progressTracker.update(100, '处理完成')

      return finalResult
    } catch (error) {
      logger.error('[大文本处理] 失败', { userId, error })
      throw error
    }
  }

  private getCachedResult(text: string): { result: ProcessResult; timestamp: number } | null {
    const cacheKey = this.generateCacheKey(text)
    const cached = this.resultCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached
    }

    if (cached) {
      this.resultCache.delete(cacheKey)
    }

    return null
  }

  private cacheResult(text: string, result: ProcessResult): void {
    if (!result.scenes || result.scenes.length === 0) {
      console.log('[大文本处理] 结果为空，不缓存')
      return
    }

    const cacheKey = this.generateCacheKey(text)
    this.resultCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    })

    if (this.resultCache.size > 100) {
      this.cleanOldCache()
    }
  }

  private generateCacheKey(text: string): string {
    const hash = this.simpleHash(text)
    return `cache_${hash}`
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  private cleanOldCache(): void {
    const now = Date.now()
    for (const [key, value] of this.resultCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.resultCache.delete(key)
      }
    }
  }

  clearCache(): void {
    this.resultCache.clear()
  }

  getCacheSize(): number {
    return this.resultCache.size
  }
}

export const largeTextProcessingService = new LargeTextProcessingService()
