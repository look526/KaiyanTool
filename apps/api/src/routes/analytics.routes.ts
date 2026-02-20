import { Router } from 'express';
import { analyticsService } from '../services/analytics.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

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
    const userId = (req as any).user.id;
    const analytics = await analyticsService.getUserAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get user analytics' });
  }
});

router.get('/platform', async (_req, res) => {
  try {
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
    const userId = (req as any).user.id;
    await analyticsService.trackEvent(userId, req.body.eventType, req.body.metadata);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to track event' });
  }
});

export default router;
