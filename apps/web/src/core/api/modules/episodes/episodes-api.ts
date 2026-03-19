import { api } from '../../client';

/**
 * @description 兼容 `{ success, data }` 与直接返回实体两种响应结构。
 */
function unwrapResponse<T>(response: any): T {
  return response?.data?.data ?? response?.data ?? response;
}

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

export const episodesApi = {
  /**
   * 获取剧集列表
   */
  async getEpisodes(
    projectId: string,
    params?: { search?: string; sort?: string; order?: 'asc' | 'desc' }
  ): Promise<Episode[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);

    console.log('[episodes-api] GET /projects/${projectId}/episodes');
    const response = await api.get(`/projects/${projectId}/episodes?${queryParams}`);
    console.log('[episodes-api] Response:', response);
    return unwrapResponse<Episode[]>(response);
  },

  /**
   * 获取剧集详情
   */
  async getEpisode(id: string): Promise<Episode> {
    const response = await api.get(`/episodes/${id}`);
    return unwrapResponse<Episode>(response);
  },

  /**
   * 获取剧集统计
   */
  async getEpisodeStats(id: string): Promise<EpisodeStats> {
    const response = await api.get(`/episodes/${id}/stats`);
    return unwrapResponse<EpisodeStats>(response);
  },

  /**
   * 创建剧集
   */
  async createEpisode(
    projectId: string,
    input: CreateEpisodeInput
  ): Promise<Episode> {
    const response = await api.post(`/projects/${projectId}/episodes`, input);
    return unwrapResponse<Episode>(response);
  },

  /**
   * 更新剧集
   */
  async updateEpisode(
    id: string,
    input: UpdateEpisodeInput
  ): Promise<Episode> {
    const response = await api.put(`/episodes/${id}`, input);
    return unwrapResponse<Episode>(response);
  },

  /**
   * 删除剧集
   */
  async deleteEpisode(id: string): Promise<void> {
    await api.delete(`/episodes/${id}`);
  },
};

