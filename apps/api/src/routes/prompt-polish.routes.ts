import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiProviderService } from '../services/ai/provider.service';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

router.post('/polish', async (req: Request, res: Response) => {
  try {
    const { prompt, type = 'image', style, language = 'chinese' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: '提示词不能为空' });
    }

    const systemPrompts: Record<string, string> = {
      image: `你是一个专业的AI图像提示词优化专家。你的任务是优化用户输入的图像生成提示词，使其更加精确、专业，能够生成更高质量的图像。

优化原则：
1. 添加必要的画质描述词（如：high quality, detailed, 4K, masterpiece）
2. 补充光影、构图、风格等专业元素
3. 保持用户原始意图不变
4. 使用英文输出（因为大多数AI图像模型对英文支持更好）
5. 如果用户输入是中文，翻译并优化为英文提示词
6. 添加适当的负面提示词建议`,
      
      video: `你是一个专业的AI视频生成提示词优化专家。你的任务是优化用户输入的视频生成提示词。

优化原则：
1. 添加镜头运动描述（如：slow pan, zoom in, tracking shot）
2. 补充时间、节奏、转场等视频元素
3. 保持用户原始意图不变
4. 使用英文输出
5. 添加适当的视频质量描述词`,
      
      character: `你是一个专业的角色设计提示词优化专家。你的任务是优化角色外观描述，使其能够生成一致、高质量的角色图像。

优化原则：
1. 详细描述角色的面部特征、发型、服装
2. 添加风格描述（如：anime style, realistic, stylized）
3. 保持角色特征的一致性
4. 使用英文输出`,
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

    const systemPrompt = `你是一个创意扩展专家。用户会给你一个简单的提示词，你需要扩展它，添加更多细节和创意元素。

请返回JSON格式：
{
  "expanded": "扩展后的详细提示词",
  "variations": [
    "变体1：不同风格或角度",
    "变体2：不同氛围或情绪",
    "变体3：不同构图或视角"
  ],
  "keywords": ["关键词1", "关键词2", "关键词3"]
}`;

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

    const systemPrompt = `你是一个专业的翻译专家，专门翻译AI图像/视频生成提示词。
请将用户输入翻译成${targetLanguage === 'english' ? '英文' : '中文'}。
保持专业术语的准确性，确保翻译后的提示词能够被AI模型正确理解。
只返回翻译结果，不要添加任何解释。`;

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

    const systemPrompt = `你是一个负面提示词生成专家。根据用户提供的正面提示词，生成合适的负面提示词，用于排除不想要的元素。

请返回JSON格式：
{
  "negative": "负面提示词，用逗号分隔",
  "explanations": [
    {"term": "术语", "reason": "为什么排除这个元素"}
  ]
}`;

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
