import { Router } from 'express';
import { storylineAgent } from '../agents/storyline-agent';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/storyline', async (req, res) => {
  try {
    const result = await storylineAgent.generateStoryline({
      title: req.body.title,
      genre: req.body.genre,
      description: req.body.description,
      style: req.body.style,
      targetDuration: req.body.targetDuration,
      targetAudience: req.body.targetAudience,
      tone: req.body.tone
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/storyline/save', async (req, res) => {
  try {
    const storylineId = await storylineAgent.saveStoryline(
      req.body.projectId,
      req.body.storyline
    );
    res.json({ id: storylineId });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Save failed' });
  }
});

router.get('/storyline/:id', async (req, res) => {
  try {
    const storyline = await storylineAgent.getStoryline(req.params.id);
    res.json(storyline);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Not found' });
  }
});

router.post('/storyline/:id/refine', async (req, res) => {
  try {
    const result = await storylineAgent.refineStoryline(
      req.params.id,
      req.body.feedback
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Refinement failed' });
  }
});

router.post('/character-backstory', async (req, res) => {
  try {
    const result = await storylineAgent.generateCharacterBackstory(
      req.body.characterName,
      req.body.role,
      req.body.storyContext
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/beat-details', async (req, res) => {
  try {
    const result = await storylineAgent.generateBeatDetails(
      req.body.beat,
      req.body.context
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

export default router;
