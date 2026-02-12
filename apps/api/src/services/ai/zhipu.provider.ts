import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse } from '../../types/ai.types'

export class ZhipuProvider extends AIProvider {
  private baseUrl: string

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || 'https://open.bigmodel.cn/api/paas/v4')
    this.baseUrl = baseUrl || 'https://open.bigmodel.cn/api/paas/v4'
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const requestBody = {
      model: options.model || 'glm-4',
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1,
      max_tokens: options.maxTokens ?? 2000,
    }

    const response = await this.request('/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    return {
      content: response.choices[0].message.content,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    }
  }

  async createImage(request: AICreateImageRequest): Promise<AICreateImageResponse> {
    const requestBody = {
      model: 'cogview-3',
      prompt: request.prompt,
      n: request.n ?? 1,
      size: request.size ?? '1024x1024',
      quality: request.quality ?? 'standard',
    }

    const response = await this.request('/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    return {
      url: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
    }
  }

  protected async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ZhipuAI request failed: ${error}`)
    }

    return response.json()
  }
}
