export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  plan: string
  role: string
  storage_used: bigint
  storage_limit: bigint
  created_at: Date
  updated_at: Date
}

export interface Project {
  id: string
  owner_id: string
  name: string
  description: string | null
  type: 'script' | 'novel' | 'mixed'
  status: string
  settings: Record<string, unknown>
  thumbnail_url: string | null
  created_at: Date
  updated_at: Date
  user_id?: string
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
  project_id: string
  name: string
  age: number | null
  gender: string | null
  appearance: string
  reference_images: string[]
  description?: string
  avatar?: string | null
  wardrobes?: any[]
  created_at: Date
  updated_at: Date
  _count?: {
    shots?: number
  }
}

export interface Scene {
  id: string
  project_id: string
  location: string
  time: string
  atmosphere: string | null
  reference_images: string[]
  created_at: Date
  updated_at: Date
  _count?: {
    shots?: number
  }
}

export interface Content {
  id: string
  project_id: string
  type: 'script' | 'novel'
  raw_text: string
  structured_data: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
}

export interface AIProvider {
  id: string
  type: string
  api_key: string
  base_url: string | null
  models: AIProviderModel[]
  enabled: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface AIProviderModel {
  id: string
  name: string
  types: string[]
  description?: string
  capabilities: string[]
  created_at: string
  updated_at: string
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
  remember_me?: boolean
}

export interface AuthResponse {
  user: User
  token?: string
  remember_me?: boolean
}

export interface CreateProjectData {
  name: string
  description: string
  type: string
}

export interface CreateAIProviderData {
  type: string
  api_key: string
  base_url?: string
  enabled?: boolean
}

export interface UpdateAIProviderData {
  type?: string
  api_key?: string
  base_url?: string
  enabled?: boolean
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
  project_id: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  status: string
  project_id: string
  document_id: string | null
  created_at: string
  updated_at: string
}

export interface ExportData {
  project: Project
  documents: Document[]
  videos: Video[]
  characters: Character[]
}

export interface Member {
  id: string
  user_id: string
  project_id: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  joined_at: string
  user: {
    id: string
    email: string
    name?: string
    avatar_url?: string
  }
}

export interface SearchUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface Shot {
  id: string
  project_id: string
  scene_id?: string
  character_id?: string
  chapter_number?: number
  episode_number?: number
  segment_id?: number
  cell_id?: number
  action_summary?: string
  camera_movement?: string
  start_prompt?: string
  end_prompt?: string
  start_image_url?: string
  end_image_url?: string
  video_url?: string
  duration: number
  aspect_ratio: string
  visual_style?: string
  created_at: string
  updated_at: string
}

export interface NineGridPanel {
  id: string
  shot_id: string
  position: number
  prompt: string
  image_url: string | null
  created_at: string
}

export interface Script {
  id: string
  project_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}
