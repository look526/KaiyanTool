import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth.middleware';
import { AppError, asyncHandler } from '../../middleware/error.middleware';

const router = Router();

const requireAdmin = async (req: Request, _res: Response, next: Function) => {
  const userId = req.user_id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  
  if (!user || user.role !== 'admin') {
    throw AppError.forbidden('需要管理员权限');
  }
  next();
};

router.get('/', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 50, action, resource, userId, startDate, endDate, success } = req.query;
  
  const where: any = {};
  
  if (action) {
    where.action = { contains: action as string, mode: 'insensitive' };
  }
  
  if (resource) {
    where.resource = resource;
  }
  
  if (userId) {
    where.user_id = userId;
  }

  if (success !== undefined) {
    where.success = success === 'true';
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) {
      where.created_at.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.created_at.lte = new Date(endDate as string);
    }
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { id: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);
  
  const userIds = [...new Set(logs.filter(l => l.user_id).map(l => l.user_id))] as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));
  
  const logsWithUsers = logs.map(log => ({
    ...log,
    user: log.user_id ? userMap.get(log.user_id) : null,
  }));
  
  res.json({
    logs: logsWithUsers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}));

router.get('/stats', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.created_at = {};
    if (startDate) dateFilter.created_at.gte = new Date(startDate as string);
    if (endDate) dateFilter.created_at.lte = new Date(endDate as string);
  }
  
  const [byAction, byResource, totalCount, successCount, recentErrors] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ['action'],
      where: dateFilter,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.auditLog.groupBy({
      by: ['resource'],
      where: dateFilter,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.auditLog.count({ where: dateFilter }),
    prisma.auditLog.count({ where: { ...dateFilter, success: true } }),
    prisma.auditLog.findMany({
      where: { ...dateFilter, success: false },
      take: 10,
      orderBy: { id: 'desc' },
    }),
  ]);
  
  res.json({
    byAction: byAction.map(a => ({ action: a.action, count: a._count.id })),
    byResource: byResource.map(r => ({ resource: r.resource, count: r._count.id })),
    successRate: {
      total: totalCount,
      successful: successCount,
      rate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100,
    },
    recentErrors,
  });
}));

router.get('/export', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  const where: any = {};
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = new Date(startDate as string);
    if (endDate) where.created_at.lte = new Date(endDate as string);
  }
  
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { id: 'desc' },
  });
  
  const userIds = [...new Set(logs.filter(l => l.user_id).map(l => l.user_id))] as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map<string, { id: string; name: string | null; email: string }>(users.map(u => [u.id, u]));
  
  if (format === 'csv') {
    const csv = [
      'ID,时间,用户,操作,资源,资源ID,IP地址,成功,错误信息',
      ...logs.map(log => {
        const user = log.user_id ? userMap.get(log.user_id) : null;
        const userEmail = user?.email ?? '系统';
        return `"${log.id}","${log.created_at.toISOString()}","${userEmail}","${log.action}","${log.resource}","${log.resource_id || ''}","${log.ip_address || ''}","${log.success}","${log.error_message || ''}"`;
      }),
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    res.send('\ufeff' + csv);
  } else {
    res.json({ logs });
  }
}));

export default router;
