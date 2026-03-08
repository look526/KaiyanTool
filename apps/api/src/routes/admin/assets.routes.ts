import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth.middleware';
import { AppError, asyncHandler } from '../../middleware/error.middleware';
import crypto from 'crypto';

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
  const { page = 1, limit = 20, search, type, projectId } = req.query;
  
  const where: any = {};
  
  if (search) {
    where.OR = [
      { url: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  
  if (type) {
    where.type = type;
  }
  
  if (projectId) {
    where.project_id = projectId;
  }
  
  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { id: 'desc' },
    }),
    prisma.asset.count({ where }),
  ]);
  
  res.json({
    assets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}));

router.get('/stats', authMiddleware, requireAdmin, asyncHandler(async (_req: Request, res: Response) => {
  const [totalCount, byType] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({
      by: ['type'],
      _count: { id: true },
    }),
  ]);
  
  res.json({
    total: totalCount,
    byType: byType.map(t => ({
      type: t.type,
      count: t._count.id,
    })),
  });
}));

router.delete('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    throw AppError.notFound('素材不存在');
  }
  
  await prisma.asset.delete({ where: { id } });
  
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      user_id: req.user_id,
      action: 'asset_deleted',
      resource: 'asset',
      resource_id: id,
      metadata: { url: asset.url, type: asset.type },
      ip_address: req.ip,
    },
  });
  
  res.json({ message: '素材已删除' });
}));

router.post('/batch-delete', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw AppError.badRequest('请选择要删除的素材');
  }
  
  const result = await prisma.asset.deleteMany({
    where: { id: { in: ids } },
  });
  
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      user_id: req.user_id,
      action: 'assets_batch_deleted',
      resource: 'asset',
      metadata: { count: result.count, ids },
      ip_address: req.ip,
    },
  });
  
  res.json({ message: `已删除 ${result.count} 个素材` });
}));

export default router;
