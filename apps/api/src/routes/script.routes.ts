import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { parseScript, saveScript, getScript, continueScript, rewriteScript, optimizeScene, parseScriptWithAI, optimizeSceneContent, formatToScript } from '../controllers/script.controller';

const router = Router();

router.post('/script/parse', authMiddleware, parseScript);
router.post('/script/parse-ai', authMiddleware, parseScriptWithAI);
router.post('/script/save', authMiddleware, saveScript);
router.post('/script/continue', authMiddleware, continueScript);
router.post('/script/rewrite', authMiddleware, rewriteScript);
router.post('/script/optimize-scene', authMiddleware, optimizeScene);
router.post('/script/format-to-script', authMiddleware, formatToScript);
router.post('/ai/optimize', authMiddleware, optimizeSceneContent);
router.get('/script/:projectId', authMiddleware, getScript);

export default router;
