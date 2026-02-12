import { Request, Response } from 'express'
import { auditService, AuditAction, AuditResource } from '../services/audit.service'
import logger from '../lib/logger'

class AuditController {
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { resource, resourceId, action, limit, offset, startDate, endDate } = req.query

      const result = await auditService.getAuditLogs({
        userId: req.userId,
        resource: resource as string,
        resourceId: resourceId as string,
        action: action as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      })

      res.json(result)
    } catch (error) {
      logger.error('获取审计日志失败', { userId: req.userId, error })
      res.status(500).json({ error: 'Failed to get audit logs' })
    }
  }

  async getAuditLogStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { resource, startDate, endDate } = req.query

      const stats = await auditService.getAuditLogStats({
        userId: req.userId,
        resource: resource as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      })

      res.json(stats)
    } catch (error) {
      logger.error('获取审计统计失败', { userId: req.userId, error })
      res.status(500).json({ error: 'Failed to get audit log stats' })
    }
  }
}

export const auditController = new AuditController()
