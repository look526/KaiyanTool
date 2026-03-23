import { Router } from 'express'
import { productionController } from '../controllers/production.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()
router.use(authMiddleware)

router.post('/projects/:project_id/production', productionController.create.bind(productionController))
router.post('/production/:id/execute', productionController.execute.bind(productionController))
router.get('/production/:id', productionController.getStatus.bind(productionController))
router.get('/projects/:project_id/production', productionController.list.bind(productionController))
router.post('/production/:id/cancel', productionController.cancel.bind(productionController))

export default router
