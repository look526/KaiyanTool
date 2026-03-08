import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { Permission, Role } from '../types/auth.types';
import './auth.middleware';

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
      if (!req.user_id) {
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

      const userRole: Role = project.owner_id === req.user_id ? Role.OWNER : Role.VIEWER;

      const member = await prisma.projectMember.findUnique({
        where: {
          project_id_user_id: {
            project_id: projectId,
            user_id: req.user_id,
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
      logger.error('Permission check failed', { error, userId: req.user_id, project_id: req.params.project_id });
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export function requireAnyPermission(permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user_id) {
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

      const userRole: Role = project.owner_id === req.user_id ? Role.OWNER : Role.VIEWER;

      const member = await prisma.projectMember.findUnique({
        where: {
          project_id_user_id: {
            project_id: projectId,
            user_id: req.user_id,
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
      logger.error('Permission check failed', { error, userId: req.user_id, project_id: req.params.project_id });
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
    if (!req.user_id) {
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

    if (project.owner_id !== req.user_id) {
      const member = await prisma.projectMember.findUnique({
        where: {
          project_id_user_id: {
            project_id: projectId,
            user_id: req.user_id,
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
    logger.error('Project access check failed', { error, userId: req.user_id, project_id: req.params.project_id });
    res.status(500).json({ error: 'Access check failed' });
  }
};

export const checkProjectRole = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user_id) {
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

      if (project.owner_id === req.user_id) {
        userRole = Role.OWNER;
      } else {
        const member = await prisma.projectMember.findUnique({
          where: {
            project_id_user_id: {
              project_id: projectId,
              user_id: req.user_id,
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
      logger.error('Project role check failed', { error, userId: req.user_id, project_id: req.params.project_id });
      res.status(500).json({ error: 'Role check failed' });
    }
  };
};


