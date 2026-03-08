import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth.middleware';
import { AppError, asyncHandler } from '../../middleware/error.middleware';
import logger from '../../lib/logger';
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
        avatar_url: true,
        plan: true,
        storage_used: true,
        storage_limit: true,
        created_at: true,
        last_login_at: true,
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
      avatar_url: u.avatar_url,
      plan: u.plan,
      storageUsed: u.storage_used?.toString(),
      storageLimit: u.storage_limit?.toString(),
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at,
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
      avatar_url: true,
      bio: true,
      plan: true,
      storage_used: true,
      storage_limit: true,
      created_at: true,
      updated_at: true,
      last_login_at: true,
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
    where: { user_id: id },
    take: 10,
    orderBy: { id: 'desc' },
  });
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      plan: user.plan,
      storageUsed: user.storage_used?.toString(),
      storageLimit: user.storage_limit?.toString(),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
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
      id: crypto.randomUUID(),
      email,
      name: name || email.split('@')[0],
      password_hash: hashedPassword,
      role,
      updated_at: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      created_at: true,
    },
  });
  
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      user_id: req.user_id,
      action: 'user_created',
      resource: 'user',
      resource_id: user.id,
      metadata: { email, name, role },
      ip_address: req.ip,
    },
  });
  
  logger.info('User created by admin', { adminId: req.user_id, newUserId: user.id });
  
  res.status(201).json({ user });
}));

router.patch('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, plan, storageLimit } = req.body;
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound('用户不存在');
  }
  
  const data: any = { updated_at: new Date() };
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (plan !== undefined) data.plan = plan;
  if (storageLimit !== undefined) data.storage_limit = BigInt(storageLimit);
  
  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      storage_limit: true,
    },
  });
  
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      user_id: req.user_id,
      action: 'user_updated',
      resource: 'user',
      resource_id: id,
      metadata: { changes: { name, role, plan } },
      ip_address: req.ip,
    },
  });
  
  res.json({ user: { ...updated, storageLimit: updated.storage_limit?.toString() } });
}));

router.delete('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (id === req.user_id) {
    throw AppError.badRequest('不能删除自己的账户');
  }
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound('用户不存在');
  }
  
  await prisma.user.delete({ where: { id } });
  
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      user_id: req.user_id,
      action: 'user_deleted',
      resource: 'user',
      resource_id: id,
      metadata: { email: user.email, name: user.name },
      ip_address: req.ip,
    },
  });
  
  logger.info('User deleted by admin', { adminId: req.user_id, deletedUserId: id });
  
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
    data: { password_hash: hashedPassword, updated_at: new Date() },
  });
  
  await prisma.session.deleteMany({ where: { user_id: id } });
  
  await prisma.auditLog.create({
    data: {
      id: crypto.randomUUID(),
      user_id: req.user_id,
      action: 'password_reset',
      resource: 'user',
      resource_id: id,
      ip_address: req.ip,
    },
  });
  
  res.json({ message: '密码已重置' });
}));

export default router;
