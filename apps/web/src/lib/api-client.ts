import {
  User,
  Project,
  AIProvider,
  AIProviderModel,
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
const API_BASE_URL = 'http://localhost:3001';

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

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async logoutAll(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/logout-all', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ user: User; rememberMe?: boolean }> {
    return this.request<{ user: User; rememberMe?: boolean }>('/api/auth/me');
  }

  async updateProfile(data: { name?: string; bio?: string; avatarUrl?: string }): Promise<User> {
    return this.request<User>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ url: string }>('/api/users/avatar', {
      method: 'POST',
      body: formData,
    });
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

  async testAIProviderModel(modelId: string): Promise<{ success: boolean; message: string; model: any }> {
    return this.request<{ success: boolean; message: string; model: any }>(`/api/ai-providers/models/${modelId}/test`, {
      method: 'POST',
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

  async setAssistantDefaultModel(modelId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/ai-providers/models/${modelId}/set-assistant-default`, {
      method: 'POST',
    });
  }

  async unsetAssistantDefaultModel(modelId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/ai-providers/models/${modelId}/unset-assistant-default`, {
      method: 'POST',
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

  async getDocuments(): Promise<{ documents: Document[] }> {
    return this.request<{ documents: Document[] }>('/api/documents');
  }

  async getDocumentById(id: string): Promise<Document> {
    return this.request<Document>(`/api/documents/${id}`);
  }

  async updateDocumentById(id: string, data: { title?: string; content?: string; type?: string; status?: string }): Promise<Document> {
    return this.request<Document>(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocumentById(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async createDocumentV2(data: { projectId: string; title: string; content: string; type?: string; status?: string }): Promise<Document> {
    return this.request<Document>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  async optimizeScene(data: {
    sceneContent: string;
    location: string;
    time: string;
    direction?: string;
  }): Promise<{ suggestion: string; optimized: string }> {
    return this.request<{ suggestion: string; optimized: string }>('/api/script/optimize-scene', {
      method: 'POST',
      body: JSON.stringify(data),
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

  async getProjectAssets(projectId: string, type?: string, search?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', String(type));
    if (search) params.append('search', String(search));
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/api/upload/projects/${projectId}/assets${query}`);
  }

  async uploadAsset(projectId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<any>(`/api/upload/projects/${projectId}/assets`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': undefined,
      },
    });
  }

  async deleteItem(itemId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getItems(projectId: string): Promise<any[]> {
    return this.request<any[]>(`/api/projects/${projectId}/items`);
  }

  async createItem(projectId: string, data: {
    name: string;
    type?: string;
    image?: string;
    description?: string;
    prompt?: string;
  }): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateItemsFromScript(projectId: string): Promise<{ message: string; items: any[] }> {
    return this.request<{ message: string; items: any[] }>(`/api/projects/${projectId}/items/generate`, {
      method: 'POST',
    });
  }

  async updateItem(itemId: string, data: any): Promise<any> {
    return this.request<any>(`/api/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async batchGenerateImages(data: {
    prompt: string;
    count: number;
    referenceImageUrl?: string;
    providerId?: string;
  }): Promise<{ assets: Array<{ url: string; filename: string }> }> {
    return this.request<{ assets: Array<{ url: string; filename: string }> }>('/api/image-generation/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateImage(data: {
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    style: string;
    projectId: string;
  }): Promise<{ asset: { url: string } }> {
    return this.request<{ asset: { url: string } }>('/api/image-generation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(assetId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/assets/${assetId}`, {
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

  async addProjectMember(projectId: string, userId: string, role: 'admin' | 'editor' | 'viewer'): Promise<Member> {
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

  async updateProjectMemberRole(projectId: string, userId: string, role: 'admin' | 'editor' | 'viewer'): Promise<Member> {
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

  async generateOutline(input: {
    storylineId: string;
    title: string;
    genre: string;
    targetDuration: number;
    style?: string;
    additionalNotes?: string;
  }): Promise<any> {
    return this.request('/api/outline', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async saveOutline(projectId: string, outline: any): Promise<{ id: string }> {
    return this.request<{ id: string }>('/api/outline/save', {
      method: 'POST',
      body: JSON.stringify({ projectId, outline }),
    });
  }

  async getOutline(outlineId: string): Promise<any> {
    return this.request(`/api/outline/${outlineId}`);
  }

  async refineOutline(outlineId: string, feedback: string): Promise<any> {
    return this.request(`/api/outline/${outlineId}/refine`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async expandScene(sceneId: string, detail: 'dialogue' | 'action' | 'visual' | 'full'): Promise<any> {
    return this.request(`/api/scene/${sceneId}/expand`, {
      method: 'POST',
      body: JSON.stringify({ detail }),
    });
  }

  async generateEpisodeSummary(episodeNumber: number, outlineId: string): Promise<any> {
    return this.request(`/api/episode/${episodeNumber}/summary?outlineId=${outlineId}`);
  }

  async getModelPreferences(): Promise<{
    defaultModels: Record<string, string>;
    lastUsedModels: Record<string, string>;
    modelParameters: Record<string, any>;
  }> {
    return this.request<{
      defaultModels: Record<string, string>;
      lastUsedModels: Record<string, string>;
      modelParameters: Record<string, any>;
    }>('/api/model-preferences');
  }

  async setDefaultModels(defaultModels: Record<string, string>): Promise<{ defaultModels: Record<string, string> }> {
    return this.request<{ defaultModels: Record<string, string> }>('/api/model-preferences/default', {
      method: 'POST',
      body: JSON.stringify({ defaultModels }),
    });
  }

  async recordModelUsage(data: {
    modelId: string;
    contentType: string;
    success?: boolean;
    duration?: number;
    tokensUsed?: number;
  }): Promise<{ lastUsedModels: Record<string, string> }> {
    return this.request<{ lastUsedModels: Record<string, string> }>('/api/model-preferences/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getModelParameters(contentType: string): Promise<{ parameters: Record<string, any> }> {
    return this.request<{ parameters: Record<string, any> }>(`/api/model-preferences/parameters/${contentType}`);
  }

  async setModelParameters(data: {
    contentType: string;
    parameters: Record<string, any>;
  }): Promise<{ parameters: Record<string, any> }> {
    return this.request<{ parameters: Record<string, any> }>('/api/model-preferences/parameters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async testModel(data: {
    modelId: string;
    testPrompt?: string;
  }): Promise<{ success: boolean; message: string; model: any }> {
    return this.request<{ success: boolean; message: string; model: any }>('/api/model-preferences/test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsageStats(): Promise<{
    defaultModels: Record<string, string>;
    lastUsedModels: Record<string, string>;
    modelCount: number;
    modelsByType: Record<string, number>;
  }> {
    return this.request<{
      defaultModels: Record<string, string>;
      lastUsedModels: Record<string, string>;
      modelCount: number;
      modelsByType: Record<string, number>;
    }>('/api/model-preferences/stats');
  }

  async getConfigurationHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ history: any[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const queryString = queryParams.toString();
    return this.request<{ history: any[]; total: number }>(
      `/api/model-preferences/history${queryString ? `?${queryString}` : ''}`
    );
  }

  async getDetailedAnalytics(): Promise<{
    summary: {
      totalModels: number;
      configuredDefaults: number;
      activeUsage: number;
      totalChanges: number;
    };
    byType: {
      distribution: Record<string, number>;
      usage: Record<string, number>;
    };
    models: {
      topUsed: Array<{ id: string; name: string; type: string; count: number }>;
      details: Array<{
        id: string;
        name: string;
        type: string;
        provider: string;
        capabilities: string[];
        isDefault: boolean;
        isLastUsed: boolean;
        usageCount: number;
      }>;
    };
    history: {
      summary: Record<string, number>;
      recent: Array<{ id: string; type: string; timestamp: string; details: any }>;
    };
  }> {
    return this.request('/api/model-preferences/analytics');
  }

  async getUserAnalytics(): Promise<{
    projects: number;
    collaborations: number;
    contributions: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    topProjects: Array<{
      id: string;
      name: string;
      role: string;
      assetCount: number;
    }>;
  }> {
    return this.request('/api/analytics/user');
  }

  async getPlatformAnalytics(): Promise<{
    totals: {
      users: number;
      projects: number;
      assets: number;
      generations: number;
    };
    recentActivity: {
      dailyStats: Array<{
        date: string;
        projects: number;
        assets: number;
        generations: number;
      }>;
      topProjects: Array<{
        id: string;
        name: string;
        assetCount: number;
      }>;
    };
  }> {
    return this.request('/api/analytics/platform');
  }

  async exportPremiere(data: {
    projectId: string;
    format: 'prproj' | 'aep' | 'edl' | 'xml';
    resolution: '720p' | '1080p' | '4k';
    frameRate: '24' | '25' | '30' | '60';
    includeAudio?: boolean;
    includeMarkers?: boolean;
  }): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/premiere`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  async exportVideos(data: {
    projectId: string;
    shotIds?: string[];
    format?: 'mp4' | 'webm' | 'mov';
    resolution?: '480p' | '720p' | '1080p' | '4k';
    fps?: number;
    quality?: 'low' | 'medium' | 'high';
  }): Promise<{ taskId: string; status: string; totalVideos: number }> {
    return this.request('/api/export/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportAssets(projectId: string, assetTypes?: string[]): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ projectId, assetTypes }),
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  async exportKeyframes(projectId: string, shotIds?: string[]): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export/keyframes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ projectId, shotIds }),
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  async getExportPreview(projectId: string): Promise<{
    project: { id: string; name: string; type: string };
    shots: Array<{
      id: string;
      sequence: number;
      duration: number;
      hasStartFrame: boolean;
      hasEndFrame: boolean;
      hasVideo: boolean;
    }>;
    assets: {
      total: number;
      byType: Record<string, number>;
    };
    totalDuration: number;
    estimatedExportSize: string;
  }> {
    return this.request(`/api/export/project/${projectId}/preview`);
  }

  async getExportFormats(): Promise<{
    videoFormats: Array<{ id: string; name: string; extension: string; description: string }>;
    resolutions: Array<{ id: string; name: string; width: number; height: number }>;
    frameRates: Array<{ id: string; name: string; description: string }>;
    projectFormats: Array<{ id: string; name: string; extension: string; description: string }>;
  }> {
    return this.request('/api/export/formats');
  }

  async getPromptTemplates(params?: { type?: string; category?: string; projectId?: string }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.projectId) queryParams.append('projectId', params.projectId);
    const queryString = queryParams.toString();
    return this.request(`/api/prompt-templates${queryString ? `?${queryString}` : ''}`);
  }

  async getPromptTemplate(code: string): Promise<any> {
    return this.request(`/api/prompt-templates/${code}`);
  }

  async createPromptTemplate(data: {
    code: string;
    name: string;
    type?: string;
    category?: string;
    defaultValue: string;
    customValue?: string;
    description?: string;
    variables?: any[];
    projectId?: string;
  }): Promise<any> {
    return this.request('/api/prompt-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePromptTemplate(code: string, data: Partial<{
    name: string;
    type: string;
    category: string;
    defaultValue: string;
    customValue: string;
    description: string;
    variables: any[];
    isActive: boolean;
  }>): Promise<any> {
    return this.request(`/api/prompt-templates/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePromptTemplate(code: string): Promise<void> {
    return this.request(`/api/prompt-templates/${code}`, { method: 'DELETE' });
  }

  async renderPromptTemplate(code: string, variables: Record<string, any>): Promise<{
    code: string;
    original: string;
    rendered: string;
    variables: Record<string, any>;
  }> {
    return this.request(`/api/prompt-templates/${code}/render`, {
      method: 'POST',
      body: JSON.stringify({ variables }),
    });
  }

  async getProjectSettings(projectId: string): Promise<{
    projectId: string;
    settings: {
      imageModel: string | null;
      languageModel: string | null;
      videoModel: string | null;
      hasTokenKey: boolean;
      defaultStyle: string | null;
      defaultAspectRatio: string;
      defaultResolution: string;
    };
  }> {
    return this.request(`/api/project-settings/${projectId}`);
  }

  async updateProjectSettings(projectId: string, settings: Partial<{
    imageModel: string;
    languageModel: string;
    videoModel: string;
    defaultStyle: string;
    defaultAspectRatio: string;
    defaultResolution: string;
  }>): Promise<{ success: boolean; settings: any }> {
    return this.request(`/api/project-settings/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async setProjectTokenKey(projectId: string, tokenKey: string): Promise<{ success: boolean }> {
    return this.request(`/api/project-settings/${projectId}/token-key`, {
      method: 'POST',
      body: JSON.stringify({ tokenKey }),
    });
  }

  async getProjectTokenKey(projectId: string): Promise<{ tokenKey: string | null }> {
    return this.request(`/api/project-settings/${projectId}/token-key`);
  }

  async deleteProjectTokenKey(projectId: string): Promise<{ success: boolean }> {
    return this.request(`/api/project-settings/${projectId}/token-key`, { method: 'DELETE' });
  }

  async generateProjectTokenKey(projectId: string): Promise<{ success: boolean; tokenKey: string }> {
    return this.request(`/api/project-settings/${projectId}/generate-token-key`, { method: 'POST' });
  }

  async getChatSessions(projectId?: string): Promise<any[]> {
    const queryParams = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/api/chat-history${queryParams}`);
  }

  async getChatSession(sessionId: string): Promise<any> {
    return this.request(`/api/chat-history/${sessionId}`);
  }

  async createChatSession(data: { projectId?: string; title?: string }): Promise<any> {
    return this.request('/api/chat-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChatSession(sessionId: string, data: { title?: string; messages?: any[] }): Promise<any> {
    return this.request(`/api/chat-history/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    return this.request(`/api/chat-history/${sessionId}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
