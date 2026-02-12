import { Router } from 'express';
import { analyzeScript, generateVisualPrompt, getAnalysisHistory } from '../services/script-analysis.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/analyze', async (req, res) => {
  try {
    const result = await analyzeScript({
      scriptContent: req.body.scriptContent,
      targetDuration: req.body.targetDuration,
      includeShots: req.body.includeShots
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
  }
});

router.post('/prompt', async (req, res) => {
  try {
    const result = await generateVisualPrompt({
      sceneDescription: req.body.sceneDescription,
      characters: req.body.characters,
      sceneImageId: req.body.sceneImageId,
      characterImageIds: req.body.characterImageIds
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Prompt generation failed' });
  }
});

router.get('/history/:projectId', async (req, res) => {
  try {
    const history = await getAnalysisHistory(req.params.projectId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get history' });
  }
});

export default router;
