export interface Episode {
  id: string;
  project_id: string;
  title: string;
  episode_number: number;
  description: string | null;
  script_id: string | null;
  created_at: string;
  updated_at: string;
  scene_count?: number;
  shot_count?: number;
  generated_count?: number;
  pending_count?: number;
}

export interface EpisodeStats {
  scene_count: number;
  shot_count: number;
  generated_count: number;
  generating_count: number;
  pending_count: number;
}

export interface CreateEpisodeInput {
  title: string;
  description?: string;
  script_id?: string;
}

export interface UpdateEpisodeInput {
  title?: string;
  description?: string;
  script_id?: string;
}
