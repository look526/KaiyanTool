export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  bio: string | null
  plan: string
  storageUsed: bigint
  storageLimit: bigint
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string | null
  type: 'script' | 'novel' | 'mixed'
  status: string
  settings: Record<string, unknown>
  thumbnailUrl: string | null
  createdAt: Date
  updatedAt: Date
  userId?: string
  owner?: {
    id: string
    name: string | null
    email: string
  }
  _count?: {
    members: number
    characters?: number
    shots?: number
  }
}

export interface Character {
  id: string
  projectId: string
  name: string
  age: number | null
  gender: string | null
  appearance: string
  referenceImages: string[]
  description?: string
  avatar?: string | null
  wardrobes?: any[]
  createdAt: Date
  updatedAt: Date
  _count?: {
    shots?: number
  }
}

export interface Scene {
  id: string
  projectId: string
  location: string
  time: string
  atmosphere: string | null
  referenceImages: string[]
  createdAt: Date
  updatedAt: Date
  _count?: {
    shots?: number
  }
}

export interface Content {
  id: string
  projectId: string
  type: 'script' | 'novel'
  rawText: string
  structuredData: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

export interface AIProvider {
  id: string
  type: string
  apiKey: string
  baseUrl: string | null
  models: string[]
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface ProjectsResponse {
  projects: Project[]
  pagination: PaginationMeta
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  rememberMe?: boolean
}

export interface CreateProjectData {
  name: string
  description: string
  type: string
}

export interface CreateAIProviderData {
  type: string
  apiKey: string
  baseUrl?: string
  models?: string[]
}

export interface UpdateAIProviderData {
  type?: string
  apiKey?: string
  baseUrl?: string
  models?: string[]
  isActive?: boolean
}

export interface Chapter {
  id: string
  title: string
  content: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  title: string
  type: string
  content: string | null
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  videoUrl: string
  thumbnailUrl: string | null
  status: string
  projectId: string
  documentId: string | null
  createdAt: string
  updatedAt: string
}

export interface ExportData {
  project: Project
  documents: Document[]
  videos: Video[]
  characters: Character[]
}

export interface Member {
  id: string
  userId: string
  projectId: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: string
  user: {
    id: string
    email: string
    name?: string
    avatarUrl?: string
  }
}

export interface SearchUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

export interface Shot {
  id: string
  projectId: string
  sceneId?: string
  characterId?: string
  chapterNumber?: number
  episodeNumber?: number
  segmentId?: number
  cellId?: number
  actionSummary?: string
  cameraMovement?: string
  startPrompt?: string
  endPrompt?: string
  startImageUrl?: string
  endImageUrl?: string
  videoUrl?: string
  duration: number
  aspectRatio: string
  visualStyle?: string
  createdAt: string
  updatedAt: string
}

export interface NineGridPanel {
  id: string
  shotId: string
  position: number
  prompt: string
  imageUrl: string | null
  createdAt: string
}

export interface Script {
  id: string
  projectId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
