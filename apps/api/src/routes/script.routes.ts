import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { parseScript, saveScript, getScript, continueScript, rewriteScript, optimizeScene, parseScriptWithAI, optimizeSceneContent, formatToScript } from '../controllers/script.controller';

const createScriptRouter = (prefix = '') => {
  const router = Router();

  router.post(`${prefix}/parse`, authMiddleware, parseScript);
  router.post(`${prefix}/parse-ai`, authMiddleware, parseScriptWithAI);
  router.post(`${prefix}/save`, authMiddleware, saveScript);
  router.post(`${prefix}/continue`, authMiddleware, continueScript);
  router.post(`${prefix}/rewrite`, authMiddleware, rewriteScript);
  router.post(`${prefix}/optimize-scene`, authMiddleware, optimizeScene);
  router.post(`${prefix}/format-to-script`, authMiddleware, formatToScript);
  router.get(`${prefix}/:projectId`, authMiddleware, getScript);

  return router;
};

export const scriptRouter = createScriptRouter();

const router = Router();
router.use(createScriptRouter('/script'));
router.post('/ai/optimize', authMiddleware, optimizeSceneContent);

export default router;
