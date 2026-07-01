import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { requireAdmin } from '../../middleware/admin.middleware'
import { aiProviderController } from '../../controllers/ai-provider.controller'

const router = Router()

router.use(authMiddleware, requireAdmin)

router.get('/', aiProviderController.getAdminProviders.bind(aiProviderController))
router.post('/', aiProviderController.createProvider.bind(aiProviderController))
router.put('/:id', aiProviderController.updateProvider.bind(aiProviderController))
router.delete('/:id', aiProviderController.deleteProvider.bind(aiProviderController))
router.post('/:id/test', aiProviderController.testProvider.bind(aiProviderController))

router.post('/:provider_id/models', aiProviderController.createModel.bind(aiProviderController))
router.put('/:provider_id/models/:model_id', aiProviderController.updateModel.bind(aiProviderController))
router.delete('/:provider_id/models/:model_id', aiProviderController.deleteModel.bind(aiProviderController))
router.post('/models/:model_id/test', aiProviderController.testModel.bind(aiProviderController))
router.post('/models/:model_id/set-assistant-default', aiProviderController.setAssistantDefault.bind(aiProviderController))
router.post('/models/:model_id/unset-assistant-default', aiProviderController.unsetAssistantDefault.bind(aiProviderController))

export default router
