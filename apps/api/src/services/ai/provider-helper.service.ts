import { prisma } from '../../lib/prisma';
import { providerManager } from './provider.manager';
import { AIProvider as AIProviderInterface } from './provider.interface';
import logger from '../../lib/logger';

export interface ProviderSelectionResult {
  providerId: string;
  providerType: string;
  modelName?: string;
  aiProvider: AIProviderInterface;
}

export interface GetProviderOptions {
  modelId?: string;
  userId?: string;
  includeGlobal?: boolean;
}

type ProviderContentType = 'text' | 'image' | 'video' | 'audio' | 'script' | 'novel' | 'storyline' | 'outline';

export class AIProviderHelper {
  private static readonly DEFAULT_USER_ID = 'system';
  private static readonly ADMIN_ROLES = ['admin', 'super_admin'];
  private static readonly TEXT_LIKE_CONTENT_TYPES: ProviderContentType[] = ['script', 'novel', 'storyline', 'outline'];
  private static readonly CHAT_PROVIDER_TYPES = ['openai', 'google', 'zhipu', 'antsk', 'deepseek', 'toapis'];

  private static enabledAdminProviderWhere(extra: Record<string, unknown> = {}): any {
    return {
      enabled: true,
      ...extra,
      User: {
        role: { in: this.ADMIN_ROLES },
      },
    };
  }

  static async getProvider(
    userId?: string,
    modelId?: string,
    contentType?: ProviderContentType
  ): Promise<ProviderSelectionResult> {
    const effectiveUserId = userId || this.DEFAULT_USER_ID;

    const providers = await prisma.aIProvider.findMany({
      where: this.enabledAdminProviderWhere(),
      include: { AIProviderModel: true },
    });

    if (providers.length === 0) {
      logger.warn('No AI provider available', { userId: effectiveUserId, modelId });
      throw new Error('No AI provider available');
    }

    let selectedProvider = providers[0];
    let modelName: string | undefined;

    if (modelId) {
      const found = this.findModelInProviders(providers, modelId, contentType);
      if (found) {
        selectedProvider = found.provider;
        modelName = found.modelName;
        logger.debug('Model found in providers', { 
          providerId: selectedProvider.id, 
          modelName,
          modelId 
        });
      } else {
        logger.warn('Requested model not found, using default provider', { 
          modelId, 
          defaultProviderId: selectedProvider.id 
        });
      }
    }

    if (!modelName && contentType) {
      const found = this.findDefaultModelForContentType(providers, contentType);
      if (found) {
        selectedProvider = found.provider;
        modelName = found.modelName;
      } else {
        const fallbackProvider = this.findChatProviderWithoutModels(providers, contentType);
        if (fallbackProvider) {
          selectedProvider = fallbackProvider;
        } else {
          logger.warn('No AI provider available for content type', {
            userId: effectiveUserId,
            modelId,
            contentType,
          });
          throw new Error(`No AI provider available for content type: ${contentType}`);
        }
      }
    }

    const aiProvider = this.ensureProviderRegistered(selectedProvider);
    
    logger.info('AI Provider selected', {
      providerId: selectedProvider.id,
      providerType: selectedProvider.type,
      modelName,
      userId: effectiveUserId,
      contentType,
    });

    return {
      providerId: selectedProvider.id,
      providerType: selectedProvider.type,
      modelName,
      aiProvider,
    };
  }

  static async getProviderForUser(
    userId: string, 
    modelId?: string,
    contentType?: ProviderContentType
  ): Promise<ProviderSelectionResult> {
    console.log('[DEBUG getProviderForUser] userId:', userId, 'modelId:', modelId);
    
    const providers = await prisma.aIProvider.findMany({
      where: this.enabledAdminProviderWhere(),
      include: { AIProviderModel: true },
    });

    console.log('[DEBUG getProviderForUser] providers count:', providers.length);
    providers.forEach((p: any) => {
      console.log('[DEBUG getProviderForUser] provider:', p.id, p.type, 'models:', p.AIProviderModel?.map((m: any) => m.name));
    });

    if (providers.length === 0) {
      logger.warn('No AI provider available for user', { userId, modelId });
      throw new Error('No AI provider available');
    }

    let selectedProvider = providers[0];
    let modelName: string | undefined;

    if (modelId) {
      console.log('[DEBUG getProviderForUser] Looking for model:', modelId);
      const found = this.findModelInProviders(providers, modelId, contentType);
      if (found) {
        selectedProvider = found.provider;
        modelName = found.modelName;
        console.log('[DEBUG getProviderForUser] Found model in provider:', found.provider.id, found.provider.type);
      } else {
        console.log('[DEBUG getProviderForUser] Model NOT found, using default provider:', providers[0].id);
      }
    }

    if (!modelName && contentType) {
      const found = this.findDefaultModelForContentType(providers, contentType);
      if (found) {
        selectedProvider = found.provider;
        modelName = found.modelName;
      } else {
        const fallbackProvider = this.findChatProviderWithoutModels(providers, contentType);
        if (fallbackProvider) {
          selectedProvider = fallbackProvider;
        } else {
          throw new Error(`No AI provider available for content type: ${contentType}`);
        }
      }
    }

    const aiProvider = this.ensureProviderRegistered(selectedProvider);

    return {
      providerId: selectedProvider.id,
      providerType: selectedProvider.type,
      modelName,
      aiProvider,
    };
  }

