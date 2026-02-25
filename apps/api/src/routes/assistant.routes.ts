import { Router } from 'express';
import { chat, getProviders, getModels } from '../controllers/assistant.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/chat', chat);
router.get('/providers', getProviders);
router.get('/models', getModels);

export default router;
