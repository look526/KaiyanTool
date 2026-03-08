import { Role } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user_id?: string;
      user?: { id: string; email: string; name: string | null };
      session?: { id: string; user_id: string; expires_at: Date; token: string };
      userRole?: Role;
    }
  }
}
