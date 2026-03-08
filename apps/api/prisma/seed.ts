import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  const adminEmail = 'likaiyan@test.com'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('超级管理员已存在，跳过创建')
  } else {
    const passwordHash = await bcrypt.hash('likaiyan', 10)

    const admin = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: adminEmail,
        password_hash: passwordHash,
        name: '超级管理员',
        role: 'admin',
        plan: 'premium',
        storage_limit: BigInt(107374182400), // 100GB
        updated_at: new Date(),
      },
    })

    console.log('超级管理员创建成功:', { id: admin.id, email: admin.email })
  }

  console.log('数据库初始化完成')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
