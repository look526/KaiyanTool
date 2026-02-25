import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const router = Router();

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
      prisma.chatSession.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prisma.chatSession.count({ where }),
    ]);

    res.json({
      sessions: sessions.map(s => ({
        ...s,
        messageCount: s._count.messages,
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
    const { projectId, type = 'general', title, context } = req.body;

    const session = await prisma.chatSession.create({
      data: {
        userId,
        projectId: projectId || null,
        type,
        title: title || '新对话',
        context: context || {},
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

    const session = await prisma.chatSession.findFirst({
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
    const { title, context } = req.body;

    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: { title, context },
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

    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.chatSession.delete({
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

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      prisma.chatMessage.count({ where: { sessionId } }),
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

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        metadata: metadata || {},
      },
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (error) {
    logger.error('Failed to add message', { error });
    res.status(500).json({ error: 'Failed to add message' });
  }
});

router.delete('/sessions/:sessionId/messages/:messageId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId, messageId } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.chatMessage.delete({
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

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.chatMessage.deleteMany({
      where: { sessionId },
    });

    res.json({ success: true, message: 'Messages cleared' });
  } catch (error) {
    logger.error('Failed to clear messages', { error });
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

router.post('/sessions/:sessionId/export', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;
    const { format = 'json' } = req.body;

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(session, null, 2);
        contentType = 'application/json';
        filename = `chat_${sessionId}.json`;
        break;
      case 'markdown':
      case 'md':
        exportData = `# ${session.title}\n\n`;
        exportData += `Type: ${session.type}\n`;
        exportData += `Created: ${session.createdAt}\n\n---\n\n`;
        session.messages.forEach((msg: any) => {
          exportData += `**${msg.role.toUpperCase()}** (${msg.createdAt})\n\n${msg.content}\n\n---\n\n`;
        });
        contentType = 'text/markdown';
        filename = `chat_${sessionId}.md`;
        break;
      case 'txt':
        exportData = `${session.title}\n${'='.repeat(session.title.length)}\n\n`;
        session.messages.forEach((msg: any) => {
          exportData += `[${msg.role.toUpperCase()}] ${msg.createdAt}\n${msg.content}\n\n`;
        });
        contentType = 'text/plain';
        filename = `chat_${sessionId}.txt`;
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    logger.error('Failed to export session', { error });
    res.status(500).json({ error: 'Failed to export session' });
  }
});

export default router;
