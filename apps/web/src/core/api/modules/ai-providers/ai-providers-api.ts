import { httpClient } from '../../client/http-client';
import type { AIProvider, AIProviderModel } from '../../../../types';

export interface CreateAIProviderRequest {
  name: string;
  type: string;
  apiKey?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export interface UpdateAIProviderRequest {
  name?: string;
  type?: string;
  apiKey?: string;
  baseUrl?: string;
  enabled?: boolean;
}

export interface TestProviderResponse {
  success: boolean;
  message: string;
}

export interface TestModelResponse {
  success: boolean;
  message: string;
  model?: AIProviderModel;
  testResult?: unknown;
}

export interface CreateModelRequest {
  name: string;
  type?: string;
  types?: string[];
  isActive?: boolean;
}

export interface SetDefaultModelResponse {
  message: string;
}

export const aiProvidersApi = {
  async getAIProviders(): Promise<AIProvider[]> {
    return httpClient.get<AIProvider[]>('/ai-providers');
  },

  async createAIProvider(data: CreateAIProviderRequest): Promise<AIProvider> {
    return httpClient.post<AIProvider>('/ai-providers', data);
  },

  async updateAIProvider(id: string, data: UpdateAIProviderRequest): Promise<AIProvider> {
    return httpClient.put<AIProvider>(`/ai-providers/${id}`, data);
  },

  async deleteAIProvider(id: string): Promise<void> {
    return httpClient.delete<void>(`/ai-providers/${id}`);
  },

  async testAIProvider(id: string): Promise<TestProviderResponse> {
    return httpClient.post<TestProviderResponse>(`/ai-providers/${id}/test`);
  },

  async testModel(modelId: string): Promise<TestModelResponse> {
    return httpClient.post<TestModelResponse>(`/ai-providers/models/${modelId}/test`);
  },

  async setDefaultModel(modelId: string): Promise<SetDefaultModelResponse> {
    return httpClient.post<SetDefaultModelResponse>(`/ai-providers/models/${modelId}/set-assistant-default`);
  },

  async unsetDefaultModel(modelId: string): Promise<SetDefaultModelResponse> {
    return httpClient.post<SetDefaultModelResponse>(`/ai-providers/models/${modelId}/unset-assistant-default`);
  },

  async createModel(providerId: string, data: CreateModelRequest): Promise<AIProviderModel> {
    return httpClient.post<AIProviderModel>(`/ai-providers/${providerId}/models`, data);
  },

  async updateModel(providerId: string, modelId: string, data: CreateModelRequest): Promise<AIProviderModel> {
    return httpClient.put<AIProviderModel>(`/ai-providers/${providerId}/models/${modelId}`, data);
  },

  async deleteModel(providerId: string, modelId: string): Promise<void> {
    return httpClient.delete<void>(`/ai-providers/${providerId}/models/${modelId}`);
  },
};
