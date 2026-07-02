import { AIProvider } from './provider.interface'
import {
  AIChatMessage,
  AICreateImageRequest,
  AICreateImageResponse,
  AICreateVideoRequest,
  AICreateVideoResponse,
  AIRequest,
  AIResponse,
} from '../../types/ai.types'
import logger from '../../lib/logger'

type TaskStatus = 'queued' | 'running' | 'processing' | 'in_progress' | 'succeeded' | 'completed' | 'failed' | 'expired' | 'canceled' | 'cancelled'

interface EndpointPair {
  create: string
  query: (taskId: string) => string
}

const ECLOUD_SEEDANCE_MODEL = 'doubao-seedance-2.0'
const ECLOUD_SEEDANCE_BASE_URL = 'https://zhenze-huhehaote.cmecloud.cn/api/v3'

export class ECloudSeedanceProvider extends AIProvider {
  private readonly endpoints: EndpointPair[] = [
    { create: '/contents/generations/tasks', query: (taskId) => `/contents/generations/tasks/${taskId}` },
  ]

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || ECLOUD_SEEDANCE_BASE_URL)
  }

  async chat(_messages: AIChatMessage[], _options: Partial<AIRequest> = {}): Promise<AIResponse> {
    throw new Error('移动云 Seedance 是视频生成模型，不支持文本对话测试')
  }

  async createImage(_request: AICreateImageRequest): Promise<AICreateImageResponse> {
    throw new Error('移动云 Seedance 是视频生成模型，不支持图像生成')
  }

  async createVideo(request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    const requestBody = this.buildVideoRequest(request)
    logger.info('ECloud Seedance createVideo request', {
      model: requestBody.model,
      duration: requestBody.duration,
      ratio: requestBody.ratio,
      generate_audio: requestBody.generate_audio,
      contentCount: requestBody.content.length,
    })

    const { taskId, endpoint } = await this.createTask(requestBody)
    const task = await this.waitForTaskCompletion(taskId, endpoint)
    const videoUrl = this.extractVideoUrl(task)

    if (!videoUrl) {
      logger.error('ECloud Seedance task completed without video URL', { taskId, task })
      throw new Error('移动云 Seedance 任务已完成，但响应中没有视频地址')
    }

    return {
      url: videoUrl,
      duration: requestBody.duration > 0 ? requestBody.duration : request.duration,
      resolution: this.extractResolution(task),
    }
  }

  private buildVideoRequest(request: AICreateVideoRequest): any {
    const content: any[] = [
      {
        type: 'text',
        text: this.buildPrompt(request),
      },
    ]

    const imageUrls = [request.imageUrl, request.endImageUrl].filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0
    )

    imageUrls.slice(0, 9).forEach((url, index) => {
      const role = index === 0 ? 'first_frame' : index === 1 ? 'last_frame' : 'reference_image'

      content.push({
        type: 'image_url',
        image_url: { url },
        role,
      })
    })

    return {
      model: request.model || ECLOUD_SEEDANCE_MODEL,
      content,
      generate_audio: Boolean(request.sync_audio_video),
      ratio: this.normalizeRatio(request.aspectRatio),
      duration: this.normalizeDuration(request.duration),
      watermark: false,
    }
  }

  private buildPrompt(request: AICreateVideoRequest): string {
    const prompt = (request.prompt || '').trim()
    const subtitle = (request.subtitle_text || '').trim()

    if (subtitle && !prompt.includes(subtitle)) {
      return `${prompt || '生成电影感视频'}\n台词/口播：${subtitle}\n要求：画面与对白同步，音画一体，口型与情绪自然。`
    }

    return prompt || '生成电影感视频'
  }

  private normalizeRatio(ratio?: string): '16:9' | '9:16' | '1:1' {
    if (ratio === '9:16' || ratio === '1:1') return ratio
    return '16:9'
  }

  private normalizeDuration(duration?: number): number {
    if (duration === -1) return -1
    const value = Math.round(Number(duration || 5))
    return Math.min(15, Math.max(4, value))
  }

  private async createTask(requestBody: any): Promise<{ taskId: string; endpoint: EndpointPair }> {
    const errors: string[] = []

    for (const endpoint of this.endpoints) {
      try {
        const response = await this.rawRequest(endpoint.create, {
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
        const taskId = this.extractTaskId(response)

        if (!taskId) {
          throw new Error(`移动云 Seedance 创建任务成功但未返回任务 ID: ${JSON.stringify(response)}`)
        }

        logger.info('ECloud Seedance task created', { taskId, endpoint: endpoint.create })
        return { taskId, endpoint }
      } catch (error: any) {
        errors.push(`${endpoint.create}: ${error?.message || String(error)}`)
        if (!this.canTryNextEndpoint(error)) {
          throw error
        }
      }
    }

    throw new Error(`移动云 Seedance 创建任务失败，已尝试 ${this.endpoints.length} 个候选路径。${errors.join(' | ')}`)
  }

  private async waitForTaskCompletion(taskId: string, endpoint: EndpointPair): Promise<any> {
    const maxAttempts = 120
    const pollInterval = 5000

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const task = await this.queryTask(taskId, endpoint)
      const status = this.normalizeStatus(task)

      logger.debug('ECloud Seedance task status', { taskId, status, attempt })

      if (status === 'succeeded' || status === 'completed') {
        return task
      }

      if (status === 'failed' || status === 'expired' || status === 'canceled' || status === 'cancelled') {
        throw new Error(`移动云 Seedance 视频生成失败: ${this.extractErrorMessage(task)}`)
      }

      await this.sleep(pollInterval)
    }

    throw new Error(`移动云 Seedance 视频生成超时: ${taskId}`)
  }

  private async queryTask(taskId: string, preferredEndpoint: EndpointPair): Promise<any> {
    const queryEndpoints = [
      preferredEndpoint,
      ...this.endpoints.filter((endpoint) => endpoint.create !== preferredEndpoint.create),
    ]
    const errors: string[] = []

    for (const endpoint of queryEndpoints) {
      try {
        return await this.rawRequest(endpoint.query(taskId), { method: 'GET' })
      } catch (error: any) {
        errors.push(`${endpoint.query(taskId)}: ${error?.message || String(error)}`)
        if (!this.canTryNextEndpoint(error)) {
          throw error
        }
      }
    }

    throw new Error(`移动云 Seedance 查询任务失败。${errors.join(' | ')}`)
  }

  private async rawRequest(endpoint: string, options: RequestInit): Promise<any> {
    const baseUrl = (this.baseUrl || ECLOUD_SEEDANCE_BASE_URL).replace(/\/$/, '')
    const url = `${baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 401) {
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      return this.parseResponse(retryResponse)
    }

    return this.parseResponse(response)
  }

  private async parseResponse(response: Response): Promise<any> {
    const text = await response.text()
    let data: any = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (!response.ok) {
      const message = this.extractErrorMessage(data) || `HTTP ${response.status}`
      const error = new Error(`移动云 Seedance API 请求失败 (${response.status}): ${message}`)
      ;(error as any).status = response.status
      ;(error as any).body = data
      throw error
    }

    return data
  }

  private canTryNextEndpoint(error: any): boolean {
    const status = Number(error?.status || 0)
    const message = String(error?.message || '').toLowerCase()
    return status === 404 || status === 405 || message.includes('not found') || message.includes('不存在')
  }

  private extractTaskId(response: any): string | null {
    return (
      response?.task_id ||
      response?.taskId ||
      response?.id ||
      response?.data?.task_id ||
      response?.data?.taskId ||
      response?.data?.id ||
      response?.result?.task_id ||
      response?.result?.id ||
      null
    )
  }

  private normalizeStatus(task: any): TaskStatus {
    const status = (
      task?.status ||
      task?.data?.status ||
      task?.result?.status ||
      task?.task_status ||
      task?.taskStatus ||
      'running'
    ).toString().toLowerCase()

    if (status === 'success') return 'succeeded'
    if (status === 'complete') return 'completed'
    return status as TaskStatus
  }

  private extractVideoUrl(task: any): string {
    return (
      task?.content?.video_url ||
      task?.content?.videoUrl ||
      task?.data?.content?.video_url ||
      task?.data?.content?.videoUrl ||
      task?.result?.content?.video_url ||
      task?.result?.content?.videoUrl ||
      task?.video_url ||
      task?.videoUrl ||
      task?.data?.video_url ||
      task?.result?.video_url ||
      task?.url ||
      ''
    )
  }

  private extractResolution(task: any): string | undefined {
    return task?.resolution || task?.content?.resolution || task?.data?.resolution || task?.metadata?.resolution
  }

  private extractErrorMessage(value: any): string {
    if (!value) return '未知错误'
    if (typeof value === 'string') return value
    return (
      value?.error?.message ||
      value?.message ||
      value?.msg ||
      value?.error_msg ||
      value?.errorMessage ||
      JSON.stringify(value)
    )
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
