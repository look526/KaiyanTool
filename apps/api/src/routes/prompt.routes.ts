import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authMiddleware);

router.post('/optimize', async (req, res) => {
  try {
    const { prompt, type = 'image' } = req.body;
    
    if (!prompt || prompt.length < 2) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const providers = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { models: true }
    });
    
    if (providers.length === 0) {
      res.status(400).json({ error: 'No AI provider available' });
      return;
    }

    const provider = providers[0];
    
    const optimizationPrompt = `You are a prompt optimization expert for AI image/video generation. 
Convert the following Chinese description into a detailed, optimized English prompt for AI generation.
Focus on:
- Visual details (lighting, composition, color, style)
- Subject description
- Technical quality modifiers
- Remove redundant words

Chinese: ${prompt}

Optimized English prompt:`;

    const result = await aiProviderService.chat(provider.id, [
      { role: 'system', content: 'You are a prompt optimization expert.' },
      { role: 'user', content: optimizationPrompt }
    ]);

    const optimizedPrompt = result.content?.trim() || prompt;

    res.json({
      original: prompt,
      optimized: optimizedPrompt,
      type
    });
  } catch (error) {
    console.error('Prompt optimization failed:', error);
    res.status(500).json({ error: 'Optimization failed' });
  }
});

export default router;
