import { api } from '../../client';

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

export const shotsApi = {
  /**
   * 获取分镜列表
   */
  async getShots(episodeId: string): Promise<Shot[]> {
    const response = await apiClient.get(`/episodes/${episodeId}/shots`);
    return response.data.data || response.data;
  },

  /**
   * 获取分镜详情
   */
  async getShot(id: string): Promise<Shot> {
    const response = await apiClient.get(`/shots/${id}`);
    return response.data.data || response.data;
  },

  /**
   * 创建分镜
   */
  async createShot(
    episodeId: string,
    input: CreateShotInput
  ): Promise<Shot> {
    const response = await apiClient.post(`/episodes/${episodeId}/shots`, input);
    return response.data.data || response.data;
  },

  /**
   * 更新分镜
   */
  async updateShot(
    id: string,
    input: UpdateShotInput
  ): Promise<Shot> {
    const response = await apiClient.put(`/shots/${id}`, input);
    return response.data.data || response.data;
  },

  /**
   * 删除分镜
   */
  async deleteShot(id: string): Promise<void> {
    await apiClient.delete(`/shots/${id}`);
  },

  /**
   * 生成视频
   */
  async generateShot(
    id: string,
    input: GenerateShotInput
  ): Promise<{ success: boolean; video_url: string; generation_time: number }> {
    const response = await apiClient.post(`/shots/${id}/generate`, input);
    return response.data.data || response.data;
  },

  /**
   * 批量生成
   */
  async batchGenerateShots(
    episodeId: string,
    input: BatchGenerateInput
  ): Promise<{ success: boolean; successful: number; failed: number; total: number }> {
    const response = await apiClient.post(`/episodes/${episodeId}/shots/batch-generate`, input);
    return response.data.data || response.data;
  },

  /**
   * 重排序分�?   */
  async reorderShot(
    id: string,
    newOrder: number
  ): Promise<void> {
    await apiClient.put(`/shots/${id}/reorder`, { order: newOrder });
  },
};

