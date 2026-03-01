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

export interface AIModelOption {
  id: string;
  name: string;
  type: string;
  providerId: string;
  providerType: string;
  isDefault?: boolean;
}

export interface GenerationProgress {
  id: string;
  type: 'image' | 'video' | 'script';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface NotificationPayload {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
