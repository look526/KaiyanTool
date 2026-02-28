import { AIProvider } from './provider.interface'
import { OpenAIProvider } from './openai.provider'
import { GoogleProvider } from './google.provider'
import { AntSKProvider } from './antsk.provider'
import { AIProviderConfig, AIChatMessage, AICreateImageRequest, AICreateImageResponse, AICreateVideoRequest, AICreateVideoResponse, AIResponse } from '../../types/ai.types'

class AIProviderService {
  private providers: Map<string, AIProvider> = new Map()
  private configs: Map<string, AIProviderConfig> = new Map()

  addProvider(id: string, config: AIProviderConfig): void {
    let provider: AIProvider

    switch (config.type) {
      case 'openai':
        provider = new OpenAIProvider(config.apiKey, config.baseUrl)
        break
      case 'google':
        provider = new GoogleProvider(config.apiKey, config.baseUrl)
        break
      case 'antsk':
        provider = new AntSKProvider(config.apiKey, config.baseUrl)
        break

      default:
        throw new Error(`Unknown provider type: ${config.type}`)
    }

    this.providers.set(id, provider)
    this.configs.set(id, config)
  }

  removeProvider(id: string): void {
    this.providers.delete(id)
    this.configs.delete(id)
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id)
  }

  hasProvider(id: string): boolean {
    return this.providers.has(id)
  }

  async chat(
    providerId: string,
    messages: AIChatMessage[],
    model?: string,
    _tools?: any
  ): Promise<AIResponse> {
    const provider = this.getProvider(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    return provider.chat(messages, { model })
  }

  async streamChat(
    providerId: string,
    messages: AIChatMessage[],
    model?: string,
    _onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    const provider = this.getProvider(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    return provider.chat(messages, { model });
  }

  async createImage(
    providerId: string,
    request: AICreateImageRequest
  ): Promise<AICreateImageResponse> {
    const provider = this.getProvider(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    return provider.createImage(request)
  }

  async createVideo(
    providerId: string,
    request: AICreateVideoRequest
  ): Promise<AICreateVideoResponse> {
    const provider = this.getProvider(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    if (!provider.createVideo) {
      throw new Error(`Provider does not support video generation`)
    }

    return provider.createVideo(request)
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  getProviderConfig(id: string): AIProviderConfig | undefined {
    return this.configs.get(id)
  }
}

export const aiProviderService = new AIProviderService()
