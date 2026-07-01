import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { aiProviderController } from '../controllers/ai-provider.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', aiProviderController.getProviders.bind(aiProviderController))

export default router
