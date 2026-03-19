export interface Shot {
  project_id?: string;
  id: string;
  episode_id: string;
  scene_id: string | null;
  character_id?: string | null;
  chapter_number?: number | null;
  episode_number?: number | null;
  segment_id?: number | null;
  cell_id?: number | null;
  shot_number?: number;
  description?: string;
  action_summary?: string;
  camera_movement?: string | null;
  start_prompt?: string | null;
  end_prompt?: string | null;
  start_image_url?: string | null;
  end_image_url?: string | null;
  model: string | null;
  aspect_ratio: string;
  resolution: string;
  duration?: number;
  visual_style?: string | null;
  status: 'pending' | 'generating' | 'completed' | 'failed' | string;
  video_url: string | null;
  Scene?: {
    id: string;
    location?: string | null;
    time?: string | null;
  } | null;
  Character?: {
    id: string;
    name?: string | null;
  } | null;
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
  character_id?: string | null;
  description?: string;
  action_summary?: string;
  model?: string;
  aspect_ratio?: string;
  resolution?: string;
  status?: string;
  camera_movement?: string;
  start_prompt?: string;
  end_prompt?: string;
  start_image_url?: string | null;
  end_image_url?: string | null;
  duration?: number;
  visual_style?: string;
}

export interface GenerateShotInput {
  provider_id: string;
}

export interface GenerateShotResponse {
  video_url: string;
  duration?: number;
  resolution?: string;
  shot?: Shot;
}

export interface BatchGenerateInput {
  shot_ids: string[];
  provider_id: string;
  model: string;
  aspect_ratio?: string;
  resolution?: string;
}
