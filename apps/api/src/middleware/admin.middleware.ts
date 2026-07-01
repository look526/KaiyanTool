import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user_id
    if (!userId) {
      res.status(401).json({ error: '未登录' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      res.status(403).json({ error: '需要管理员权限' })
      return
    }

    next()
  } catch (error) {
    logger.error('Admin authorization failed', {
      user_id: req.user_id,
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: '管理员权限校验失败' })
  }
}
