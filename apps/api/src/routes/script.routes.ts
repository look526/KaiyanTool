import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { parseScript, saveScript, getScript, continueScript, rewriteScript } from '../controllers/script.controller';

const router = Router();

router.post('/script/parse', authMiddleware, parseScript);
router.post('/script/save', authMiddleware, saveScript);
router.post('/script/continue', authMiddleware, continueScript);
router.post('/script/rewrite', authMiddleware, rewriteScript);
router.get('/script/:projectId', authMiddleware, getScript);

export default router;
