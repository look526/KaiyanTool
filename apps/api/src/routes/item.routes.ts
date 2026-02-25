import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { aiProviderService } from '../services/ai/provider.service';

const prisma = new PrismaClient();
const router = Router();

router.use(authMiddleware);

router.get('/projects/:projectId/items', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const items = await prisma.item.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.post('/projects/:projectId/items', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, type, image, description, prompt } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const item = await prisma.item.create({
      data: {
        projectId,
        name: name.trim(),
        type: type || 'prop',
        image: image || null,
        description: description || null,
        prompt: prompt || null,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Failed to create item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, image, description, prompt } = req.body;

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: name?.trim(),
        type,
        image,
        description,
        prompt,
      },
    });

    res.json(item);
  } catch (error) {
    console.error('Failed to update item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.item.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

router.post('/projects/:projectId/items/generate', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const currentUser = req.user?.id;

    if (!currentUser) {
      return res.status(401).json({ error: '未授权' });
    }

    const script = await prisma.script.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    if (!script || !script.content) {
      return res.status(400).json({ error: '该项目没有剧本内容' });
    }

    const provider = await prisma.aIProvider.findFirst({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (!provider) {
      return res.status(400).json({ error: '没有可用的AI提供商' });
    }

    const prompt = `请从以下剧本内容中提取所有出现的物品（包括道具、服装、武器、装饰品等），并为每个物品生成详细的视觉描述。

要求：
1. 从剧本中提取所有具体提到的物品名称
2. 每个物品需要包含：名称、类型（prop/clothing/weapon/decoration等）、详细视觉描述
3. 描述要具体、可视化，便于生成图像
4. 只返回剧本中明确提到的物品，不要自己添加

剧本内容：
${script.content}

请以JSON数组格式返回，格式如下：
[
  {
    "name": "物品名称",
    "type": "物品类型",
    "description": "详细视觉描述"
  }
]`;

    const response = await aiProviderService.chat(provider.id, [
      { role: 'user', content: prompt }
    ]);

    let itemsData: Array<{ name: string; type: string; description: string }> = [];
    
    try {
      const content = response.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        itemsData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ error: 'AI返回格式解析失败' });
    }

    const createdItems = [];
    for (const itemData of itemsData) {
      if (itemData.name && itemData.description) {
        const item = await prisma.item.create({
          data: {
            projectId,
            name: itemData.name.trim(),
            type: itemData.type || 'prop',
            description: itemData.description.trim(),
            prompt: itemData.description.trim(),
          },
        });
        createdItems.push(item);
      }
    }

    res.json({ 
      message: `成功从剧本中提取并创建 ${createdItems.length} 个物品`,
      items: createdItems 
    });
  } catch (error) {
    console.error('Failed to generate items:', error);
    res.status(500).json({ error: '生成物品失败' });
  }
});

export default router;
