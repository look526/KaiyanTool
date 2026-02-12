import { Router } from 'express'
import { shotController } from '../controllers/shot.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/projects/:projectId/shots', shotController.getShots.bind(shotController))
router.get('/shots/:id', shotController.getShot.bind(shotController))
router.post('/projects/:projectId/shots', shotController.createShot.bind(shotController))
router.put('/shots/:id', shotController.updateShot.bind(shotController))
router.delete('/shots/:id', shotController.deleteShot.bind(shotController))
router.post('/projects/:projectId/shots/reorder', shotController.reorderShots.bind(shotController))
router.post('/projects/:projectId/shots/generate', shotController.generateShotsFromScript.bind(shotController))

export default router
