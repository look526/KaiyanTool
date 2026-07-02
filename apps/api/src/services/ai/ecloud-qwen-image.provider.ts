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

const ECLOUD_QWEN_IMAGE_MODEL = 'qwen/qwen-image-2.0-pro'
const ECLOUD_QWEN_IMAGE_BASE_URL = 'https://moma.cmecloud.cn/v1/aigc/multimodal-generation'

export class ECloudQwenImageProvider extends AIProvider {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, (baseUrl || ECLOUD_QWEN_IMAGE_BASE_URL).replace(/\/generation\/?$/, '').replace(/\/$/, ''))
  }

  async chat(_messages: AIChatMessage[], _options: Partial<AIRequest> = {}): Promise<AIResponse> {
    throw new Error('移动云千问 Image2 是图片生成与编辑模型，不支持文本对话测试')
  }

  async createImage(request: AICreateImageRequest): Promise<AICreateImageResponse> {
    const requestBody = this.buildRequestBody(request)

    logger.info('ECloud Qwen Image createImage request', {
      model: requestBody.model,
      size: requestBody.parameters.size,
      n: requestBody.parameters.n,
      promptExtend: requestBody.parameters.prompt_extend,
      hasReferenceImages: (request.image_urls || []).length > 0,
    })

    const response = await this.request('/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    const imageUrls = this.extractImageUrls(response)
    if (imageUrls.length === 0) {
      logger.error('ECloud Qwen Image response without image URL', { response })
      throw new Error('移动云千问 Image2 响应中没有图片地址')
    }

    return {
      url: imageUrls[0],
      revisedPrompt: request.prompt,
      thumbnailUrl: imageUrls[0],
    }
  }

  async createVideo(_request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    throw new Error('移动云千问 Image2 是图片模型，不支持视频生成')
  }

  private buildRequestBody(request: AICreateImageRequest): any {
    const content: any[] = [{ text: request.prompt }]

    ;(request.image_urls || [])
      .filter(url => typeof url === 'string' && url.trim().length > 0)
      .slice(0, 6)
      .forEach(url => {
        content.push({ image: url })
      })

    const metadata = request.metadata || {}

    return {
      model: request.model || ECLOUD_QWEN_IMAGE_MODEL,
      input: {
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      },
      parameters: {
        n: Math.min(Math.max(Number(request.n || 1), 1), 6),
        negative_prompt: metadata.negative_prompt || metadata.negativePrompt || undefined,
        prompt_extend: metadata.prompt_extend ?? metadata.promptExtend ?? true,
        watermark: metadata.watermark ?? false,
        seed: metadata.seed,
        size: this.normalizeSize(request.size),
      },
    }
  }

  private normalizeSize(size?: string): string {
    switch (size) {
      case '16:9':
        return '2688*1536'
      case '9:16':
        return '1536*2688'
      case '4:3':
        return '2368*1728'
      case '3:4':
        return '1728*2368'
      case '1:1':
      case undefined:
      case '':
        return '2048*2048'
      default:
        if (/^\d{3,4}[*x]\d{3,4}$/i.test(size)) {
          return size.replace('x', '*')
        }
        return '2048*2048'
    }
  }

  private extractImageUrls(response: any): string[] {
    const content = response?.output?.choices?.[0]?.message?.content
    if (!Array.isArray(content)) return []

    return content
      .map(item => item?.image || item?.image_url?.url || item?.image_url)
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
  }
}
