import { Router } from 'express'
import { panelGenerationController } from '../controllers/panel-generation.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/panels/:id/generate', panelGenerationController.generatePanelImage.bind(panelGenerationController))
router.post('/shots/:shot_id/generate-panels', panelGenerationController.generateBatchImages.bind(panelGenerationController))
router.get('/shots/:shot_id/export-grid', panelGenerationController.exportNineGrid.bind(panelGenerationController))

export default router
