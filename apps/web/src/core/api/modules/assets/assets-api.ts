import { httpClient } from '../../client/http-client';

export interface Asset {
  id: string;
  projectId?: string;
  type?: string;
  url?: string;
  filename?: string;
  size?: number;
  category?: string;
  source?: string;
  createdAt?: string;
}

export interface AssetCategory {
  value: string;
  label: string;
}

export interface AssetCategoriesResponse {
  categories: AssetCategory[];
  sources: AssetCategory[];
}

export interface GetAssetsParams {
  type?: string;
  search?: string;
  category?: string;
  source?: string;
}

export interface UploadAssetResponse {
  asset: Asset;
  url: string;
}

export const assetsApi = {
  async getAssets(params?: GetAssetsParams): Promise<Asset[]> {
    const queryParams = params 
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
      : undefined;
    return httpClient.get<Asset[]>('/upload/assets', queryParams);
  },

  async getAssetCategories(): Promise<AssetCategoriesResponse> {
    return httpClient.get<AssetCategoriesResponse>('/upload/categories');
  },

  async updateAssetCategory(assetId: string, category: string): Promise<unknown> {
    return httpClient.patch<unknown>(`/upload/assets/${assetId}/category`, { category });
  },

  async uploadAssetGlobal(file: File): Promise<UploadAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/upload/assets`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  async uploadImage(file: File, projectId?: string): Promise<UploadAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'character');
    formData.append('source', 'upload');
    if (projectId) {
      formData.append('projectId', projectId);
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/upload/assets`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  async deleteAsset(id: string): Promise<void> {
    return httpClient.delete<void>(`/upload/assets/${id}`);
  },

  async getProjectAssets(projectId: string, params?: GetAssetsParams): Promise<Asset[]> {
    const queryParams = { projectId, ...params };
    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== 'all')
    );
    const queryString = new URLSearchParams(filteredParams as Record<string, string>).toString();
    return httpClient.get<Asset[]>(`/upload/projects/${projectId}/assets${queryString ? `?${queryString}` : ''}`);
  },

  async uploadProjectAsset(projectId: string, file: File, type: string): Promise<UploadAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/upload/projects/${projectId}/assets`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  async deleteProjectAsset(projectId: string, assetId: string): Promise<void> {
    return httpClient.delete<void>(`/upload/projects/${projectId}/assets/${assetId}`);
  },
};
