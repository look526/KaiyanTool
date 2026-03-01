import { AIProvider } from './provider.interface'
import { OpenAIProvider } from './openai.provider'
import { GoogleProvider } from './google.provider'
import { ZhipuProvider } from './zhipu.provider'
import { AntSKProvider } from './antsk.provider'
import { SeedreamProvider } from './seedream.provider'

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
    console.log('[DEBUG providerManager.addProvider] Adding provider:', config.id, config.type, config.baseUrl);
    let provider: AIProvider

    switch (config.type) {
      case 'openai':
        provider = new OpenAIProvider(config.apiKey, config.baseUrl)
        break
      case 'google':
        provider = new GoogleProvider(config.apiKey)
        break
      case 'zhipu':
        provider = new ZhipuProvider(config.apiKey, config.baseUrl)
        break
      case 'antsk':
        provider = new AntSKProvider(config.apiKey, config.baseUrl)
        break
      case 'seedream':
        provider = new SeedreamProvider(config.apiKey, config.baseUrl)
        break
      default:
        provider = new OpenAIProvider(config.apiKey, config.baseUrl)
    }

    this.providers.set(config.id, provider)
    console.log('[DEBUG providerManager.addProvider] Registered, current providers:', Array.from(this.providers.keys()));
  }

  getProvider(id: string): AIProvider | undefined {
    const provider = this.providers.get(id);
    console.log('[DEBUG providerManager.getProvider] id:', id, 'found:', provider ? 'yes' : 'no', 'baseUrl:', provider ? (provider as any).baseUrl : 'N/A');
    return provider;
  }

  getProviderId(provider: AIProvider): string {
    return (provider as any).id || '';
  }

  getProviderModels(providerId: string): any[] {
    const provider = this.providers.get(providerId);
    return provider ? (provider as any).models || [] : [];
  }

  getAllModels(): any[] {
    const allModels: any[] = [];
    for (const provider of this.providers.values()) {
      const models = (provider as any).models || [];
      allModels.push(...models);
    }
    return allModels;
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
