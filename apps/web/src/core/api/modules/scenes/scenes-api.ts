import { api } from '../../client';

export interface Scene {
  id: string;
  episode_id: string;
  location: string;
  time: string;
  description: string | null;
  scene_order: number;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateSceneInput {
  location: string;
  time: string;
  description?: string;
}

export interface UpdateSceneInput {
  location?: string;
  time?: string;
  description?: string;
  status?: string;
}

export const scenesApi = {
  /**
   * 获取场景列表
   */
  async getScenes(episodeId: string): Promise<Scene[]> {
    const response = await apiClient.get(`/episodes/${episodeId}/scenes`);
    return response.data.data || response.data;
  },

  /**
   * 获取场景详情
   */
  async getScene(id: string): Promise<Scene> {
    const response = await apiClient.get(`/scenes/${id}`);
    return response.data.data || response.data;
  },

  /**
   * 创建场景
   */
  async createScene(
    episodeId: string,
    input: CreateSceneInput
  ): Promise<Scene> {
    const response = await apiClient.post(`/episodes/${episodeId}/scenes`, input);
    return response.data.data || response.data;
  },

  /**
   * 更新场景
   */
  async updateScene(
    id: string,
    input: UpdateSceneInput
  ): Promise<Scene> {
    const response = await apiClient.put(`/scenes/${id}`, input);
    return response.data.data || response.data;
  },

  /**
   * 删除场景
   */
  async deleteScene(id: string): Promise<void> {
    await apiClient.delete(`/scenes/${id}`);
  },

  /**
   * 重排序场�?   */
  async reorderScenes(
    episodeId: string,
    scenes: Array<{ id: string; scene_order: number }>
  ): Promise<Scene[]> {
    const response = await apiClient.put(`/scenes/${episodeId}/reorder`, { scenes });
    return response.data.data || response.data;
  },
};

