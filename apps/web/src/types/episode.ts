export interface Episode {
  id: string;
  title: string;
  description: string | null;
  episode_number: number;
  created_at: string;
  updated_at: string;
  Script?: { content: string };
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
