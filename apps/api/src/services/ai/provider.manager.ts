import { AIProvider } from './provider.interface'
import { OpenAIProvider } from './openai.provider'
import { GoogleProvider } from './google.provider'
import { ZhipuProvider } from './zhipu.provider'
import { AntSKProvider } from './antsk.provider'

export interface ModelProvider {
  id: string
  name: string
  type: string
  apiKey: string
  baseUrl?: string
}

export class ProviderManager {
  private providers: Map<string, AIProvider> = new Map()

  addProvider(config: ModelProvider): void {
    let provider: AIProvider

    switch (config.type) {
      case 'openai':
        provider = new OpenAIProvider(config.apiKey, config.baseUrl)
        break
      case 'google':
        provider = new GoogleProvider(config.apiKey)
        break
      case 'zhipu':
        provider = new ZhipuProvider(config.apiKey)
        break
      case 'antsk':
        provider = new AntSKProvider(config.apiKey, config.baseUrl)
        break
      default:
        provider = new OpenAIProvider(config.apiKey, config.baseUrl)
    }

    this.providers.set(config.id, provider)
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id)
  }

  removeProvider(id: string): void {
    this.providers.delete(id)
  }

  listProviders(): AIProvider[] {
    return Array.from(this.providers.values())
  }
}

export const providerManager = new ProviderManager()

providerManager.addProvider({
  id: 'openai',
  name: 'OpenAI',
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY || '',
})

providerManager.addProvider({
  id: 'google',
  name: 'Google',
  type: 'google',
  apiKey: process.env.GOOGLE_API_KEY || '',
})

providerManager.addProvider({
  id: 'zhipu',
  name: '智普AI',
  type: 'zhipu',
  apiKey: process.env.ZHIPU_API_KEY || '',
})
