import { httpClient } from '../../client/http-client';

export interface Shot {
  id: string;
  projectId?: string;
  sceneId?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShotRequest {
  sceneId?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  order?: number;
}

export interface UpdateShotRequest {
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  order?: number;
}

export const shotsApi = {
  async getShots(projectId: string, sceneId?: string): Promise<Shot[]> {
    const params = sceneId ? { sceneId } : undefined;
    return httpClient.get<Shot[]>(`/projects/${projectId}/shots`, params);
  },

  async createShot(projectId: string, data: CreateShotRequest): Promise<Shot> {
    return httpClient.post<Shot>(`/projects/${projectId}/shots`, data);
  },

  async updateShot(id: string, data: UpdateShotRequest): Promise<Shot> {
    return httpClient.put<Shot>(`/shots/${id}`, data);
  },

  async deleteShot(id: string): Promise<void> {
    return httpClient.delete<void>(`/shots/${id}`);
  },
};
