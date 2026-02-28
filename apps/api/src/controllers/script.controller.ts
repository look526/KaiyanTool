import { Request, Response } from 'express';
import { providerManager } from '../services/ai/provider.manager';
import { prisma } from '../lib/prisma';
import { scriptParserService } from '../services/script/script-parser.service';
import { largeTextProcessingService } from '../services/large-text';
import { SCRIPT_CONTROLLER_PROMPTS } from '../prompts/services';

interface Dialogue {
  character: string;
  lines: string[];
  action?: string;
}

interface Scene {
  id: number;
  description: string;
  type: string;
  dialogue: Dialogue[];
  action?: string;
}

interface ParsedScript {
  scenes: Scene[];
  characters: string[];
}

export const parseScript = (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '剧本内容不能为空' });
    }

    const scenes: Scene[] = [];
    const characters = new Set<string>();
    const lines = content.split('\n');
    let currentScene: Scene | null = null;
    let sceneId = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const sceneMatch = line.match(/^(场景\d+|场景\s*\d+|Scene\s*\d+)\s*[-：:]\s*(.+)/i);
      const bracketSceneMatch = line.match(/^\[场景(\d+)\]\s*(.+)/i);

      if (sceneMatch || bracketSceneMatch) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        sceneId++;
        const description = bracketSceneMatch ? bracketSceneMatch[2] : sceneMatch![2];
        const sceneType = bracketSceneMatch?.[1] || sceneMatch![1].replace(/[^\d]/g, '');
        currentScene = {
          id: sceneId,
          description: description.trim(),
          type: sceneType,
          dialogue: [],
        };
        continue;
      }

      const actionMatch = line.match(/^\((.+)\)$/);
      if (actionMatch && currentScene) {
        if (currentScene.dialogue.length === 0) {
          currentScene.action = actionMatch[1].trim();
        } else {
          const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
          lastDialogue.action = actionMatch[1].trim();
        }
        continue;
      }

      const characterMatch = line.match(/^([^\uff1a\uff3b:：:]+)[\uff1a\uff3b:：:]\s*(.+)/);
      if (characterMatch && currentScene) {
        const character = characterMatch[1].trim();
        const text = characterMatch[2].trim();
        characters.add(character);

        const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
        if (lastDialogue && lastDialogue.character === character) {
          lastDialogue.lines.push(text);
        } else {
          currentScene.dialogue.push({
            character,
            lines: [text],
          });
        }
        continue;
      }
    }

    if (currentScene) {
      scenes.push(currentScene);
    }

    const result: ParsedScript = {
      scenes,
      characters: Array.from(characters),
    };

    res.json(result);
  } catch (error) {
    console.error('解析剧本失败:', error);
    res.status(500).json({ error: '解析剧本失败' });
  }
};

export const saveScript = async (req: Request, res: Response) => {
  try {
    const { projectId, title, content } = req.body;

    if (!projectId || !title || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const { prisma } = await import('../lib/prisma');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: title,
        description: content.substring(0, 500),
      },
    });

    res.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('保存剧本失败:', error);
    res.status(500).json({ error: '保存剧本失败' });
  }
};

export const getScript = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json({
      title: project.name,
      content: project.description || '',
    });
  } catch (error) {
    console.error('获取剧本失败:', error);
    res.status(500).json({ error: '获取剧本失败' });
  }
};

export const continueScript = async (req: Request, res: Response) => {
  try {
    const { content, context, model } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '剧本内容不能为空' });
    }

    const aiProviders = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { models: true },
    });

    if (aiProviders.length === 0) {
      return res.status(400).json({ error: '没有可用的 AI 提供商' });
    }

    let provider = aiProviders[0];
    let modelName: string | undefined;

    console.log('[DEBUG rewrite] Available providers:', aiProviders.map(p => ({ id: p.id, name: p.name, type: p.type, hasApiKey: !!p.apiKey })));

    if (model) {
      console.log('[DEBUG] Searching for model:', model);
      for (const p of aiProviders) {
        console.log('[DEBUG] Checking provider:', p.id, 'models:', p.models?.map(m => ({ id: m.id, name: m.name })));
        const foundModel = p.models?.find(m => m.id === model || m.name === model);
        if (foundModel) {
          provider = p;
          modelName = foundModel.name;
          console.log('[DEBUG] Found model:', foundModel);
          break;
        }
      }
    }

    try {
      providerManager.addProvider({
        id: provider.id,
        name: provider.name,
        type: provider.type as any,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || undefined,
      });
      console.log('[DEBUG] Provider added:', { id: provider.id, type: provider.type, baseUrl: provider.baseUrl, modelName });
      const aiProvider = providerManager.getProvider(provider.id);
      if (!aiProvider) {
        throw new Error('AI 提供商初始化失败');
      }
      console.log('[DEBUG] Calling AI with model:', modelName);

      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        {
          role: 'system',
          content: SCRIPT_CONTROLLER_PROMPTS.continueScript.systemPrompt
        },
        {
          role: 'user',
          content: SCRIPT_CONTROLLER_PROMPTS.continueScript.userPromptTemplate
            .replace('{{existingContent}}', content)
            .replace('{{wordCount}}', '500')
            .replace('{{context}}', context ? '上下文补充：' + context : '')
        }
      ];

      const result = await aiProvider.chat(messages, modelName ? { model: modelName } : undefined);
      
      let continuedContent = result.content;
      if (continuedContent === null || continuedContent === undefined) {
        throw new Error('AI返回内容为空');
      }

      res.json({
        success: true,
        content: content + '\n\n' + continuedContent,
        truncated: result.truncated
      });
    } catch (aiError) {
      console.error('AI 调用失败:', aiError);
      console.error('AI 调用详情:', {
        providerType: provider.type,
        providerId: provider.id,
        modelName,
        contentLength: content?.length,
        errorMessage: aiError instanceof Error ? aiError.message : String(aiError)
      });
      res.status(500).json({ 
        error: aiError instanceof Error ? aiError.message : 'AI调用失败，请检查账户余额或稍后重试' 
      });
    }
  } catch (error) {
    console.error('AI续写失败:', error);
    res.status(500).json({ error: 'AI续写失败' });
  }
};

