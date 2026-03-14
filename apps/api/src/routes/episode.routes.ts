import { Router } from 'express';
import { EpisodeController } from '../controllers/episode.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const episodeController = new EpisodeController();

// All routes require authentication
router.use(authMiddleware);

// GET /projects/:projectId/episodes
router.get('/projects/:projectId/episodes', (req, res) => episodeController.getEpisodes(req, res));

// POST /projects/:projectId/episodes
router.post('/projects/:projectId/episodes', (req, res) => episodeController.createEpisode(req, res));

// GET /episodes/:id
router.get('/episodes/:id', (req, res) => episodeController.getEpisode(req, res));

// PUT /episodes/:id
router.put('/episodes/:id', (req, res) => episodeController.updateEpisode(req, res));

// DELETE /episodes/:id
router.delete('/episodes/:id', (req, res) => episodeController.deleteEpisode(req, res));

// GET /episodes/:id/stats
router.get('/episodes/:id/stats', (req, res) => episodeController.getEpisodeStats(req, res));

export default router;
