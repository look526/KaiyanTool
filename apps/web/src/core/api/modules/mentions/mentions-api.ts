import { api } from '../../client';

/**
 * @description 兼容 `{ success, data }` 与直接返回实体两种响应结构。
 */
function unwrapResponse<T>(response: any): T {
  return response?.data?.data ?? response?.data ?? response;
}

export interface MentionItem {
  id: string;
  type: 'character' | 'item' | 'scene' | 'asset';
  name: string;
  icon: string;
}

export const mentionsApi = {
  /**
   * 获取可提及的资源
   */
  async getMentions(
    projectId: string,
    query?: string
  ): Promise<MentionItem[]> {
    const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
    const response = await api.get(`/projects/${projectId}/mentions${queryParams}`);
    return unwrapResponse<MentionItem[]>(response);
  },
};


