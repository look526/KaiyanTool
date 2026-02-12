import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

interface AuditLogOptions {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success?: boolean
  errorMessage?: string
}

export const auditService = {
  async log(options: AuditLogOptions): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: options.userId,
          action: options.action,
          resource: options.resource,
          resourceId: options.resourceId,
          metadata: options.metadata,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          success: options.success ?? true,
          errorMessage: options.errorMessage,
        },
      })
    } catch (error) {
      logger.error('审计日志记录失败', { error, options })
    }
  },

  async logAction(
    req: any,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId: req.userId || req.user?.id,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers?.['user-agent'],
      success: true,
    })
  },

  async logError(
    req: any,
    action: string,
    resource: string,
    errorMessage: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId: req.userId || req.user?.id,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers?.['user-agent'],
      success: false,
      errorMessage,
    })
  },

  async getAuditLogs(options: {
    userId?: string
    resource?: string
    resourceId?: string
    action?: string
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (options.userId) {
      where.userId = options.userId
    }
    if (options.resource) {
      where.resource = options.resource
    }
    if (options.resourceId) {
      where.resourceId = options.resourceId
    }
    if (options.action) {
      where.action = options.action
    }
    if (options.startDate || options.endDate) {
      where.createdAt = {}
      if (options.startDate) {
        where.createdAt.gte = options.startDate
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 100,
        skip: options.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ])

    return { logs, total }
  },

  async getAuditLogStats(options: {
    userId?: string
    resource?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (options.userId) {
      where.userId = options.userId
    }
    if (options.resource) {
      where.resource = options.resource
    }
    if (options.startDate || options.endDate) {
      where.createdAt = {}
      if (options.startDate) {
        where.createdAt.gte = options.startDate
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate
      }
    }

    const [total, successful, failed, byAction, byResource] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({ where: { ...where, success: true } }),
      prisma.auditLog.count({ where: { ...where, success: false } }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ])

    return {
      total,
      successful,
      failed,
      byAction: byAction.map(item => ({
        action: item.action,
        count: item._count.id,
      })),
      byResource: byResource.map(item => ({
        resource: item.resource,
        count: item._count.id,
      })),
    }
  },
}

export const AuditAction = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  GENERATE: 'generate',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  SHARE: 'share',
  INVITE: 'invite',
  REMOVE_MEMBER: 'remove_member',
  CHANGE_ROLE: 'change_role',
} as const

export const AuditResource = {
  USER: 'user',
  PROJECT: 'project',
  SHOT: 'shot',
  PANEL: 'panel',
  CHARACTER: 'character',
  SCENE: 'scene',
  SCRIPT: 'script',
  NOVEL: 'novel',
  VIDEO: 'video',
  ASSET: 'asset',
  AI_PROVIDER: 'ai_provider',
  CONTENT: 'content',
} as const