export const rewriteScript = async (req: Request, res: Response) => {
  console.log('[DEBUG rewrite] Request received');
  try {
    const { content, instruction, model } = req.body;
    console.log('[DEBUG rewrite] Request body:', { contentLength: content?.length, instruction, model });

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '剧本内容不能为空' });
    }

    const aiProviders = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { models: true },
    });

    if (aiProviders.length === 0) {
      return res.status(400).json({ error: '没有可用的 AI 提供商' });
    }

    let provider = aiProviders[0];
    let modelName: string | undefined;

    console.log('[DEBUG rewrite] Available providers:', aiProviders.map(p => ({ id: p.id, name: p.name, type: p.type, hasApiKey: !!p.apiKey })));

    if (model) {
      for (const p of aiProviders) {
        const foundModel = p.models?.find(m => m.id === model || m.name === model);
        if (foundModel) {
          provider = p;
          modelName = foundModel.name;
          break;
        }
      }
    }

    try {
      providerManager.addProvider({
        id: provider.id,
        name: provider.name,
        type: provider.type as any,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || undefined,
      });

      const aiProvider = providerManager.getProvider(provider.id);
      if (!aiProvider) {
        throw new Error('AI 提供商初始化失败');
      }
      console.log('[DEBUG rewrite] Provider type:', provider.type, 'modelName:', modelName);

      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        {
          role: 'system',
          content: SCRIPT_CONTROLLER_PROMPTS.rewriteScript.systemPrompt
        },
        {
          role: 'user',
          content: SCRIPT_CONTROLLER_PROMPTS.rewriteScript.userPromptTemplate
            .replace('{{originalContent}}', content)
            .replace('{{requirements}}', instruction || '创意改编，保持故事核心精神')
        }
      ];

      const result = await aiProvider.chat(messages, modelName ? { model: modelName } : undefined);
      console.log('[DEBUG rewrite] AI result:', { hasContent: !!result.content, contentLength: result.content?.length, model: result.model, usage: result.usage });
      
      let rewrittenContent = result.content;
      if (rewrittenContent === null || rewrittenContent === undefined) {
        throw new Error('AI返回内容为空');
      }

      res.json({
        success: true,
        content: rewrittenContent,
        truncated: result.truncated
      });
    } catch (aiError) {
      console.error('AI 调用失败:', aiError);
      console.error('AI 调用详情:', {
        providerType: provider.type,
        providerId: provider.id,
        modelName,
        contentLength: content?.length,
        errorMessage: aiError instanceof Error ? aiError.message : String(aiError)
      });
      res.status(500).json({ 
        error: aiError instanceof Error ? aiError.message : 'AI调用失败，请检查账户余额或稍后重试' 
      });
    }
  } catch (error) {
    console.error('AI改写失败:', error);
    res.status(500).json({ error: 'AI改写失败' });
  }
};

