import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiProviderService } from '../services/ai/provider.service';
import { prisma } from '../lib/prisma';
import { emitProgress, emitStreamChunk, emitTaskComplete, emitTaskError } from '../lib/websocket';
import logger from '../lib/logger';
import { AIChatMessage } from '../types/ai.types';

const router = Router();

router.use(authMiddleware);

interface StreamContext {
  projectId: string;
  taskId: string;
  userId: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

router.post('/outline/stream', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, message, history = [] } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const taskId = `outline-${Date.now()}`;

    res.json({
      taskId,
      status: 'started',
      message: 'Outline generation started',
    });

    const context: StreamContext = {
      projectId,
      taskId,
      userId,
      conversationHistory: history,
    };

    await runOutlineAgentStream(context, message);
  } catch (error) {
    logger.error('Failed to start outline stream', { error });
    res.status(500).json({ error: 'Failed to start outline stream' });
  }
});

router.post('/storyboard/stream', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, outlineId, message, history = [] } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const taskId = `storyboard-${Date.now()}`;

    res.json({
      taskId,
      status: 'started',
      message: 'Storyboard generation started',
    });

    const context: StreamContext = {
      projectId,
      taskId,
      userId,
      conversationHistory: history,
    };

    await runStoryboardAgentStream(context, outlineId, message);
  } catch (error) {
    logger.error('Failed to start storyboard stream', { error });
    res.status(500).json({ error: 'Failed to start storyboard stream' });
  }
});

router.post('/chat/stream', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, message, systemPrompt, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const taskId = `chat-${Date.now()}`;

    res.json({
      taskId,
      status: 'started',
      message: 'Chat started',
    });

    const context: StreamContext = {
      projectId: projectId || 'global',
      taskId,
      userId,
      conversationHistory: history,
    };

    await runChatStream(context, message, systemPrompt);
  } catch (error) {
    logger.error('Failed to start chat stream', { error });
    res.status(500).json({ error: 'Failed to start chat stream' });
  }
});

