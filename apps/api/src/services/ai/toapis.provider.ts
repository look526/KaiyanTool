import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'
import { Sora2VideoRequest, Sora2VideoResponse, VEO3VideoRequest } from '../../types/ai.types'
import logger from '../../lib/logger'

export class ToapisProvider extends AIProvider {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || 'https://toapis.com/v1')
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const modelMap: Record<string, string> = {
      'gpt-5': 'gpt-5',
      'gpt-4o': 'gpt-4o',
      'claude-3-5-sonnet': 'claude-3-5-sonnet',
      'gemini-2.0-flash': 'gemini-2.0-flash',
      'sora-2': 'sora-2',
      'sora-2-pro': 'sora-2-pro',
      'sora-2-vip': 'sora-2-vip',
      'veo3': 'veo3',
      'veo3-pro': 'veo3-pro',
    }

    const requestBody = {
      model: modelMap[options.model || ''] || options.model || 'gpt-4o',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000,
    }

    const response = await this.request('/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response choices returned from ToAPIs API')
    }

    return {
      content: response.choices[0].message?.content || '',
      truncated: response.choices[0].finish_reason === 'length',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    }
  }

  async createImage(request: AICreateImageRequest): Promise<AICreateImageResponse> {
    const modelMap: Record<string, string> = {
      'gpt-4o-image': 'gpt-4o-image',
      'gemini-3-pro-image-preview': 'gemini-3-pro-image-preview',
      'gemini-3.1-flash-image-preview': 'gemini-3.1-flash-image-preview',
      'gemini-2.5-flash-image-preview': 'gemini-2.5-flash-image-preview',
      'seedream-4.0': 'seedream-4.0',
      'seedream-4.5': 'seedream-4.5',
      'seedream-5.0': 'seedream-5.0',
      'flux-kontext': 'flux-kontext',
      'flux-2.0': 'flux-2.0',
      'grok-image': 'grok-image',
    }

    const imageModel = modelMap[request.model || ''] || 'gpt-4o-image'

    const sizeMap: Record<string, string> = {
      '256x256': '512x512',
      '512x512': '512x512',
      '1024x1024': '1024x1024',
      '1920x1080': '1920x1080',
      '1536x1024': '1536x1024',
      '1024x1792': '1024x1792',
      '1:1': '1024x1024',
      '4:3': '1024x768',
      '3:4': '768x1024',
      '16:9': '1024x1024',
      '9:16': '1024x1792',
      '3:2': '1536x1024',
      '2:3': '1024x1536',
      '21:9': '1920x810',
      '9:21': '810x1920',
    }

    const imageRequest = {
      model: imageModel,
      prompt: request.prompt,
      image_size: sizeMap[request.size || '1:1'] || '1024x1024',
      image_quality: request.quality === 'hd' || request.quality === '2K' ? 'high' : 'standard',
      style: request.style || 'vivid',
      n: request.n || 1,
    }

    logger.info('ToAPIs createImage request', imageRequest)

    const baseUrl = this.baseUrl || 'https://toapis.com/v1'
    const endpoint = '/images/generations'
    const url = `${baseUrl}${endpoint}`

    logger.info('ToAPIs createImage URL', { url, baseUrl, endpoint, method: 'POST' })

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageRequest),
      })

      logger.info('ToAPIs createImage response status', { status: response.status, ok: response.ok })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('ToAPIs createImage error response', { status: response.status, error: errorText })
        throw new Error(`ToAPIs API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      logger.info('ToAPIs createImage response data', { hasData: !!data.data, dataLength: data.data?.length })

      if (!data.data || data.data.length === 0) {
        throw new Error('No image data returned from ToAPIs API')
      }

      return {
        url: data.data[0].url || data.data[0].b64_json || '',
        revisedPrompt: data.data[0].revised_prompt,
      }
    } catch (error) {
      logger.error('ToAPIs createImage failed', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  async createVideo(request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    if (request.model === 'veo3' || request.model === 'veo3-pro') {
      return this.createVEO3Video({
        model: request.model,
        prompt: request.prompt || '',
        duration: request.duration,
        aspect_ratio: request.aspectRatio === '9:16' || request.aspectRatio === '1:1' ? request.aspectRatio : '16:9',
        image_urls: request.imageUrl ? [request.imageUrl] : undefined,
        end_image_url: request.endImageUrl,
      })
    }

    const imageUrls = [request.imageUrl, request.endImageUrl].filter(
      (u): u is string => typeof u === 'string' && u.length > 0
    )
    const sora2Request: Sora2VideoRequest = {
      model: request.model === 'sora-2-pro' || request.model === 'sora-2-vip' ? request.model : 'sora-2',
      prompt: request.prompt || '',
      duration: request.duration ?? 10,
      aspect_ratio: request.aspectRatio === '9:16' ? '9:16' : '16:9',
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      thumbnail: true,
    }

    logger.info('ToAPIs Sora2 createVideo request', {
      model: sora2Request.model,
      prompt: sora2Request.prompt?.substring(0, 50),
      duration: sora2Request.duration,
      aspect_ratio: sora2Request.aspect_ratio,
      hasImage: !!sora2Request.image_urls?.length,
    })

    const response = await this.request('/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(sora2Request),
    })

    logger.info('ToAPIs Sora2 createVideo response', { response })

    if (!response.id) {
      throw new Error('Failed to create Sora2 video generation task')
    }

    const taskManager = new Sora2TaskManager(this.apiKey, this.baseUrl || 'https://toapis.com/v1')
    
    try {
      const result = await taskManager.waitForTaskCompletion(response.id, {
        pollInterval: 3000,
        maxPollAttempts: 200,
        onProgress: (task) => {
          logger.debug('Sora2 task progress', {
            taskId: response.id,
            status: task.status,
            progress: task.progress,
          })
        },
      })

      logger.info('Sora2 task completed', {
        taskId: response.id,
        status: result.status,
        progress: result.progress,
        hasUrl: !!result.url,
      })

      if (result.status === 'failed') {
        throw new Error(`Video generation failed: ${result.progress}% completed`)
      }

      return {
        url: result.url || '',
        duration: result.metadata?.duration,
        resolution: result.metadata?.resolution,
      }
    } catch (error) {
      logger.error('Sora2 task wait failed', { taskId: response.id, error })
      throw error
    }
  }

  async createSora2Video(request: Sora2VideoRequest): Promise<Sora2VideoResponse> {
    const response = await this.request('/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    })

    return {
      id: response.id,
      object: response.object || 'generation.task',
      model: response.model,
      status: response.status || 'queued',
      progress: response.progress || 0,
      created_at: response.created_at || Date.now(),
      metadata: response.metadata,
    }
  }

  async querySora2Task(taskId: string): Promise<Sora2VideoResponse> {
    const response = await this.request(`/videos/generations/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    return {
      id: response.id,
      object: response.object || 'generation.task',
      model: response.model,
      status: response.status,
      progress: response.progress || 0,
      created_at: response.created_at,
      metadata: response.metadata,
    }
  }

  async createVEO3Video(request: VEO3VideoRequest): Promise<AICreateVideoResponse> {
    const imageUrls = [request.image_urls?.[0], request.end_image_url].filter(
      (u): u is string => typeof u === 'string' && u.length > 0
    )

    const veo3Request = {
      model: request.model || 'veo3',
      prompt: request.prompt,
      duration: request.duration ?? 10,
      aspect_ratio: request.aspect_ratio || '16:9',
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      prompt_strength: request.prompt_strength ?? 0.8,
    }

    logger.info('ToAPIs VEO3 createVideo request', veo3Request)

    const response = await this.request('/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(veo3Request),
    })

    if (!response.id) {
      throw new Error('Failed to create VEO3 video generation task')
    }

    const taskManager = new Sora2TaskManager(this.apiKey, this.baseUrl || 'https://toapis.com/v1')

    const result = await taskManager.waitForTaskCompletion(response.id, {
      pollInterval: 3000,
      maxPollAttempts: 200,
    })

    return {
      url: result.url || '',
      duration: result.metadata?.duration,
      resolution: result.metadata?.resolution,
    }
  }
}

