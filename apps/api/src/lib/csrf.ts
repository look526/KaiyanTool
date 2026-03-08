import crypto from 'crypto';

interface CsrfToken {
  token: string;
  expiresAt: Date;
}

export const csrfTokens = new Map<string, CsrfToken>();

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function storeCsrfToken(sessionId: string, token: string): void {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  csrfTokens.set(sessionId, { token, expiresAt });
}

export function getCsrfToken(sessionId: string): CsrfToken | undefined {
  return csrfTokens.get(sessionId);
}

export function clearCsrfToken(sessionId: string): void {
  csrfTokens.delete(sessionId);
}

// 定期清理过期的令牌
setInterval(() => {
  const now = new Date();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expiresAt < now) {
      csrfTokens.delete(key);
    }
  }
}, 60 * 60 * 1000);
