import {
  User,
  Project,
  AIProvider,
  PaginationMeta,
  ProjectsResponse,
  RegisterData,
  LoginData,
  AuthResponse,
  CreateProjectData,
  CreateAIProviderData,
  UpdateAIProviderData,
  Character,
  Document,
  Video,
  ExportData,
  Member,
  SearchUser,
  Scene,
  Shot,
  NineGridPanel
} from '@ai-content-platform/shared';
const API_BASE_URL = '';

let authErrorHandler: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  authErrorHandler = handler;
};

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const start = Date.now();
    
    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    let response;
    try {
      response = await fetch(url, config);
      const duration = Date.now() - start;
      
      const { trackApiRequest } = await import('./metrics');
      trackApiRequest(options.method || 'GET', endpoint, duration, response.status);

      if (response.status === 401) {
        if (authErrorHandler) {
          authErrorHandler();
        }
        const errorText = await response.text();
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.error || '登录已过期，请重新登录');
        } catch {
          throw new Error('登录已过期，请重新登录');
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.error || '请求失败');
        } catch {
          throw new Error(errorText || '请求失败');
        }
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const responseText = await response.text();
      if (!responseText) {
        return undefined as T;
      }

      try {
        return JSON.parse(responseText) as T;
      } catch {
        return responseText as unknown as T;
      }
    } catch (error) {
      const duration = Date.now() - start;
      
      const { trackApiRequest, trackError } = await import('./metrics');
      trackApiRequest(options.method || 'GET', endpoint, duration, 0);
      trackError(error as Error, { endpoint, method: options.method || 'GET' });
      
      const { captureException } = await import('./sentry');
      captureException(error as Error, { endpoint, method: options.method || 'GET' });
      
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ user: User; rememberMe?: boolean }> {
    return this.request<{ user: User; rememberMe?: boolean }>('/api/auth/me');
  }

  async updateSession(): Promise<{ message: string; rememberMe?: boolean }> {
    return this.request<{ message: string; rememberMe?: boolean }>('/api/auth/session', {
      method: 'PUT',
    });
  }

  async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  }): Promise<ProjectsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.request<ProjectsResponse>(`/api/projects${query ? `?${query}` : ''}`);
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<CreateProjectData>): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getAIProviders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<{ providers: AIProvider[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return this.request<{ providers: AIProvider[]; pagination: PaginationMeta }>(
      `/api/ai-providers${query ? `?${query}` : ''}`
    );
  }

  async getAIProvider(id: string): Promise<AIProvider> {
    return this.request<AIProvider>(`/api/ai-providers/${id}`);
  }

  async createAIProvider(data: CreateAIProviderData): Promise<AIProvider> {
    return this.request<AIProvider>('/api/ai-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAIProvider(id: string, data: UpdateAIProviderData): Promise<AIProvider> {
    return this.request<AIProvider>(`/api/ai-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAIProvider(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/ai-providers/${id}`, {
      method: 'DELETE',
    });
  }

  async testAIProvider(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/ai-providers/${id}/test`, {
      method: 'POST',
    });
  }

  async createAIProviderModel(providerId: string, data: Partial<AIProviderModel>): Promise<AIProviderModel> {
    return this.request<AIProviderModel>(`/api/ai-providers/${providerId}/models`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAIProviderModel(providerId: string, modelId: string, data: Partial<AIProviderModel>): Promise<AIProviderModel> {
    return this.request<AIProviderModel>(`/api/ai-providers/${providerId}/models/${modelId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAIProviderModel(providerId: string, modelId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/ai-providers/${providerId}/models/${modelId}`, {
      method: 'DELETE',
    });
  }

  async exportProject(projectId: string): Promise<ExportData> {
    return this.request<ExportData>(`/api/projects/${projectId}/export`);
  }

  async exportProjectVideos(projectId: string): Promise<Blob> {
    const url = `/api/projects/${projectId}/export/videos`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('导出视频失败');
    }

    return response.blob();
  }

  async exportProjectBundle(projectId: string): Promise<Blob> {
    const url = `/api/projects/${projectId}/export/bundle`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('导出完整包失败');
    }

    return response.blob();
  }

  async getProjectDocuments(projectId: string): Promise<Document[]> {
    return this.request<Document[]>(`/api/projects/${projectId}/documents`);
  }

  async getScenes(projectId: string): Promise<Scene[]> {
    return this.request<Scene[]>(`/api/projects/${projectId}/scenes`);
  }

  async getCharacters(projectId: string): Promise<Character[]> {
    return this.request<Character[]>(`/api/projects/${projectId}/characters`);
  }

  async getShots(projectId: string): Promise<Shot[]> {
    return this.request<Shot[]>(`/api/projects/${projectId}/shots`);
  }

  async createScene(projectId: string, data: Partial<Scene>): Promise<Scene> {
    return this.request<Scene>(`/api/projects/${projectId}/scenes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScene(sceneId: string, data: Partial<Scene>): Promise<Scene> {
    return this.request<Scene>(`/api/scenes/${sceneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteScene(sceneId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/scenes/${sceneId}`, {
      method: 'DELETE',
    });
  }

  async createCharacter(projectId: string, data: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/api/projects/${projectId}/characters`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCharacter(characterId: string, data: Partial<Character>): Promise<Character> {
    return this.request<Character>(`/api/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCharacter(characterId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/characters/${characterId}`, {
      method: 'DELETE',
    });
  }

  async createShot(projectId: string, data: Partial<Shot>): Promise<Shot> {
    return this.request<Shot>(`/api/projects/${projectId}/shots`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShot(shotId: string, data: Partial<Shot>): Promise<Shot> {
    return this.request<Shot>(`/api/shots/${shotId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShot(shotId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/shots/${shotId}`, {
      method: 'DELETE',
    });
  }

  async generateShotBothImages(shotId: string, providerId: string): Promise<{ success: boolean; startImageUrl?: string; endImageUrl?: string }> {
    return this.request<{ success: boolean; startImageUrl?: string; endImageUrl?: string }>(`/api/shots/${shotId}/generate-images`, {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    });
  }

  async reorderShots(projectId: string, shots: { id: string; chapterNumber: number; episodeNumber: number; segmentId: number; cellId: number }[]): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/projects/${projectId}/shots/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ shots }),
    });
  }

  async parseNovel(content: string): Promise<{ chapters: any[]; characters: string[] }> {
    return this.request<{ chapters: any[]; characters: string[] }>('/api/novel/parse', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async saveNovel(projectId: string, title: string, content: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/novel/save', {
      method: 'POST',
      body: JSON.stringify({ projectId, title, content }),
    });
  }

  async createDocument(projectId: string, data: { title: string; type: string; content?: string }): Promise<Document> {
    return this.request<Document>(`/api/projects/${projectId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocument(projectId: string, documentId: string, data: Partial<{ title: string; content: string }>): Promise<Document> {
    return this.request<Document>(`/api/projects/${projectId}/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(projectId: string, documentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async generateVideo(projectId: string, documentId: string, data: { aiProviderId: string; model: string }): Promise<{ video: Video }> {
    return this.request<{ video: Video }>(`/api/projects/${projectId}/documents/${documentId}/generate-video`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateShotVideo(shotId: string, providerId: string): Promise<{ success: boolean; videoUrl?: string }> {
    return this.request<{ success: boolean; videoUrl?: string }>(`/api/shots/${shotId}/generate-video`, {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    });
  }

  async parseScript(content: string): Promise<{ scenes: any[]; characters: string[] }> {
    return this.request<{ scenes: any[]; characters: string[] }>('/api/script/parse', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async saveScript(projectId: string, title: string, content: string): Promise<{ success: boolean; project: Project }> {
    return this.request<{ success: boolean; project: Project }>('/api/script/save', {
      method: 'POST',
      body: JSON.stringify({ projectId, title, content }),
    });
  }

  async generateScript(projectId: string, data: {
    storyOutline: string;
    genre: string;
    characters: Array<{ name: string; description: string; personality: string }>;
    settings: Array<{ name: string; description: string; atmosphere: string }>;
  }): Promise<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }> {
    return this.request<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }>('/api/director/script', {
      method: 'POST',
      body: JSON.stringify({ projectId, ...data }),
    });
  }

  async getScript(scriptId: string): Promise<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }> {
    return this.request<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }>(`/api/scripts/${scriptId}`);
  }

  async getProjectScripts(projectId: string): Promise<Array<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }>> {
    return this.request<Array<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }>>(`/api/projects/${projectId}/scripts`);
  }

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/upload/images`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上传失败');
    }

    return response.json();
  }

  async uploadCharacterImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/upload/images/character`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上传失败');
    }

    return response.json();
  }

  async uploadSceneImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/upload/images/scene`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上传失败');
    }

    return response.json();
  }

  async generateShotsFromScript(projectId: string, scriptContent: string, visualStyle?: string): Promise<{ success: boolean; count: number; shots: any[] }> {
    return this.request<{ success: boolean; count: number; shots: any[] }>(`/api/projects/${projectId}/director/generate-shots`, {
      method: 'POST',
      body: JSON.stringify({ scriptContent, visualStyle }),
    });
  }

  async optimizeShotPrompt(shotId: string, referenceImages: string[]): Promise<{ success: boolean; startPrompt: string; endPrompt: string; shot: any }> {
    return this.request<{ success: boolean; startPrompt: string; endPrompt: string; shot: any }>('/api/director/optimize-shot', {
      method: 'POST',
      body: JSON.stringify({ shotId, referenceImages }),
    });
  }

  async generateStoryline(input: {
    title: string;
    genre: string;
    description: string;
    style?: string;
    targetDuration?: number;
    targetAudience?: string;
    tone?: string;
  }): Promise<any> {
    return this.request('/api/storyline', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async saveStoryline(projectId: string, storyline: any): Promise<{ id: string }> {
    return this.request<{ id: string }>('/api/storyline/save', {
      method: 'POST',
      body: JSON.stringify({ projectId, storyline }),
    });
  }

  async getStoryline(storylineId: string): Promise<any> {
    return this.request<any>(`/api/storyline/${storylineId}`);
  }

  async refineStoryline(storylineId: string, feedback: string): Promise<any> {
    return this.request<any>(`/api/storyline/${storylineId}/refine`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async generateCharacterBackstory(characterName: string, role: string, storyContext: string): Promise<any> {
    return this.request('/api/character-backstory', {
      method: 'POST',
      body: JSON.stringify({ characterName, role, storyContext }),
    });
  }

  async getNovels(projectId: string): Promise<{ novels: any[] }> {
    return this.request<{ novels: any[] }>(`/api/projects/${projectId}/novels`);
  }

  async getNovelById(novelId: string): Promise<any> {
    return this.request<any>(`/api/novels/${novelId}`);
  }

  async createNovel(projectId: string, data: { title?: string; description?: string }): Promise<any> {
    return this.request(`/api/projects/${projectId}/novels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNovel(novelId: string, data: { title?: string; description?: string }): Promise<any> {
    return this.request(`/api/novels/${novelId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNovel(novelId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/novels/${novelId}`, {
      method: 'DELETE',
    });
  }

  async createChapter(novelId: string, data: { title?: string; content?: string; order?: number }): Promise<any> {
    return this.request(`/api/novels/${novelId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChapter(chapterId: string, data: { title?: string; content?: string; order?: number }): Promise<any> {
    return this.request(`/api/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChapter(chapterId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/chapters/${chapterId}`, {
      method: 'DELETE',
    });
  }

  async getPanels(shotId: string): Promise<any[]> {
    return this.request<any[]>(`/api/shots/${shotId}/panels`);
  }

  async createPanel(shotId: string, data: { prompt: string; imageUrl?: string; position?: number }): Promise<any> {
    return this.request(`/api/shots/${shotId}/panels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePanel(panelId: string, data: { prompt?: string; imageUrl?: string; position?: number }): Promise<any> {
    return this.request(`/api/panels/${panelId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePanel(panelId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/panels/${panelId}`, {
      method: 'DELETE',
    });
  }

  async createBatchPanels(shotId: string, panels: { prompt: string; position: number }[]): Promise<any> {
    return this.request(`/api/shots/${shotId}/panels/batch`, {
      method: 'POST',
      body: JSON.stringify({ panels }),
    });
  }

  async reorderPanels(shotId: string, panels: { id: string; position: number }[]): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/shots/${shotId}/panels/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ panels }),
    });
  }

  async generatePanelImage(panelId: string, providerId: string): Promise<{ imageUrl: string }> {
    return this.request<{ imageUrl: string }>(`/api/panels/${panelId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    });
  }

  async generateBatchPanels(shotId: string, providerId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/shots/${shotId}/generate-panels`, {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    });
  }

  async exportNineGrid(shotId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/api/shots/${shotId}/export-grid`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('导出九宫格失败');
    }

    return response.blob();
  }

  async getShot(shotId: string): Promise<any> {
    return this.request<any>(`/api/shots/${shotId}`);
  }

  async getProjectVideos(projectId: string): Promise<any[]> {
    return this.request<any[]>(`/api/projects/${projectId}/videos`);
  }

  async deleteVideo(videoId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  async createVideoMergeTask(projectId: string, videoIds: string[]): Promise<any> {
    return this.request(`/api/projects/${projectId}/video-merge`, {
      method: 'POST',
      body: JSON.stringify({ videoIds }),
    });
  }

  async getMergeTaskStatus(taskId: string): Promise<any> {
    return this.request(`/api/video-merge/${taskId}/status`);
  }

  async getVideoStatus(shotId: string): Promise<any> {
    return this.request(`/api/shots/${shotId}/video-status`);
  }

  async continueScript(content: string, context?: string): Promise<{ success: boolean; content: string }> {
    return this.request<{ success: boolean; content: string }>('/api/script/continue', {
      method: 'POST',
      body: JSON.stringify({ content, context }),
    });
  }

  async rewriteScript(content: string, instruction?: string): Promise<{ success: boolean; content: string }> {
    return this.request<{ success: boolean; content: string }>('/api/script/rewrite', {
      method: 'POST',
      body: JSON.stringify({ content, instruction }),
    });
  }

  async createWardrobe(characterId: string, data: { name: string; description?: string; images?: string[] }): Promise<any> {
    return this.request(`/api/characters/${characterId}/wardrobes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteWardrobe(wardrobeId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/wardrobes/${wardrobeId}`, {
      method: 'DELETE',
    });
  }

  async getProjectMembers(projectId: string): Promise<Member[]> {
    return this.request<Member[]>(`/api/projects/${projectId}/members`);
  }

  async addProjectMember(projectId: string, userId: string, role: 'editor' | 'viewer'): Promise<Member> {
    return this.request<Member>(`/api/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  }

  async removeProjectMember(projectId: string, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateProjectMemberRole(projectId: string, userId: string, role: 'editor' | 'viewer'): Promise<Member> {
    return this.request<Member>(`/api/projects/${projectId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async searchUsers(query: string): Promise<SearchUser[]> {
    return this.request<SearchUser[]>(`/api/users/search?q=${encodeURIComponent(query)}`);
  }

  async getNineGridPanels(shotId: string): Promise<NineGridPanel[]> {
    return this.request<NineGridPanel[]>(`/api/shots/${shotId}/ninegrid/panels`);
  }

  async createNineGridPanel(shotId: string, data: { position?: number; prompt: string }): Promise<NineGridPanel> {
    return this.request<NineGridPanel>(`/api/shots/${shotId}/ninegrid/panels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNineGridPanel(shotId: string, panelId: string, data: { prompt?: string; imageUrl?: string }): Promise<NineGridPanel> {
    return this.request<NineGridPanel>(`/api/shots/${shotId}/ninegrid/panels/${panelId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteNineGridPanel(shotId: string, panelId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/shots/${shotId}/ninegrid/panels/${panelId}`, {
      method: 'DELETE',
    });
  }

  async generateNineGridPanels(shotId: string, data?: { providerId?: string; model?: string }): Promise<{ total: number; successful: number; failed: number }> {
    return this.request(`/api/shots/${shotId}/ninegrid/generate`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async reorderNineGridPanels(shotId: string, panelIds: string[]): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/shots/${shotId}/ninegrid/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ panelIds }),
    });
  }
}

export const apiClient = new ApiClient();
