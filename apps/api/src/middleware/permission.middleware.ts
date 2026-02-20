import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

declare module 'express' {
  export interface Request {
    userRole?: Role;
  }
}

export enum Permission {
  PROJECT_READ = 'project:read',
  PROJECT_WRITE = 'project:write',
  PROJECT_DELETE = 'project:delete',
  PROJECT_MANAGE_MEMBERS = 'project:manage_members',

  CHARACTER_READ = 'character:read',
  CHARACTER_WRITE = 'character:write',
  CHARACTER_DELETE = 'character:delete',

  SCENE_READ = 'scene:read',
  SCENE_WRITE = 'scene:write',
  SCENE_DELETE = 'scene:delete',

  SHOT_READ = 'shot:read',
  SHOT_WRITE = 'shot:write',
  SHOT_DELETE = 'shot:delete',

  AI_PROVIDER_READ = 'ai_provider:read',
  AI_PROVIDER_WRITE = 'ai_provider:write',
  AI_PROVIDER_DELETE = 'ai_provider:delete',
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    Permission.PROJECT_READ,
    Permission.PROJECT_WRITE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE_MEMBERS,
    Permission.CHARACTER_READ,
    Permission.CHARACTER_WRITE,
    Permission.CHARACTER_DELETE,
    Permission.SCENE_READ,
    Permission.SCENE_WRITE,
    Permission.SCENE_DELETE,
    Permission.SHOT_READ,
    Permission.SHOT_WRITE,
    Permission.SHOT_DELETE,
    Permission.AI_PROVIDER_READ,
    Permission.AI_PROVIDER_WRITE,
    Permission.AI_PROVIDER_DELETE,
  ],
  [Role.ADMIN]: [
    Permission.PROJECT_READ,
    Permission.PROJECT_WRITE,
    Permission.CHARACTER_READ,
    Permission.CHARACTER_WRITE,
    Permission.CHARACTER_DELETE,
    Permission.SCENE_READ,
    Permission.SCENE_WRITE,
    Permission.SCENE_DELETE,
    Permission.SHOT_READ,
    Permission.SHOT_WRITE,
    Permission.SHOT_DELETE,
    Permission.AI_PROVIDER_READ,
    Permission.AI_PROVIDER_WRITE,
    Permission.AI_PROVIDER_DELETE,
  ],
  [Role.EDITOR]: [
    Permission.PROJECT_READ,
    Permission.CHARACTER_READ,
    Permission.CHARACTER_WRITE,
    Permission.SCENE_READ,
    Permission.SCENE_WRITE,
    Permission.SHOT_READ,
    Permission.SHOT_WRITE,
    Permission.AI_PROVIDER_READ,
  ],
  [Role.VIEWER]: [
    Permission.PROJECT_READ,
    Permission.CHARACTER_READ,
    Permission.SCENE_READ,
    Permission.SHOT_READ,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => ROLE_PERMISSIONS[role].includes(permission));
}

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const userRole: Role = project.ownerId === req.userId ? Role.OWNER : Role.VIEWER;

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.userId,
          },
        },
      });

      if (member) {
        if (!hasPermission(member.role as Role, permission)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      } else {
        if (!hasPermission(userRole, permission)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      logger.error('Permission check failed', { error, userId: req.userId, projectId: req.params.projectId });
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export function requireAnyPermission(permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const userRole: Role = project.ownerId === req.userId ? Role.OWNER : Role.VIEWER;

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.userId,
          },
        },
      });

      if (member) {
        if (!hasAnyPermission(member.role as Role, permissions)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      } else {
        if (!hasAnyPermission(userRole, permissions)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      logger.error('Permission check failed', { error, userId: req.userId, projectId: req.params.projectId });
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export const checkProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.ownerId !== req.userId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.userId,
          },
        },
      });

      if (!member) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error('Project access check failed', { error, userId: req.userId, projectId: req.params.projectId });
    res.status(500).json({ error: 'Access check failed' });
  }
};

export const checkProjectRole = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({ error: 'Project ID is required' });
        return;
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      let userRole: Role;

      if (project.ownerId === req.userId) {
        userRole = Role.OWNER;
      } else {
        const member = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: req.userId,
            },
          },
        });

        if (!member) {
          res.status(403).json({ error: 'Access denied' });
          return;
        }

        userRole = member.role as Role;
      }

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      logger.error('Project role check failed', { error, userId: req.userId, projectId: req.params.projectId });
      res.status(500).json({ error: 'Role check failed' });
    }
  };
};


