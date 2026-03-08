import { httpClient } from '../../client/http-client';

export interface ModelPreference {
  id: string;
  userId?: string;
  contentType?: string;
  modelId?: string;
  isDefault?: boolean;
}

export interface ModelPreferenceConfiguration {
  contentType: string;
  modelId: string;
  isDefault?: boolean;
}

export interface SetDefaultModelsRequest {
  configurations: ModelPreferenceConfiguration[];
}

export interface TestModelRequest {
  modelId: string;
  providerId?: string;
}

export interface RecordModelUsageRequest {
  modelId: string;
  contentType: string;
  success: boolean;
}

export interface ConfigurationHistoryEntry {
  id: string;
  timestamp: string;
  changes: Record<string, { oldValue: string; newValue: string }>;
}

export interface ConfigurationHistoryResponse {
  data: ConfigurationHistoryEntry[];
  total: number;
}

export const modelPreferencesApi = {
  async getModelPreferences(): Promise<{ defaultModels: Record<string, string>; lastUsedModels: Record<string, string> }> {
    return httpClient.get<{ defaultModels: Record<string, string>; lastUsedModels: Record<string, string> }>('/model-preferences');
  },

  async setDefaultModels(configurations: ModelPreferenceConfiguration[]): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>('/model-preferences/default', { configurations });
  },

  async testModel(data: TestModelRequest): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>('/model-preferences/test', data);
  },

  async recordModelUsage(data: RecordModelUsageRequest): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>('/model-preferences/usage', data);
  },

  async getConfigurationHistory(params?: { limit?: number; offset?: number }): Promise<ConfigurationHistoryResponse> {
    const queryParams = params 
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
      : undefined;
    return httpClient.get<ConfigurationHistoryResponse>('/model-preferences/history', queryParams);
  },
};
