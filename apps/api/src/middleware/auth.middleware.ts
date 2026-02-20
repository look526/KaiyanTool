import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ENABLE_AUTH = false

declare module 'express' {
  export interface Request {
    userId?: string
    user?: { id: string; email: string; name: string | null }
    session?: { id: string; userId: string; expiresAt: Date; token: string }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!ENABLE_AUTH) {
      req.userId = '00000000-0000-0000-0000-000000000001'
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
            username: true,
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
              username: true,
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
