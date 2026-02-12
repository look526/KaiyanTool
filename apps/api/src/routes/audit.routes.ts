import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { auditController } from '../controllers/audit.controller'

const router = express.Router()

router.use(authMiddleware)

router.get('/', auditController.getAuditLogs.bind(auditController))
router.get('/stats', auditController.getAuditLogStats.bind(auditController))

export default router
