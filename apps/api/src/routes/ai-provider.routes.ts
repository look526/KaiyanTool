import { Router } from 'express'
import { aiProviderController } from '../controllers/ai-provider.controller'

const router = Router()

router.get('/', aiProviderController.getProviders)
router.post('/', aiProviderController.createProvider)
router.put('/:id', aiProviderController.updateProvider)
router.delete('/:id', aiProviderController.deleteProvider)
router.post('/:id/test', aiProviderController.testProvider)

router.post('/:providerId/models', aiProviderController.createModel)
router.put('/:providerId/models/:modelId', aiProviderController.updateModel)
router.delete('/:providerId/models/:modelId', aiProviderController.deleteModel)

export default router
