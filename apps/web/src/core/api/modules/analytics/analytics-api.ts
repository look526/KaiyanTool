import { httpClient } from '../../client/http-client';

export interface AnalyticsData {
  totalGenerations?: number;
  totalImages?: number;
  totalVideos?: number;
  totalTokens?: number;
  period?: string;
  data?: unknown[];
}

export interface UsageStats {
  totalRequests?: number;
  totalTokens?: number;
  totalImages?: number;
  totalVideos?: number;
  byModel?: Record<string, number>;
  byProvider?: Record<string, number>;
}

export interface GetAnalyticsParams {
  type: string;
  startDate?: string;
  endDate?: string;
}

export interface AnalysisData {
  id: string;
  projectId: string;
  data?: unknown;
  createdAt?: string;
}

export const analyticsApi = {
  async getAnalytics(params: GetAnalyticsParams): Promise<AnalyticsData> {
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    );
    return httpClient.get<AnalyticsData>(`/analytics?${new URLSearchParams(queryParams as Record<string, string>).toString()}`);
  },

  async getPlatformAnalytics(): Promise<AnalyticsData> {
    return httpClient.get<AnalyticsData>('/analytics/platform');
  },

  async getUsageStats(): Promise<UsageStats> {
    return httpClient.get<UsageStats>('/analytics/usage');
  },

  async getAnalysis(projectId: string): Promise<AnalysisData> {
    return httpClient.get<AnalysisData>(`/analysis/project/${projectId}`);
  },
};
