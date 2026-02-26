import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'
import { config } from '../../config'
import logger from '../../lib/logger'

export class GoogleProvider extends AIProvider {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || config.ai.google.baseUrl)
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

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response candidates returned from Google AI API')
    }

    return {
      content: response.candidates[0].content.parts[0].text,
      model,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
      },
    }
  }

  async createImage(request: AICreateImageRequest): Promise<AICreateImageResponse> {
    try {
      const response = await fetch(`${config.ai.google.baseUrl}/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`, {
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
        const errorText = await response.text()
        let errorMessage = `Google Imagen API error with status ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        logger.error('Google Imagen API request failed', {
          status: response.status,
          error: errorMessage,
        })
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (!data.images || data.images.length === 0) {
        throw new Error('No image data returned from Google Imagen API')
      }

      return {
        url: data.images[0].image.encodedImage,
        revisedPrompt: request.prompt,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      
      logger.error('Google Imagen API request error', {
        error: String(error),
      })
      throw new Error(`Google Imagen request failed: ${String(error)}`)
    }
  }

  async createVideo(request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    try {
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
        const errorText = await response.text()
        let errorMessage = `Google Video API error with status ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        logger.error('Google Video API request failed', {
          status: response.status,
          error: errorMessage,
        })
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (!data.url) {
        throw new Error('No video URL returned from Google Video API')
      }

      return {
        url: data.url,
        duration: data.duration,
        resolution: data.resolution,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      
      logger.error('Google Video API request error', {
        error: String(error),
      })
      throw new Error(`Google Video request failed: ${String(error)}`)
    }
  }

  protected async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Google AI request failed with status ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        logger.error('Google AI API request failed', {
          endpoint,
          status: response.status,
          error: errorMessage,
        })
        
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      
      logger.error('Google AI API request error', {
        endpoint,
        error: String(error),
      })
      throw new Error(`Google AI request failed: ${String(error)}`)
    }
  }
}
