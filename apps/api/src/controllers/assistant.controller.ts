import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { providerManager } from '../services/ai/provider.manager';
import { AIChatMessage } from '../types/ai.types';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { ASSISTANT_PROMPTS } from '../prompts/services';

interface ChatRequest {
  message: string;
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    page?: string;
    projectId?: string;
    currentData?: any;
  };
  provider?: string;
  model?: string;
}

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const MAX_MESSAGE_LENGTH = 10000;

function buildSystemPrompt(context?: ChatRequest['context']): string {
  const contextInfo = context 
    ? `- 页面：${context.page || '未知'}\n- 项目ID：${context.projectId || '无'}`
    : '无';
  
  return ASSISTANT_PROMPTS.systemPrompt.replace('{{context}}', contextInfo);
}

function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: '消息内容不能为空' };
  }
  
  if (message.trim().length === 0) {
    return { valid: false, error: '消息内容不能为空' };
  }
  
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `消息内容过长，最多${MAX_MESSAGE_LENGTH}字符` };
  }
  
  return { valid: true };
}

export const chat = async (req: AuthRequest, res: Response) => {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const { message, conversation = [], context, provider: providerId, model }: ChatRequest = req.body;

    const validation = validateMessage(message);
    if (!validation.valid) {
      logger.warn('Invalid message request', { requestId, error: validation.error });
      return res.status(400).json({ error: validation.error });
    }

    const dbProviders = await prisma.aIProvider.findMany({
      where: { userId: req.userId, enabled: true },
      include: { models: true }
    });

    for (const dbProvider of dbProviders) {
      logger.info('Processing provider from DB', { providerId: dbProvider.id, type: dbProvider.type, hasApiKey: !!dbProvider.apiKey, hasBaseUrl: !!dbProvider.baseUrl, baseUrl: dbProvider.baseUrl });
      if (!providerManager.getProvider(dbProvider.id)) {
        try {
          providerManager.addProvider({
            id: dbProvider.id,
            name: dbProvider.type,
            type: dbProvider.type as any,
            apiKey: dbProvider.apiKey,
            baseUrl: dbProvider.baseUrl || undefined
          });
          logger.info('Provider added to manager', { providerId: dbProvider.id, type: dbProvider.type });
        } catch (e) {
          logger.warn('Failed to add provider to manager', { providerId: dbProvider.id, error: e });
        }
      }
    }

    const providers = providerManager.listProviders();
    logger.info('Chat request - providers loaded', { 
      requestId, 
      userId: req.userId,
      providersCount: providers.length,
      providerIds: providers.map(p => p.id),
      providerId,
      model 
    });
    
    if (providers.length === 0) {
      logger.warn('No AI providers configured', { requestId, userId: req.userId });
      return res.status(400).json({ error: '未配置AI提供商，请先在设置中配置AI服务' });
    }

    let selectedProvider = providerId 
      ? providerManager.getProvider(providerId)
      : providers[0];
    
    logger.info('Provider selected', { 
      requestId, 
      selectedProviderId: providerId || providerManager.getProviderId(providers[0]),
      providerType: selectedProvider?.type 
    });

    if (!selectedProvider) {
      return res.status(400).json({ error: '指定的AI提供商不存在' });
    }

    let selectedModel = model;

    logger.info('Model selection', { requestId, selectedModel, providerId, model });

    if (selectedModel && selectedModel.length > 30) {
      try {
        const modelRecord = await prisma.aIProviderModel.findUnique({
          where: { id: selectedModel },
          include: { provider: true }
        });
        
        if (modelRecord) {
          selectedModel = modelRecord.name;
          logger.info('Converted model ID to name', { 
            requestId, 
            modelId: model, 
            modelName: selectedModel 
          });
        }
      } catch (dbError) {
        logger.warn('Failed to fetch model record', { 
          requestId, 
          modelId: selectedModel,
          error: dbError 
        });
      }
    }

    if (!providerId && !model && req.userRole === 'admin') {
      try {
        const defaultModel = await prisma.aIProviderModel.findFirst({
          where: {
            isAssistantDefault: true,
            provider: {
              userId: req.userId,
              enabled: true,
            },
          },
          include: {
            provider: true,
          },
        });

        if (defaultModel) {
          const providerType = defaultModel.provider.type;
          const matchedProvider = providers.find(p => p.type === providerType);
          if (matchedProvider) {
            selectedProvider = matchedProvider;
            selectedModel = defaultModel.name;
            logger.info('Using default assistant model', { 
              requestId, 
              userId: req.userId,
              model: selectedModel,
              provider: selectedProvider.id 
            });
          }
        }
      } catch (dbError) {
        logger.warn('Failed to fetch default assistant model', { 
          requestId, 
          userId: req.userId,
          error: dbError 
        });
      }
    }

    const systemPrompt = buildSystemPrompt(context);

    const messages: AIChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    logger.info('Calling AI provider chat', { 
      requestId, 
      providerId: selectedProvider.id,
      providerType: selectedProvider.type,
      model: selectedModel || DEFAULT_MODEL,
      messageCount: messages.length 
    });

    const response = await selectedProvider.chat(messages, {
      model: selectedModel || DEFAULT_MODEL,
      temperature: 0.7,
      maxTokens: 1000
    });

    logger.info('AI assistant chat successful', { 
      requestId, 
      userId: req.userId,
      provider: selectedProvider.id,
      model: selectedModel || DEFAULT_MODEL,
      messageLength: message.length 
    });

    res.json({
      response: response.content,
      provider: selectedProvider.id,
      model: model || DEFAULT_MODEL
    });
  } catch (error) {
    logger.error('Assistant chat error', { 
      requestId, 
      userId: req.userId,
      error: error instanceof Error ? error.message : String(error) 
    });
    
    const isNetworkError = error instanceof Error && 
      (error.message.includes('ECONNREFUSED') || 
       error.message.includes('ETIMEDOUT') ||
       error.message.includes('timeout'));
    
    const statusCode = isNetworkError ? 503 : 500;
    const errorMessage = isNetworkError 
      ? 'AI服务暂时不可用，请稍后再试' 
      : 'AI助手暂时无法响应，请稍后再试';

    const errorResponse: { error: string; code: string; details?: string } = { 
      error: errorMessage,
      code: isNetworkError ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR'
    };
    
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      errorResponse.details = error.message;
    }
    
    res.status(statusCode).json(errorResponse);
  }
};

