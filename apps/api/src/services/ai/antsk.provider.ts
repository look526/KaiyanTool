import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse } from '../../types/ai.types'

export class AntSKProvider extends AIProvider {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || 'https://api.antsk.com/v1')
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const requestBody = {
      model: options.model || 'gpt-4',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      top_p: options.topP ?? 1,
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
      model: 'dall-e-3',
      prompt: request.prompt,
      n: request.n ?? 1,
      size: request.size ?? '1024x1024',
      quality: request.quality ?? 'standard',
      style: request.style ?? 'vivid',
    }

    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AntSK API error: ${error}`)
    }

    const data = await response.json()
    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
    }
  }
}
