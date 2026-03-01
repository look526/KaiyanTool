import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'
import { SeedreamImageRequest } from '../../types/seedream.types'
import { SeedreamTaskManager } from './seedream.task-manager'
import { config } from '../../config'
import logger from '../../lib/logger'

export class SeedreamProvider extends AIProvider {
  private taskManager: SeedreamTaskManager

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || config.ai.seedream?.baseUrl || 'https://api.seedream.com/v1')
    this.taskManager = new SeedreamTaskManager(this.apiKey, this.baseUrl)
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const requestBody = {
      model: options.model || 'doubao-seedream-5-0',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
    }

    logger.info('Seedream chat request', {
      model: requestBody.model,
      messagesCount: messages.length,
      temperature: requestBody.temperature,
      maxTokens: requestBody.max_tokens,
    })

    const response = await this.request('/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.choices || response.choices.length === 0) {
      logger.error('Seedream API returned no choices', { response })
      throw new Error('No response choices returned from Seedream API')
    }

    const messageContent = response.choices[0].message?.content
    if (!messageContent) {
      logger.error('Seedream API returned empty content', { response })
      throw new Error('AI返回内容为空')
    }

    const finishReason = response.choices[0].finish_reason

    logger.info('Seedream chat response', {
      model: response.model,
      finishReason,
      usage: response.usage,
    })

    return {
      content: messageContent,
      truncated: finishReason === 'length',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    }
  }

  async createImage(request: AICreateImageRequest): Promise<AICreateImageResponse> {
    const seedreamRequest = this.convertToSeedreamRequest(request)
    const resolution = seedreamRequest.resolution || '2K'
    const aspectRatio = seedreamRequest.size || '1:1'
    const count = Math.min(seedreamRequest.n || 1, 15)

    const requestBody = {
      model: 'doubao-seedream-5-0',
      prompt: request.prompt,
      size: aspectRatio,
      n: count,
      image_urls: seedreamRequest.image_urls || [],
      metadata: {
        resolution,
        sequential_image_generation: count > 1 ? 'auto' : 'disabled',
        sequential_image_generation_options: count > 1 ? { max_images: count } : undefined,
        watermark: seedreamRequest.metadata?.watermark || false,
      },
    }

    logger.info('Seedream createImage request', {
      prompt: request.prompt.substring(0, 50),
      size: aspectRatio,
      resolution,
      n: count,
      hasReferenceImages: (request as any).image_urls?.length > 0,
    })

    const taskResponse = await this.request('/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    logger.info('Seedream API response', { response: taskResponse });

    if (taskResponse.data && Array.isArray(taskResponse.data) && taskResponse.data.length > 0) {
      const imageData = taskResponse.data[0];
      logger.info('Seedream direct image result', { url: imageData.url });
      return {
        url: imageData.url,
        revisedPrompt: request.prompt,
        thumbnailUrl: imageData.url,
      };
    }

    if (!taskResponse.id) {
      logger.error('Seedream failed to create task', { response: taskResponse })
      throw new Error('Failed to create image generation task')
    }

    const taskId = taskResponse.id
    logger.info('Seedream task created', { taskId })

    try {
      const result = await this.taskManager.waitForTaskCompletion(taskId, {
        pollInterval: 2000,
        maxPollAttempts: 150,
        onProgress: (task) => {
          logger.debug('Seedream task progress', {
            taskId,
            status: task.status,
            progress: task.progress,
          })
        },
      })

      if (result.status === 'failed') {
        const error = `Image generation failed: ${result.progress}% completed`
        logger.error('Seedream task failed', { taskId, progress: result.progress })
        throw new Error(error)
      }

      logger.info('Seedream image generation completed', {
        taskId,
        attempts: result.progress,
        metadata: result.metadata,
      })

      return {
        url: (result as any).url,
        revisedPrompt: request.prompt,
      }
    } catch (error) {
      logger.error('Seedream task wait failed', { taskId, error })
      throw error
    }
  }

  async createVideo(_request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    throw new Error('Video generation not implemented for Seedream provider')
  }

  private convertToSeedreamRequest(request: AICreateImageRequest): SeedreamImageRequest {
    const seedreamRequest: SeedreamImageRequest = {
      prompt: request.prompt,
      n: request.n || 1,
    }

    if (request.size) {
      const size = request.size
      if (size.includes(':')) {
        seedreamRequest.size = size as any
      } else {
        seedreamRequest.size = '1:1'
      }
    }

    if ((request as any).resolution) {
      seedreamRequest.resolution = (request as any).resolution
    }

    if ((request as any).image_urls) {
      seedreamRequest.image_urls = (request as any).image_urls
    }

    if ((request as any).metadata) {
      seedreamRequest.metadata = (request as any).metadata
    }

    return seedreamRequest
  }
}
