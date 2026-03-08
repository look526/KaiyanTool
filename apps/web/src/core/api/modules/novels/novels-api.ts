import { httpClient } from '../../client/http-client';

export interface Novel {
  id: string;
  projectId: string;
  title?: string;
  content?: string;
  chapters?: Chapter[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  title?: string;
  content?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNovelRequest {
  title?: string;
  content?: string;
}

export interface UpdateNovelRequest {
  title?: string;
  content?: string;
}

export interface CreateChapterRequest {
  title?: string;
  content?: string;
  order?: number;
}

export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  order?: number;
}

export interface NovelAnalysis {
  characters?: unknown[];
  themes?: string[];
  plot?: unknown;
  summary?: string;
}

export const novelsApi = {
  async getNovels(projectId: string): Promise<Novel[]> {
    return httpClient.get<Novel[]>(`/projects/${projectId}/novels`);
  },

  async getNovelById(novelId: string): Promise<Novel> {
    return httpClient.get<Novel>(`/novels/${novelId}`);
  },

  async createNovel(projectId: string, data: CreateNovelRequest): Promise<Novel> {
    return httpClient.post<Novel>(`/projects/${projectId}/novels`, data);
  },

  async updateNovel(novelId: string, data: UpdateNovelRequest): Promise<Novel> {
    return httpClient.put<Novel>(`/novels/${novelId}`, data);
  },

  async deleteNovel(novelId: string): Promise<void> {
    return httpClient.delete<void>(`/novels/${novelId}`);
  },

  async createChapter(novelId: string, data: CreateChapterRequest): Promise<Chapter> {
    return httpClient.post<Chapter>(`/novels/${novelId}/chapters`, data);
  },

  async getChaptersByNovel(novelId: string): Promise<Chapter[]> {
    return httpClient.get<Chapter[]>(`/novels/${novelId}/chapters`);
  },

  async updateChapter(chapterId: string, data: UpdateChapterRequest): Promise<Chapter> {
    return httpClient.put<Chapter>(`/chapters/${chapterId}`, data);
  },

  async deleteChapter(chapterId: string): Promise<void> {
    return httpClient.delete<void>(`/chapters/${chapterId}`);
  },

  async parseNovel(content: string): Promise<NovelAnalysis> {
    return httpClient.post<NovelAnalysis>('/novel/extract-chapters', { content });
  },

  async adaptToScript(novelAnalysis: NovelAnalysis, options?: unknown): Promise<unknown> {
    return httpClient.post<unknown>('/novel/adapt-to-script', { novelAnalysis, options });
  },

  async analyzeNovel(content: string): Promise<unknown> {
    return httpClient.post<unknown>('/novel/analyze', { content });
  },

  async identifyCharacters(content: string): Promise<unknown> {
    return httpClient.post<unknown>('/novel/identify-characters', { content });
  },

  async generateStoryline(content: string): Promise<unknown> {
    return httpClient.post<unknown>('/novel/generate-storyline', { content });
  },

  async createOutline(content: string): Promise<unknown> {
    return httpClient.post<unknown>('/novel/generate-outline', { content });
  },

  async generateOutline(data: { storylineId: string; title: string; genre: string; targetDuration: number; style: string; additionalNotes?: string }): Promise<unknown> {
    return httpClient.post<unknown>('/novel/generate-outline', data);
  },

  async generateStorylineFromForm(formData: unknown): Promise<unknown> {
    return httpClient.post<unknown>('/novel/generate-storyline', formData);
  },
};
