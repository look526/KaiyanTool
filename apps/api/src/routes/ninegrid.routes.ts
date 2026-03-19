import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { nineGridController } from '../controllers/ninegrid.controller'

const router = Router()

router.use(authMiddleware)

router.get(
  '/shots/:shot_id/ninegrid/panels',
  nineGridController.getPanelsByShot.bind(nineGridController)
)

router.post(
  '/shots/:shot_id/ninegrid/panels',
  nineGridController.createPanel.bind(nineGridController)
)

router.put(
  '/shots/:shot_id/ninegrid/panels/:panelId',
  nineGridController.updatePanel.bind(nineGridController)
)

router.delete(
  '/shots/:shot_id/ninegrid/panels/:panelId',
  nineGridController.deletePanel.bind(nineGridController)
)

router.post(
  '/shots/:shot_id/ninegrid/generate',
  nineGridController.generateAllPanels.bind(nineGridController)
)

router.put(
  '/shots/:shot_id/ninegrid/reorder',
  nineGridController.reorderPanels.bind(nineGridController)
)

export default router
