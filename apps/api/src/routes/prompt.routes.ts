import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AIProviderHelper } from '../services/ai/provider-helper.service';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

const SYSTEM_PROMPT = `You are a prompt optimization expert for AI image/video generation.`;

const USER_PROMPT_TEMPLATE = `Convert the following Chinese description into a detailed, optimized English prompt for AI generation.
Focus on:
- Visual details (lighting, composition, color, style)
- Subject description
- Technical quality modifiers
- Remove redundant words

Chinese: {{prompt}}

Optimized English prompt:`;

router.post('/optimize', asyncHandler(async (req, res) => {
  const { prompt, model } = req.body;
  const userId = req.user_id;

  if (!prompt || prompt.length < 2) {
    throw AppError.badRequest('Prompt is required');
  }

  logger.info('Prompt optimization request', { 
    userId, 
    promptLength: prompt.length, 
    model 
  });

  const { aiProvider, modelName, providerId } = await AIProviderHelper.getProvider(userId, model);

  logger.debug('Provider selected for prompt optimization', { 
    providerId, 
    modelName 
  });

  const optimizationPrompt = USER_PROMPT_TEMPLATE.replace('{{prompt}}', prompt);

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: optimizationPrompt },
  ];

  const result = await aiProvider.chat(
    messages,
    modelName ? { model: modelName } : undefined
  );

  const optimizedPrompt = result.content?.trim() || prompt;

  logger.info('Prompt optimization completed', { 
    userId,
    originalLength: prompt.length,
    optimizedLength: optimizedPrompt.length 
  });

  res.json({
    original: prompt,
    optimized: optimizedPrompt,
    type: 'image'
  });
}));

export default router;
