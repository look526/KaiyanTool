import { Router } from 'express';
import { outlineAgent } from '../agents/outline-agent';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/outline', async (req, res) => {
  try {
    const result = await outlineAgent.generateOutline({
      storylineId: req.body.storylineId,
      title: req.body.title,
      genre: req.body.genre,
      targetDuration: req.body.targetDuration,
      style: req.body.style,
      additionalNotes: req.body.additionalNotes
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/outline/save', async (req, res) => {
  try {
    const outlineId = await outlineAgent.saveOutline(
      req.body.projectId,
      req.body.outline
    );
    res.json({ id: outlineId });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Save failed' });
  }
});

router.get('/outline/:id', async (req, res) => {
  try {
    const outline = await outlineAgent.getOutline(req.params.id);
    res.json(outline);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Not found' });
  }
});

router.post('/outline/:id/refine', async (req, res) => {
  try {
    const result = await outlineAgent.refineOutline(
      req.params.id,
      req.body.feedback
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Refinement failed' });
  }
});

router.post('/scene/:sceneId/expand', async (req, res) => {
  try {
    const result = await outlineAgent.expandScene(
      req.params.sceneId,
      req.body.detail
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Expansion failed' });
  }
});

router.get('/episode/:episodeNumber/summary', async (req, res) => {
  try {
    const result = await outlineAgent.generateEpisodeSummary(
      parseInt(req.params.episodeNumber),
      req.query.outlineId as string
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

export default router;
