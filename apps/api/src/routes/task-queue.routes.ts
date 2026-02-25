import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { renderQueueService } from '../services/render-queue.service';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const router = Router();

router.use(authMiddleware);

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await renderQueueService.getQueueStatus();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get queue status', { error });
    res.status(500).json({ error: 'Failed to get queue status' });
  }
});

router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { status, type, projectId, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }
    if (type) {
      where.type = Array.isArray(type) ? { in: type } : type;
    }
    if (projectId) {
      where.projectId = projectId;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [tasks, total] = await Promise.all([
      prisma.renderTask.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.renderTask.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Failed to get tasks', { error });
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

router.get('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const task = await prisma.renderTask.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    logger.error('Failed to get task', { error });
    res.status(500).json({ error: 'Failed to get task' });
  }
});

router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { type, params, projectId, priority = 5 } = req.body;

    if (!type || !params || !projectId) {
      return res.status(400).json({ error: 'Missing required fields: type, params, projectId' });
    }

    const taskId = await renderQueueService.addTask(type, params, projectId, priority);

    res.status(201).json({
      taskId,
      status: 'pending',
      message: 'Task added to queue',
    });
  } catch (error) {
    logger.error('Failed to add task', { error });
    res.status(500).json({ error: 'Failed to add task' });
  }
});

router.post('/tasks/:id/pause', async (req: Request, res: Response) => {
  try {
    await renderQueueService.pauseTask(req.params.id);
    res.json({ success: true, message: 'Task paused' });
  } catch (error) {
    logger.error('Failed to pause task', { error });
    res.status(500).json({ error: 'Failed to pause task' });
  }
});

router.post('/tasks/:id/resume', async (req: Request, res: Response) => {
  try {
    await renderQueueService.resumeTask(req.params.id);
    res.json({ success: true, message: 'Task resumed' });
  } catch (error) {
    logger.error('Failed to resume task', { error });
    res.status(500).json({ error: 'Failed to resume task' });
  }
});

router.post('/tasks/:id/cancel', async (req: Request, res: Response) => {
  try {
    await renderQueueService.cancelTask(req.params.id);
    res.json({ success: true, message: 'Task cancelled' });
  } catch (error) {
    logger.error('Failed to cancel task', { error });
    res.status(500).json({ error: 'Failed to cancel task' });
  }
});

router.post('/tasks/:id/retry', async (req: Request, res: Response) => {
  try {
    await renderQueueService.retryTask(req.params.id);
    res.json({ success: true, message: 'Task queued for retry' });
  } catch (error) {
    logger.error('Failed to retry task', { error });
    res.status(500).json({ error: 'Failed to retry task' });
  }
});

router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    await prisma.renderTask.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    logger.error('Failed to delete task', { error });
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.delete('/tasks/completed', async (req: Request, res: Response) => {
  try {
    const result = await prisma.renderTask.deleteMany({
      where: { status: 'completed' },
    });
    res.json({ success: true, deleted: result.count });
  } catch (error) {
    logger.error('Failed to clear completed tasks', { error });
    res.status(500).json({ error: 'Failed to clear completed tasks' });
  }
});

router.delete('/tasks/failed', async (req: Request, res: Response) => {
  try {
    const result = await prisma.renderTask.deleteMany({
      where: { status: 'failed' },
    });
    res.json({ success: true, deleted: result.count });
  } catch (error) {
    logger.error('Failed to clear failed tasks', { error });
    res.status(500).json({ error: 'Failed to clear failed tasks' });
  }
});

router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const tasks = await renderQueueService.getProjectQueue(req.params.projectId);
    res.json(tasks);
  } catch (error) {
    logger.error('Failed to get project queue', { error });
    res.status(500).json({ error: 'Failed to get project queue' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTasks,
      pendingTasks,
      processingTasks,
      completedTasksToday,
      failedTasksToday,
      avgProcessingTime,
    ] = await Promise.all([
      prisma.renderTask.count(),
      prisma.renderTask.count({ where: { status: 'pending' } }),
      prisma.renderTask.count({ where: { status: 'processing' } }),
      prisma.renderTask.count({
        where: { status: 'completed', completedAt: { gte: today } },
      }),
      prisma.renderTask.count({
        where: { status: 'failed', updatedAt: { gte: today } },
      }),
      prisma.renderTask.aggregate({
        where: {
          status: 'completed',
          startedAt: { not: null },
          completedAt: { not: null },
        },
        _avg: {
          processingTime: true,
        },
      }),
    ]);

    res.json({
      total: totalTasks,
      pending: pendingTasks,
      processing: processingTasks,
      completedToday: completedTasksToday,
      failedToday: failedTasksToday,
      avgProcessingTime: avgProcessingTime._avg.processingTime || 0,
    });
  } catch (error) {
    logger.error('Failed to get task stats', { error });
    res.status(500).json({ error: 'Failed to get task stats' });
  }
});

export default router;
