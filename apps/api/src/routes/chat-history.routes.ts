import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const router = Router();
const prismaAny = prisma as any;

router.use(authMiddleware);

router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, type, page = '1', limit = '20' } = req.query;

    const where: any = { userId };
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [sessions, total] = await Promise.all([
      prismaAny.chatSession.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prismaAny.chatSession.count({ where }),
    ]);

    res.json({
      sessions: sessions.map((s: any) => ({
        ...s,
        messageCount: s._count?.messages || 0,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Failed to get chat sessions', { error });
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { projectId, title } = req.body;

    const session = await prismaAny.chatSession.create({
      data: {
        userId,
        projectId: projectId || null,
        title: title || '新对话',
      },
    });

    res.status(201).json(session);
  } catch (error) {
    logger.error('Failed to create chat session', { error });
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const session = await prismaAny.chatSession.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    logger.error('Failed to get chat session', { error });
    res.status(500).json({ error: 'Failed to get chat session' });
  }
});

router.put('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title } = req.body;

    const session = await prismaAny.chatSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updated = await prismaAny.chatSession.update({
      where: { id },
      data: { title },
    });

    res.json(updated);
  } catch (error) {
    logger.error('Failed to update chat session', { error });
    res.status(500).json({ error: 'Failed to update chat session' });
  }
});

router.delete('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const session = await prismaAny.chatSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prismaAny.chatSession.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete chat session', { error });
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

router.get('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const session = await prismaAny.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [messages, total] = await Promise.all([
      prismaAny.chatMessage?.findMany?.({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }) || [],
      prismaAny.chatMessage?.count?.({ where: { sessionId } }) || 0,
    ]);

    res.json({
      messages,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Failed to get messages', { error });
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

router.post('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;
    const { role, content, metadata } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }

    const session = await prismaAny.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const message = await prismaAny.chatMessage?.create?.({
      data: {
        sessionId,
        role,
        content,
        metadata: metadata || {},
      },
    });

    await prismaAny.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message || {});
  } catch (error) {
    logger.error('Failed to add message', { error });
    res.status(500).json({ error: 'Failed to add message' });
  }
});

router.delete('/sessions/:sessionId/messages/:messageId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId, messageId } = req.params;

    const session = await prismaAny.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prismaAny.chatMessage?.delete?.({
      where: { id: messageId },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete message', { error });
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

router.post('/sessions/:sessionId/clear', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;

    const session = await prismaAny.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prismaAny.chatMessage?.deleteMany?.({
      where: { sessionId },
    });

    res.json({ success: true, message: 'Messages cleared' });
  } catch (error) {
    logger.error('Failed to clear messages', { error });
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

export default router;
