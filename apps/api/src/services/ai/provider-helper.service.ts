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

export class AIProviderHelper {
  private static readonly DEFAULT_USER_ID = 'system';
  private static readonly ADMIN_ROLES = ['admin', 'super_admin'];

  private static enabledAdminProviderWhere(extra: Record<string, unknown> = {}): any {
    return {
      enabled: true,
      ...extra,
      User: {
        role: { in: this.ADMIN_ROLES },
      },
    };
  }

  static async getProvider(userId?: string, modelId?: string): Promise<ProviderSelectionResult> {
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
      const found = this.findModelInProviders(providers, modelId);
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

    const aiProvider = this.ensureProviderRegistered(selectedProvider);
    
    logger.info('AI Provider selected', {
      providerId: selectedProvider.id,
      providerType: selectedProvider.type,
      modelName,
      userId: effectiveUserId,
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
    modelId?: string
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
      const found = this.findModelInProviders(providers, modelId);
      if (found) {
        selectedProvider = found.provider;
        modelName = found.modelName;
        console.log('[DEBUG getProviderForUser] Found model in provider:', found.provider.id, found.provider.type);
      } else {
        console.log('[DEBUG getProviderForUser] Model NOT found, using default provider:', providers[0].id);
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

  static async getGlobalProvider(modelId?: string): Promise<ProviderSelectionResult> {
    return this.getProvider(undefined, modelId);
  }

  private static findModelInProviders(
    providers: any[], 
    modelId: string
  ): { provider: any; modelName: string } | null {
    for (const provider of providers) {
      const foundModel = provider.AIProviderModel?.find(
        (m: any) => m.id === modelId || m.name === modelId
      );
      if (foundModel) {
        return { provider, modelName: foundModel.name };
      }
    }
    return null;
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
