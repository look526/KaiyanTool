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
      size: req.body.size,
      resolution: req.body.resolution,
      n: req.body.n || 1,
      image_urls: req.body.image_urls,
      style: req.body.style,
      character_ref_image_id: req.body.character_ref_image_id,
      scene_ref_image_id: req.body.scene_ref_image_id,
      project_id: req.body.project_id || req.body.projectId,
      model: req.body.model,
      three_view: req.body.three_view,
      watermark: req.body.watermark,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { prompt, count = 1, referenceImageUrl, providerId, style, negativePrompt, width, height, resolution, watermark, projectId } = req.body;
    
    console.log('[DEBUG] Batch request:', { prompt, count, projectId, providerId });
    
    const prompts = Array.from({ length: count }, () => ({
      prompt,
      negativePrompt,
      style,
      width,
      height,
      resolution,
      watermark,
      referenceImageUrl,
      project_id: projectId,
      model: providerId,
    }));
    
    const results = await batchGenerateImages(prompts);
    console.log('[DEBUG] Batch results:', results);
    res.json(results);
  } catch (error) {
    console.error('[DEBUG] Batch error:', error);
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
