import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { aiProviderService } from '../services/ai/provider.service';

const router = Router();

router.use(authMiddleware);

router.get('/projects/:projectId/items', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as AuthRequest).user_id;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { owner_id: userId },
          { ProjectMember: { some: { user_id: userId } } },
        ],
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const items = await prisma.item.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
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
    const userId = (req as AuthRequest).user_id;
    const { name, type, image, description, prompt } = req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { owner_id: userId },
          { ProjectMember: { some: { user_id: userId } } },
        ],
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const item = await prisma.item.create({
      data: {
        id: crypto.randomUUID(),
        project_id: projectId,
        name: String(name).trim(),
        type: type ?? null,
        image: image ?? null,
        description: description ?? null,
        prompt: prompt ?? null,
        created_at: new Date(),
        updated_at: new Date(),
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
    const userId = (req as AuthRequest).user_id;
    const { name, type, image, description, prompt } = req.body;

    const existing = await prisma.item.findFirst({
      where: {
        id,
        Project: {
          OR: [
            { owner_id: userId },
            { ProjectMember: { some: { user_id: userId } } },
          ],
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(prompt !== undefined ? { prompt } : {}),
        updated_at: new Date(),
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
    const userId = (req as AuthRequest).user_id;

    const existing = await prisma.item.findFirst({
      where: {
        id,
        Project: {
          OR: [
            { owner_id: userId },
            { ProjectMember: { some: { user_id: userId } } },
          ],
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    await prisma.item.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

router.get('/providers', async (_req: Request, res: Response) => {
  try {
    const providers = await prisma.aIProvider.findMany({
      where: {
        enabled: true,
        User: {
          role: { in: ['admin', 'super_admin'] },
        },
      } as any,
      orderBy: { created_at: 'desc' },
    });
    res.json(providers);
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

router.post('/providers/:id/chat', async (req: Request, res: Response) => {
  try {
    const { id: providerId } = req.params;
    const { messages, model } = req.body;

    const response = await aiProviderService.chat(
      providerId,
      messages,
      model
    );

    res.json(response);
  } catch (error) {
    console.error('Failed to chat:', error);
    res.status(500).json({ error: 'Failed to chat' });
  }
});

router.get('/providers/:id/models', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = await prisma.aIProvider.findUnique({ where: { id } });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const models = (provider as any).models || [];
    res.json(models);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

export default router;
