import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'likaiyan@test.com';

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });

  console.log('User updated to admin:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
