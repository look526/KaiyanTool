import { Role } from '../middleware/permission.middleware';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: { id: string; email: string; name: string | null };
      session?: { id: string; userId: string; expiresAt: Date; token: string };
      userRole?: Role;
    }
  }
}
