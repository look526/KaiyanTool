const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  options: RequestOptions = {}
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

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      error: 'Unknown error',
      code: 'UNKNOWN_ERROR',
    }));
    throw new ApiError(
      errorData.error || 'Request failed',
      errorData.code || 'REQUEST_FAILED',
      response.status,
      errorData.details
    );
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
