import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiProviderService } from '../services/ai/provider.service';
import logger from '../lib/logger';
import { 
  POLISH_PROMPTS, 
  EXPAND_PROMPT, 
  TRANSLATE_PROMPT, 
  NEGATIVE_PROMPT_GENERATOR 
} from '../prompts/routes/polish-prompts';

const router = Router();

router.use(authMiddleware);

router.post('/polish', async (req: Request, res: Response) => {
  try {
    const { prompt, type = 'image', style, language = 'chinese' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

    const systemPrompts: Record<string, string> = {
      image: POLISH_PROMPTS.image,
      video: POLISH_PROMPTS.video,
      character: POLISH_PROMPTS.character,
    };

    const styleGuide = style ? `\n\n目标风格：${style}` : '';
    const langGuide = language === 'chinese' ? '\n\n请同时提供中文翻译版本。' : '';

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: systemPrompts[type] || systemPrompts.image },
        { role: 'user', content: `请优化以下提示词：\n\n${prompt}${styleGuide}${langGuide}` }
      ],
      undefined
    );

    const content = response.content;

    const result = parsePolishResult(content, type);

    res.json({
      original: prompt,
      polished: result.polished,
      negative: result.negative,
      suggestions: result.suggestions,
      chineseTranslation: result.chinese,
    });
  } catch (error) {
    logger.error('Failed to polish prompt', { error });
    res.status(500).json({ error: '提示词润色失败' });
  }
});

router.post('/expand', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

    const systemPrompt = EXPAND_PROMPT.systemPrompt;

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请扩展以下提示词：\n\n${prompt}` }
      ],
      undefined
    );

    const result = parseJsonResponse(response.content);

    res.json({
      original: prompt,
      expanded: result.expanded || prompt,
      variations: result.variations || [],
      keywords: result.keywords || [],
    });
  } catch (error) {
    logger.error('Failed to expand prompt', { error });
    res.status(500).json({ error: '提示词扩展失败' });
  }
});

router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { prompt, targetLanguage = 'english' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

    const systemPrompt = TRANSLATE_PROMPT.systemPrompt.replace('{{targetLanguage}}', targetLanguage === 'english' ? '英文' : '中文');

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      undefined
    );

    res.json({
      original: prompt,
      translated: response.content.trim(),
      sourceLanguage: targetLanguage === 'english' ? 'chinese' : 'english',
      targetLanguage,
    });
  } catch (error) {
    logger.error('Failed to translate prompt', { error });
    res.status(500).json({ error: '提示词翻译失败' });
  }
});

router.post('/negative', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

    const systemPrompt = NEGATIVE_PROMPT_GENERATOR.systemPrompt;

    const response = await aiProviderService.chat(
      'default',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请为以下提示词生成负面提示词：\n\n${prompt}` }
      ],
      undefined
    );

    const result = parseJsonResponse(response.content);

    res.json({
      original: prompt,
      negative: result.negative || '',
      explanations: result.explanations || [],
    });
  } catch (error) {
    logger.error('Failed to generate negative prompt', { error });
    res.status(500).json({ error: '负面提示词生成失败' });
  }
});

function parsePolishResult(content: string, _type: string) {
  const result: any = {
    polished: '',
    negative: '',
    suggestions: [],
    chinese: '',
  };

  const polishedMatch = content.match(/(?:优化后|润色后|Polished|Optimized)[:：]\s*([^\n]+)/i);
  if (polishedMatch) {
    result.polished = polishedMatch[1].trim();
  }

  const negativeMatch = content.match(/(?:负面提示词|Negative)[:：]\s*([^\n]+)/i);
  if (negativeMatch) {
    result.negative = negativeMatch[1].trim();
  }

  const chineseMatch = content.match(/(?:中文翻译|Chinese)[:：]\s*([^\n]+)/i);
  if (chineseMatch) {
    result.chinese = chineseMatch[1].trim();
  }

  if (!result.polished) {
    const lines = content.split('\n').filter((l: string) => l.trim());
    if (lines.length > 0) {
      result.polished = lines[0].trim();
    }
  }

  return result;
}

function parseJsonResponse(content: string): any {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    return {};
  }
}

export default router;