async function runOutlineAgentStream(context: StreamContext, userMessage: string) {
  const { projectId, taskId } = context;

  try {
    emitProgress(projectId, taskId, 0, '开始生成大纲...');

    const systemPrompt = `你是一个专业的剧本大纲师AI助手。你的任务是：
1. 分析用户提供的小说或故事内容
2. 提取主要角色、场景和关键事件
3. 生成结构化的剧集大纲
4. 确保故事逻辑连贯、节奏合理

你可以使用以下工具：
- getChapter: 获取小说章节内容
- saveStoryline: 保存故事线
- saveOutline: 保存大纲
- getCharacters: 获取角色列表
- generateAssets: 从大纲提取生成角色/场景/道具

返回格式要求：
{
  "episodes": [
    {
      "episodeIndex": 1,
      "title": "第X集标题",
      "chapterRange": [1, 5],
      "coreConflict": "核心矛盾",
      "outline": "剧情主干",
      "keyEvents": { "起": "", "承": "", "转": "", "合": "" },
      "scenes": [],
      "characters": [],
      "props": []
    }
  ]
}`;

    const messages: AIChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory.map(h => ({ role: h.role as 'user' | 'assistant' | 'system', content: h.content })),
      { role: 'user', content: userMessage },
    ];

    emitProgress(projectId, taskId, 20, '正在分析内容...');

    const response: any = await aiProviderService.streamChat(
      'default',
      messages,
      undefined,
      (chunk: string) => {
        emitStreamChunk(projectId, taskId, chunk, false);
      }
    );

    emitProgress(projectId, taskId, 80, '正在解析结果...');

    const parsedResult = parseJsonResponse(response.content || response);

    if (parsedResult.storyline) {
      const existing = await prisma.storyline.findFirst({ where: { projectId } });
      if (existing) {
        await prisma.storyline.update({
          where: { id: existing.id },
          data: { content: parsedResult.storyline } as any,
        });
      } else {
        await prisma.storyline.create({
          data: { projectId, content: parsedResult.storyline } as any,
        });
      }
    }

    if (parsedResult.episodes) {
      const existingOutline = await prisma.outline.findFirst({ where: { projectId } });
      if (existingOutline) {
        await prisma.outline.update({
          where: { id: existingOutline.id },
          data: { content: parsedResult } as any,
        });
      } else {
        await prisma.outline.create({
          data: { projectId, content: parsedResult } as any,
        });
      }
    }

    emitStreamChunk(projectId, taskId, '', true);
    emitProgress(projectId, taskId, 100, '大纲生成完成');
    emitTaskComplete(projectId, taskId, parsedResult);
  } catch (error) {
    logger.error('Outline agent stream failed', { error, taskId });
    emitTaskError(projectId, taskId, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runStoryboardAgentStream(context: StreamContext, outlineId: string | undefined, userMessage: string) {
  const { projectId, taskId } = context;

  try {
    emitProgress(projectId, taskId, 0, '开始生成分镜...');

    let outline: any = null;
    if (outlineId) {
      const outlineDoc = await prisma.outline.findFirst({
        where: { id: outlineId, projectId },
      });
      outline = outlineDoc?.content;
    } else {
      const outlineDoc = await prisma.outline.findFirst({
        where: { projectId },
      });
      outline = outlineDoc?.content;
    }

    const systemPrompt = `你是一个专业的分镜师AI助手。你的任务是：
1. 根据大纲内容设计镜头
2. 编写视觉提示词（Midjourney/SD格式）
3. 设计运镜和时长
4. 确保视觉连贯性

返回格式要求：
{
  "shots": [
    {
      "sequence": 1,
      "type": "wide/medium/closeup",
      "description": "镜头描述",
      "prompt": "AI图像生成提示词",
      "negativePrompt": "负面提示词",
      "duration": 3,
      "camera": { "movement": "", "angle": "", "distance": "" },
      "dialogue": "",
      "action": ""
    }
  ],
  "totalDuration": 120,
  "styleGuide": { "visualStyle": "", "colorPalette": [], "lighting": "", "mood": "" }
}`;

    const messages: AIChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory.map(h => ({ role: h.role as 'user' | 'assistant' | 'system', content: h.content })),
      { role: 'user', content: `大纲内容：\n${JSON.stringify(outline, null, 2)}\n\n用户要求：${userMessage}` },
    ];

    emitProgress(projectId, taskId, 20, '正在分析大纲...');

    const response: any = await aiProviderService.streamChat(
      'default',
      messages,
      undefined,
      (chunk: string) => {
        emitStreamChunk(projectId, taskId, chunk, false);
      }
    );

    emitProgress(projectId, taskId, 80, '正在保存分镜...');

    const parsedResult = parseJsonResponse(response.content || response);

    if (parsedResult.shots && Array.isArray(parsedResult.shots)) {
      for (const shot of parsedResult.shots) {
        await prisma.shot.create({
          data: {
            projectId,
            actionSummary: shot.description || '',
            startPrompt: shot.prompt || '',
            duration: shot.duration || 5,
            cameraMovement: shot.camera?.movement || null,
          },
        });
      }
    }

    emitStreamChunk(projectId, taskId, '', true);
    emitProgress(projectId, taskId, 100, '分镜生成完成');
    emitTaskComplete(projectId, taskId, parsedResult);
  } catch (error) {
    logger.error('Storyboard agent stream failed', { error, taskId });
    emitTaskError(projectId, taskId, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runChatStream(context: StreamContext, userMessage: string, systemPrompt?: string) {
  const { projectId, taskId } = context;

  try {
    emitProgress(projectId, taskId, 0, '开始对话...');

    const messages: AIChatMessage[] = [
      { role: 'system', content: systemPrompt || '你是一个专业的AI助手，帮助用户进行视频创作。' },
      ...context.conversationHistory.map(h => ({ role: h.role as 'user' | 'assistant' | 'system', content: h.content })),
      { role: 'user', content: userMessage },
    ];

    emitProgress(projectId, taskId, 20, '正在思考...');

    const response: any = await aiProviderService.streamChat(
      'default',
      messages,
      undefined,
      (chunk: string) => {
        emitStreamChunk(projectId, taskId, chunk, false);
      }
    );

    emitStreamChunk(projectId, taskId, '', true);
    emitProgress(projectId, taskId, 100, '对话完成');
    emitTaskComplete(projectId, taskId, { response });
  } catch (error) {
    logger.error('Chat stream failed', { error, taskId });
    emitTaskError(projectId, taskId, error instanceof Error ? error.message : 'Unknown error');
  }
}

function parseJsonResponse(content: string): any {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { raw: content };
  } catch {
    return { raw: content };
  }
}

export default router;
