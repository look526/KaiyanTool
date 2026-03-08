import { Request, Response, NextFunction } from 'express';
import { csrfTokens, generateCsrfToken, storeCsrfToken } from '../lib/csrf';

export interface CsrfRequest extends Request {
  csrfToken?: string;
}

export function csrfMiddleware(req: CsrfRequest, res: Response, next: NextFunction): void {
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/init-admin', '/api/auth/me'];
  const isPublicPath = publicPaths.some(path => req.path === path);
  
  // 使用固定的sessionId来存储CSRF令牌
  const sessionId = 'csrf-token';
  
  if (isPublicPath && ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // 公共路径的GET请求也需要生成CSRF令牌
    const token = generateCsrfToken();
    storeCsrfToken(sessionId, token);

    res.setHeader('X-CSRF-Token', token);
    req.csrfToken = token;
    
    next();
    return;
  }
  
  if (isPublicPath && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // 公共路径的非GET请求，需要验证CSRF令牌
    const storedToken = csrfTokens.get(sessionId);
    const providedToken = req.headers['x-csrf-token'] as string || req.body?.csrfToken;

    if (!storedToken || !providedToken || storedToken.token !== providedToken) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'CSRF token 无效或已过期',
        },
      });
      return;
    }
    
    // 检查token是否过期
    if (storedToken.expiresAt < new Date()) {
      csrfTokens.delete(sessionId);
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_TOKEN_EXPIRED',
          message: 'CSRF token 已过期',
        },
      });
      return;
    }
    
    next();
    return;
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const token = generateCsrfToken();
    storeCsrfToken(sessionId, token);

    res.setHeader('X-CSRF-Token', token);
    req.csrfToken = token;
    
    next();
    return;
  }

  // 验证CSRF令牌
  const storedToken = csrfTokens.get(sessionId);
  const providedToken = req.headers['x-csrf-token'] as string || req.body?.csrfToken;

  if (!storedToken || !providedToken || storedToken.token !== providedToken) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token 无效或已过期',
      },
    });
    return;
  }
  
  // 检查token是否过期
  if (storedToken.expiresAt < new Date()) {
    csrfTokens.delete(sessionId);
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_EXPIRED',
        message: 'CSRF token 已过期',
      },
    });
    return;
  }

  next();
}

setInterval(() => {
  const now = new Date();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expiresAt < now) {
      csrfTokens.delete(key);
    }
  }
}, 60 * 60 * 1000);
