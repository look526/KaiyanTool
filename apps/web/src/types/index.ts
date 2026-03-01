export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface Content {
  id: string;
  projectId: string;
  type: string;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  type: string;
  apiKey?: string;
  isActive?: boolean;
  enabled?: boolean;
  models?: AIProviderModel[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AIProviderModel {
  id: string;
  name: string;
  type?: string;
  types?: string[];
  providerId?: string;
  isActive?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  referenceImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Scene {
  id: string | number;
  location?: string;
  time?: string;
  content?: string;
  characters?: string[];
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Shot {
  id: string;
  projectId?: string;
  sceneId?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Novel {
  id: string;
  projectId: string;
  title?: string;
  content?: string;
  chapters?: Chapter[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  title?: string;
  content?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  projectId?: string;
  title?: string;
  content?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Asset {
  id: string;
  projectId?: string;
  type?: string;
  url?: string;
  filename?: string;
  size?: number;
  createdAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members?: TeamMember[];
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  joinedAt?: string;
}

export interface AnalyticsData {
  totalGenerations?: number;
  totalImages?: number;
  totalVideos?: number;
  totalTokens?: number;
  period?: string;
  data?: any[];
}

export interface UsageStats {
  totalRequests?: number;
  totalTokens?: number;
  totalImages?: number;
  totalVideos?: number;
  byModel?: Record<string, number>;
  byProvider?: Record<string, number>;
}

export interface ModelPreference {
  id: string;
  userId?: string;
  contentType?: string;
  modelId?: string;
  isDefault?: boolean;
}

export interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: string;
  projectId?: string;
  model?: string;
}

export interface GenerateVideoParams {
  imageUrl?: string;
  prompt?: string;
  duration?: number;
  style?: string;
  projectId?: string;
  model?: string;
}

export interface MetricData {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  tags: Record<string, string>;
  timestamp: string;
}
