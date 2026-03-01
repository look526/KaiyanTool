import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'
import { config } from '../../config'
import logger from '../../lib/logger'

export class ZhipuProvider extends AIProvider {
  public baseUrl: string

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || config.ai.zhipu.baseUrl)
    this.baseUrl = baseUrl || config.ai.zhipu.baseUrl
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const requestBody = {
      model: options.model || 'glm-4.7',
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1,
      max_tokens: options.maxTokens ?? 8192,
      stream: false,
    }

    logger.debug('Zhipu chat request', { 
      model: requestBody.model, 
      maxTokens: requestBody.max_tokens, 
      messageCount: messages.length 
    });

    const response = await this.request('/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response choices returned from Zhipu AI API')
    }

    const message = response.choices[0]
    const messageContent = message?.message?.content || message?.message?.reasoning_content
    
    if (!messageContent) {
      logger.warn('Zhipu AI returned empty content', { response })
      throw new Error('AI返回内容为空，请检查API响应格式')
    }
    
    if (message?.message?.reasoning_content && !message?.message?.content) {
      logger.warn('Zhipu AI returned reasoning_content instead of final content', {
        model: requestBody.model
      });
      throw new Error('AI返回的是推理过程而不是最终结果，请调整Prompt要求只返回JSON');
    }

    const finishReason = response.choices[0].finish_reason

    logger.debug('Zhipu chat response', { 
      contentLength: messageContent.length,
      finishReason,
      model: response.model
    });

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

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from Zhipu AI API')
    }

    return {
      url: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
    }
  }

  async createVideo(_request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    throw new Error('Video generation not yet implemented for Zhipu provider')
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
        let errorMessage = `ZhipuAI request failed with status ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        logger.error('Zhipu AI API request failed', {
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
      
      logger.error('Zhipu AI API request error', {
        endpoint,
        error: String(error),
      })
      throw new Error(`Zhipu AI request failed: ${String(error)}`)
    }
  }
}
