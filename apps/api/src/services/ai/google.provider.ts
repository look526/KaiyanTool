import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'

export class GoogleProvider extends AIProvider {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || 'https://generativelanguage.googleapis.com/v1beta')
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const requestBody = {
      contents: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2000,
        topP: options.topP ?? 1,
      },
    }

    const model = options.model || 'gemini-1.5-pro'
    const response = await this.request(`/models/${model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    return {
      content: response.candidates[0].content.parts[0].text,
      model,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      },
    }
  }

  async createImage(request: AICreateImageRequest): Promise<AICreateImageResponse> {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=' + this.apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: request.prompt,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
        imageGenerationConfig: {
          number_of_images: request.n ?? 1,
          size: request.size ?? '1024x1024',
          aspectRatio: request.size === '1024x1024' ? '1:1' : 
                     request.size === '1024x1792' ? '9:16' : '16:9',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google API error: ${error}`)
    }

    const data = await response.json()
    return {
      url: data.images[0].image.encodedImage,
      revisedPrompt: request.prompt,
    }
  }

  async createVideo(request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    const response = await fetch(`${this.baseUrl}/videos/generate?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: request.imageUrl,
        prompt: request.prompt || '',
        duration: request.duration ?? 5,
        motion: request.motion ?? 5,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google API error: ${error}`)
    }

    const data = await response.json()
    return {
      url: data.videoUrl,
      duration: data.duration,
      resolution: data.resolution,
    }
  }
}
