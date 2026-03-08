import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorResponse } from '../types/response.types';

export function responseMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    if (body && typeof body === 'object') {
      if (body.success === false || (body.error && typeof body.error === 'object')) {
        return originalJson(body);
      }
      
      if (body.success === true) {
        return originalJson(body);
      }
      
      return originalJson({
        success: true,
        data: body,
      });
    }
    
    return originalJson(body);
  };

  next();
}

export function standardizeResponse<T>(
  data: T,
  meta?: any
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function standardizeError(
  code: string,
  message: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export function convertLegacyError(legacyError: any): ErrorResponse {
  if (legacyError.error && typeof legacyError.error === 'string') {
    return standardizeError('LEGACY_ERROR', legacyError.error);
  }
  if (typeof legacyError === 'string') {
    return standardizeError('LEGACY_ERROR', legacyError);
  }
  return legacyError;
}