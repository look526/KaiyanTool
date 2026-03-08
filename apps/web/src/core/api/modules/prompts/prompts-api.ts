import { httpClient } from '../../client/http-client';

export interface PromptTemplate {
  id: string;
  name: string;
  category?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromptTemplateRequest {
  name: string;
  category?: string;
  content: string;
}

export interface UpdatePromptTemplateRequest {
  name?: string;
  category?: string;
  content?: string;
}

export interface PolishPromptRequest {
  prompt: string;
  context?: unknown;
}

export const promptsApi = {
  async getPromptTemplates(category?: string): Promise<PromptTemplate[]> {
    const params = category ? { category } : undefined;
    return httpClient.get<PromptTemplate[]>('/prompt-templates', params);
  },

  async createPromptTemplate(data: CreatePromptTemplateRequest): Promise<PromptTemplate> {
    return httpClient.post<PromptTemplate>('/prompt-templates', data);
  },

  async updatePromptTemplate(id: string, data: UpdatePromptTemplateRequest): Promise<PromptTemplate> {
    return httpClient.put<PromptTemplate>(`/prompt-templates/${id}`, data);
  },

  async deletePromptTemplate(id: string): Promise<void> {
    return httpClient.delete<void>(`/prompt-templates/${id}`);
  },

  async polishPrompt(prompt: string, context?: unknown): Promise<unknown> {
    return httpClient.post<unknown>('/prompt-polish', { prompt, context });
  },

  async optimizePrompt(prompt: string, model?: string, type: string = 'image'): Promise<unknown> {
    return httpClient.post<unknown>('/prompt/optimize', { prompt, model, type });
  },
};
