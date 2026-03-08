import { Request, Response, NextFunction } from 'express';

export function legacyResponseMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json.bind(res);
  const originalStatus = res.status.bind(res);

  res.status = function (statusCode: number) {
    const statusRes = originalStatus(statusCode);
    const originalJsonForStatus = statusRes.json.bind(statusRes);

    statusRes.json = function (body: any) {
      const normalized = normalizeResponse(body);
      console.log('[LegacyResponseMiddleware] Normalized response:', JSON.stringify(normalized));
      return originalJsonForStatus(normalized);
    };

    return statusRes as any;
  };

  res.json = function (body: any) {
    const normalized = normalizeResponse(body);
    console.log('[LegacyResponseMiddleware] Normalized response:', JSON.stringify(normalized));
    return originalJson(normalized);
  };

  next();
}

function normalizeResponse(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  if (body.success === false || (body.error && typeof body.error === 'object')) {
    return body;
  }

  if (body.success === true) {
    return body;
  }

  if (body.error && typeof body.error === 'string') {
    console.log('[LegacyResponseMiddleware] Converting legacy error format:', body.error);
    return {
      success: false,
      error: {
        code: 'LEGACY_ERROR',
        message: body.error,
      },
    };
  }

  if (body.error && typeof body.error === 'object' && body.error.code && body.error.message) {
    return body;
  }

  console.log('[LegacyResponseMiddleware] Wrapping data in success format');
  return {
    success: true,
    data: body,
  };
}