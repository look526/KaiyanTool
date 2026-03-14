export interface ShotAlternative {
  id: string;
  shot_id: string;
  video_url: string;
  is_recommended: boolean;
  version: number;
  metadata: any;
  created_at: string;
}

export interface CreateAlternativeInput {
  video_url: string;
  metadata?: any;
}
