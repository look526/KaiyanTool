export interface Shot {
  id: string;
  episode_id: string;
  scene_id: string | null;
  shot_number: number;
  description: string;
  model: string | null;
  aspect_ratio: string;
  resolution: string;
  status: 'pending' | 'generating' | 'completed';
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateShotInput {
  scene_id?: string;
  description: string;
  model?: string;
  aspect_ratio?: string;
  resolution?: string;
}

export interface UpdateShotInput {
  scene_id?: string;
  description?: string;
  model?: string;
  aspect_ratio?: string;
  resolution?: string;
  status?: string;
}

export interface GenerateShotInput {
  provider_id: string;
  model: string;
  prompt: string;
  aspect_ratio?: string;
  resolution?: string;
}

export interface BatchGenerateInput {
  shot_ids: string[];
  provider_id: string;
  model: string;
  aspect_ratio?: string;
  resolution?: string;
}
