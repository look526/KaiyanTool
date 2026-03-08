import type { PaginationParams } from './types/common';

export const queryKeys = {
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },

  projects: {
    all: ['projects'] as const,
    list: (params?: PaginationParams) => ['projects', 'list', params] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    members: (projectId: string) => ['projects', 'members', projectId] as const,
    scripts: (projectId: string) => ['projects', 'scripts', projectId] as const,
    documents: (projectId: string) => ['projects', 'documents', projectId] as const,
    items: (projectId: string) => ['projects', 'items', projectId] as const,
  },

  aiProviders: {
    all: ['aiProviders'] as const,
    detail: (id: string) => ['aiProviders', 'detail', id] as const,
    models: (providerId: string) => ['aiProviders', 'models', providerId] as const,
  },

  documents: {
    all: ['documents'] as const,
    list: (params?: PaginationParams) => ['documents', 'list', params] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
  },

  scripts: {
    all: ['scripts'] as const,
    list: (projectId: string) => ['scripts', 'list', projectId] as const,
    detail: (id: string) => ['scripts', 'detail', id] as const,
  },

  characters: {
    all: (projectId: string) => ['characters', 'all', projectId] as const,
    list: (projectId: string) => ['characters', 'list', projectId] as const,
    detail: (id: string) => ['characters', 'detail', id] as const,
    wardrobes: (characterId: string) => ['characters', 'wardrobes', characterId] as const,
  },

  scenes: {
    all: (projectId: string) => ['scenes', 'all', projectId] as const,
    list: (projectId: string) => ['scenes', 'list', projectId] as const,
    detail: (id: string) => ['scenes', 'detail', id] as const,
  },

  shots: {
    all: (projectId: string) => ['shots', 'all', projectId] as const,
    list: (projectId: string, sceneId?: string) => ['shots', 'list', projectId, sceneId] as const,
    detail: (id: string) => ['shots', 'detail', id] as const,
  },

  novels: {
    all: (projectId: string) => ['novels', 'all', projectId] as const,
    list: (projectId: string) => ['novels', 'list', projectId] as const,
    detail: (id: string) => ['novels', 'detail', id] as const,
    chapters: (novelId: string) => ['novels', 'chapters', novelId] as const,
  },

  assets: {
    all: (projectId?: string) => ['assets', 'all', projectId] as const,
    list: (projectId: string, params?: Record<string, string>) => ['assets', 'list', projectId, params] as const,
    global: (params?: Record<string, string>) => ['assets', 'global', params] as const,
  },

  prompts: {
    all: ['prompts'] as const,
    templates: (category?: string) => ['prompts', 'templates', category] as const,
    polish: (prompt: string) => ['prompts', 'polish', prompt] as const,
  },

  analytics: {
    platform: ['analytics', 'platform'] as const,
    usage: ['analytics', 'usage'] as const,
    project: (projectId: string) => ['analytics', 'project', projectId] as const,
  },

  modelPreferences: {
    all: ['modelPreferences'] as const,
    user: () => ['modelPreferences', 'user'] as const,
    history: (params?: Record<string, string>) => ['modelPreferences', 'history', params] as const,
  },

  migrations: {
    all: ['migrations'] as const,
    list: () => ['migrations', 'list'] as const,
  },
};
