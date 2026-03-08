import { Router } from 'express';
import { analyzeScript, generateVisualPrompt, getAnalysisHistory } from '../services/script-analysis.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/analyze', async (req, res) => {
  try {
    const result = await analyzeScript({
      script_content: req.body.script_content,
      target_duration: req.body.target_duration,
      include_shots: req.body.include_shots
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
  }
});

router.post('/prompt', async (req, res) => {
  try {
    const result = await generateVisualPrompt({
      scene_description: req.body.scene_description,
      characters: req.body.characters,
      scene_image_id: req.body.scene_image_id,
      character_image_ids: req.body.character_image_ids
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Prompt generation failed' });
  }
});

router.get('/history/:project_id', async (req, res) => {
  try {
    const history = await getAnalysisHistory(req.params.project_id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get history' });
  }
});

export default router;
