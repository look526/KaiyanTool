import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { scriptParserService } from '../services/script/script-parser.service';
import { largeTextProcessingService } from '../services/large-text';
import { SCRIPT_CONTROLLER_PROMPTS } from '../prompts/services';
import { AIProviderHelper } from '../services/ai/provider-helper.service';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import logger from '../lib/logger';

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

export const parseScript = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    throw AppError.badRequest('剧本内容不能为空');
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
});

export const saveScript = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, title, content } = req.body;

  if (!projectId || !title || !content) {
    throw AppError.badRequest('缺少必要参数');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw AppError.notFound('项目不存在');
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: title,
      description: content.substring(0, 500),
    },
  });

  logger.info('Script saved', { projectId, title });
  res.json({ success: true, project: updatedProject });
});

export const getScript = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId as string },
  });

  if (!project) {
    throw AppError.notFound('项目不存在');
  }

  res.json({
    title: project.name,
    content: project.description || '',
  });
});

export const continueScript = asyncHandler(async (req: Request, res: Response) => {
  const { content, context, model } = req.body;
  const user_id = req.user_id;

  if (!content || typeof content !== 'string') {
    throw AppError.badRequest('剧本内容不能为空');
  }

  const { aiProvider, modelName, providerId } = await AIProviderHelper.getProvider(user_id, model);

  logger.info('Continue script request', { 
    user_id, 
    providerId, 
    modelName, 
    contentLength: content.length 
  });

  const messages = [
    {
      role: 'system' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.continueScript.systemPrompt
    },
    {
      role: 'user' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.continueScript.userPromptTemplate
        .replace('{{existingContent}}', content)
        .replace('{{wordCount}}', '500')
        .replace('{{context}}', context ? '上下文补充：' + context : '')
    }
  ];

  const result = await aiProvider.chat(messages, modelName ? { model: modelName } : undefined);
  
  if (!result.content) {
    throw AppError.internal('AI返回内容为空');
  }

  res.json({
    success: true,
    content: content + '\n\n' + result.content,
    truncated: result.truncated
  });
});

export const rewriteScript = asyncHandler(async (req: Request, res: Response) => {
  const { content, instruction, model } = req.body;
  const user_id = req.user_id;

  if (!content || typeof content !== 'string') {
    throw AppError.badRequest('剧本内容不能为空');
  }

  const { aiProvider, modelName, providerId } = await AIProviderHelper.getProvider(user_id, model);

  logger.info('Rewrite script request', { 
    user_id, 
    providerId, 
    modelName, 
    contentLength: content.length,
    hasInstruction: !!instruction
  });

  const messages = [
    {
      role: 'system' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.rewriteScript.systemPrompt
    },
    {
      role: 'user' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.rewriteScript.userPromptTemplate
        .replace('{{originalContent}}', content)
        .replace('{{requirements}}', instruction || '创意改编，保持故事核心精神')
    }
  ];

  const result = await aiProvider.chat(messages, modelName ? { model: modelName } : undefined);
  
  if (!result.content) {
    throw AppError.internal('AI返回内容为空');
  }

  res.json({
    success: true,
    content: result.content,
    truncated: result.truncated
  });
});

export const optimizeScene = asyncHandler(async (req: Request, res: Response) => {
  const { sceneContent, location, direction } = req.body;
  const user_id = req.user_id;

  if (!sceneContent || typeof sceneContent !== 'string') {
    throw AppError.badRequest('场景内容不能为空');
  }

  const { aiProvider, providerId } = await AIProviderHelper.getProvider(user_id);

  logger.info('Optimize scene request', { 
    user_id, 
    providerId, 
    location,
    hasDirection: !!direction
  });

  const messages = [
    {
      role: 'system' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.optimizeScene.systemPrompt
    },
    {
      role: 'user' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.optimizeScene.userPromptTemplate
        .replace('{{title}}', location || '未指定')
        .replace('{{description}}', sceneContent)
        .replace('{{characters}}', '未指定')
        .replace('{{optimizationDirection}}', direction || '增强场景描述，使画面感更强')
    }
  ];

  try {
    const result = await aiProvider.chat(messages);
    
    res.json({
      success: true,
      suggestion: result.content || sceneContent,
      optimized: result.content || sceneContent
    });
  } catch (aiError) {
    logger.warn('AI optimization failed, returning original content', { 
      user_id, 
      error: aiError instanceof Error ? aiError.message : String(aiError)
    });
    res.json({
      success: true,
      suggestion: sceneContent,
      optimized: sceneContent
    });
  }
});

export const parseScriptWithAI = asyncHandler(async (req: Request, res: Response) => {
  const { content, model } = req.body;
  const user_id = req.user_id;

  if (!content || typeof content !== 'string') {
    throw AppError.badRequest('剧本内容不能为空');
  }

  if (!user_id) {
    throw AppError.unauthorized();
  }

  const { modelName, providerId } = await AIProviderHelper.getProviderForUser(user_id, model);

  logger.info('Parse script with AI request', { 
    user_id, 
    providerId, 
    modelName, 
    contentLength: content.length 
  });

  if (modelName) {
    largeTextProcessingService.setDefaultModel(modelName);
  }

  const result = await scriptParserService.parseScriptWithLargeText(user_id, content, {
    useCache: false,
    onProgress: (progress, message) => {
      logger.debug('Script parsing progress', { user_id, progress, message });
    },
    model: modelName,
    providerId: providerId
  });

  logger.info('Script parsing completed', { 
    user_id, 
    scenesCount: result.scenes.length,
    charactersCount: result.characters.length,
    itemsCount: result.items?.length || 0
  });

  console.log('[Script Controller] result.items:', result.items);
  console.log('[Script Controller] result.items length:', result.items?.length);

  res.json({
    scenes: result.scenes,
    characters: result.characters,
    items: result.items || [],
    metadata: result.metadata
  });
});

export const optimizeSceneContent = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, model } = req.body;
  const user_id = req.user_id;

  if (!prompt || typeof prompt !== 'string') {
    throw AppError.badRequest('优化提示词不能为空');
  }

  const { aiProvider, modelName, providerId } = await AIProviderHelper.getProvider(user_id, model);

  logger.info('Optimize scene content request', { 
    user_id, 
    providerId, 
    modelName, 
    promptLength: prompt.length 
  });

  const messages = [
    {
      role: 'system' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.optimizeSceneContent.systemPrompt
    },
    {
      role: 'user' as const,
      content: SCRIPT_CONTROLLER_PROMPTS.optimizeSceneContent.userPromptTemplate
        .replace('{{sceneContent}}', prompt)
    }
  ];

  const result = await aiProvider.chat(messages, modelName ? { model: modelName } : undefined);

  res.json({
    success: true,
    content: result.content
  });
});
