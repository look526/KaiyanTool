import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const email = 'likaiyan@test.com';
  const password = 'likaiyan';
  const name = 'likaiyan';

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('User already exists:', existingUser);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      password_hash: hashedPassword,
      name,
      role: 'user',
      created_at: new Date(),
      updated_at: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      created_at: true,
    }
  });

  console.log('User created successfully:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
