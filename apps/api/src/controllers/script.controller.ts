import { Request, Response } from 'express';
import { providerManager } from '../services/ai/provider.manager';
import { prisma } from '../lib/prisma';

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
    const { content, context } = req.body;

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
          content: '你是一个专业的剧本作家助手。请根据提供的剧本内容，继续创作接下来的部分。保持原有的风格、人物设定和剧情节奏。'
        },
        {
          role: 'user',
          content: `请继续续写以下剧本：\n\n${content}\n\n${context ? '上下文补充：' + context : ''}\n\n请直接输出续写的内容，不需要任何额外说明。`
        }
      ];

      const result = await aiProvider.chat(messages);
      
      let continuedContent = result.content;
      if (!continuedContent) {
        continuedContent = content + '\n\n（AI 续写暂不可用，请稍后重试）';
      }

      res.json({
        success: true,
        content: content + '\n\n' + continuedContent
      });
    } catch (aiError) {
      console.error('AI 调用失败:', aiError);
      res.json({
        success: true,
        content: content + '\n\n（AI 服务暂时不可用，请检查 AI 提供商配置）'
      });
    }
  } catch (error) {
    console.error('AI续写失败:', error);
    res.status(500).json({ error: 'AI续写失败' });
  }
};

export const rewriteScript = async (req: Request, res: Response) => {
  try {
    const { content, instruction } = req.body;

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
          content: '你是一个专业的剧本编辑助手。请根据用户的要求，优化或改写提供的剧本内容。保持原有的核心情节和人物设定。'
        },
        {
          role: 'user',
          content: `请${instruction || '优化改写'}以下剧本：\n\n${content}\n\n请直接输出改写后的剧本内容，不需要任何额外说明。`
        }
      ];

      const result = await aiProvider.chat(messages);
      
      let rewrittenContent = result.content;
      if (!rewrittenContent) {
        rewrittenContent = content;
      }

      res.json({
        success: true,
        content: rewrittenContent
      });
    } catch (aiError) {
      console.error('AI 调用失败:', aiError);
      res.json({
        success: true,
        content: content
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
          content: `你是一个专业的剧本场景优化专家。你的任务是优化剧本中的场景描写，使其更加生动、具体、有画面感。
优化原则：
1. 保持原有剧情和人物设定不变
2. 增强环境细节描写（光线、声音、气味等）
3. 强化氛围渲染
4. 使对话更加自然流畅
5. 添加适当的动作和表情描写
6. 保持剧本格式规范`
        },
        {
          role: 'user',
          content: `请优化以下场景：

场景位置：${location || '未指定'}
时间：${time || '未指定'}
优化方向：${direction || '增强场景描述，使画面感更强'}

原始场景内容：
${sceneContent}

请直接输出优化后的场景内容，保持剧本格式，不需要任何额外说明。`
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
