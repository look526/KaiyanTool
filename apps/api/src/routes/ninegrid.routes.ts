import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { checkProjectAccess } from '../middleware/permission.middleware'
import { nineGridController } from '../controllers/ninegrid.controller'

const router = Router()

router.get(
  '/shots/:shotId/ninegrid/panels',
  authMiddleware,
  nineGridController.getPanelsByShot.bind(nineGridController)
)

router.post(
  '/shots/:shotId/ninegrid/panels',
  authMiddleware,
  checkProjectAccess,
  nineGridController.createPanel.bind(nineGridController)
)

router.patch(
  '/shots/:shotId/ninegrid/panels/:panelId',
  authMiddleware,
  checkProjectAccess,
  nineGridController.updatePanel.bind(nineGridController)
)

router.delete(
  '/shots/:shotId/ninegrid/panels/:panelId',
  authMiddleware,
  checkProjectAccess,
  nineGridController.deletePanel.bind(nineGridController)
)

router.post(
  '/shots/:shotId/ninegrid/generate',
  authMiddleware,
  checkProjectAccess,
  nineGridController.generateAllPanels.bind(nineGridController)
)

router.put(
  '/shots/:shotId/ninegrid/reorder',
  authMiddleware,
  checkProjectAccess,
  nineGridController.reorderPanels.bind(nineGridController)
)

export default router