  static async getGlobalProvider(modelId?: string, contentType?: ProviderContentType): Promise<ProviderSelectionResult> {
    return this.getProvider(undefined, modelId, contentType);
  }

  private static findModelInProviders(
    providers: any[], 
    modelId: string,
    contentType?: ProviderContentType
  ): { provider: any; modelName: string } | null {
    for (const provider of providers) {
      const foundModel = provider.AIProviderModel?.find(
        (m: any) => (m.id === modelId || m.name === modelId || m.model_id === modelId) && this.modelMatchesContentType(m, contentType)
      );
      if (foundModel) {
        return { provider, modelName: foundModel.model_id || foundModel.name };
      }
    }
    return null;
  }

  private static findDefaultModelForContentType(
    providers: any[],
    contentType: ProviderContentType
  ): { provider: any; modelName: string } | null {
    for (const provider of providers) {
      const foundModel = provider.AIProviderModel?.find((m: any) =>
        this.modelMatchesContentType(m, contentType)
      );
      if (foundModel) {
        return { provider, modelName: foundModel.model_id || foundModel.name };
      }
    }
    return null;
  }

  private static findChatProviderWithoutModels(
    providers: any[],
    contentType: ProviderContentType
  ): any | null {
    if (!this.TEXT_LIKE_CONTENT_TYPES.includes(contentType) && contentType !== 'text') {
      return null;
    }

    return providers.find((provider: any) => {
      const models = provider.AIProviderModel || [];
      return models.length === 0 && this.CHAT_PROVIDER_TYPES.includes(provider.type);
    }) || null;
  }

  private static modelMatchesContentType(model: any, contentType?: ProviderContentType): boolean {
    if (!contentType) return true;

    const types = Array.isArray(model.types) ? model.types : [];
    if (types.length === 0) return true;
    if (types.includes(contentType)) return true;

    return this.TEXT_LIKE_CONTENT_TYPES.includes(contentType) && types.includes('text');
  }

  private static ensureProviderRegistered(dbProvider: any): AIProviderInterface {
    console.log('[DEBUG ensureProviderRegistered] dbProvider:', JSON.stringify(dbProvider));
    const existingProvider = providerManager.getProvider(dbProvider.id);
    
    if (existingProvider) {
      console.log('[DEBUG ensureProviderRegistered] Found existing provider:', dbProvider.id, 'baseUrl:', (existingProvider as any).baseUrl);
      return existingProvider;
    }

    console.log('[DEBUG ensureProviderRegistered] Adding new provider:', { id: dbProvider.id, type: dbProvider.type, baseUrl: dbProvider.base_url });
    
    providerManager.addProvider({
      id: dbProvider.id,
      name: dbProvider.type,
      type: dbProvider.type,
      apiKey: dbProvider.api_key,
      baseUrl: dbProvider.base_url || undefined,
    });

    const aiProvider = providerManager.getProvider(dbProvider.id);
    
    if (!aiProvider) {
      logger.error('Failed to initialize AI provider', { 
        providerId: dbProvider.id,
        providerType: dbProvider.type,
      });
      throw new Error('Failed to initialize AI provider');
    }

    logger.debug('AI Provider registered', { 
      providerId: dbProvider.id,
      providerType: dbProvider.type,
    });

    return aiProvider;
  }

  static async getDefaultModelForAssistant(userId: string): Promise<{ modelId: string; modelName: string } | null> {
    try {
      const defaultModel = await prisma.aIProviderModel.findFirst({
        where: {
          is_assistant_default: true,
          AIProvider: this.enabledAdminProviderWhere(),
        },
        include: {
          AIProvider: true,
        },
      });

      if (defaultModel) {
        return {
          modelId: defaultModel.id,
          modelName: defaultModel.name,
        };
      }
      return null;
    } catch (error) {
      logger.warn('Failed to fetch default assistant model', { userId, error });
      return null;
    }
  }

  static async resolveModelName(modelId: string): Promise<string | null> {
    if (modelId.length <= 30) {
      return modelId;
    }

    try {
      const modelRecord = await prisma.aIProviderModel.findUnique({
        where: { id: modelId },
      });

      return modelRecord?.name || null;
    } catch (error) {
      logger.warn('Failed to resolve model name', { modelId, error });
      return null;
    }
  }
}

export const aiProviderHelper = AIProviderHelper;
