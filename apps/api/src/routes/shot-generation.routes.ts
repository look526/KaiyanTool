import { Router } from 'express'
import { shotGenerationController } from '../controllers/shot-generation.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/shots/:id/generate/start-image', shotGenerationController.generateStartImage.bind(shotGenerationController))
router.post('/shots/:id/generate/end-image', shotGenerationController.generateEndImage.bind(shotGenerationController))
router.post('/shots/:id/generate/both-images', shotGenerationController.generateBothImages.bind(shotGenerationController))
router.post('/shots/:id/generate/video', shotGenerationController.generateVideo.bind(shotGenerationController))

export default router
