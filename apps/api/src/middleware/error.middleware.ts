import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code: string = 'BAD_REQUEST', details?: any): AppError {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message: string = '未授权', code: string = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message: string = '禁止访问', code: string = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(message: string, code: string = 'NOT_FOUND'): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code: string = 'CONFLICT'): AppError {
    return new AppError(message, 409, code);
  }

  static validation(message: string, details?: any): AppError {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  static internal(message: string = '服务器内部错误', code: string = 'INTERNAL_ERROR'): AppError {
    return new AppError(message, 500, code);
  }

  static serviceUnavailable(message: string = '服务暂时不可用', code: string = 'SERVICE_UNAVAILABLE'): AppError {
    return new AppError(message, 503, code);
  }
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  stack?: string;
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const userId = (req as any).userId;

  if (err instanceof AppError) {
    if (err.isOperational) {
      logger.warn('Application error', {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        userId,
        details: err.details,
      });
    } else {
      logger.error('Non-operational error', {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        userId,
        stack: err.stack,
      });
    }

    const response: ErrorResponse = {
      error: err.message,
      code: err.code,
    };

    if (err.details && process.env.NODE_ENV === 'development') {
      response.details = err.details;
    }

    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const isNetworkError = isNetworkRelatedError(err);
  const statusCode = isNetworkError ? 503 : 500;
  const errorCode = isNetworkError ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR';
  const errorMessage = isNetworkError 
    ? 'AI服务暂时不可用，请稍后再试' 
    : '服务器内部错误';

  const response: ErrorResponse = {
    error: errorMessage,
    code: errorCode,
  };

  if (process.env.NODE_ENV === 'development') {
    response.details = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

function isNetworkRelatedError(err: Error): boolean {
  const networkErrorPatterns = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'EHOSTUNREACH',
    'timeout',
    'network',
    'fetch failed',
  ];

  const errorMessage = err.message.toLowerCase();
  return networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern.toLowerCase())
  );
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `路由 ${req.method} ${req.path} 不存在`,
    code: 'ROUTE_NOT_FOUND',
  });
}
