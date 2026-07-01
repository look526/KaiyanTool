import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { providerManager } from '../services/ai/provider.manager';

const router = Router();

router.post('/content/process-file', authMiddleware, async (req, res) => {
  try {
    const { content, mode, model } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '内容不能为空' });
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const inputFileName = `input_${timestamp}.txt`;
    const outputFileName = `output_${timestamp}.txt`;
    const inputFilePath = path.join(tempDir, inputFileName);
    const outputFilePath = path.join(tempDir, outputFileName);

    fs.writeFileSync(inputFilePath, content, 'utf-8');

    const aiProviders = await prisma.aIProvider.findMany({
      where: {
        enabled: true,
        User: {
          role: { in: ['admin', 'super_admin'] },
        },
      },
      include: { AIProviderModel: true },
    });

    if (aiProviders.length === 0) {
      fs.unlinkSync(inputFilePath);
      return res.status(400).json({ error: '没有可用的 AI 提供商' });
    }

    let provider = aiProviders[0];
    let modelName: string | undefined;

    if (model) {
      for (const p of aiProviders) {
        const foundModel = p.AIProviderModel?.find(m => m.id === model || m.name === model);
        if (foundModel) {
          provider = p;
          modelName = foundModel.name;
          break;
        }
      }
    }

    providerManager.addProvider({
      id: provider.id,
      name: provider.type,
      type: provider.type as any,
      apiKey: provider.api_key,
      baseUrl: provider.base_url || undefined,
    });

    const aiProvider = providerManager.getProvider(provider.id);
    if (!aiProvider) {
      fs.unlinkSync(inputFilePath);
      throw new Error('AI 提供商初始化失败');
    }

    const modeInstructions: Record<string, string> = {
      continue: '请根据以下剧本内容继续创作，保持原有的风格、人物设定和剧情节奏。',
      rewrite: '请改编以下剧本内容，保持故事的核心精神和人物性格，创作出更加精彩的版本。',
      optimize: '请优化以下剧本内容，提升文笔和叙事技巧。'
    };

    const systemPrompt = mode === 'continue' 
      ? '你是一个专业的剧本作家助手。'
      : mode === 'rewrite'
      ? '你是一个专业的剧本作家。'
      : '你是一个专业的剧本编辑助手。';

    const userPrompt = `${modeInstructions[mode] || '请处理以下内容：'}\n\n以下是剧本内容（保存在文件中）：\n\n（请读取附件文件）\n\n请直接输出处理后的内容，不需要任何额外说明。`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const result = await aiProvider.chat(messages, modelName ? { model: modelName } : undefined);

    let resultContent = result.content;
    
    if (!resultContent && (result as any).truncated) {
      resultContent = (result as any).content || '';
    }

    if (!resultContent && (result as any).reasoning_content) {
      resultContent = (result as any).reasoning_content;
    }

    if (resultContent) {
      fs.writeFileSync(outputFilePath, resultContent, 'utf-8');
    }

    const fileUrl = `/temp/${outputFileName}`;

    res.json({
      success: true,
      content: resultContent || '',
      fileUrl,
      inputFileName,
      outputFileName,
      truncated: (result as any).truncated || false
    });

  } catch (error) {
    console.error('AI处理文件失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'AI处理失败' });
  }
});

router.get('/temp/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), 'temp', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

export default router;
