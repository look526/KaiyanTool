import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError, asyncHandler } from '../../middleware/error.middleware';
import logger from '../../lib/logger';
import { randomBytes } from 'crypto';

const router = Router();

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw AppError.badRequest('邮箱和密码不能为空');
  }
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      role: true,
      avatarUrl: true,
    },
  });
  
  if (!user) {
    throw AppError.unauthorized('邮箱或密码错误');
  }
  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    throw AppError.forbidden('需要管理员权限');
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'admin_login_failed',
        resource: 'admin_auth',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        success: false,
        errorMessage: '密码错误',
      },
    });
    throw AppError.unauthorized('邮箱或密码错误');
  }
  
  const sessionToken = randomBytes(32).toString('hex');
  const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      expiresAt: sessionExpiresAt,
    },
  });
  
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'admin_login',
      resource: 'admin_auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });
  
  res.cookie('sessionId', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  
  logger.info('Admin login successful', { userId: user.id, email: user.email });
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  });
}));

router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw AppError.unauthorized();
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
  
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    throw AppError.forbidden('需要管理员权限');
  }
  
  res.json({ user });
}));

router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw AppError.unauthorized();
  }
  
  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  
  if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'super_admin')) {
    throw AppError.forbidden('需要管理员权限');
  }
  
  const [
    userCount,
    projectCount,
    assetCount,
    todayLogins,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.asset.count(),
    prisma.session.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { id: 'desc' },
    }),
  ]);
  
  const userIds = [...new Set(recentLogs.filter(l => l.userId).map(l => l.userId))] as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));
  
  const logsWithUsers = recentLogs.map(log => ({
    ...log,
    user: log.userId ? userMap.get(log.userId) : null,
  }));
  
  res.json({
    stats: {
      users: userCount,
      projects: projectCount,
      assets: assetCount,
      todayLogins,
    },
    recentLogs: logsWithUsers,
  });
}));

export default router;
