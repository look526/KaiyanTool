import { Router } from 'express'
import { shotController } from '../controllers/shot.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

// Project-based endpoints
router.get('/projects/:projectId/shots', shotController.getShots.bind(shotController))
router.post('/projects/:projectId/shots', shotController.createShot.bind(shotController))
router.post('/projects/:projectId/shots/reorder', shotController.reorderShots.bind(shotController))
router.post('/projects/:projectId/shots/generate', shotController.generateShotsFromScript.bind(shotController))

// Episode-based endpoints (for new API)
router.get('/episodes/:episodeId/shots', shotController.getShotsByEpisode.bind(shotController))
router.post('/episodes/:episodeId/shots', shotController.createShotByEpisode.bind(shotController))
router.post('/episodes/:episodeId/shots/batch-generate', shotController.batchGenerateShots.bind(shotController))

// Shot-specific endpoints
router.get('/shots/:id', shotController.getShot.bind(shotController))
router.put('/shots/:id', shotController.updateShot.bind(shotController))
router.delete('/shots/:id', shotController.deleteShot.bind(shotController))
router.put('/shots/:id/reorder', shotController.reorderShot.bind(shotController))

export default router
