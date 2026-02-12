import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { directorController } from '../controllers/director.controller'

const router = Router()

router.post('/director/script', authMiddleware, directorController.generateScript.bind(directorController))
router.post('/director/shots', authMiddleware, directorController.generateShots.bind(directorController))
router.post('/director/optimize-shot', authMiddleware, directorController.optimizeShotPrompt.bind(directorController))

export default router