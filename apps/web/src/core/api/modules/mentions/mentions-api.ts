import { api } from '../../client';

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
    return (response as any).data || response;
  },
};


