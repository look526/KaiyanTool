import { Router } from 'express';
import { analyticsService } from '../services/analytics.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const user_id = (req as any).user_id;
    const user = (req as any).user;
    const type = req.query.type as string;
    
    if (type === 'user' || type === 'usage') {
      const analytics = await analyticsService.getUserAnalytics(user_id);
      return res.json(analytics);
    }
    
    if (type === 'platform') {
      const userWithRole = await prisma.user.findUnique({
        where: { id: user_id },
        select: { role: true }
      });
      
      if (!userWithRole || (userWithRole.role !== 'admin' && userWithRole.role !== 'super_admin')) {
        return res.status(403).json({ error: '需要管理员权限' });
      }
      
      const analytics = await analyticsService.getPlatformAnalytics();
      return res.json(analytics);
    }
    
    res.status(400).json({ error: 'Invalid analytics type' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get analytics' });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const user_id = (req as any).user_id;
    const analytics = await analyticsService.getUserAnalytics(user_id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get usage analytics' });
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const analytics = await analyticsService.getProjectAnalytics(req.params.projectId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get analytics' });
  }
});

router.get('/user', async (req, res) => {
  try {
    const user_id = (req as any).user_id;
    const analytics = await analyticsService.getUserAnalytics(user_id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get user analytics' });
  }
});

router.get('/platform', async (req, res) => {
  try {
    const user_id = (req as any).user_id;
    
    const userWithRole = await prisma.user.findUnique({
      where: { id: user_id },
      select: { role: true }
    });
    
    if (!userWithRole || (userWithRole.role !== 'admin' && userWithRole.role !== 'super_admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }
    
    const analytics = await analyticsService.getPlatformAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get platform analytics' });
  }
});

router.get('/project/:projectId/generations', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const report = await analyticsService.getGenerationReport(req.params.projectId, days);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get generation report' });
  }
});

router.get('/project/:projectId/costs', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const report = await analyticsService.getCostReport(req.params.projectId, days);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get cost report' });
  }
});

router.post('/track', async (req, res) => {
  try {
    const user_id = (req as any).user_id;
    await analyticsService.trackEvent(user_id, req.body.eventType, req.body.metadata);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to track event' });
  }
});

export default router;
