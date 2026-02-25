import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { MultiAgentOrchestrator } from '../agents/multi-agent';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

router.post('/workflow', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, workflow = ['story', 'outline', 'director', 'storyboard'] } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const taskId = `workflow-${Date.now()}`;
    const orchestrator = new MultiAgentOrchestrator(projectId, taskId, userId);

    res.json({
      taskId,
      status: 'started',
      workflow,
    });

    orchestrator.runWorkflow(workflow).catch(error => {
      logger.error('Workflow failed', { error, taskId });
    });
  } catch (error) {
    logger.error('Failed to start workflow', { error });
    res.status(500).json({ error: 'Failed to start workflow' });
  }
});

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, agent, message } = req.body;

    if (!projectId || !agent || !message) {
      return res.status(400).json({ error: 'projectId, agent, and message are required' });
    }

    const taskId = `chat-${Date.now()}`;
    const orchestrator = new MultiAgentOrchestrator(projectId, taskId, userId);

    const response = await orchestrator.chat(agent, message);

    res.json({
      agent,
      response,
    });
  } catch (error) {
    logger.error('Failed to chat with agent', { error });
    res.status(500).json({ error: 'Failed to chat with agent' });
  }
});

router.post('/story/generate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, input } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const taskId = `story-${Date.now()}`;
    const orchestrator = new MultiAgentOrchestrator(projectId, taskId, userId);

    const response = await orchestrator.chat('story', input || '请分析小说原文，生成故事线。');

    res.json({
      taskId,
      agent: 'story',
      result: response,
    });
  } catch (error) {
    logger.error('Failed to generate story', { error });
    res.status(500).json({ error: 'Failed to generate story' });
  }
});

router.post('/outline/generate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, storyline } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const taskId = `outline-${Date.now()}`;
    const orchestrator = new MultiAgentOrchestrator(projectId, taskId, userId);

    const input = storyline
      ? `请根据以下故事线生成详细大纲：\n${JSON.stringify(storyline, null, 2)}`
      : '请根据现有故事线生成详细大纲。';

    const response = await orchestrator.chat('outline', input);

    res.json({
      taskId,
      agent: 'outline',
      result: response,
    });
  } catch (error) {
    logger.error('Failed to generate outline', { error });
    res.status(500).json({ error: 'Failed to generate outline' });
  }
});

router.post('/storyboard/generate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, outline } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const taskId = `storyboard-${Date.now()}`;
    const orchestrator = new MultiAgentOrchestrator(projectId, taskId, userId);

    const input = outline
      ? `请根据以下大纲生成分镜：\n${JSON.stringify(outline, null, 2)}`
      : '请根据现有大纲生成分镜。';

    const response = await orchestrator.chat('storyboard', input);

    res.json({
      taskId,
      agent: 'storyboard',
      result: response,
    });
  } catch (error) {
    logger.error('Failed to generate storyboard', { error });
    res.status(500).json({ error: 'Failed to generate storyboard' });
  }
});

router.post('/director/review', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, storyline, outline } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const taskId = `review-${Date.now()}`;
    const orchestrator = new MultiAgentOrchestrator(projectId, taskId, userId);

    const input = `请审核以下故事线和大纲：
故事线：${storyline ? JSON.stringify(storyline, null, 2) : '请从数据库获取'}
大纲：${outline ? JSON.stringify(outline, null, 2) : '请从数据库获取'}`;

    const response = await orchestrator.chat('director', input);

    res.json({
      taskId,
      agent: 'director',
      result: response,
    });
  } catch (error) {
    logger.error('Failed to review', { error });
    res.status(500).json({ error: 'Failed to review' });
  }
});

router.get('/agents', (_req: Request, res: Response) => {
  res.json({
    agents: [
      {
        id: 'story',
        name: '故事师',
        description: '分析小说原文，生成故事线',
        capabilities: ['分析原文', '提取故事线', '识别角色'],
      },
      {
        id: 'outline',
        name: '大纲师',
        description: '根据故事线生成详细大纲',
        capabilities: ['生成大纲', '设计情节', '规划节奏'],
      },
      {
        id: 'director',
        name: '导演',
        description: '审核故事线和大纲，提出修改建议',
        capabilities: ['审核内容', '提出建议', '风格把控'],
      },
      {
        id: 'storyboard',
        name: '分镜师',
        description: '根据大纲生成分镜脚本',
        capabilities: ['生成分镜', '设计镜头', '编写提示词'],
      },
    ],
    workflows: [
      {
        id: 'full',
        name: '完整流程',
        steps: ['story', 'outline', 'director', 'storyboard'],
        description: '从小说到分镜的完整流程',
      },
      {
        id: 'quick',
        name: '快速流程',
        steps: ['story', 'outline'],
        description: '仅生成故事线和大纲',
      },
      {
        id: 'storyboard-only',
        name: '仅分镜',
        steps: ['storyboard'],
        description: '仅生成分镜',
      },
    ],
  });
});

export default router;
