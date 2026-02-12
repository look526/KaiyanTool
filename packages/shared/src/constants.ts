export const API_BASE_URL = process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:4000'

export const STORAGE_LIMITS = {
  free: 1073741824,
  basic: 10737418240,
  pro: 107374182400,
} as const

export const PROJECT_TYPES = {
  SCRIPT: 'script',
  NOVEL: 'novel',
  MIXED: 'mixed',
} as const

export const CONTENT_TYPES = {
  SCRIPT: 'script',
  NOVEL: 'novel',
} as const

export const MEMBER_ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GOOGLE: 'google',
  ZHIPU: 'zhipu',
} as const
