import { Router } from 'express'
import { panelController } from '../controllers/panel.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/shots/:shotId/panels', panelController.getPanels.bind(panelController))
router.get('/panels/:id', panelController.getPanel.bind(panelController))
router.post('/shots/:shotId/panels', panelController.createPanel.bind(panelController))
router.post('/shots/:shotId/panels/batch', panelController.createBatchPanels.bind(panelController))
router.put('/panels/:id', panelController.updatePanel.bind(panelController))
router.delete('/panels/:id', panelController.deletePanel.bind(panelController))
router.put('/shots/:shotId/panels/reorder', panelController.reorderPanels.bind(panelController))

export default router