export const optimizeScene = async (req: Request, res: Response) => {
  try {
    const { sceneContent, location, time, direction } = req.body;

    if (!sceneContent || typeof sceneContent !== 'string') {
      return res.status(400).json({ error: '场景内容不能为空' });
    }

    const aiProviders = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { models: true },
    });

    if (aiProviders.length === 0) {
      return res.status(400).json({ error: '没有可用的 AI 提供商' });
    }

    const provider = aiProviders[0];

    try {
      providerManager.addProvider({
        id: provider.id,
        name: provider.name,
        type: provider.type as any,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || undefined,
      });

      const aiProvider = providerManager.getProvider(provider.id);
      if (!aiProvider) {
        throw new Error('AI 提供商初始化失败');
      }

      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        {
          role: 'system',
          content: SCRIPT_CONTROLLER_PROMPTS.optimizeScene.systemPrompt
        },
        {
          role: 'user',
          content: SCRIPT_CONTROLLER_PROMPTS.optimizeScene.userPromptTemplate
            .replace('{{title}}', location || '未指定')
            .replace('{{description}}', sceneContent)
            .replace('{{characters}}', '未指定')
            .replace('{{optimizationDirection}}', direction || '增强场景描述，使画面感更强')
        }
      ];

      const result = await aiProvider.chat(messages);
      
      let optimizedContent = result.content;
      if (!optimizedContent) {
        optimizedContent = sceneContent;
      }

      res.json({
        success: true,
        suggestion: optimizedContent,
        optimized: optimizedContent
      });
    } catch (aiError) {
      console.error('AI 调用失败:', aiError);
      res.json({
        success: true,
        suggestion: sceneContent,
        optimized: sceneContent
      });
    }
  } catch (error) {
    console.error('场景优化失败:', error);
    res.status(500).json({ error: '场景优化失败' });
  }
};

export const parseScriptWithAI = async (req: Request, res: Response) => {
  try {
    const { content, model } = req.body;
    const userId = (req as any).user?.id;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '剧本内容不能为空' });
    }

    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const aiProviders = await prisma.aIProvider.findMany({
      where: { userId, enabled: true },
      include: { models: true },
    });

    if (aiProviders.length === 0) {
      return res.status(400).json({ error: '没有可用的 AI 提供商' });
    }

    let provider = aiProviders[0];
    let modelName: string | undefined;

    if (model) {
      for (const p of aiProviders) {
        const foundModel = p.models?.find(m => m.id === model || m.name === model);
        if (foundModel) {
          provider = p;
          modelName = foundModel.name;
          break;
        }
      }
    }

    if (!providerManager.getProvider(provider.id)) {
      console.log(`[大文本处理] 注册AI提供商: ${provider.id} (${provider.name})`);
      providerManager.addProvider({
        id: provider.id,
        name: provider.name,
        type: provider.type as any,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || undefined,
      });
    }

    if (modelName) {
      largeTextProcessingService.setDefaultModel(modelName);
    }

    console.log('[大文本解析] 开始处理，内容长度:', content.length, '模型:', modelName || 'default');

    const result = await scriptParserService.parseScriptWithLargeText(userId, content, {
      useCache: false,
      onProgress: (progress, message) => {
        console.log(`[大文本解析] 进度: ${progress}% - ${message}`);
      }
    });

    console.log('[大文本解析] 完成', {
      scenesCount: result.scenes.length,
      charactersCount: result.characters.length
    });

    res.json({
      scenes: result.scenes,
      characters: result.characters,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('大文本解析失败:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '解析剧本失败'
    });
  }
};

export const optimizeSceneContent = async (req: Request, res: Response) => {
  try {
    const { prompt, model } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: '优化提示词不能为空' });
    }

    const aiProviders = await prisma.aIProvider.findMany({
      where: { enabled: true },
      include: { models: true },
    });

    if (aiProviders.length === 0) {
      return res.status(400).json({ error: '没有可用的 AI 提供商' });
    }

    let provider = aiProviders[0];
    let modelName: string | undefined;

    if (model) {
      for (const p of aiProviders) {
        const foundModel = p.models?.find(m => m.id === model || m.name === model);
        if (foundModel) {
          provider = p;
          modelName = foundModel.name;
          break;
        }
      }
    }

    try {
      providerManager.addProvider({
        id: provider.id,
        name: provider.name,
        type: provider.type as any,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl || undefined,
      });

      const aiProvider = providerManager.getProvider(provider.id);
      if (!aiProvider) {
        throw new Error('AI 提供商初始化失败');
      }

      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        {
          role: 'system',
          content: SCRIPT_CONTROLLER_PROMPTS.optimizeSceneContent.systemPrompt
        },
        {
          role: 'user',
          content: SCRIPT_CONTROLLER_PROMPTS.optimizeSceneContent.userPromptTemplate
            .replace('{{sceneContent}}', prompt)
        }
      ];

      const result = await aiProvider.chat(messages);
      
      const optimizedContent = result.content;

      res.json({
        success: true,
        content: optimizedContent
      });
    } catch (aiError) {
      console.error('AI 调用失败:', aiError);
      res.status(500).json({
        error: 'AI 优化失败',
        details: aiError instanceof Error ? aiError.message : '未知错误'
      });
    }
  } catch (error) {
    console.error('场景优化失败:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '场景优化失败'
    });
  }
};
