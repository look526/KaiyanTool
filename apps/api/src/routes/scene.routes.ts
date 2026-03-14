import { Router } from 'express';
import { SceneController } from '../controllers/scene.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const sceneController = new SceneController();

// All routes require authentication
router.use(authMiddleware);

// GET /projects/:projectId/scenes
router.get('/projects/:projectId/scenes', (req, res) => sceneController.getScenesByProject(req, res));

// POST /projects/:projectId/scenes
router.post('/projects/:projectId/scenes', (req, res) => sceneController.createScene(req, res));

// GET /episodes/:episodeId/scenes
router.get('/episodes/:episodeId/scenes', (req, res) => sceneController.getScenes(req, res));

// POST /episodes/:episodeId/scenes
router.post('/episodes/:episodeId/scenes', (req, res) => sceneController.createScene(req, res));

// GET /scenes/:id
router.get('/scenes/:id', (req, res) => sceneController.getScene(req, res));

// PUT /scenes/:id
router.put('/scenes/:id', (req, res) => sceneController.updateScene(req, res));

// DELETE /scenes/:id
router.delete('/scenes/:id', (req, res) => sceneController.deleteScene(req, res));

// PUT /scenes/:id/reorder
router.put('/scenes/:id/reorder', (req, res) => sceneController.reorderScenes(req, res));

export default router;
