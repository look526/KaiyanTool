import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth.middleware';
import { AppError, asyncHandler } from '../../middleware/error.middleware';
import logger from '../../lib/logger';

const router = Router();

const requireAdmin = async (req: Request, _res: Response, next: Function) => {
  const userId = req.userId;
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
  const { page = 1, limit = 20, search, role } = req.query;
  
  const where: any = {};
  
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { name: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  
  if (role) {
    where.role = role;
  }
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { id: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        plan: true,
        storageUsed: true,
        storageLimit: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { Project: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);
  
  res.json({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatarUrl,
      plan: u.plan,
      storageUsed: u.storageUsed?.toString(),
      storageLimit: u.storageLimit?.toString(),
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      projectCount: u._count.Project,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}));

router.get('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      bio: true,
      plan: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          Project: true,
          AIProvider: true,
          Session: true,
        },
      },
    },
  });
  
  if (!user) {
    throw AppError.notFound('用户不存在');
  }
  
  const recentLogs = await prisma.auditLog.findMany({
    where: { userId: id },
    take: 10,
    orderBy: { id: 'desc' },
  });
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      plan: user.plan,
      storageUsed: user.storageUsed?.toString(),
      storageLimit: user.storageLimit?.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      projectCount: user._count.Project,
      providerCount: user._count.AIProvider,
      sessionCount: user._count.Session,
      recentLogs,
    },
  });
}));

router.post('/', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role = 'user' } = req.body;
  
  if (!email || !password) {
    throw AppError.badRequest('邮箱和密码不能为空');
  }
  
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existing) {
    throw AppError.conflict('邮箱已被注册');
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.create({
    data: {
      email,
      name: name || email.split('@')[0],
      passwordHash: hashedPassword,
      role,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  
  await prisma.auditLog.create({
    data: {
      userId: req.userId,
      action: 'user_created',
      resource: 'user',
      resourceId: user.id,
      metadata: { email, name, role },
      ipAddress: req.ip,
    },
  });
  
  logger.info('User created by admin', { adminId: req.userId, newUserId: user.id });
  
  res.status(201).json({ user });
}));

router.patch('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, plan, storageLimit } = req.body;
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound('用户不存在');
  }
  
  const data: any = { updatedAt: new Date() };
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (plan !== undefined) data.plan = plan;
  if (storageLimit !== undefined) data.storageLimit = BigInt(storageLimit);
  
  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      storageLimit: true,
    },
  });
  
  await prisma.auditLog.create({
    data: {
      userId: req.userId,
      action: 'user_updated',
      resource: 'user',
      resourceId: id,
      metadata: { changes: { name, role, plan } },
      ipAddress: req.ip,
    },
  });
  
  res.json({ user: { ...updated, storageLimit: updated.storageLimit?.toString() } });
}));

router.delete('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (id === req.userId) {
    throw AppError.badRequest('不能删除自己的账户');
  }
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound('用户不存在');
  }
  
  await prisma.user.delete({ where: { id } });
  
  await prisma.auditLog.create({
    data: {
      userId: req.userId,
      action: 'user_deleted',
      resource: 'user',
      resourceId: id,
      metadata: { email: user.email, name: user.name },
      ipAddress: req.ip,
    },
  });
  
  logger.info('User deleted by admin', { adminId: req.userId, deletedUserId: id });
  
  res.json({ message: '用户已删除' });
}));

router.post('/:id/reset-password', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;
  
  if (!password || password.length < 6) {
    throw AppError.badRequest('密码长度至少6位');
  }
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound('用户不存在');
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  await prisma.user.update({
    where: { id },
    data: { passwordHash: hashedPassword, updatedAt: new Date() },
  });
  
  await prisma.session.deleteMany({ where: { userId: id } });
  
  await prisma.auditLog.create({
    data: {
      userId: req.userId,
      action: 'password_reset',
      resource: 'user',
      resourceId: id,
      ipAddress: req.ip,
    },
  });
  
  res.json({ message: '密码已重置' });
}));

export default router;
