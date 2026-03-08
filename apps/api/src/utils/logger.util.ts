import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export function loggerUtil(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = (req as any).userId || req.user?.id;

    logger.info('API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId,
    });
  });

  next();
}

export function logError(
  error: Error,
  context: {
    userId?: string;
    path?: string;
    method?: string;
    [key: string]: any;
  }
): void {
  logger.error('API Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

export function logWarning(
  message: string,
  context: {
    userId?: string;
    path?: string;
    method?: string;
    [key: string]: any;
  }
): void {
  logger.warn('API Warning', {
    message,
    ...context,
  });
}

export function logInfo(
  message: string,
  context: {
    userId?: string;
    path?: string;
    method?: string;
    [key: string]: any;
  }
): void {
  logger.info('API Info', {
    message,
    ...context,
  });
}