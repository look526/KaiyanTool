import { Router } from 'express';
import { storyboardAgent } from '../agents/storyboard-agent.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/storyboard', async (req, res) => {
  try {
    const result = await storyboardAgent.generateStoryboard({
      outlineId: req.body.outlineId,
      episodeId: req.body.episodeId,
      style: req.body.style,
      targetAspectRatio: req.body.targetAspectRatio,
      shotStyle: req.body.shotStyle
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/storyboard/save', async (req, res) => {
  try {
    const shotIds = await storyboardAgent.saveStoryboard(
      req.body.projectId,
      req.body.storyboard
    );
    res.json({ shotIds });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Save failed' });
  }
});

router.get('/export/:projectId', async (req, res) => {
  try {
    const format = req.query.format as string || 'json';
    const result = await storyboardAgent.exportToFormat(
      req.params.projectId,
      format as any
    );

    const filename = `storyboard_${req.params.projectId}.${format}`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Export failed' });
  }
});

router.post('/shot/:shotId/refine', async (req, res) => {
  try {
    const result = await storyboardAgent.refineShot(
      req.params.shotId,
      req.body.feedback
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Refinement failed' });
  }
});

router.post('/shot/:shotId/variations', async (req, res) => {
  try {
    const result = await storyboardAgent.generateVariations(
      req.params.shotId,
      req.body.count || 4
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/transition', async (req, res) => {
  try {
    const result = await storyboardAgent.generateTransition(
      req.body.fromShotId,
      req.body.toShotId,
      req.body.transitionType
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

export default router;
