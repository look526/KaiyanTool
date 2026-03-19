import { api } from '../../client';

/**
 * @description 兼容 `{ success, data }` 与直接返回实体两种响应结构。
 */
function unwrapResponse<T>(response: any): T {
  return response?.data?.data ?? response?.data ?? response;
}

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
    return unwrapResponse<ShotDraft[]>(response);
  },

  /**
   * 保存草稿
   */
  async saveDraft(
    episodeId: string,
    input: SaveDraftInput
  ): Promise<ShotDraft> {
    const response = await api.post(`/episodes/${episodeId}/drafts`, input);
    return unwrapResponse<ShotDraft>(response);
  },

  /**
   * 更新草稿
   */
  async updateDraft(
    id: string,
    draft_data: any
  ): Promise<ShotDraft> {
    const response = await api.put(`/drafts/${id}`, { draft_data });
    return unwrapResponse<ShotDraft>(response);
  },

  /**
   * 删除草稿
   */
  async deleteDraft(id: string): Promise<void> {
    await api.delete(`/drafts/${id}`);
  },
};