export const getProviders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    const dbProviders = await prisma.aIProvider.findMany({
      where: { userId, enabled: true },
      include: {
        models: {
          select: {
            id: true,
            name: true,
            isAssistantDefault: true,
            types: true
          }
        }
      }
    });

    const providers = providerManager.listProviders();
    
    logger.info('Get AI providers', { userId, count: providers.length });
    
    res.json({
      providers: dbProviders.map(p => ({
        id: p.id,
        type: p.type,
        models: p.models.map(m => ({
          id: m.id,
          name: m.name,
          types: m.types,
          isAssistantDefault: m.isAssistantDefault
        }))
      }))
    });
  } catch (error) {
    logger.error('Get providers error', { 
      userId: req.userId,
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ error: '获取AI提供商失败' });
  }
};

export const getModels = async (req: AuthRequest, res: Response) => {
  try {
    const { provider: providerId } = req.query;
    
    if (providerId && typeof providerId === 'string') {
      const models = providerManager.getProviderModels(providerId);
      return res.json({
        provider: providerId,
        models: models.filter(m => m.type === 'chat').map(m => ({
          id: m.id,
          name: m.name,
          type: m.type
        }))
      });
    }
    
    const allModels = providerManager.getAllModels();
    res.json({
      providers: allModels.map(({ provider, models }) => ({
        id: provider,
        models: models.filter(m => m.type === 'chat').map(m => ({
          id: m.id,
          name: m.name,
          type: m.type
        }))
      }))
    });
  } catch (error) {
    logger.error('Get models error', { 
      userId: req.userId,
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ error: '获取模型列表失败' });
  }
};
