import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { optionalAuthMiddleware } from '../middleware/auth.middleware'
import { authController } from '../controllers/auth.controller'
import { initAdminController } from '../controllers/init-admin.controller'
import { userAuthRateLimit } from '../middleware/user-rate-limit.middleware'

const router = Router()

// 测试端点 - 用于调试 CSRF token
router.post('/test-csrf', (req, res) => {
  console.log('[TEST CSRF] Headers:', req.headers);
  console.log('[TEST CSRF] X-CSRF-Token:', req.headers['x-csrf-token']);
  res.json({
    receivedHeaders: req.headers,
    csrfToken: req.headers['x-csrf-token'] || null
  });
});

router.post('/register', userAuthRateLimit, (req, res) => authController.register(req, res))
router.post('/login', userAuthRateLimit, (req, res) => authController.login(req, res))
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res))
router.get('/me', optionalAuthMiddleware, (req, res) => authController.getCurrentUser(req, res))
router.put('/session', authMiddleware, (req, res) => authController.updateSession(req, res))
router.post('/init-admin', (req, res) => initAdminController.initAdmin(req, res))

export default router
