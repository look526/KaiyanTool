import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  rememberMe: z.boolean().optional().default(false),
});

const registerSchema = z.object({
  name: z.string().min(2, '用户名至少2位').max(50, '用户名最多50位'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { name: data.name },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          return res.status(400).json({ error: '该邮箱已被注册' });
        }
        if (existingUser.name === data.name) {
          return res.status(400).json({ error: '该用户名已被使用' });
        }
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      const sessionToken = randomBytes(32).toString('hex');
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          token: sessionToken,
          userId: user.id,
          expiresAt: sessionExpiresAt,
        },
      });

      res.cookie('sessionId', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      res.status(201).json({ user });
    } catch (error: any) {
      if (error.name === 'ZodError' && error.issues && error.issues.length > 0) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: '数据验证失败' });
      }
      console.error('Register error:', error);
      res.status(500).json({ error: '注册失败' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      console.log('Login request body:', req.body);
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          passwordHash: true,
        },
      });

      if (!user) {
        return res.status(401).json({ error: '邮箱或密码错误' });
      }

      const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: '邮箱或密码错误' });
      }

      const sessionToken = randomBytes(32).toString('hex');
      const rememberMe = data.rememberMe || false;

      const sessionExpiresAt = rememberMe
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const cookieMaxAge = rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

      await prisma.session.create({
        data: {
          token: sessionToken,
          userId: user.id,
          expiresAt: sessionExpiresAt,
        },
      });

      res.cookie('sessionId', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
      });

      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, rememberMe });
    } catch (error: any) {
      if (error.name === 'ZodError' && error.issues && error.issues.length > 0) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: '数据验证失败' });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: '登录失败' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const sessionToken = req.cookies?.sessionId;

      if (sessionToken) {
        await prisma.session.deleteMany({
          where: { token: sessionToken },
        }).catch(() => {});
      }

      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      res.json({ message: '退出成功' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: '退出失败' });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const sessionToken = req.cookies?.sessionId;

      if (!sessionToken) {
        return res.status(401).json({ error: '未登录' });
      }

      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              bio: true,
              createdAt: true,
            },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        res.clearCookie('sessionId', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        return res.status(401).json({ error: '会话已过期，请重新登录' });
      }

      const isRememberMeSession = session.expiresAt.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000;

      res.json({ user: session.user, rememberMe: isRememberMeSession });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const sessionToken = req.cookies?.sessionId;

      if (!sessionToken) {
        return res.status(401).json({ error: '未登录' });
      }

      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
      });

      if (!session) {
        return res.status(401).json({ error: '会话不存在' });
      }

      const isRememberMeSession = session.expiresAt.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000;

      await prisma.session.update({
        where: { token: sessionToken },
        data: {
          expiresAt: isRememberMeSession
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const cookieMaxAge = isRememberMeSession
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

      res.cookie('sessionId', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
      });

      res.json({ message: '会话已更新', rememberMe: isRememberMeSession });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({ error: '更新会话失败' });
    }
  }
}

export const authController = new AuthController();
