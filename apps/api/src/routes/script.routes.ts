import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { parseScript, saveScript, getScript } from '../controllers/script.controller';

const router = Router();

router.post('/parse', authMiddleware, parseScript);
router.post('/save', authMiddleware, saveScript);
router.get('/:projectId', authMiddleware, getScript);

export default router;
