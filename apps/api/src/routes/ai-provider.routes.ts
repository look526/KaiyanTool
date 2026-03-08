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

router.post('/:provider_id/models', aiProviderController.createModel)
router.put('/:provider_id/models/:model_id', aiProviderController.updateModel)
router.delete('/:provider_id/models/:model_id', aiProviderController.deleteModel)
router.post('/models/:model_id/test', aiProviderController.testModel)
router.post('/models/:model_id/set-assistant-default', aiProviderController.setAssistantDefault)
router.post('/models/:model_id/unset-assistant-default', aiProviderController.unsetAssistantDefault)

export default router
