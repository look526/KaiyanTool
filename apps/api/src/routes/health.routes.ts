import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: string; latency?: number; error?: string };
    memory: { status: string; used: number; total: number; percentage: number };
    env: { status: string; missing: string[] };
  };
}

router.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = {
    database: { status: 'unknown' },
    memory: { status: 'unknown', used: 0, total: 0, percentage: 0 },
    env: { status: 'unknown', missing: [] },
  };

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = (usedMemory / totalMemory) * 100;

  checks.memory = {
    status: memoryPercentage > 90 ? 'unhealthy' : memoryPercentage > 70 ? 'degraded' : 'healthy',
    used: Math.round(usedMemory / 1024 / 1024),
    total: Math.round(totalMemory / 1024 / 1024),
    percentage: Math.round(memoryPercentage * 100) / 100,
  };

  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  checks.env = {
    status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
    missing: missingEnvVars,
  };

  const allHealthy = checks.database.status === 'healthy' && 
                     checks.memory.status !== 'unhealthy' && 
                     checks.env.status === 'healthy';

  const status: HealthStatus = {
    status: allHealthy ? 'healthy' : checks.database.status === 'unhealthy' ? 'unhealthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  const httpStatus = status.status === 'healthy' ? 200 : status.status === 'degraded' ? 200 : 503;

  logger.info('Health check completed', {
    status: status.status,
    duration: Date.now() - startTime,
    checks: {
      database: checks.database.status,
      memory: checks.memory.status,
      env: checks.env.status,
    },
  });

  res.status(httpStatus).json(status);
});

router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: 'Database unavailable' });
  }
});

export default router;
