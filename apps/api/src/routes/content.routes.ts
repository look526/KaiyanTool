import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createScript,
  getScripts,
  getScript,
  parseScript,
  updateScript,
  deleteScript,
  createNovel,
  getNovels,
  parseNovel,
} from '../controllers/content.controller';

const router = Router();

router.use(authMiddleware);

router.post('/scripts', createScript);
router.get('/projects/:projectId/scripts', getScripts);
router.get('/scripts/:id', getScript);
router.post('/scripts/parse', parseScript);
router.put('/scripts/:id', updateScript);
router.delete('/scripts/:id', deleteScript);

router.post('/novels', createNovel);
router.get('/projects/:projectId/novels', getNovels);
router.post('/novels/parse', parseNovel);

export default router;
