import { Router } from 'express';
import { videoTutorialService } from '../services/video-tutorial.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/categories', async (_req, res) => {
  try {
    const categories = await videoTutorialService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, level, search, limit = 20, offset = 0 } = req.query;
    const tutorials = await videoTutorialService.getTutorials({
      category: category as string,
      level: level as string,
      search: search as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tutorials' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tutorial = await videoTutorialService.getTutorial(req.params.id);
    res.json(tutorial);
  } catch (error) {
    res.status(404).json({ error: 'Tutorial not found' });
  }
});

router.post('/:id/progress', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { progress, completed, watchedDuration } = req.body;
    
    const result = await videoTutorialService.updateProgress(
      req.params.id,
      userId,
      { progress, completed, watchedDuration }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

router.get('/user/progress', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const progress = await videoTutorialService.getUserProgress(userId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const recommendations = await videoTutorialService.getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
