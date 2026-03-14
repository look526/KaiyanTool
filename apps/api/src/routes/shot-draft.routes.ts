import { Router } from 'express';
import { ShotDraftController } from '../controllers/shot-draft.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const shotDraftController = new ShotDraftController();

// All routes require authentication
router.use(authMiddleware);

// GET /episodes/:episodeId/drafts
router.get('/episodes/:episodeId/drafts', (req, res) => shotDraftController.getDrafts(req, res));

// POST /episodes/:episodeId/drafts
router.post('/episodes/:episodeId/drafts', (req, res) => shotDraftController.saveDraft(req, res));

// PUT /drafts/:id
router.put('/drafts/:id', (req, res) => shotDraftController.updateDraft(req, res));

// DELETE /drafts/:id
router.delete('/drafts/:id', (req, res) => shotDraftController.deleteDraft(req, res));

export default router;
