import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIProviderHelper } from '../services/ai/provider-helper.service';
import { AIChatMessage } from '../types/ai.types';
import logger from '../lib/logger';
import { ASSISTANT_PROMPTS } from '../prompts/services';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { config } from '../config';

interface ChatRequest {
  message: string;
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    page?: string;
    projectId?: string;
    currentData?: Record<string, unknown>;
  };
  provider?: string;
  model?: string;
}

const { defaultModel, temperature, maxTokens } = config.ai.chat;
const { maxMessageLength } = config.ai.defaults;

function buildSystemPrompt(context?: ChatRequest['context']): string {
  const contextInfo = context 
    ? `- 页面：${context.page || '未知'}\n- 项目ID：${context.projectId || '无'}`
    : '无';
  
  return ASSISTANT_PROMPTS.systemPrompt.replace('{{context}}', contextInfo);
}

function validateMessage(message: string): void {
  if (!message || typeof message !== 'string') {
    throw AppError.badRequest('消息内容不能为空');
  }
  
  if (message.trim().length === 0) {
    throw AppError.badRequest('消息内容不能为空');
  }
  
  if (message.length > maxMessageLength) {
    throw AppError.badRequest(`消息内容过长，最多${maxMessageLength}字符`);
  }
}

export const chat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requestId = Math.random().toString(36).substring(7);
  const { message, conversation = [], context, model }: ChatRequest = req.body;
  const userId = req.user_id;

  if (!userId) {
    throw AppError.unauthorized('未登录');
  }

  validateMessage(message);

  logger.info('Assistant chat request', { 
    requestId, 
    userId,
    messageLength: message.length,
    model 
  });

  const { aiProvider, modelName, providerId } = await AIProviderHelper.getProviderForUser(userId, model);

  logger.debug('Provider selected for assistant chat', { 
    requestId, 
    providerId, 
    modelName 
  });

  const systemPrompt = buildSystemPrompt(context);

  const messages: AIChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversation.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  const response = await aiProvider.chat(messages, {
    model: modelName || defaultModel,
    temperature,
    maxTokens
  });

  logger.info('Assistant chat completed', { 
    requestId, 
    userId,
    providerId,
    model: modelName || defaultModel
  });

  res.json({
    response: response.content,
    provider: providerId,
    model: modelName || defaultModel
  });
});

export const getProviders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user_id;

  if (!userId) {
    throw AppError.unauthorized('未登录');
  }

  const { prisma } = await import('../lib/prisma');
  
  const dbProviders = await prisma.aIProvider.findMany({
    where: { user_id: userId, enabled: true },
    include: {
      AIProviderModel: {
        select: {
          id: true,
          name: true,
          is_assistant_default: true,
          types: true
        }
      }
    }
  });

  logger.debug('Get AI providers for assistant', { userId, count: dbProviders.length });

  res.json({
    providers: dbProviders.map(p => ({
      id: p.id,
      type: p.type,
      models: p.AIProviderModel.map(m => ({
        id: m.id,
        name: m.name,
        types: m.types,
        isAssistantDefault: m.is_assistant_default
      }))
    }))
  });
});

export const getModels = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { provider: providerId } = req.query;
  const userId = req.user_id;

  if (!userId) {
    throw AppError.unauthorized('未登录');
  }

  const { prisma } = await import('../lib/prisma');
  
  if (providerId && typeof providerId === 'string') {
    const models = await prisma.aIProviderModel.findMany({
      where: { ai_provider_id: providerId },
      select: { id: true, name: true, types: true }
    });
    
    res.json({
      provider: providerId,
      models: models.map(m => ({
        id: m.id,
        name: m.name,
        type: m.types
      }))
    });
    return;
  }
  
  const allProviders = await prisma.aIProvider.findMany({
    where: { user_id: userId, enabled: true },
    include: {
      AIProviderModel: {
        select: { id: true, name: true, types: true }
      }
    }
  });

  res.json({
    providers: allProviders.map(p => ({
      id: p.id,
      models: p.AIProviderModel.map(m => ({
        id: m.id,
        name: m.name,
        type: m.types
      }))
    }))
  });
});
