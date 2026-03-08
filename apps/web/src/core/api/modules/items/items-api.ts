import { httpClient } from '../../client/http-client';

export interface Item {
  id: string;
  projectId: string;
  type: string;
  name: string;
  content?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemRequest {
  type: string;
  name: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateItemRequest {
  name?: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

export const itemsApi = {
  async getItems(projectId: string): Promise<Item[]> {
    return httpClient.get<Item[]>(`/projects/${projectId}/items`);
  },

  async createItem(projectId: string, data: CreateItemRequest): Promise<Item> {
    return httpClient.post<Item>(`/projects/${projectId}/items`, data);
  },

  async updateItem(id: string, data: UpdateItemRequest): Promise<Item> {
    return httpClient.put<Item>(`/items/${id}`, data);
  },

  async deleteItem(id: string): Promise<void> {
    return httpClient.delete<void>(`/items/${id}`);
  },

  async generateItemsFromScript(projectId: string): Promise<Item[]> {
    return httpClient.post<Item[]>(`/projects/${projectId}/items/generate`, {});
  },
};
