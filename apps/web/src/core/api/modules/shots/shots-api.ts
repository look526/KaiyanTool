import { api } from '../../client';

/**
 * @description 兼容 `{ success, data }` 与直接返回实体两种响应结构。
 */
function unwrapResponse<T>(response: any): T {
  return response?.data?.data ?? response?.data ?? response;
}

export interface Shot {
  id: string;
  project_id?: string;
  episode_id: string;
  scene_id: string | null;
  character_id?: string | null;
  chapter_number?: number | null;
  episode_number?: number | null;
  segment_id?: number | null;
  cell_id?: number | null;
  shot_number?: number;
  description?: string;
  action_summary?: string;
  camera_movement?: string | null;
  start_prompt?: string | null;
  end_prompt?: string | null;
  start_image_url?: string | null;
  end_image_url?: string | null;
  model: string | null;
  aspect_ratio: string;
  resolution: string;
  duration?: number;
  visual_style?: string | null;
  subtitle_text?: string | null;
  status: 'pending' | 'generating' | 'completed' | 'failed' | string;
  video_url: string | null;
  Scene?: {
    id: string;
    location?: string | null;
    time?: string | null;
  } | null;
  Character?: {
    id: string;
    name?: string | null;
  } | null;
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
  character_id?: string | null;
  description?: string;
  action_summary?: string;
  model?: string;
  aspect_ratio?: string;
  resolution?: string;
  status?: string;
  camera_movement?: string;
  start_prompt?: string;
  end_prompt?: string;
  start_image_url?: string | null;
  end_image_url?: string | null;
  duration?: number;
  visual_style?: string;
  subtitle_text?: string | null;
}

export interface GenerateShotInput {
  provider_id: string;
  /** 将台词并入视频提示，依赖模型是否支持有声/口型 */
  sync_audio_video?: boolean;
  subtitle_text?: string;
}

export interface GenerateShotResponse {
  video_url: string;
  duration?: number;
  resolution?: string;
  shot?: Shot;
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
    const response = await api.get(`/episodes/${episodeId}/shots`);
    return unwrapResponse<Shot[]>(response);
  },

  /**
   * 获取分镜详情
   */
  async getShot(id: string): Promise<Shot> {
    const response = await api.get(`/shots/${id}`);
    return unwrapResponse<Shot>(response);
  },

  /**
   * 创建分镜
   */
  async createShot(
    episodeId: string,
    input: CreateShotInput
  ): Promise<Shot> {
    const response = await api.post(`/episodes/${episodeId}/shots`, input);
    return unwrapResponse<Shot>(response);
  },

  /**
   * 更新分镜
   */
  async updateShot(
    id: string,
    input: UpdateShotInput
  ): Promise<Shot> {
    const response = await api.put(`/shots/${id}`, input);
    return unwrapResponse<Shot>(response);
  },

  /**
   * 删除分镜
   */
  async deleteShot(id: string): Promise<void> {
    await api.delete(`/shots/${id}`);
  },

  /**
   * 生成视频
   */
  async generateShot(
    id: string,
    input: GenerateShotInput
  ): Promise<GenerateShotResponse> {
    const response = await api.post(`/shots/${id}/generate/video`, input);
    return unwrapResponse<GenerateShotResponse>(response);
  },

  async generateStartFrame(
    id: string,
    body: { provider_id: string; prompt?: string; quality?: string }
  ): Promise<{ imageUrl: string; shot?: Shot }> {
    const response = await api.post(`/shots/${id}/generate/start-image`, body);
    return unwrapResponse(response);
  },

  async generateEndFrame(
    id: string,
    body: { provider_id: string; prompt?: string; quality?: string }
  ): Promise<{ imageUrl: string; shot?: Shot }> {
    const response = await api.post(`/shots/${id}/generate/end-image`, body);
    return unwrapResponse(response);
  },

  async generateBothFrames(
    id: string,
    body: { provider_id: string; quality?: string }
  ): Promise<{ startImage: string; endImage: string; shot?: Shot }> {
    const response = await api.post(`/shots/${id}/generate/both-images`, body);
    return unwrapResponse(response);
  },

  /**
   * 批量生成
   */
  async batchGenerateShots(
    episodeId: string,
    input: BatchGenerateInput
  ): Promise<{ success: boolean; successful: number; failed: number; total: number }> {
    const response = await api.post(`/episodes/${episodeId}/shots/batch-generate`, input);
    return unwrapResponse<{ success: boolean; successful: number; failed: number; total: number }>(response);
  },

  /**
   * 重排序分�?   */
  async reorderShot(
    id: string,
    newOrder: number
  ): Promise<void> {
    await api.put(`/shots/${id}/reorder`, { order: newOrder });
  },
};

