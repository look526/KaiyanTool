import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

const ENABLE_AUTH = false

export interface AuthRequest extends Request {
  user_id?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  session?: {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!ENABLE_AUTH) {
      req.user_id = '00000000-0000-0000-0000-000000000001'
      req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'dev@example.com', name: 'Dev User' }
      next()
      return
    }

    const session_token = req.cookies?.sessionId as string | undefined

    if (!session_token) {
      logger.debug('No session token provided', { path: req.path })
      res.status(401).json({ error: '未登录' })
      return
    }

    const session = await prisma.session.findUnique({
      where: { token: session_token },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!session || session.expires_at < new Date()) {
      logger.info('Session expired or invalid', { 
        hasSession: !!session,
        expired: session ? session.expires_at < new Date() : false 
      })
      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      res.status(401).json({ error: '会话已过期，请重新登录' })
      return
    }

    req.user_id = session.user_id
    req.user = session.User
    req.session = {
      id: session.id,
      user_id: session.user_id,
      token: session.token,
      expires_at: session.expires_at
    }
    next()
  } catch (error) {
    logger.error('Auth middleware error', { 
      error: error instanceof Error ? error.message : String(error),
      path: req.path 
    })
    res.status(401).json({ error: '认证失败' })
  }
}

export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session_token = req.cookies?.sessionId as string | undefined

    if (session_token) {
      const session = await prisma.session.findUnique({
        where: { token: session_token },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      })

      if (session && session.expires_at >= new Date()) {
        req.user_id = session.user_id
        req.user = session.User
        req.session = {
          id: session.id,
          user_id: session.user_id,
          token: session.token,
          expires_at: session.expires_at
        }
      }
    }

    next()
  } catch (error) {
    logger.warn('Optional auth middleware error', { 
      error: error instanceof Error ? error.message : String(error) 
    })
    next()
  }
}
