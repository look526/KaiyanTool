import { AIProvider } from './provider.interface'
import { AIRequest, AIResponse, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse } from '../../types/ai.types'
import { config } from '../../config'
import logger from '../../lib/logger'

export class DeepSeekProvider extends AIProvider {
  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl || config.ai.deepseek?.baseUrl || 'https://api.deepseek.com/v1')
  }

  async chat(messages: AIChatMessage[], options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const requestBody = {
      model: options.model || 'deepseek-chat',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4000,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      stream: false,
    }

    logger.info('DeepSeek chat request', {
      model: requestBody.model,
      messagesCount: messages.length,
      temperature: requestBody.temperature,
      maxTokens: requestBody.max_tokens,
    })

    const response = await this.request('/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.choices || response.choices.length === 0) {
      logger.error('DeepSeek API returned no choices', { response })
      throw new Error('DeepSeek API 返回为空')
    }

    const messageContent = response.choices[0].message?.content
    if (!messageContent) {
      logger.error('DeepSeek API returned empty content', { response })
      throw new Error('AI返回内容为空')
    }

    const finishReason = response.choices[0].finish_reason

    logger.info('DeepSeek chat response', {
      contentLength: messageContent.length,
      finishReason,
      model: response.model,
    })

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
    throw new Error('DeepSeek 目前不支持图像生成功能')
  }

  async createVideo(request: AICreateVideoRequest): Promise<AICreateVideoResponse> {
    throw new Error('DeepSeek 目前不支持视频生成功能')
  }
}
