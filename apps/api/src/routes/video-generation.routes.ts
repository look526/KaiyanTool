import { Router } from 'express';
import { generateVideo, interpolateFrames } from '../services/video-generation.service';
import { renderQueueService } from '../services/render-queue.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/generate', async (req, res) => {
  try {
    const result = await generateVideo({
      startFrameId: req.body.startFrameId,
      endFrameId: req.body.endFrameId,
      prompt: req.body.prompt,
      duration: req.body.duration,
      projectId: req.body.projectId,
      shotId: req.body.shotId
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Video generation failed' });
  }
});

router.post('/interpolate', async (req, res) => {
  try {
    const result = await interpolateFrames(
      req.body.startFrameId,
      req.body.endFrameId,
      req.body.projectId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Interpolation failed' });
  }
});

router.get('/queue', async (req, res) => {
  try {
    const status = await renderQueueService.getQueueStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get queue' });
  }
});

router.get('/queue/project/:projectId', async (req, res) => {
  try {
    const tasks = await renderQueueService.getProjectQueue(req.params.projectId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get project queue' });
  }
});

router.post('/queue/:taskId/pause', async (req, res) => {
  try {
    await renderQueueService.pauseTask(req.params.taskId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to pause task' });
  }
});

router.post('/queue/:taskId/resume', async (req, res) => {
  try {
    await renderQueueService.resumeTask(req.params.taskId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to resume task' });
  }
});

router.post('/queue/:taskId/cancel', async (req, res) => {
  try {
    await renderQueueService.cancelTask(req.params.taskId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to cancel task' });
  }
});

export default router;
