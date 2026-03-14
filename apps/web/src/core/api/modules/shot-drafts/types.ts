export interface ShotDraft {
  id: string;
  shot_id: string | null;
  episode_id: string;
  scene_id: string | null;
  draft_data: any;
  created_at: string;
  updated_at: string;
}

export interface SaveDraftInput {
  shot_id?: string;
  scene_id?: string;
  draft_data: any;
}
