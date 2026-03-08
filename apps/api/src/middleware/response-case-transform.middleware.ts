import { Request, Response, NextFunction } from 'express';
import { transformKeysToCamel } from '../utils/case-transform';

const CASE_TRANSFORM_ENABLED = process.env.CASE_TRANSFORM_ENABLED !== 'false';

export function responseCaseTransform(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!CASE_TRANSFORM_ENABLED) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = function (body: any): Response {
    if (body === null || body === undefined) {
      return originalJson(body);
    }

    if (typeof body !== 'object') {
      return originalJson(body);
    }

    if (body.success === false || (body.error && typeof body.error === 'object')) {
      return originalJson(body);
    }

    const transformedBody = transformKeysToCamel(body);
    return originalJson(transformedBody);
  };

  next();
}
