import { api } from '../../client';

/**
 * @description 兼容 `{ success, data }` 与直接返回实体两种响应结构。
 */
function unwrapResponse<T>(response: any): T {
  return response?.data?.data ?? response?.data ?? response;
}

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
    const response = await api.get(`/episodes/${episodeId}/scenes`);
    return unwrapResponse<Scene[]>(response);
  },

  /**
   * 获取场景详情
   */
  async getScene(id: string): Promise<Scene> {
    const response = await api.get(`/scenes/${id}`);
    return unwrapResponse<Scene>(response);
  },

  /**
   * 创建场景
   */
  async createScene(
    episodeId: string,
    input: CreateSceneInput
  ): Promise<Scene> {
    const response = await api.post(`/episodes/${episodeId}/scenes`, input);
    return unwrapResponse<Scene>(response);
  },

  /**
   * 更新场景
   */
  async updateScene(
    id: string,
    input: UpdateSceneInput
  ): Promise<Scene> {
    const response = await api.put(`/scenes/${id}`, input);
    return unwrapResponse<Scene>(response);
  },

  /**
   * 删除场景
   */
  async deleteScene(id: string): Promise<void> {
    await api.delete(`/scenes/${id}`);
  },

  /**
   * 重排序场�?   */
  async reorderScenes(
    episodeId: string,
    scenes: Array<{ id: string; scene_order: number }>
  ): Promise<Scene[]> {
    const response = await api.put(`/scenes/${episodeId}/reorder`, { scenes });
    return unwrapResponse<Scene[]>(response);
  },
};

