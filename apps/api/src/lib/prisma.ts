import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// 确保在初始化 Prisma 客户端之前加载环境变量
dotenv.config({ path: '.env' })

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
