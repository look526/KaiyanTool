import { httpClient } from '../../client/http-client';

export interface Scene {
  id: string | number;
  location?: string;
  time?: string;
  content?: string;
  characters?: string[];
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSceneRequest {
  location?: string;
  time?: string;
  content?: string;
  characters?: string[];
}

export interface UpdateSceneRequest {
  location?: string;
  time?: string;
  content?: string;
  characters?: string[];
}

export const scenesApi = {
  async getScenes(projectId: string): Promise<Scene[]> {
    return httpClient.get<Scene[]>(`/projects/${projectId}/scenes`);
  },

  async createScene(projectId: string, data: CreateSceneRequest): Promise<Scene> {
    return httpClient.post<Scene>(`/projects/${projectId}/scenes`, data);
  },

  async updateScene(id: string, data: UpdateSceneRequest): Promise<Scene> {
    return httpClient.put<Scene>(`/scenes/${id}`, data);
  },

  async deleteScene(id: string): Promise<void> {
    return httpClient.delete<void>(`/scenes/${id}`);
  },
};
