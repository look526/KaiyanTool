import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import logger from '../lib/logger'

export class InitAdminController {
  async initAdmin(_req: Request, res: Response): Promise<void> {
    try {
      const adminEmail = 'likaiyan'
      const adminPassword = 'likaiyan'

      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
      })

      if (existingAdmin) {
        logger.info('超级管理员已存在', { email: adminEmail })
        res.json({
          message: '超级管理员已存在',
          admin: {
            email: existingAdmin.email,
            name: existingAdmin.name,
            role: existingAdmin.role,
          },
        })
        return
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10)

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: '超级管理员',
          role: 'admin',
          plan: 'premium',
          storageLimit: BigInt(107374182400),
        },
      })

      res.status(201).json({
        message: '超级管理员创建成功',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      })
      logger.info('超级管理员创建成功', { email: adminEmail, userId: admin.id })
    } catch (error) {
      logger.error('初始化管理员失败', { error })
      if (error instanceof Error) {
        res.status(500).json({ error: error.message })
      } else {
        res.status(500).json({ error: '初始化管理员失败' })
      }
    }
  }
}

export const initAdminController = new InitAdminController()
