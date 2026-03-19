import { api } from '../../client';

/**
 * @description 兼容 `{ success, data }` 与直接返回实体两种响应结构。
 */
function unwrapResponse<T>(response: any): T {
  return response?.data?.data ?? response?.data ?? response;
}

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

export const shotAlternativesApi = {
  /**
   * 获取备选视频列�?   */
  async getAlternatives(shotId: string): Promise<ShotAlternative[]> {
    const response = await api.get(`/shots/${shotId}/alternatives`);
    return unwrapResponse<ShotAlternative[]>(response);
  },

  /**
   * 创建备选视�?   */
  async createAlternative(
    shotId: string,
    input: CreateAlternativeInput
  ): Promise<ShotAlternative> {
    const response = await api.post(`/shots/${shotId}/alternatives`, input);
    return unwrapResponse<ShotAlternative>(response);
  },

  /**
   * 设为推荐视频
   */
  async setRecommended(shotId: string, alternativeId: string): Promise<ShotAlternative> {
    const response = await api.put(`/shots/${shotId}/alternatives/${alternativeId}/recommend`);
    return unwrapResponse<ShotAlternative>(response);
  },

  /**
   * 删除备选视�?   */
  async deleteAlternative(shotId: string, alternativeId: string): Promise<void> {
    await api.delete(`/shots/${shotId}/alternatives/${alternativeId}`);
  },
};


