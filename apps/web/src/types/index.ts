export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Content {
  id: string;
  project_id: string;
  type: string;
  title?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  type: string;
  api_key?: string;
  is_active?: boolean;
  enabled?: boolean;
  models?: AIProviderModel[];
  created_at?: string;
  updated_at?: string;
}

export interface AIProviderModel {
  id: string;
  name: string;
  model_id?: string;
  type?: string;
  types?: string[];
  provider_id?: string;
  is_active?: boolean;
  enabled?: boolean;
  is_assistant_default?: boolean;
  description?: string;
  capabilities?: string[];
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at?: string;
  created_at?: string;
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
  reference_images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Scene {
  id: string | number;
  location?: string;
  time?: string;
  content?: string;
  characters?: string[];
  project_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Shot {
  id: string;
  project_id?: string;
  scene_id?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Novel {
  id: string;
  project_id: string;
  title?: string;
  content?: string;
  chapters?: Chapter[];
  created_at?: string;
  updated_at?: string;
}

export interface Chapter {
  id: string;
  novel_id: string;
  title?: string;
  content?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  project_id: string;
  type: string;
  url: string;
  thumbnail_url?: string;
  category?: string;
  category_label?: string;
  filename?: string;
  size?: number;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members?: TeamMember[];
  created_at?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role?: string;
  joined_at?: string;
}

export interface AnalyticsData {
  total_generations?: number;
  total_images?: number;
  total_videos?: number;
  total_tokens?: number;
  period?: string;
  data?: any[];
}

export interface UsageStats {
  total_requests?: number;
  total_tokens?: number;
  total_images?: number;
  total_videos?: number;
  by_model?: Record<string, number>;
  by_provider?: Record<string, number>;
}

export interface ModelPreference {
  id: string;
  user_id?: string;
  content_type?: string;
  model_id?: string;
  is_default?: boolean;
}

export interface GenerateImageParams {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  style?: string;
  project_id?: string;
  model?: string;
}

export interface GenerateVideoParams {
  image_url?: string;
  prompt?: string;
  duration?: number;
  style?: string;
  project_id?: string;
  model?: string;
}

export interface MetricData {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  tags: Record<string, string>;
  timestamp: string;
}
