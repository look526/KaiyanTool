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

export type MentionResourceType = MentionItem['type'] | 'all';

/**
 * @description 获取可提及的资源。`type` 与触发符对应：character=@、scene=#、item=$、asset=*
 */
export const mentionsApi = {
  async getMentions(
    projectId: string,
    query?: string,
    type?: MentionResourceType
  ): Promise<MentionItem[]> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (type && type !== 'all') params.set('type', type);
    const qs = params.toString();
    const response = await api.get(
      `/projects/${projectId}/mentions${qs ? `?${qs}` : ''}`
    );
    return unwrapResponse<MentionItem[]>(response);
  },
};

