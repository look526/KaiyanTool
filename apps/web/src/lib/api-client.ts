import type { User, Project, Content, AIProvider, Session } from '../types'
import { getCsrfToken, clearCsrfToken, refreshCsrfToken } from './csrf'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    const method = (options.method || 'GET').toUpperCase()
    console.log('[API] Request method:', method, 'endpoint:', endpoint)
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      console.log('[API] Getting CSRF token...')
      const token = await getCsrfToken()
      console.log('[API] CSRF token:', token ? token.substring(0, 20) + '...' : 'null')
      if (token) {
        headers['X-CSRF-Token'] = token
        console.log('[API] Added X-CSRF-Token header')
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = errorText || 'Request failed'
      let isCsrfError = false
      try {
        const errorJson = JSON.parse(errorText)
        if (typeof errorJson.error === 'string') {
          errorMessage = errorJson.error
        } else if (errorJson.error && typeof errorJson.error === 'object') {
          errorMessage = errorJson.error.message || JSON.stringify(errorJson.error)
          if (errorJson.error?.code === 'CSRF_TOKEN_INVALID' || 
              errorJson.error?.code === 'CSRF_TOKEN_EXPIRED') {
            isCsrfError = true
          }
        } else if (errorJson.message) {
          errorMessage = errorJson.message
        } else {
          errorMessage = JSON.stringify(errorJson)
        }
        
        if (response.status === 403 && isCsrfError) {
          clearCsrfToken()
          if (retryCount < 1) {
            await refreshCsrfToken()
            return this.request<T>(endpoint, options, retryCount + 1)
          }
        }
      } catch {
        if (errorText.startsWith('{') || errorText.startsWith('[')) {
          errorMessage = `Request failed with status ${response.status}`
        }
      }
      const error = new Error(errorMessage) as any
      error.response = { status: response.status, data: errorText }
      // 处理认证错误
      if (response.status === 401) {
        handleAuthError(error);
      }
      throw error
    }

    const csrfToken = response.headers.get('X-CSRF-Token')
    if (csrfToken) {
      this.saveCsrfToken(csrfToken)
    }

    return response.json()
  }

  /** 兼容 legacyResponseMiddleware：裸对象会被包成 { success: true, data: T } */
  private unwrapSuccessData<T>(result: any): T {
    if (
      result &&
      typeof result === 'object' &&
      result.success === true &&
      result.data !== undefined &&
      result.data !== null
    ) {
      return result.data as T
    }
    return result as T
  }

  /** ParsedScriptV1（snake_case）→ 剧本预览/资产生成使用的 camelCase 场景结构 */
  private normalizeParsedScriptV1ForPreview(v1: Record<string, unknown>): {
    scenes: unknown[]
    characters: unknown[]
    items: unknown[]
    metadata?: unknown
    parse_schema_version?: number
  } {
    const scenesRaw = Array.isArray(v1.scenes) ? v1.scenes : []
    const scenes = scenesRaw.map((s: Record<string, unknown>) => {
      const dialoguesRaw = Array.isArray(s.dialogues) ? s.dialogues : []
      const dialogues = dialoguesRaw.map((d: Record<string, unknown>) => ({
        characterName: typeof d.character_name === 'string' ? d.character_name : '角色',
        text: typeof d.text === 'string' ? d.text : '',
        shot: d.shot,
      }))
      const charNames = Array.isArray(s.character_names)
        ? s.character_names.filter((x): x is string => typeof x === 'string')
        : []
      const desc =
        (typeof s.description === 'string' && s.description) ||
        (typeof s.heading === 'string' && s.heading) ||
        ''
      return {
        id: s.id,
        number: s.number,
        heading: s.heading,
        location: s.location,
        time: s.time,
        description: desc,
        characters: charNames,
        dialogues,
        actions: Array.isArray(s.actions) ? s.actions : [],
        items: Array.isArray(s.items) ? s.items : undefined,
        segmentId: s.segment_id,
      }
    })
    const charsRaw = Array.isArray(v1.characters) ? v1.characters : []
    const characters = charsRaw.map((c: Record<string, unknown>) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      lines: c.lines,
      personality: c.personality,
      costume: c.costume,
      appearance: c.appearance,
    }))
    const itemsRaw = Array.isArray(v1.items) ? v1.items : []
    const items = itemsRaw.map((i: Record<string, unknown>) => ({
      name: i.name,
      size: i.size,
      shape: i.shape,
      color: i.color,
    }))
    return {
      scenes,
      characters,
      items,
      metadata: v1.metadata,
      parse_schema_version:
        typeof v1.parse_schema_version === 'number' ? v1.parse_schema_version : undefined,
    }
  }

  private saveCsrfToken(token: string): void {
    localStorage.setItem('csrfToken', token)
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

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Auth endpoints
  async login(data: { email: string; password: string; remember_me?: boolean }) {
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
  async getProjects(params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    const queryString = query.toString();
    const response = await this.get<{ success: boolean; data: Project[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(`/projects${queryString ? '?' + queryString : ''}`);
    return {
      projects: response.data,
      pagination: response.meta,
    };
  }

  async getProject(id: string) {
    const response = await this.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: Partial<Project>) {
    const response = await this.post<{ success: boolean; data: Project }>('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<Project>) {
    const response = await this.put<{ success: boolean; data: Project }>(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string) {
    return this.delete(`/projects/${id}`)
  }

  // AI Provider endpoints
  async getAIProviders() {
    return this.get<{ providers: AIProvider[]; pagination: { total: number; page: number; limit: number } }>('/ai-providers')
  }

  async getAdminAIProviders() {
    return this.get<{ providers: AIProvider[]; pagination: { total: number; page: number; limit: number } }>('/admin/ai-providers')
  }

  async createAIProvider(data: Partial<AIProvider>) {
    return this.post<AIProvider>('/admin/ai-providers', data)
  }

  async updateAIProvider(id: string, data: Partial<AIProvider>) {
    return this.put<AIProvider>(`/admin/ai-providers/${id}`, data)
  }

  async deleteAIProvider(id: string) {
    return this.delete(`/admin/ai-providers/${id}`)
  }

  async testAIProvider(id: string) {
    return this.post<{ success: boolean; message: string }>(`/admin/ai-providers/${id}/test`)
  }

  async testAIProviderModel(modelId: string) {
    return this.post<{ success: boolean; message: string; model: any; testResult?: any }>(`/admin/ai-providers/models/${modelId}/test`)
  }

  async setAssistantDefaultModel(modelId: string) {
    return this.post<{ message: string }>(`/admin/ai-providers/models/${modelId}/set-assistant-default`)
  }

  async unsetAssistantDefaultModel(modelId: string) {
    return this.post<{ message: string }>(`/admin/ai-providers/models/${modelId}/unset-assistant-default`)
  }

  async createAIProviderModel(provider_id: string, data: any) {
    return this.post<any>(`/admin/ai-providers/${provider_id}/models`, data)
  }

  async updateAIProviderModel(provider_id: string, model_id: string, data: any) {
    return this.put<any>(`/admin/ai-providers/${provider_id}/models/${model_id}`, data)
  }

  async deleteAIProviderModel(provider_id: string, model_id: string) {
    return this.delete(`/admin/ai-providers/${provider_id}/models/${model_id}`)
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

  async processContentWithFile(content: string, mode: 'continue' | 'rewrite' | 'optimize', model?: string) {
    const response = await fetch(`${this.baseUrl}/content/process-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, mode, model }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText || 'Request failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async optimizePrompt(prompt: string, model?: string, type: string = 'image') {
    console.log('[api-client] optimizePrompt 调用', { promptLength: prompt.length, model, type })
    try {
      const result = await this.post<any>('/prompt/optimize', { prompt, model, type })
      console.log('[api-client] optimizePrompt 成功', result)
      return result
    } catch (error) {
      console.error('[api-client] optimizePrompt 失败', error)
      throw error
    }
  }

  async parseScript(content: string, model?: string, script_kind?: string) {
    console.log('[api-client] parseScript 调用', { contentLength: content.length, model })
    try {
      const result = await this.post<any>('/script/parse', { content, model, script_kind })
      const unwrapped = this.unwrapSuccessData<Record<string, unknown>>(result)
      if (unwrapped && typeof unwrapped === 'object' && unwrapped.parse_schema_version === 1) {
        const normalized = this.normalizeParsedScriptV1ForPreview(unwrapped)
        console.log('[api-client] parseScript 成功 (V1→preview)', normalized)
        return normalized
      }
      console.log('[api-client] parseScript 成功', unwrapped)
      return unwrapped as {
        scenes: unknown[]
        characters: unknown[]
        items?: unknown[]
      }
    } catch (error) {
      console.error('[api-client] parseScript 失败', error)
      throw error
    }
  }

  async parseScriptWithAI(
    content: string,
    model?: string,
    options?: { use_cache?: boolean; script_kind?: string }
  ) {
    console.log('[api-client] parseScriptWithAI 调用', { contentLength: content.length, model })
    try {
      const result = await this.post<any>('/script/parse-ai', {
        content,
        model,
        use_cache: options?.use_cache,
        script_kind: options?.script_kind,
      })
      const unwrapped = this.unwrapSuccessData<Record<string, unknown>>(result)
      if (unwrapped && typeof unwrapped === 'object' && unwrapped.parse_schema_version === 1) {
        const normalized = this.normalizeParsedScriptV1ForPreview(unwrapped)
        console.log('[api-client] parseScriptWithAI 成功 (V1→preview)', normalized)
        return normalized
      }
      console.log('[api-client] parseScriptWithAI 成功', unwrapped)
      return unwrapped as {
        scenes: unknown[]
        characters: unknown[]
        items?: unknown[]
        metadata?: unknown
      }
    } catch (error) {
      console.error('[api-client] parseScriptWithAI 失败', error)
      throw error
    }
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

  async formatToScript(content: string, episodes: number, minutesPerEpisode: number, model?: string) {
    return this.post<{ success: boolean; formatted_text: string; metadata: { episodes: number; minutes_per_episode: number } }>('/script/format-to-script', {
      content,
      episodes,
      minutes_per_episode: minutesPerEpisode,
      model
    })
  }

  async getProjectEpisodes(
    projectId: string,
    params?: { search?: string; sort?: string; order?: 'asc' | 'desc' }
  ) {
    const q = new URLSearchParams()
    if (params?.search) q.append('search', params.search)
    if (params?.sort) q.append('sort', params.sort)
    if (params?.order) q.append('order', params.order)
    const qs = q.toString()
    const result = await this.get<any>(`/projects/${projectId}/episodes${qs ? `?${qs}` : ''}`)
    return this.unwrapSuccessData<any[]>(result) ?? result
  }

  async applyParseToEpisode(
    episodeId: string,
    body: {
      parse_result: Record<string, unknown>
      mode?: 'append_scenes' | 'fill_empty_only'
      create_shot_drafts?: boolean
    }
  ) {
    const result = await this.post<any>(`/episodes/${episodeId}/apply-parse`, body)
    return this.unwrapSuccessData<{
      created_scene_ids: string[]
      updated_scene_ids: string[]
      created_shot_ids: string[]
    }>(result)
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

  async getScenes(projectId: string) {
    return this.get<any[]>(`/projects/${projectId}/scenes`)
  }

  async createScene(projectId: string, data: any) {
    return this.post<any>(`/projects/${projectId}/scenes`, data)
  }

  async updateScene(id: string, data: any) {
    return this.put<any>(`/scenes/${id}`, data)
  }

  async deleteScene(id: string) {
    return this.delete(`/scenes/${id}`)
  }

  async getShots(projectId: string, sceneId?: string) {
    const params = sceneId ? `?sceneId=${sceneId}` : ''
    return this.get<any[]>(`/projects/${projectId}/shots${params}`)
  }

  async createShot(projectId: string, data: any) {
    return this.post<any>(`/projects/${projectId}/shots`, data)
  }

  async updateShot(id: string, data: any) {
    return this.put<any>(`/shots/${id}`, data)
  }

  async deleteShot(id: string) {
    return this.delete(`/shots/${id}`)
  }

  async createWardrobe(characterId: string, data: any) {
    return this.post<any>(`/characters/${characterId}/wardrobes`, data)
  }

  async getAssets(type?: string, search?: string, category?: string, source?: string) {
    const params = new URLSearchParams()
    if (type && type !== 'all') params.append('type', type)
    if (search) params.append('search', search)
    if (category && category !== 'all') params.append('category', category)
    if (source && source !== 'all') params.append('source', source)
    const query = params.toString() ? `?${params.toString()}` : ''
    console.log('[GetAssets] Request:', `/upload/assets${query}`)
    const result = await this.get<any[]>(`/upload/assets${query}`)
    console.log('[GetAssets] Response count:', result?.length)
    return result
  }

  async getAssetCategories() {
    return this.get<{ categories: Array<{ value: string; label: string }>; sources: Array<{ value: string; label: string }> }>('/upload/categories')
  }

  async updateAssetCategory(assetId: string, category: string) {
    return this.patch<any>(`/upload/assets/${assetId}/category`, { category })
  }

  async uploadAssetGlobal(file: File, retryCount: number = 0): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const token = await getCsrfToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['X-CSRF-Token'] = token
    }

    console.log('[Upload] Starting upload:', file.name)
    const response = await fetch(`${this.baseUrl}/upload/assets`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    })
    console.log('[Upload] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Upload] Error response:', errorText)
      let isCsrfError = false
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.code === 'CSRF_TOKEN_INVALID' ||
            errorJson.error?.code === 'CSRF_TOKEN_EXPIRED') {
          isCsrfError = true
        }
      } catch {}

      if (response.status === 403 && isCsrfError) {
        clearCsrfToken()
        if (retryCount < 1) {
          await refreshCsrfToken()
          return this.uploadAssetGlobal(file, retryCount + 1)
        }
      }

      throw new Error(errorText || 'Upload failed')
    }

    const result = await response.json()
    console.log('[Upload] Success:', result)
    return result
  }

  async uploadImage(file: File, projectId?: string, retryCount: number = 0): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'character')
    formData.append('source', 'upload')
    if (projectId) {
      formData.append('projectId', projectId)
    }

    const token = await getCsrfToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['X-CSRF-Token'] = token
    }

    const response = await fetch(`${this.baseUrl}/upload/assets`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      let isCsrfError = false
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.code === 'CSRF_TOKEN_INVALID' ||
            errorJson.error?.code === 'CSRF_TOKEN_EXPIRED') {
          isCsrfError = true
        }
      } catch {}

      if (response.status === 403 && isCsrfError) {
        clearCsrfToken()
        if (retryCount < 1) {
          await refreshCsrfToken()
          return this.uploadImage(file, projectId, retryCount + 1)
        }
      }

      throw new Error(errorText || 'Upload failed')
    }

    return response.json()
  }

  async deleteAsset(id: string) {
    return this.delete(`/upload/assets/${id}`)
  }

  async getProjectAssets(projectId: string, type?: string, search?: string, category?: string, source?: string) {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (search) params.append('search', search)
    if (category && category !== 'all') params.append('category', category)
    if (source && source !== 'all') params.append('source', source)
    const queryString = params.toString()
    return this.get<any[]>(`/upload/projects/${projectId}/assets${queryString ? `?${queryString}` : ''}`)
  }

  async uploadProjectAsset(projectId: string, file: File, type: string, retryCount: number = 0): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const token = await getCsrfToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['X-CSRF-Token'] = token
    }

    const response = await fetch(`${this.baseUrl}/upload/projects/${projectId}/assets`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      let isCsrfError = false
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.code === 'CSRF_TOKEN_INVALID' ||
            errorJson.error?.code === 'CSRF_TOKEN_EXPIRED') {
          isCsrfError = true
        }
      } catch {}

      if (response.status === 403 && isCsrfError) {
        clearCsrfToken()
        if (retryCount < 1) {
          await refreshCsrfToken()
          return this.uploadProjectAsset(projectId, file, type, retryCount + 1)
        }
      }

      throw new Error(errorText || 'Upload failed')
    }

    return response.json()
  }

  async deleteProjectAsset(projectId: string, assetId: string) {
    return this.delete(`/upload/projects/${projectId}/assets/${assetId}`)
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

  async generateOutline(data: { storylineId: string; title: string; genre: string; targetDuration: number; style: string; additionalNotes?: string }) {
    return this.post<any>('/novel/generate-outline', data)
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

  async getModelUsageAnalytics() {
    return this.get<any>('/model-preferences/analytics')
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

  async generateImage(data: { prompt: string; negativePrompt?: string; width: number; height: number; style: string; projectId?: string | undefined; model?: string; category?: string; image_urls?: string[]; threeView?: boolean; resolution?: string; n?: number; watermark?: boolean }) {
    return this.post<any>('/image-generation/generate', data)
  }

  async batchGenerateImages(data: { prompt: string; count: number; referenceImageUrl?: string; providerId?: string }) {
    return this.post<any>('/image-generation/batch', data)
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
    const defaultModels: Record<string, string> = {}
    configurations.forEach(config => {
      if (config.contentType && config.modelId) {
        defaultModels[config.contentType] = config.modelId
      }
    })
    return this.post<any>('/model-preferences/default', { default_models: defaultModels })
  }

  async testModel(data: any) {
    const snakeCaseData = {
      model_id: data.modelId || data.model_id,
      test_prompt: data.testPrompt || data.test_prompt
    }
    return this.post<any>('/model-preferences/test', snakeCaseData)
  }

  async recordModelUsage(data: { modelId: string; contentType: string; success: boolean }) {
    const snakeCaseData = {
      model_id: data.modelId,
      content_type: data.contentType,
      success: data.success
    }
    return this.post<any>('/model-preferences/usage', snakeCaseData)
  }

  async getConfigurationHistory(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get<any>(`/model-preferences/history${queryString}`);
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

  async saveStoryline(projectId: string, storyline: any) {
    return this.post<any>(`/projects/${projectId}/storyline`, storyline)
  }

  async generateStorylineFromForm(formData: any) {
    return this.post<any>('/novel/generate-storyline', formData)
  }

  async superResolution(imageId: string, scale: number = 2) {
    return this.post<{ url: string }>('/image-enhancement/super-resolution', { imageId, scale })
  }

  async upscaleImage(imageId: string, scale: number = 2) {
    return this.post<{ url: string }>('/image-enhancement/upscale', { imageId, scale })
  }

  async inpainting(imageId: string, maskPrompt: string) {
    return this.post<{ url: string }>('/image-enhancement/inpainting', { imageId, maskPrompt })
  }

  async removeBackground(imageId: string) {
    return this.post<{ url: string }>('/image-enhancement/background-removal', { imageId })
  }

  async faceEnhancement(imageId: string, strength: number = 0.5) {
    return this.post<{ url: string }>('/image-enhancement/face-enhancement', { imageId, strength })
  }

  async colorCorrection(imageId: string, data: { brightness?: number; contrast?: number; saturation?: number }) {
    return this.post<{ url: string }>('/image-enhancement/color-correction', { imageId, ...data })
  }

  async styleTransfer(imageId: string, style?: string, strength: number = 0.5) {
    return this.post<{ url: string }>('/image-enhancement/style-transfer', { imageId, style, strength })
  }

  // ========== TTS 配音 ==========

  async synthesizeSpeech(project_id: string, data: { text: string; voice_id: string; provider_id: string; speed?: number; emotion?: string; shot_id?: string; episode_id?: string; speaker?: string }) {
    return this.post<any>(`/projects/${project_id}/tts/synthesize`, data)
  }

  async batchSynthesizeTTS(project_id: string, data: { episode_id: string; provider_id: string; default_voice_id?: string }) {
    return this.post<any>(`/projects/${project_id}/tts/batch`, data)
  }

  async listTTSVoices(provider_id: string) {
    return this.get<any[]>(`/tts/voices?provider_id=${provider_id}`)
  }

  async getVoiceProfiles(project_id: string) {
    return this.get<any[]>(`/projects/${project_id}/voice-profiles`)
  }

  async upsertVoiceProfile(project_id: string, data: { character_id?: string; name: string; provider: string; voice_id: string; sample_url?: string; language?: string; gender?: string; style?: string }) {
    return this.post<any>(`/projects/${project_id}/voice-profiles`, data)
  }

  async deleteVoiceProfile(id: string) {
    return this.delete(`/voice-profiles/${id}`)
  }

  // ========== 字幕 ==========

  async generateSubtitles(project_id: string, episode_id: string) {
    return this.post<any>(`/projects/${project_id}/episodes/${episode_id}/subtitles/generate`, {})
  }

  async getSubtitles(project_id: string, episode_id: string) {
    return this.get<any>(`/projects/${project_id}/episodes/${episode_id}/subtitles`)
  }

  async updateSubtitleEntries(subtitle_id: string, entries: any[]) {
    return this.put<any>(`/subtitles/${subtitle_id}/entries`, { entries })
  }

  async updateSubtitleStyle(subtitle_id: string, style: Record<string, any>) {
    return this.put<any>(`/subtitles/${subtitle_id}/style`, { style })
  }

  async exportSubtitle(subtitle_id: string, format: 'srt' | 'vtt' | 'ass' | 'ssa' = 'srt') {
    return this.get<string>(`/subtitles/${subtitle_id}/export?format=${format}`)
  }

  // ========== 时间线 ==========

  async createTimeline(project_id: string, episode_id: string) {
    return this.post<any>(`/projects/${project_id}/episodes/${episode_id}/timeline`, {})
  }

  async getTimeline(project_id: string, episode_id: string) {
    return this.get<any>(`/projects/${project_id}/episodes/${episode_id}/timeline`)
  }

  async updateTimelineTracks(timeline_id: string, tracks: any[]) {
    return this.put<any>(`/timeline/${timeline_id}/tracks`, { tracks })
  }

  async startTimelineRender(timeline_id: string) {
    return this.post<any>(`/timeline/${timeline_id}/render`, {})
  }

  async getTimelineRenderStatus(timeline_id: string) {
    return this.get<any>(`/timeline/${timeline_id}/render/status`)
  }

  // ========== 一键出片 ==========

  async createProductionTask(project_id: string, data: { episode_id: string; provider_id: string; tts_provider_id?: string; default_voice_id?: string; style?: string; quality?: string; skip_steps?: string[]; enable_lip_sync?: boolean }) {
    return this.post<any>(`/projects/${project_id}/production`, data)
  }

  async executeProductionTask(task_id: string) {
    return this.post<any>(`/production/${task_id}/execute`, {})
  }

  async getProductionTask(task_id: string) {
    return this.get<any>(`/production/${task_id}`)
  }

  async listProductionTasks(project_id: string) {
    return this.get<any[]>(`/projects/${project_id}/production`)
  }

  async cancelProductionTask(task_id: string) {
    return this.post<any>(`/production/${task_id}/cancel`, {})
  }
}

let authErrorHandler: ((error: Error) => void) | null = null;

export function setAuthErrorHandler(handler: (error: Error) => void) {
  authErrorHandler = handler;
}

// 在request方法中调用认证错误处理
export function handleAuthError(error: Error) {
  if (authErrorHandler) {
    authErrorHandler(error);
  }
}

export const apiClient = new ApiClient()
