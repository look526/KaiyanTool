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
