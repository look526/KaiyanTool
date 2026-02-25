import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { aiProviderController } from '../controllers/ai-provider.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', aiProviderController.getProviders)
router.post('/', aiProviderController.createProvider)
router.put('/:id', aiProviderController.updateProvider)
router.delete('/:id', aiProviderController.deleteProvider)
router.post('/:id/test', aiProviderController.testProvider)

router.post('/:providerId/models', aiProviderController.createModel)
router.put('/:providerId/models/:modelId', aiProviderController.updateModel)
router.delete('/:providerId/models/:modelId', aiProviderController.deleteModel)
router.post('/models/:modelId/test', aiProviderController.testModel)
router.post('/models/:modelId/set-assistant-default', aiProviderController.setAssistantDefault)
router.post('/models/:modelId/unset-assistant-default', aiProviderController.unsetAssistantDefault)

export default router
