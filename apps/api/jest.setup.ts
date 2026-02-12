import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

beforeAll(() => {
  prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