interface Sora2TaskResult {
  id: string
  object: string
  model: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  progress: number
  created_at: number
  url?: string
  metadata?: {
    duration?: number
    resolution?: string
    video_url?: string
    thumbnail_url?: string
    [key: string]: any
  }
}

interface TaskOptions {
  pollInterval?: number
  maxPollAttempts?: number
  onProgress?: (task: Sora2TaskResult) => void
}

class Sora2TaskManager {
  private apiKey: string
  private baseUrl: string
  private defaultPollInterval = 3000
  private defaultMaxPollAttempts = 200

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async waitForTaskCompletion(
    taskId: string,
    options: TaskOptions = {}
  ): Promise<Sora2TaskResult> {
    const {
      pollInterval = this.defaultPollInterval,
      maxPollAttempts = this.defaultMaxPollAttempts,
      onProgress,
    } = options

    let attempts = 0

    logger.info('Waiting for Sora2 task completion', {
      taskId,
      pollInterval,
      maxAttempts: maxPollAttempts,
    })

    while (attempts < maxPollAttempts) {
      const task = await this.queryTask(taskId)

      logger.debug('Sora2 task status', {
        taskId,
        status: task.status,
        progress: task.progress,
        attempt: attempts,
      })

      onProgress?.(task)

      if (task.status === 'completed') {
        logger.info('Sora2 task completed successfully', {
          taskId,
          attempts,
          duration: attempts * pollInterval,
        })
        return task
      }

      if (task.status === 'failed') {
        logger.error('Sora2 task failed', {
          taskId,
          attempts,
          progress: task.progress,
        })
        return task
      }

      await this.sleep(pollInterval)
      attempts++
    }

    const error = `Task ${taskId} timeout after ${attempts} attempts (${attempts * pollInterval}ms)`
    logger.error('Sora2 task timeout', { taskId, attempts, maxAttempts: maxPollAttempts })
    throw new Error(error)
  }

