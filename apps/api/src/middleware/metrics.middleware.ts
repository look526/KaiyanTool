import { Request, Response, NextFunction } from 'express';
import { recordHttpRequest } from '../lib/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    recordHttpRequest(req.method, route, res.statusCode, duration);
  });
  
  next();
}
