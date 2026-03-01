import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let isDatabaseAvailable = false;

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, database tests will be skipped');
    return;
  }

  try {
    prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
    
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseAvailable = true;
  } catch (error) {
    console.warn('Database connection failed, database tests will be skipped:', error);
    prisma = null;
    isDatabaseAvailable = false;
  }
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

export { prisma };

export const skipIfNoDatabase = () => {
  if (!isDatabaseAvailable || !prisma) {
    return true;
  }
  return false;
};

declare global {
  var __DATABASE_AVAILABLE__: boolean;
}

globalThis.__DATABASE_AVAILABLE__ = isDatabaseAvailable;
