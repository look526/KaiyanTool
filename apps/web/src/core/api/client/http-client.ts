import type { 
  ApiErrorDetail, 
  RequestConfig, 
  RequestInterceptor
} from '../types/common';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class HttpClient {
  private interceptors: RequestInterceptor[] = [];

  addInterceptor(interceptor: RequestInterceptor): () => void {
    this.interceptors.push(interceptor);
    return () => {
      const index = this.interceptors.indexOf(interceptor);
      if (index > -1) {
        this.interceptors.splice(index, 1);
      }
    };
  }

  private async executeInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let currentConfig = config;
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        currentConfig = await interceptor.onRequest(currentConfig);
      }
    }
    return currentConfig;
  }

  private async handleResponse<T>(response: T): Promise<T> {
    let currentResponse = response;
    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        currentResponse = await interceptor.onResponse(currentResponse);
      }
    }
    return currentResponse;
  }

  private async handleError(error: unknown): Promise<never> {
    let handledError = error;
    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        handledError = await interceptor.onError(handledError) || handledError;
      }
    }
    throw handledError;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: Omit<RequestConfig, 'endpoint'>
  ): Promise<T> {
    const config: RequestConfig = {
      ...options,
      endpoint,
    };

    try {
      const finalConfig = await this.executeInterceptors(config);
      
      const url = finalConfig.method === 'GET' && finalConfig.body
        ? this.buildUrl(finalConfig.endpoint, finalConfig.body as Record<string, string | number | boolean | undefined>)
        : `${API_BASE_URL}${finalConfig.endpoint}`;

      const fetchOptions: RequestInit = {
        method: finalConfig.method,
        headers: {
          'Content-Type': 'application/json',
          ...finalConfig.headers,
        },
        credentials: 'include',
        signal: finalConfig.signal,
      };

      if (finalConfig.body && finalConfig.method !== 'GET') {
        fetchOptions.body = JSON.stringify(finalConfig.body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData: ApiErrorDetail = await response.json().catch(() => ({
          message: 'Unknown error',
          code: 'UNKNOWN_ERROR',
        }));
        
        const error = new ApiError(
          errorData.message || 'Request failed',
          errorData.code || 'REQUEST_FAILED',
          response.status,
          errorData.details
        );
        
        throw error;
      }

      const data = await response.json();
      return this.handleResponse(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<T> {
    const filteredParams = params 
      ? Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
        )
      : undefined;
    return this.request<T>(endpoint, { 
      method: 'GET', 
      ...(filteredParams ? { body: filteredParams } : {}) 
    });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
export { ApiError };
