import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'

export abstract class AIProvider {
  protected apiKey: string
  protected baseUrl?: string

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  abstract chat(messages: AIChatMessage[], options?: Partial<AIRequest>): Promise<AIResponse>
  abstract createImage(request: AICreateImageRequest): Promise<AICreateImageResponse>
  abstract createVideo?(request: AICreateVideoRequest): Promise<AICreateVideoResponse>

  protected async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI request failed: ${error}`)
    }

    return response.json()
  }
}
