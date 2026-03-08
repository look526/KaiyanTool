import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

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

export async function getUserProjectRole(
  projectId: string,
  userId: string
): Promise<Role> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw AppError.notFound('项目不存在');
  }

  if (project.owner_id === userId) {
    return Role.OWNER;
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
  });

  if (!member) {
    throw AppError.forbidden('无权访问此项目');
  }

  return member.role as Role;
}

export function checkPermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw AppError.forbidden('权限不足');
  }
}

export function checkAnyPermission(role: Role, permissions: Permission[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw AppError.forbidden('权限不足');
  }
}