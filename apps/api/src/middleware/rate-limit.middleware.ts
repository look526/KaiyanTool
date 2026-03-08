import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const createRateLimit = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.message || '请求过于频繁，请稍后再试',
      },
    },
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    skipFailedRequests: config.skipFailedRequests || false,
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

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'API请求过于频繁，请15分钟后再试',
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: '登录尝试过于频繁，请15分钟后再试',
});

export const aiGenerationRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'AI生成请求过于频繁，请15分钟后再试',
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: '上传请求过于频繁，请1小时后再试',
});