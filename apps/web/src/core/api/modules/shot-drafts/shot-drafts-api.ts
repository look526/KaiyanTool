import { api } from '../../client';

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

export const shotDraftsApi = {
  /**
   * 获取草稿列表
   */
  async getDrafts(episodeId: string): Promise<ShotDraft[]> {
    const response = await api.get(`/episodes/${episodeId}/drafts`);
    return response.data.data || response.data;
  },

  /**
   * 保存草稿
   */
  async saveDraft(
    episodeId: string,
    input: SaveDraftInput
  ): Promise<ShotDraft> {
    const response = await api.post(`/episodes/${episodeId}/drafts`, input);
    return response.data.data || response.data;
  },

  /**
   * 更新草稿
   */
  async updateDraft(
    id: string,
    draft_data: any
  ): Promise<ShotDraft> {
    const response = await api.put(`/drafts/${id}`, { draft_data });
    return response.data.data || response.data;
  },

  /**
   * 删除草稿
   */
  async deleteDraft(id: string): Promise<void> {
    await api.delete(`/drafts/${id}`);
  },
};


