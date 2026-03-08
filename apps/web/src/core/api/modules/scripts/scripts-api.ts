import { httpClient } from '../../client/http-client';

export interface RewriteScriptRequest {
  content: string;
  model?: string;
}

export interface ContinueScriptRequest {
  content: string;
  model?: string;
}

export interface ProcessContentWithFileRequest {
  content: string;
  mode: 'continue' | 'rewrite' | 'optimize';
  model?: string;
}

export interface SaveScriptRequest {
  projectId: string;
  title: string;
  content: string;
}

export interface OptimizeSceneRequest {
  sceneId?: string;
  content?: string;
  prompt?: string;
  model?: string;
}

export interface Script {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const scriptsApi = {
  async rewriteScript(content: string, model?: string): Promise<unknown> {
    return httpClient.post<unknown>('/script/rewrite', { content, model });
  },

  async continueScript(content: string, model?: string): Promise<unknown> {
    return httpClient.post<unknown>('/script/continue', { content, model });
  },

  async processContentWithFile(content: string, mode: 'continue' | 'rewrite' | 'optimize', model?: string): Promise<unknown> {
    return httpClient.post<unknown>('/content/process-file', { content, mode, model });
  },

  async saveScript(projectId: string, title: string, content: string): Promise<unknown> {
    return httpClient.post<unknown>('/script/save', { projectId, title, content });
  },

  async optimizeScene(data: OptimizeSceneRequest): Promise<unknown> {
    return httpClient.post<unknown>('/script/optimize-scene', data);
  },

  async getScripts(projectId: string): Promise<Script[]> {
    return httpClient.get<Script[]>(`/projects/${projectId}/scripts`);
  },

  async parseScript(content: string, model?: string): Promise<unknown> {
    return httpClient.post<unknown>('/script/parse', { content, model });
  },

  async parseScriptWithAI(content: string, model?: string): Promise<unknown> {
    return httpClient.post<unknown>('/script/parse-ai', { content, model });
  },
};
