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
      const error = await response.text()
      throw new Error(error || 'Request failed')
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
}

// Auth error handler
export function setAuthErrorHandler(handler: (error: Error) => void) {
  // Auth error handler
  // This function can be used to set a global error handler for auth errors
}

export const apiClient = new ApiClient()
