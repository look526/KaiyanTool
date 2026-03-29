export interface EpisodeSceneApi {
  id: string;
  episode_id: string;
  location: string;
  time: string;
  description?: string | null;
  scene_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Episode {
  id: string;
  project_id?: string;
  title: string;
  description: string | null;
  episode_number: number;
  script_id?: string | null;
  created_at: string;
  updated_at: string;
  Script?: { content: string; title?: string; id?: string } | null;
  Scene?: EpisodeSceneApi[];
}

export interface Scene {
  id: string;
  episode_id: string;
  scene_number: number;
  description: string;
  scene_title: string | null;
  location: string | null;
  time_of_day: string | null;
  created_at: string;
  updated_at: string;
}
