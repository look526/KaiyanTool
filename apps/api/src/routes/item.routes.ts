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
    const items = await (prisma as any).item?.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
    }) || [];
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
      return res.status(400).json({ error: 'Name is required' });
    }

    const item = await (prisma as any).item?.create({
      data: { name, type, image, description, prompt, project_id: projectId },
    });
    res.json(item);
  } catch (error) {
    console.error('Failed to create item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, image, description, prompt } = req.body;

    const item = await (prisma as any).item?.update({
      where: { id },
      data: { name, type, image, description, prompt },
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
    await (prisma as any).item?.delete({
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
      where: { enabled: true } as any,
      orderBy: { name: 'asc' } as any,
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
