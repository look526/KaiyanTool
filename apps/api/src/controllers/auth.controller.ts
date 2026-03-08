import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomBytes, randomBytes as cryptoRandomBytes } from 'crypto';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { LoginAttemptsService } from '../services/login-attempts.service';
import { getCookieOptions } from '../config/cookies';
import { storeCsrfToken } from '../lib/csrf';

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  remember_me: z.boolean().optional().default(false),
});

const registerSchema = z.object({
  name: z.string().min(2, '用户名至少2位').max(50, '用户名最多50位'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string()
    .min(8, '密码至少8位')
    .regex(/[A-Z]/, '密码必须包含至少1个大写字母')
    .regex(/[a-z]/, '密码必须包含至少1个小写字母')
    .regex(/[0-9]/, '密码必须包含至少1个数字')
    .regex(/[^A-Za-z0-9]/, '密码必须包含至少1个特殊字符'),
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
          id: randomBytes(16).toString('hex'),
          name: data.name,
          email: data.email,
          password_hash: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          role: true,
          created_at: true,
        },
      });

      const session_token = randomBytes(32).toString('hex');
      const session_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          id: randomBytes(16).toString('hex'),
          token: session_token,
          user_id: user.id,
          expires_at: session_expires_at,
        },
      });

      res.cookie('sessionId', session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      // 生成并返回CSRF token
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.setHeader('X-CSRF-Token', csrfToken);

      // 存储CSRF令牌，使用固定的sessionId以保持一致
      storeCsrfToken('csrf-token', csrfToken);

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
      const ip = req.ip || 'unknown';

      const is_locked = await LoginAttemptsService.isLocked(data.email, ip);
      if (is_locked) {
        const locked_until = await LoginAttemptsService.getLockedUntil(data.email, ip);
        const unlock_time = locked_until 
          ? new Date(locked_until).toLocaleString('zh-CN', { hour12: false })
          : '15分钟后';
        return res.status(401).json({ 
          error: '账户已被临时锁定',
          locked_until: unlock_time 
        });
      }

      await LoginAttemptsService.recordAttempt(data.email, ip);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          role: true,
          created_at: true,
          password_hash: true,
        },
      });

      if (!user) {
        return res.status(401).json({ error: '邮箱或密码错误' });
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: '邮箱或密码错误' });
      }

      await LoginAttemptsService.clearAttempts(data.email, ip);

      const existing_session_token = req.cookies?.sessionId;
      if (existing_session_token) {
        await prisma.session.deleteMany({
          where: { token: existing_session_token },
        }).catch(() => {});
        res.clearCookie('sessionId');
      }

      const session_token = randomBytes(32).toString('hex');
      const remember_me = data.remember_me || false;

      const session_expires_at = remember_me
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const cookie_max_age = remember_me
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

      await prisma.session.create({
        data: {
          id: randomBytes(16).toString('hex'),
          token: session_token,
          user_id: user.id,
          expires_at: session_expires_at,
        },
      });

      res.cookie('sessionId', session_token, getCookieOptions(cookie_max_age));

      // 生成并返回CSRF token
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.setHeader('X-CSRF-Token', csrfToken);

      // 存储CSRF令牌，使用固定的sessionId以保持一致
      storeCsrfToken('csrf-token', csrfToken);

      const { password_hash: _, ...user_without_password } = user;
      res.json({ user: user_without_password, remember_me });
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
      const session_token = req.cookies?.sessionId;

      // 生成并返回CSRF token（无论是否登录）
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.setHeader('X-CSRF-Token', csrfToken);

      // 存储CSRF令牌，使用固定的sessionId以保持一致
      storeCsrfToken('csrf-token', csrfToken);

      if (!session_token) {
        return res.status(401).json({ error: '未登录' });
      }

      const session = await prisma.session.findUnique({
        where: { token: session_token },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
              role: true,
              bio: true,
              created_at: true,
            },
          },
        },
      });

      if (!session || session.expires_at < new Date()) {
        res.clearCookie('sessionId', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        return res.status(401).json({ error: '会话已过期，请重新登录' });
      }

      const is_remember_me_session = session.expires_at.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000;

      res.json({ user: session.User, remember_me: is_remember_me_session });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const session_token = req.cookies?.sessionId;

      if (!session_token) {
        return res.status(401).json({ error: '未登录' });
      }

      const session = await prisma.session.findUnique({
        where: { token: session_token },
      });

      if (!session) {
        return res.status(401).json({ error: '会话不存在' });
      }

      const is_remember_me_session = session.expires_at.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000;

      await prisma.session.update({
        where: { token: session_token },
        data: {
          expires_at: is_remember_me_session
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const cookie_max_age = is_remember_me_session
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

      res.cookie('sessionId', session_token, getCookieOptions(cookie_max_age));

      // 生成并返回CSRF token
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.setHeader('X-CSRF-Token', csrfToken);

      // 存储CSRF令牌，使用固定的sessionId以保持一致
      storeCsrfToken('csrf-token', csrfToken);

      res.json({ message: '会话已更新', remember_me: is_remember_me_session });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({ error: '更新会话失败' });
    }
  }
}

export const authController = new AuthController();
