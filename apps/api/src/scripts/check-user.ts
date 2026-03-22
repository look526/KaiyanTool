import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: 'likaiyan'
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      created_at: true,
    }
  });

  console.log('Users found:', JSON.stringify(users, null, 2));

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      created_at: true,
    }
  });

  console.log('\nAll users:', JSON.stringify(allUsers, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
