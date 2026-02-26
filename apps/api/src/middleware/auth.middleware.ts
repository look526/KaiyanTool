import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

const ENABLE_AUTH = true

export interface AuthRequest extends Request {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!ENABLE_AUTH) {
      req.userId = '00000000-0000-0000-0000-000000000001'
      req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'dev@example.com', name: 'Dev User' }
      next()
      return
    }

    const sessionToken = req.cookies?.sessionId as string | undefined

    if (!sessionToken) {
      res.status(401).json({ error: '未登录' })
      return
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      res.status(401).json({ error: '会话已过期，请重新登录' })
      return
    }

    req.userId = session.userId
    req.user = session.user
    req.session = session
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: '认证失败' })
  }
}

export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies?.sessionId as string | undefined

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      })

      if (session && session.expiresAt >= new Date()) {
        req.userId = session.userId
        req.user = session.user
        req.session = session
      }
    }

    next()
  } catch (error) {
    next()
  }
}
