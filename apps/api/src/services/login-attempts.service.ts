import { prisma } from '../lib/prisma';
import crypto from 'crypto';

interface LoginAttempt {
  identifier: string;
  ip: string;
  attempts: number;
  locked_until: Date | null;
  first_attempt: Date;
}

export class LoginAttemptsService {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCK_DURATION = 15 * 60 * 1000;
  private static readonly ATTEMPT_WINDOW = 15 * 60 * 1000;

  private static attempts = new Map<string, LoginAttempt>();

  static async recordAttempt(identifier: string, ip: string): Promise<{
    allowed: boolean;
    remaining_attempts: number;
    locked_until: Date | null;
  }> {
    const key = `${identifier}:${ip}`;
    const now = new Date();
    const existing = this.attempts.get(key);

    if (existing) {
      const time_since_first = now.getTime() - existing.first_attempt.getTime();

      if (time_since_first > this.ATTEMPT_WINDOW) {
        this.attempts.delete(key);
        return this.recordAttempt(identifier, ip);
      }

      if (existing.locked_until && existing.locked_until > now) {
        return {
          allowed: false,
          remaining_attempts: 0,
          locked_until: existing.locked_until,
        };
      }

      existing.attempts++;

      if (existing.attempts >= this.MAX_ATTEMPTS) {
        existing.locked_until = new Date(now.getTime() + this.LOCK_DURATION);

        try {
          await prisma.loginAttempt.create({
            data: {
              id: crypto.randomUUID(),
              identifier,
              ip,
              attempts: existing.attempts,
              locked_until: existing.locked_until,
              first_attempt: existing.first_attempt,
            },
          });
        } catch (error) {
          console.error('Failed to persist login attempt:', error);
        }

        return {
          allowed: false,
          remaining_attempts: 0,
          locked_until: existing.locked_until,
        };
      }

      return {
        allowed: true,
        remaining_attempts: this.MAX_ATTEMPTS - existing.attempts,
        locked_until: null,
      };
    }

    this.attempts.set(key, {
      identifier,
      ip,
      attempts: 1,
      locked_until: null,
      first_attempt: now,
    });

    return {
      allowed: true,
      remaining_attempts: this.MAX_ATTEMPTS - 1,
      locked_until: null,
    };
  }

  static async clearAttempts(identifier: string, ip: string): Promise<void> {
    const key = `${identifier}:${ip}`;
    this.attempts.delete(key);

    try {
      await prisma.loginAttempt.deleteMany({
        where: {
          identifier,
          ip,
        },
      });
    } catch (error) {
      console.error('Failed to clear login attempts:', error);
    }
  }

  static async isLocked(identifier: string, ip: string): Promise<boolean> {
    const key = `${identifier}:${ip}`;
    const attempt = this.attempts.get(key);
    const now = new Date();

    if (!attempt) return false;

    if (attempt.locked_until && attempt.locked_until > now) {
      return true;
    }

    return false;
  }

  static async getLockedUntil(identifier: string, ip: string): Promise<Date | null> {
    const key = `${identifier}:${ip}`;
    const attempt = this.attempts.get(key);
    const now = new Date();

    if (!attempt) return null;

    if (attempt.locked_until && attempt.locked_until > now) {
      return attempt.locked_until;
    }

    return null;
  }
}
