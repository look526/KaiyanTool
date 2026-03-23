const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// CSRF token 管理
let csrfTokenPromise: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  // 首先检查 localStorage 中是否已有 token
  const existingToken = localStorage.getItem('csrfToken');
  if (existingToken) {
    return existingToken;
  }
  
  // 如果已经有正在进行的请求，返回该 Promise
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }
  
  // 创建新的请求 Promise
  csrfTokenPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      const newToken = response.headers.get('X-CSRF-Token') || '';
      if (newToken) {
        localStorage.setItem('csrfToken', newToken);
      }
      return newToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return '';
    } finally {
      csrfTokenPromise = null;
    }
  })();
  
  return csrfTokenPromise;
}

function clearCsrfToken(): void {
  localStorage.removeItem('csrfToken');
}

async function refreshCsrfToken(): Promise<string> {
  clearCsrfToken();
  return getCsrfToken();
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: any;
  stack?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retryCount: number = 0
): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    signal,
  };

  // 非 GET 请求需要 CSRF token
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    console.log('[API] Getting CSRF token for', method, endpoint);
    const token = await getCsrfToken();
    console.log('[API] CSRF token:', token ? token.substring(0, 20) + '...' : 'null');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as Record<string, string>)['X-CSRF-Token'] = token;
      console.log('[API] Added X-CSRF-Token header');
    }
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText || 'Request failed';
    let isCsrfError = false;
    
    try {
      const errorJson = JSON.parse(errorText);
      if (typeof errorJson.error === 'string') {
        errorMessage = errorJson.error;
      } else if (errorJson.error && typeof errorJson.error === 'object') {
        errorMessage = errorJson.error.message || JSON.stringify(errorJson.error);
        if (errorJson.error?.code === 'CSRF_TOKEN_INVALID' || 
            errorJson.error?.code === 'CSRF_TOKEN_EXPIRED') {
          isCsrfError = true;
        }
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      } else {
        errorMessage = JSON.stringify(errorJson);
      }
      
      // CSRF 错误处理
      if (response.status === 403 && isCsrfError) {
        console.log('[API] CSRF error detected, refreshing token...');
        clearCsrfToken();
        if (retryCount < 1) {
          await refreshCsrfToken();
          return request<T>(endpoint, options, retryCount + 1);
        }
      }
    } catch {
      if (errorText.startsWith('{') || errorText.startsWith('[')) {
        errorMessage = `Request failed with status ${response.status}`;
      }
    }
    
    const errorData: ApiErrorResponse = {
      error: errorMessage,
      code: isCsrfError ? 'CSRF_TOKEN_INVALID' : 'REQUEST_FAILED',
    };
    
    throw new ApiError(
      errorData.error || 'Request failed',
      errorData.code || 'REQUEST_FAILED',
      response.status,
      errorData.details
    );
  }

  // 从响应中获取并保存 CSRF token
  const csrfToken = response.headers.get('X-CSRF-Token');
  if (csrfToken) {
    localStorage.setItem('csrfToken', csrfToken);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, signal?: AbortSignal) =>
    request<T>(endpoint, { signal }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (params?: PaginationParams) => ['projects', 'list', params] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    members: (id: string) => ['projects', 'members', id] as const,
  },
  scripts: {
    all: ['scripts'] as const,
    detail: (projectId: string) => ['scripts', 'detail', projectId] as const,
  },
  characters: {
    all: (projectId: string) => ['characters', projectId] as const,
    detail: (id: string) => ['characters', 'detail', id] as const,
  },
  scenes: {
    all: (projectId: string) => ['scenes', projectId] as const,
    detail: (id: string) => ['scenes', 'detail', id] as const,
  },
  shots: {
    all: (projectId: string) => ['shots', projectId] as const,
    detail: (id: string) => ['shots', 'detail', id] as const,
  },
  aiProviders: {
    all: ['ai-providers'] as const,
    models: (providerId: string) => ['ai-providers', 'models', providerId] as const,
  },
  assets: {
    all: (projectId: string) => ['assets', projectId] as const,
  },
};

export { ApiError };
