import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { optionalAuthMiddleware } from '../middleware/auth.middleware'
import { authController } from '../controllers/auth.controller'
import { initAdminController } from '../controllers/init-admin.controller'

const router = Router()

router.post('/register', (req, res) => authController.register(req, res))
router.post('/login', (req, res) => authController.login(req, res))
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res))
router.get('/me', optionalAuthMiddleware, (req, res) => authController.getCurrentUser(req, res))
router.put('/session', authMiddleware, (req, res) => authController.updateSession(req, res))
router.post('/init-admin', (req, res) => initAdminController.initAdmin(req, res))

export default router
