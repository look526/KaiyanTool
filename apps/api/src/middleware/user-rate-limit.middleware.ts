import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request, Response } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export const createUserRateLimit = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    keyGenerator: config.keyGenerator || ((req) => {
      const userId = (req as any).userId;
      if (userId) {
        return `user:${userId}`;
      }
      return ipKeyGenerator(req.ip || '');
    }),
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.message || '请求过于频繁，请稍后再试',
      },
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message || '请求过于频繁，请稍后再试',
        },
      });
    },
  });
};

export const userAuthRateLimit = createUserRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: '登录尝试过于频繁，请15分钟后再试',
});

export const userApiRateLimit = createUserRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'API请求过于频繁，请15分钟后再试',
});
