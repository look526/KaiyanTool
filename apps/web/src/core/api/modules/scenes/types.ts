export interface Scene {
  id: string;
  episode_id: string;
  location: string;
  time: string;
  description: string | null;
  scene_order: number;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateSceneInput {
  location: string;
  time: string;
  description?: string;
}

export interface UpdateSceneInput {
  location?: string;
  time?: string;
  description?: string;
  status?: string;
}
