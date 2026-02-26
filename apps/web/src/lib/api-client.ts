import type { User, Project, Content, AIProvider, Session } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = errorText || 'Request failed'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorMessage
      } catch {}
      const error = new Error(errorMessage) as any
      error.response = { status: response.status, data: errorText }
      throw error
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Auth endpoints
  async login(data: { email: string; password: string; rememberMe?: boolean }) {
    return this.post<{ user: User; token: string }>('/auth/login', data)
  }

  async register(data: { name: string; email: string; password: string }) {
    return this.post<{ user: User; token: string }>('/auth/register', data)
  }

  async logout() {
    return this.post('/auth/logout')
  }

  async getCurrentUser() {
    return this.get<{ user: User }>('/auth/me')
  }

  // Project endpoints
  async getProjects() {
    return this.get<Project[]>('/projects')
  }

  async getProject(id: string) {
    return this.get<Project>(`/projects/${id}`)
  }

  async createProject(data: Partial<Project>) {
    return this.post<Project>('/projects', data)
  }

  async updateProject(id: string, data: Partial<Project>) {
    return this.put<Project>(`/projects/${id}`, data)
  }

  async deleteProject(id: string) {
    return this.delete(`/projects/${id}`)
  }

  // AI Provider endpoints
  async getAIProviders() {
    return this.get<AIProvider[]>('/ai-providers')
  }

  async createAIProvider(data: Partial<AIProvider>) {
    return this.post<AIProvider>('/ai-providers', data)
  }

  async updateAIProvider(id: string, data: Partial<AIProvider>) {
    return this.put<AIProvider>(`/ai-providers/${id}`, data)
  }

  async deleteAIProvider(id: string) {
    return this.delete(`/ai-providers/${id}`)
  }

  // Document endpoints
  async getDocuments() {
    return this.get<any[]>('/documents')
  }

  async getDocument(id: string) {
    return this.get<any>(`/documents/${id}`)
  }

  async createDocument(data: any) {
    return this.post<any>('/documents', data)
  }

  async updateDocument(id: string, data: any) {
    return this.put<any>(`/documents/${id}`, data)
  }

  async deleteDocument(id: string) {
    return this.delete(`/documents/${id}`)
  }

  // Script endpoints
  async rewriteScript(content: string, model?: string) {
    return this.post<any>('/script/rewrite', { content, model })
  }

  async continueScript(content: string, model?: string) {
    return this.post<any>('/script/continue', { content, model })
  }

  async parseScript(content: string, model?: string) {
    return this.post<any>('/script/parse', { content, model })
  }

  async saveScript(projectId: string, title: string, content: string) {
    return this.post<any>('/script/save', { projectId, title, content })
  }

  async optimizeScene(data: any) {
    return this.post<any>('/script/optimize-scene', data)
  }

  async getScripts(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/scripts`)
  }

  // Novel endpoints
  async getNovels(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/novels`)
  }

  async getNovelById(novelId: string) {
    return this.get<any>(`/novels/${novelId}`)
  }

  async createNovel(projectId: string, data: any) {
    return this.post<any>(`/projects/${projectId}/novels`, data)
  }

  async updateNovel(novelId: string, data: any) {
    return this.put<any>(`/novels/${novelId}`, data)
  }

  async deleteNovel(novelId: string) {
    return this.delete(`/novels/${novelId}`)
  }

  async createChapter(novelId: string, data: any) {
    return this.post<any>(`/novels/${novelId}/chapters`, data)
  }

  async getChaptersByNovel(novelId: string) {
    return this.get<any[]>(`/novels/${novelId}/chapters`)
  }

  async updateChapter(chapterId: string, data: any) {
    return this.put<any>(`/chapters/${chapterId}`, data)
  }

  async deleteChapter(chapterId: string) {
    return this.delete(`/chapters/${chapterId}`)
  }

  async parseNovel(content: string) {
    return this.post<any>('/novel/extract-chapters', { content })
  }

  async adaptToScript(novelAnalysis: any, options?: any) {
    return this.post<any>('/novel/adapt-to-script', { novelAnalysis, options })
  }

  // Character endpoints
  async getCharacters(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/characters`)
  }

  async createCharacter(projectId: string, data: any) {
    return this.post<any>(`/projects/${projectId}/characters`, data)
  }

  async updateCharacter(id: string, data: any) {
    return this.put<any>(`/characters/${id}`, data)
  }

  async deleteCharacter(id: string) {
    return this.delete(`/characters/${id}`)
  }

  async createWardrobe(characterId: string, data: any) {
    return this.post<any>(`/characters/${characterId}/wardrobes`, data)
  }

  async getAssets(type?: string, search?: string) {
    const params = new URLSearchParams()
    if (type && type !== 'all') params.append('type', type)
    if (search) params.append('search', search)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.get<any[]>(`/upload/assets${query}`)
  }

  async uploadAssetGlobal(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${this.baseUrl}/upload/assets`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Upload failed')
    }
    
    return response.json()
  }

  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${this.baseUrl}/assets/images/character`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Upload failed')
    }
    
    return response.json()
  }

  async uploadSceneImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${this.baseUrl}/assets/images/scene`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Upload failed')
    }
    
    return response.json()
  }

  async deleteAsset(id: string) {
    return this.delete(`/assets/${id}`)
  }

  async getProjectAssets(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/assets`)
  }

  async uploadProjectAsset(projectId: string, file: File, type: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/assets`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Upload failed')
    }
    
    return response.json()
  }

  async deleteProjectAsset(projectId: string, assetId: string) {
    return this.delete(`/projects/${projectId}/assets/${assetId}`)
  }

  async getPromptTemplates(category?: string) {
    return this.get<any[]>(`/prompt-templates${category ? `?category=${category}` : ''}`)
  }

  async createPromptTemplate(data: any) {
    return this.post<any>('/prompt-templates', data)
  }

  async updatePromptTemplate(id: string, data: any) {
    return this.put<any>(`/prompt-templates/${id}`, data)
  }

  async deletePromptTemplate(id: string) {
    return this.delete(`/prompt-templates/${id}`)
  }

  async polishPrompt(prompt: string, context?: any) {
    return this.post<any>('/prompt-polish', { prompt, context })
  }

  async getClothingVariants(characterId: string) {
    return this.get<any[]>(`/clothing-variant/character/${characterId}`)
  }

  async createClothingVariant(data: any) {
    return this.post<any>('/clothing-variant', data)
  }

  async getWardrobe(characterId: string) {
    return this.get<any[]>(`/clothing-variant/wardrobe/${characterId}`)
  }

  async createWardrobeItem(characterId: string, data: any) {
    return this.post<any>('/clothing-variant/wardrobe', { characterId, ...data })
  }

  async deleteWardrobeItem(wardrobeId: string) {
    return this.delete(`/clothing-variant/wardrobe/${wardrobeId}`)
  }

  async analyzeNovel(content: string) {
    return this.post<any>('/novel/analyze', { content })
  }

  async identifyCharacters(content: string) {
    return this.post<any>('/novel/identify-characters', { content })
  }

  async generateStoryline(content: string) {
    return this.post<any>('/novel/generate-storyline', { content })
  }

  async createOutline(content: string) {
    return this.post<any>('/novel/generate-outline', { content })
  }

  async getMigrations() {
    return this.get<any[]>('/migration')
  }

  async migrateFromCinegen(data: any) {
    return this.post<any>('/migration/cinegen', data)
  }

  async migrateFromJianYing(data: any) {
    return this.post<any>('/migration/jianying', data)
  }

  async getAnalysis(projectId: string) {
    return this.get<any>(`/analysis/project/${projectId}`)
  }

  async getAnalytics(type: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ type })
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return this.get<any>(`/analytics?${params.toString()}`)
  }

  async getPlatformAnalytics() {
    return this.get<any>('/analytics/platform')
  }

  async getUsageStats() {
    return this.get<any>('/analytics/usage')
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.post<any>('/auth/change-password', { currentPassword, newPassword })
  }

  async logoutAll() {
    return this.post<any>('/auth/logout-all', {})
  }

  async searchUsers(query: string) {
    return this.get<any[]>(`/users/search?q=${encodeURIComponent(query)}`)
  }

  async getProjectMembers(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/members`)
  }

  async addProjectMember(projectId: string, userId: string, role: string) {
    return this.post<any>(`/projects/${projectId}/members`, { userId, role })
  }

  async generateImage(data: { prompt: string; negativePrompt?: string; width: number; height: number; style: string; projectId?: string; model?: string }) {
    return this.post<any>('/image/generate', data)
  }

  async removeProjectMember(projectId: string, userId: string) {
    return this.delete<any>(`/projects/${projectId}/members/${userId}`)
  }

  async updateProjectMemberRole(projectId: string, userId: string, role: string) {
    return this.put<any>(`/projects/${projectId}/members/${userId}`, { role })
  }

  async updateProfile(data: any) {
    return this.put<any>('/users/profile', data)
  }

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${this.baseUrl}/users/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Upload failed')
    }
    return response.json()
  }

  async getProjectDocuments(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/documents`)
  }

  async saveOutline(projectId: string, outline: any) {
    return this.post<any>(`/projects/${projectId}/outline`, outline)
  }

  async getModelPreferences() {
    return this.get<any>('/model-preferences')
  }

  async setDefaultModels(configurations: any[]) {
    return this.post<any>('/model-preferences/default', { configurations })
  }

  async testModel(data: any) {
    return this.post<any>('/model-preferences/test', data)
  }

  async recordModelUsage(data: { modelId: string; contentType: string; success: boolean }) {
    return this.post<any>('/model-preferences/usage', data)
  }

  async getConfigurationHistory(params?: any) {
    return this.get<any>('/model-preferences/history', params)
  }

  async getItems(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/items`)
  }

  async createItem(projectId: string, data: any) {
    return this.post<any>(`/projects/${projectId}/items`, data)
  }

  async updateItem(id: string, data: any) {
    return this.put<any>(`/items/${id}`, data)
  }

  async deleteItem(id: string) {
    return this.delete(`/items/${id}`)
  }

  async generateItemsFromScript(projectId: string) {
    return this.post<any>(`/projects/${projectId}/items/generate`, {})
  }

  async createDocumentV2(data: any) {
    return this.post<any>('/documents/v2', data)
  }

  async getDocumentById(id: string) {
    return this.get<any>(`/documents/${id}`)
  }

  async updateDocumentById(id: string, data: any) {
    return this.put<any>(`/documents/${id}`, data)
  }

  async deleteDocumentById(id: string) {
    return this.delete(`/documents/${id}`)
  }

  async createNovel(projectId: string, data: any) {
    return this.post<any>(`/projects/${projectId}/novels`, data)
  }

  async saveStoryline(projectId: string, storyline: any) {
    return this.post<any>(`/projects/${projectId}/storyline`, storyline)
  }

  async generateStorylineFromForm(formData: any) {
    return this.post<any>('/novel/generate-storyline', formData)
  }
}

export function setAuthErrorHandler(handler: (error: Error) => void) {
  // Auth error handler
  // This function can be used to set a global error handler for auth errors
}

export const apiClient = new ApiClient()