  private async queryTask(taskId: string): Promise<Sora2TaskResult> {
    const url = `${this.baseUrl}/videos/generations/${taskId}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('Sora2 query task failed', {
          taskId,
          status: response.status,
          error: errorText,
        })
        throw new Error(`Query task failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      logger.info('Sora2 queryTask response', {
        taskId,
        status: data.status,
        progress: data.progress,
        hasUrl: !!data.metadata?.video_url,
        hasThumbnail: !!data.metadata?.thumbnail_url,
      })

      let videoUrl = ''
      
      if (data.metadata?.video_url) {
        videoUrl = data.metadata.video_url
      } else if (data.metadata?.output_url) {
        videoUrl = data.metadata.output_url
      } else if (data.url) {
        videoUrl = data.url
      }

      const task: Sora2TaskResult = {
        id: data.id,
        object: data.object || 'generation.task',
        model: data.model,
        status: data.status,
        progress: data.progress || 0,
        created_at: data.created_at || Date.now(),
        url: videoUrl,
        metadata: {
          duration: data.metadata?.duration,
          resolution: data.metadata?.resolution || (data.metadata?.hd ? 'HD' : 'SD'),
          video_url: data.metadata?.video_url,
          thumbnail_url: data.metadata?.thumbnail_url,
        },
      }

      return task
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Sora2 query task error', { taskId, error: error.message })
        throw error
      }
      logger.error('Sora2 query task unknown error', { taskId, error: String(error) })
      throw new Error(`Query task failed: ${String(error)}`)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
