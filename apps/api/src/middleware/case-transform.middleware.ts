import { Request, Response, NextFunction, RequestHandler } from 'express';
import { transformKeysToSnake } from '../utils/case-transform';

export interface CaseTransformOptions {
  skipRoutes?: string[];
  transformQuery?: boolean;
}

const DEFAULT_OPTIONS: CaseTransformOptions = {
  skipRoutes: ['/api/health'],
  transformQuery: false,
};

export function transformRequestBody(
  options: CaseTransformOptions = DEFAULT_OPTIONS
): RequestHandler {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return (req: Request, _res: Response, next: NextFunction) => {
    const path = req.path;

    if (mergedOptions.skipRoutes?.some((skipPath) => path.startsWith(skipPath))) {
      return next();
    }

    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      req.body = transformKeysToSnake(req.body);
    }

    if (mergedOptions.transformQuery && req.query && typeof req.query === 'object') {
      req.query = transformKeysToSnake(req.query) as typeof req.query;
    }

    next();
  };
}

export function requestCaseTransform(
  options: CaseTransformOptions = DEFAULT_OPTIONS
): RequestHandler {
  return transformRequestBody(options);
}

export default requestCaseTransform;
