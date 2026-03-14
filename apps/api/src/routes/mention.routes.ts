import { Router } from 'express';
import { MentionController } from '../controllers/mention.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const mentionController = new MentionController();

// All routes require authentication
router.use(authMiddleware);

// GET /projects/:projectId/mentions
router.get('/projects/:projectId/mentions', (req, res) => mentionController.getMentions(req, res));

export default router;
