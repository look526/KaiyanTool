import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'

export class OpenAIProvider extends AIProvider {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || 'https://api.openai.com/v1')
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const requestBody = {
      model: options.model || 'gpt-4',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
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

  async createVideo(request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    const requestBody = {
      model: 'sora',
      image: request.imageUrl,
      prompt: request.prompt || '',
      duration: request.duration ?? 5,
      motion: request.motion ?? 5,
      aspect_ratio: request.aspectRatio || '16:9',
    }

    const response = await this.request('/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    return {
      url: response.url,
      duration: response.duration,
      resolution: response.resolution,
    }
  }
}
