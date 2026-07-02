// 从新的 API 客户端导入
import { apiClient as newApiClient, setAuthErrorHandler as originalSetAuthErrorHandler } from './api-client';
import type {
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

// 重新导出 setAuthErrorHandler
export const setAuthErrorHandler = originalSetAuthErrorHandler;

// 定义 API 客户端接口
export interface ApiClientInterface {
  register(data: RegisterData): Promise<AuthResponse & { token?: string }>;
  login(data: LoginData): Promise<AuthResponse & { token?: string }>;
  logout(): Promise<{ message: string }>;
  changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }>;
  logoutAll(): Promise<{ message: string }>;
  getCurrentUser(): Promise<{ user: User; rememberMe?: boolean }>;
  updateSession(): Promise<{ message: string; rememberMe?: boolean }>;
  updateProfile(data: { name?: string; bio?: string; avatarUrl?: string }): Promise<User>;
  uploadAvatar(file: File): Promise<{ url: string }>;
  getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  }): Promise<ProjectsResponse>;
  getProject(id: string): Promise<Project>;
  createProject(data: CreateProjectData): Promise<Project>;
  updateProject(id: string, data: Partial<CreateProjectData>): Promise<Project>;
  deleteProject(id: string): Promise<{ message: string }>;
  getAIProviders(): Promise<{ providers: AIProvider[]; pagination: PaginationMeta }>;
  getAIProviders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<{ providers: AIProvider[]; pagination: PaginationMeta }>;
  getAdminAIProviders(): Promise<{ providers: AIProvider[]; pagination: PaginationMeta }>;
  getAIProvider(id: string): Promise<AIProvider>;
  createAIProvider(data: CreateAIProviderData): Promise<AIProvider>;
  updateAIProvider(id: string, data: UpdateAIProviderData): Promise<AIProvider>;
  deleteAIProvider(id: string): Promise<{ message: string }>;
  testAIProvider(id: string): Promise<{ success: boolean; message: string }>;
  testAIProviderModel(modelId: string): Promise<{ success: boolean; message: string; model: any; testResult?: any }>;
  setAssistantDefaultModel(modelId: string): Promise<{ message: string }>;
  unsetAssistantDefaultModel(modelId: string): Promise<{ message: string }>;
  createAIProviderModel(providerId: string, data: any): Promise<any>;
  updateAIProviderModel(providerId: string, modelId: string, data: any): Promise<any>;
  deleteAIProviderModel(providerId: string, modelId: string): Promise<{ message: string }>;
  exportProject(projectId: string): Promise<ExportData>;
  exportProjectVideos(projectId: string): Promise<Blob>;
  exportProjectBundle(projectId: string): Promise<Blob>;
  getProjectDocuments(projectId: string): Promise<Document[]>;
  getScenes(projectId: string): Promise<Scene[]>;
  getCharacters(projectId: string): Promise<Character[]>;
  getShots(projectId: string): Promise<Shot[]>;
  createScene(projectId: string, data: Partial<Scene>): Promise<Scene>;
  updateScene(sceneId: string, data: Partial<Scene>): Promise<Scene>;
  deleteScene(sceneId: string): Promise<{ message: string }>;
  createCharacter(projectId: string, data: Partial<Character>): Promise<Character>;
  updateCharacter(characterId: string, data: Partial<Character>): Promise<Character>;
  deleteCharacter(characterId: string): Promise<{ message: string }>;
  createShot(projectId: string, data: Partial<Shot>): Promise<Shot>;
  updateShot(shotId: string, data: Partial<Shot>): Promise<Shot>;
  deleteShot(shotId: string): Promise<{ message: string }>;
  createItem(projectId: string, data: { name: string; description?: string }): Promise<any>;
  generateShotBothImages(shotId: string, providerId: string): Promise<{ success: boolean; startImageUrl?: string; endImageUrl?: string }>;
  reorderShots(projectId: string, shots: { id: string; chapterNumber: number; episodeNumber: number; segmentId: number; cellId: number }[]): Promise<{ message: string }>;
  parseNovel(content: string): Promise<{ chapters: any[]; characters: string[] }>;
  saveNovel(projectId: string, title: string, content: string): Promise<{ success: boolean }>;
  createDocument(projectId: string, data: { title: string; type: string; content?: string }): Promise<Document>;
  getDocumentById(id: string): Promise<Document>;
  updateDocumentById(id: string, data: { title?: string; content?: string; type?: string; status?: string }): Promise<Document>;
  deleteDocumentById(id: string): Promise<{ message: string }>;
  generateVideo(projectId: string, documentId: string, data: { aiProviderId: string; model: string }): Promise<{ video: Video }>;
  generateShotVideo(shotId: string, providerId: string): Promise<{ success: boolean; videoUrl?: string }>;
  parseScript(content: string, model?: string, script_kind?: string): Promise<any>;
  saveScript(projectId: string, title: string, content: string): Promise<{ success: boolean; project: Project }>;
  getScript(scriptId: string): Promise<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }>;
  getProjectScripts(projectId: string): Promise<Array<{ id: string; title: string; content: string; createdAt: string; updatedAt: string }>>;
  uploadImage(file: File, projectId?: string): Promise<{ url: string; filename: string }>;
  deleteAsset(assetId: string): Promise<{ message: string }>;
  uploadCharacterImage(file: File): Promise<{ url: string; filename: string }>;
  uploadSceneImage(file: File): Promise<{ url: string; filename: string }>;
  getAssetCategories(): Promise<{ categories: Array<{ value: string; label: string }>; sources: Array<{ value: string; label: string }> }>;
  updateAssetCategory(assetId: string, category: string): Promise<any>;
  generateShotsFromScript(projectId: string, scriptContent: string, visualStyle?: string): Promise<{ success: boolean; count: number; shots: any[] }>;
  optimizeShotPrompt(shotId: string, referenceImages: string[]): Promise<{ success: boolean; startPrompt: string; endPrompt: string; shot: any }>;
  optimizeScene(data: { sceneContent: string; location: string; time: string; direction?: string }): Promise<{ suggestion: string; optimized: string }>;
  generateImage(data: { prompt: string; negativePrompt?: string; width: number; height: number; style: string; projectId?: string; model?: string; category?: string; image_urls?: string[]; threeView?: boolean; resolution?: string; n?: number; watermark?: boolean }): Promise<{ asset: { url: string } }>;
  batchGenerateImages(data: { prompt: string; count: number; style?: string; negativePrompt?: string; width?: number; height?: number; resolution?: string; projectId?: string; model?: string; providerId?: string; referenceImageUrl?: string; three_view?: boolean; watermark?: boolean }): Promise<{ assets: Array<{ url: string; filename: string }> }>;
  getProjectAssets(projectId: string, type?: string, search?: string, category?: string, source?: string): Promise<any[]>;
  polishPrompt(prompt: string, type?: string, style?: string): Promise<{ polished: string }>;
  processContentWithFile(content: string, mode: 'continue' | 'rewrite' | 'optimize', model?: string): Promise<any>;
  parseScriptWithAI(
    content: string,
    model?: string,
    options?: { use_cache?: boolean; script_kind?: string }
  ): Promise<any>;
  getProjectEpisodes(
    projectId: string,
    params?: { search?: string; sort?: string; order?: 'asc' | 'desc' }
  ): Promise<any[]>;
  applyParseToEpisode(
    episodeId: string,
    body: {
      parse_result: Record<string, unknown>;
      mode?: 'append_scenes' | 'fill_empty_only';
      create_shot_drafts?: boolean;
    }
  ): Promise<{
    created_scene_ids: string[];
    updated_scene_ids: string[];
    created_shot_ids: string[];
  }>;
  optimizePrompt(prompt: string, model?: string, type?: string): Promise<any>;
  getModelPreferences(): Promise<any>;
  setDefaultModels(configurations: any[]): Promise<any>;
  testModel(data: any): Promise<any>;
  recordModelUsage(data: { modelId: string; contentType: string; success: boolean }): Promise<any>;
  expandPrompt(prompt: string, type?: string): Promise<{ expanded: string }>;
  translatePrompt(prompt: string, targetLanguage: string): Promise<{ translated: string }>;
  generateNegativePrompt(prompt: string, type?: string): Promise<{ negative: string }>;
  superResolution(imageId: string, scale: number): Promise<{ url: string }>;
  upscaleImage(imageId: string, scale: number): Promise<{ url: string }>;
  inpainting(imageId: string, maskPrompt: string): Promise<{ url: string }>;
  removeBackground(imageId: string): Promise<{ url: string }>;
  faceEnhancement(imageId: string, strength?: number): Promise<{ url: string }>;
  colorCorrection(imageId: string, data: { brightness?: number; contrast?: number; saturation?: number }): Promise<{ url: string }>;
  styleTransfer(imageId: string, style?: string, strength?: number): Promise<{ url: string }>;
  getNovels(projectId: string): Promise<{ novels: any[] }>;
  getNovelById(novelId: string): Promise<any>;
  createNovel(projectId: string, data: { title?: string; description?: string }): Promise<any>;
  updateNovel(novelId: string, data: { title?: string; description?: string }): Promise<any>;
  deleteNovel(novelId: string): Promise<{ success: boolean }>;
  createChapter(novelId: string, data: { title?: string; content?: string; order?: number }): Promise<any>;
  updateChapter(chapterId: string, data: { title?: string; content?: string; order?: number }): Promise<any>;
  deleteChapter(chapterId: string): Promise<{ success: boolean }>;
  adaptToScript(novelAnalysis: any, options?: any): Promise<any>;
  formatToScript(content: string, episodes: number, minutesPerEpisode: number, model?: string): Promise<{ success: boolean; formatted_text: string; metadata: { episodes: number; minutes_per_episode: number } }>;
  getPanels(shotId: string): Promise<any[]>;
  createPanel(shotId: string, data: { prompt: string; imageUrl?: string; position?: number }): Promise<any>;
  updatePanel(panelId: string, data: { prompt?: string; imageUrl?: string; position?: number }): Promise<any>;
  deletePanel(panelId: string): Promise<{ message: string }>;
  createBatchPanels(shotId: string, panels: { prompt: string; position: number }[]): Promise<any>;
  reorderPanels(shotId: string, panels: { id: string; position: number }[]): Promise<{ message: string }>;
  generatePanelImage(panelId: string, providerId: string): Promise<{ imageUrl: string }>;
  generateBatchPanels(shotId: string, providerId: string): Promise<{ success: boolean }>;
  exportNineGrid(shotId: string): Promise<Blob>;
  getShot(shotId: string): Promise<any>;
  getProjectVideos(projectId: string): Promise<any[]>;
  getProjectVideoQueue(projectId: string): Promise<any[]>;
  deleteVideo(videoId: string): Promise<{ message: string }>;
  createVideoMergeTask(projectId: string, videoIds: string[]): Promise<any>;
  getMergeTaskStatus(taskId: string): Promise<any>;
  getVideoStatus(shotId: string): Promise<any>;
  generateVideoFromPrompt(projectId: string, data: { prompt: string; providerId?: string; model?: string }): Promise<any>;
  continueScript(content: string, context?: string): Promise<{ success: boolean; content: string }>;
  rewriteScript(content: string, model?: string): Promise<{ success: boolean; content: string }>;
  createWardrobe(characterId: string, data: { name: string; description?: string; images?: string[] }): Promise<any>;
  deleteWardrobe(wardrobeId: string): Promise<{ message: string }>;
  getProjectMembers(projectId: string): Promise<Member[]>;
  addProjectMember(projectId: string, userId: string, role: 'editor' | 'viewer'): Promise<Member>;
  removeProjectMember(projectId: string, userId: string): Promise<{ message: string }>;
  updateProjectMemberRole(projectId: string, userId: string, role: 'editor' | 'viewer'): Promise<Member>;
  searchUsers(query: string): Promise<SearchUser[]>;
  getNineGridPanels(shotId: string): Promise<NineGridPanel[]>;
  createNineGridPanel(shotId: string, data: { position?: number; prompt: string }): Promise<NineGridPanel>;
  updateNineGridPanel(shotId: string, panelId: string, data: { prompt?: string; imageUrl?: string }): Promise<NineGridPanel>;
  deleteNineGridPanel(shotId: string, panelId: string): Promise<{ message: string }>;
  generateNineGridPanels(shotId: string, data?: { providerId?: string; model?: string }): Promise<{ total: number; successful: number; failed: number }>;
  reorderNineGridPanels(shotId: string, panelIds: string[]): Promise<{ message: string }>;
  getAnalytics(type: string, startDate?: string, endDate?: string): Promise<any>;
  getPlatformAnalytics(): Promise<any>;
  getUsageStats(): Promise<any>;
  getModelUsageAnalytics(): Promise<any>;
  getAnalysis(projectId: string): Promise<any>;
  get<T = any>(url: string): Promise<T>;
  post<T = any>(url: string, data?: any): Promise<T>;
  put<T = any>(url: string, data?: any): Promise<T>;
  patch<T = any>(url: string, data?: any): Promise<T>;
  delete<T = any>(url: string): Promise<T>;
}

// 重新导出类型以保持向后兼容性
export type {
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
};

// 导出新的 API 客户端实例，保持向后兼容性
export const apiClient = newApiClient as unknown as ApiClientInterface;
