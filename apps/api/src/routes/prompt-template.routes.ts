import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, category, project_id } = req.query;

    const where: any = {
      OR: [
        { user_id: null, project_id: null },
        { user_id: userId },
      ],
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (project_id) {
      where.OR.push({ project_id: project_id as string });
    }

    const templates = await prisma.promptTemplate.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    res.json(templates);
  } catch (error) {
    logger.error('Failed to get prompt templates', { error });
    res.status(500).json({ error: 'Failed to get prompt templates' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.promptTemplate.findMany({
      where: { category: { not: null } },
      select: { category: true, type: true },
      distinct: ['category'],
    });

    const groupedCategories = categories.reduce((acc: any, item) => {
      const cat = item.category || 'general';
      if (!acc[cat]) acc[cat] = { name: cat, types: [] };
      if (item.type && !acc[cat].types.includes(item.type)) {
        acc[cat].types.push(item.type);
      }
      return acc;
    }, {});

    res.json(Object.values(groupedCategories));
  } catch (error) {
    logger.error('Failed to get categories', { error });
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { code } = req.params;

    const template = await prisma.promptTemplate.findFirst({
      where: {
        code,
        OR: [
          { user_id: null, project_id: null },
          { user_id: userId },
        ],
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    logger.error('Failed to get prompt template', { error });
    res.status(500).json({ error: 'Failed to get prompt template' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      code,
      name,
      type = 'general',
      category,
      default_value,
      custom_value,
      parent_code,
      description,
      variables,
      project_id,
    } = req.body;

    if (!code || !name || !default_value) {
      return res.status(400).json({ error: 'code, name, and default_value are required' });
    }

    const existing = await prisma.promptTemplate.findUnique({
      where: { code },
    });

    if (existing) {
      return res.status(400).json({ error: 'Template with this code already exists' });
    }

    const template = await prisma.promptTemplate.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        project_id: project_id || null,
        code,
        name,
        type,
        category: category || null,
        default_value,
        custom_value: custom_value || null,
        parent_code: parent_code || null,
        description: description || null,
        variables: variables || [],
        is_active: true,
        updated_at: new Date(),
      },
    });

    res.status(201).json(template);
  } catch (error) {
    logger.error('Failed to create prompt template', { error });
    res.status(500).json({ error: 'Failed to create prompt template' });
  }
});

router.put('/:code', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { code } = req.params;
    const {
      name,
      type,
      category,
      default_value,
      custom_value,
      parent_code,
      description,
      variables,
      is_active,
    } = req.body;

    const template = await prisma.promptTemplate.findFirst({
      where: { code, user_id: userId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found or not owned by user' });
    }

    const updated = await prisma.promptTemplate.update({
      where: { id: template.id },
      data: {
        name,
        type,
        category,
        default_value,
        custom_value,
        parent_code: parent_code,
        description,
        variables,
        is_active: is_active,
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error('Failed to update prompt template', { error });
    res.status(500).json({ error: 'Failed to update prompt template' });
  }
});

router.delete('/:code', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { code } = req.params;

    const template = await prisma.promptTemplate.findFirst({
      where: { code, user_id: userId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found or not owned by user' });
    }

    await prisma.promptTemplate.delete({
      where: { id: template.id },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete prompt template', { error });
    res.status(500).json({ error: 'Failed to delete prompt template' });
  }
});

router.post('/:code/render', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { code } = req.params;
    const { variables = {} } = req.body;

    const template = await prisma.promptTemplate.findFirst({
      where: {
        code,
        OR: [
          { user_id: null, project_id: null },
          { user_id: userId },
        ],
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const value = template.custom_value || template.default_value;

    let rendered = value;
    Object.entries(variables).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(val));
    });

    res.json({
      code,
      original: value,
      rendered,
      variables,
    });
  } catch (error) {
    logger.error('Failed to render prompt template', { error });
    res.status(500).json({ error: 'Failed to render prompt template' });
  }
});

router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const defaultTemplates = [
      {
        code: 'story_outline',
        name: '故事大纲生成',
        type: 'story',
        category: 'outline',
        default_value: `请根据以下小说内容生成故事大纲：

小说内容：
{{content}}

请按照以下格式输出：
1. 故事主线
2. 主要角色
3. 关键事件
4. 情感曲线`,
        description: '用于从小说内容生成故事大纲的提示词模板',
        variables: [{ name: 'content', description: '小说内容', required: true }],
      },
      {
        code: 'shot_prompt',
        name: '镜头提示词生成',
        type: 'image',
        category: 'shot',
        default_value: `{{style}}风格，{{scene}}场景，{{character}}角色，{{action}}动作，{{mood}}氛围，高质量，细节丰富，电影级光影`,
        description: '用于生成镜头图像的提示词模板',
        variables: [
          { name: 'style', description: '视觉风格', default: '电影' },
          { name: 'scene', description: '场景描述', required: true },
          { name: 'character', description: '角色描述', required: true },
          { name: 'action', description: '动作描述', default: '站立' },
          { name: 'mood', description: '氛围描述', default: '自然' },
        ],
      },
      {
        code: 'video_prompt',
        name: '视频提示词生成',
        type: 'video',
        category: 'video',
        default_value: `{{description}}，{{camera}}运镜，{{duration}}秒时长，流畅过渡，高质量视频`,
        description: '用于生成视频的提示词模板',
        variables: [
          { name: 'description', description: '场景描述', required: true },
          { name: 'camera', description: '运镜方式', default: '缓慢推进' },
          { name: 'duration', description: '时长', default: '5' },
        ],
      },
      {
        code: 'character_design',
        name: '角色设计',
        type: 'image',
        category: 'character',
        default_value: `角色设计：{{name}}，{{appearance}}，{{clothing}}服装，{{personality}}性格，{{style}}风格，全身像，白色背景，高质量角色设计稿`,
        description: '用于生成角色设计图的提示词模板',
        variables: [
          { name: 'name', description: '角色名称' },
          { name: 'appearance', description: '外貌描述', required: true },
          { name: 'clothing', description: '服装描述' },
          { name: 'personality', description: '性格特点' },
          { name: 'style', description: '画风', default: '动漫' },
        ],
      },
      {
        code: 'scene_design',
        name: '场景设计',
        type: 'image',
        category: 'scene',
        default_value: `场景设计：{{name}}，{{description}}，{{time}}时间，{{weather}}天气，{{style}}风格，全景视角，高质量场景设计`,
        description: '用于生成场景设计图的提示词模板',
        variables: [
          { name: 'name', description: '场景名称' },
          { name: 'description', description: '场景描述', required: true },
          { name: 'time', description: '时间', default: '白天' },
          { name: 'weather', description: '天气', default: '晴朗' },
          { name: 'style', description: '画风', default: '写实' },
        ],
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const template of defaultTemplates) {
      const existing = await prisma.promptTemplate.findUnique({
        where: { code: template.code },
      });

      if (!existing) {
        await prisma.promptTemplate.create({
          data: {
            id: crypto.randomUUID(),
            code: template.code,
            name: template.name,
            type: template.type,
            category: template.category,
            default_value: template.default_value,
            description: template.description,
            variables: template.variables,
            user_id: null,
            parent_code: null,
            custom_value: null,
            is_active: true,
            updated_at: new Date(),
          },
        });
        created++;
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Seeded ${created} templates, skipped ${skipped} existing`,
      created,
      skipped,
    });
  } catch (error) {
    logger.error('Failed to seed prompt templates', { error });
    res.status(500).json({ error: 'Failed to seed prompt templates' });
  }
});

export default router;
