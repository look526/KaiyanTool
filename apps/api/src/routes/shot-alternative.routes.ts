import { Router } from 'express';
import { ShotAlternativeController } from '../controllers/shot-alternative.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const shotAlternativeController = new ShotAlternativeController();

// All routes require authentication
router.use(authMiddleware);

// GET /shots/:shotId/alternatives
router.get('/shots/:shotId/alternatives', (req, res) => shotAlternativeController.getAlternatives(req, res));

// POST /shots/:shotId/alternatives
router.post('/shots/:shotId/alternatives', (req, res) => shotAlternativeController.createAlternative(req, res));

// PUT /shots/:shotId/alternatives/:id/recommend
router.put('/shots/:shotId/alternatives/:id/recommend', (req, res) => shotAlternativeController.setRecommended(req, res));

// DELETE /shots/:shotId/alternatives/:id
router.delete('/shots/:shotId/alternatives/:id', (req, res) => shotAlternativeController.deleteAlternative(req, res));

export default router;
