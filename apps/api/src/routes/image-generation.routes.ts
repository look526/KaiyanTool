import { Router } from 'express';
import { generateImage, batchGenerateImages, getTaskStatus } from '../services/image-generation.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/generate', async (req, res) => {
  try {
    const result = await generateImage({
      prompt: req.body.prompt,
      negativePrompt: req.body.negativePrompt,
      width: req.body.width,
      height: req.body.height,
      style: req.body.style,
      characterRefImageId: req.body.characterRefImageId,
      sceneRefImageId: req.body.sceneRefImageId,
      projectId: req.body.projectId,
      model: req.body.model,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const results = await batchGenerateImages(req.body.prompts);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Batch generation failed' });
  }
});

router.get('/task/:taskId', async (req, res) => {
  try {
    const status = await getTaskStatus(req.params.taskId);
    res.json(status);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Task not found' });
  }
});

export default router;
