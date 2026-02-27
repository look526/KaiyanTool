import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { providerManager } from '../services/ai/provider.manager';
import { prisma } from '../lib/prisma';

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

router.post('/optimize', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    
    if (!prompt || prompt.length < 2) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    console.log('[Prompt Optimize] Request:', { promptLength: prompt.length, model });

    const aiProviders = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { models: true },
    });

    console.log('[Prompt Optimize] Providers found:', aiProviders.length);

    if (aiProviders.length === 0) {
      res.status(400).json({ error: 'No AI provider available' });
      return;
    }

    let selectedProvider = aiProviders[0];
    let modelName: string | undefined;

    if (model) {
      console.log('[Prompt Optimize] Searching for model:', model);
      for (const p of aiProviders) {
        const foundModel = p.models?.find((m: any) => m.id === model || m.name === model);
        if (foundModel) {
          selectedProvider = p;
          modelName = foundModel.name;
          console.log('[Prompt Optimize] Found model:', foundModel);
          break;
        }
      }
    }

    console.log('[Prompt Optimize] Using provider:', selectedProvider.name, selectedProvider.type, 'baseUrl:', selectedProvider.baseUrl, 'model:', modelName);

    providerManager.addProvider({
      id: selectedProvider.id,
      name: selectedProvider.name,
      type: selectedProvider.type as any,
      apiKey: selectedProvider.apiKey,
      baseUrl: selectedProvider.baseUrl || undefined,
    });

    const aiProvider = providerManager.getProvider(selectedProvider.id);
    if (!aiProvider) {
      throw new Error('Failed to initialize AI provider');
    }

    console.log('[Prompt Optimize] Provider initialized, calling AI with model:', modelName);

    const optimizationPrompt = USER_PROMPT_TEMPLATE.replace('{{prompt}}', prompt);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: optimizationPrompt },
    ];

    const result = await aiProvider.chat(
      messages,
      modelName ? { model: modelName } : undefined
    );

    console.log('[Prompt Optimize] AI response:', result.content?.substring(0, 100));

    const optimizedPrompt = result.content?.trim() || prompt;

    res.json({
      original: prompt,
      optimized: optimizedPrompt,
      type: 'image'
    });
  } catch (error) {
    console.error('Prompt optimization failed:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Optimization failed' });
  }
});

export default router;
