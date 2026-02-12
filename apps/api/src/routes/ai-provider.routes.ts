import { Router } from 'express'
import { aiProviderController } from '../controllers/ai-provider.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import logger from '../lib/logger'

const router = Router()

router.use(authMiddleware)

router.get('/', aiProviderController.getProviders.bind(aiProviderController))
router.post('/', (req, res, next) => {
  logger.info('POST /api/ai-providers received', { body: req.body, userId: req.userId })
  aiProviderController.createProvider.bind(aiProviderController)(req, res, next)
})
router.put('/:id', aiProviderController.updateProvider.bind(aiProviderController))
router.delete('/:id', aiProviderController.deleteProvider.bind(aiProviderController))
router.post('/:id/test', aiProviderController.testProvider.bind(aiProviderController))

export default router
