import { ApiError } from './http-client';

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  REQUEST_FAILED = 'REQUEST_FAILED',
}

export interface ErrorContext {
  endpoint: string;
  method: string;
  statusCode?: number;
  timestamp: number;
}

export interface ErrorLogEntry {
  error: Error;
  context: ErrorContext;
  userMessage?: string;
}

class ApiErrorHandler {
  private errorListeners: ((entry: ErrorLogEntry) => void)[] = [];
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize = 100;

  private errorMessages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: 'Please log in to continue',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action',
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found',
    [ErrorCode.VALIDATION_ERROR]: 'Invalid data provided',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests, please try again later',
    [ErrorCode.SERVER_ERROR]: 'Server error, please try again later',
    [ErrorCode.NETWORK_ERROR]: 'Network connection failed',
    [ErrorCode.TIMEOUT_ERROR]: 'Request timed out',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred',
    [ErrorCode.REQUEST_FAILED]: 'Request failed',
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.FORBIDDEN;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 422:
        return ErrorCode.VALIDATION_ERROR;
      case 429:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      case 500:
      case 502:
      case 503:
        return ErrorCode.SERVER_ERROR;
      default:
        return ErrorCode.REQUEST_FAILED;
    }
  }

  private isAuthError(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.statusCode === 401 || error.statusCode === 403;
    }
    return false;
  }

  handle(error: unknown, context?: Partial<ErrorContext>): never {
    const fullContext: ErrorContext = {
      endpoint: context?.endpoint || '',
      method: context?.method || 'GET',
      statusCode: context?.statusCode,
      timestamp: Date.now(),
    };

    let userMessage: string;
    let errorCode: ErrorCode;

    if (error instanceof ApiError) {
      errorCode = this.mapStatusToErrorCode(error.statusCode);
      userMessage = this.errorMessages[errorCode] || error.message;
    } else if (error instanceof Error) {
      errorCode = ErrorCode.UNKNOWN_ERROR;
      userMessage = error.message || this.errorMessages[ErrorCode.UNKNOWN_ERROR];
    } else {
      errorCode = ErrorCode.UNKNOWN_ERROR;
      userMessage = this.errorMessages[ErrorCode.UNKNOWN_ERROR];
    }

    const logEntry: ErrorLogEntry = {
      error: error instanceof Error ? error : new Error(String(error)),
      context: fullContext,
      userMessage,
    };

    this.logError(logEntry);
    this.notifyListeners(logEntry);

    const enhancedError = new Error(userMessage) as Error & { 
      code: ErrorCode; 
      originalError: unknown;
      context: ErrorContext;
    };
    enhancedError.code = errorCode;
    enhancedError.originalError = error;
    enhancedError.context = fullContext;

    throw enhancedError;
  }

  handleAsync<T>(promise: Promise<T>, context?: Partial<ErrorContext>): Promise<T> {
    return promise.catch(error => {
      this.handle(error, context);
    });
  }

  private logError(entry: ErrorLogEntry): void {
    this.errorLog.push(entry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    
    console.error('[API Error]', {
      message: entry.error.message,
      code: (entry.error as Error & { code?: ErrorCode }).code,
      endpoint: entry.context.endpoint,
      method: entry.context.method,
      statusCode: entry.context.statusCode,
      timestamp: new Date(entry.context.timestamp).toISOString(),
    });
  }

  onError(listener: (entry: ErrorLogEntry) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(entry: ErrorLogEntry): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(entry);
      } catch (e) {
        console.error('[Error Listener Error]', e);
      }
    });
  }

  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    if (error instanceof Error) {
      return error.message.includes('network') || error.message.includes('Network');
    }
    return false;
  }

  isTimeoutError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.name === 'AbortError' || error.message.includes('timeout');
    }
    return false;
  }

  getUserMessage(error: unknown): string {
    if (error instanceof ApiError) {
      const code = this.mapStatusToErrorCode(error.statusCode);
      return this.errorMessages[code];
    }
    if (error instanceof Error) {
      return error.message;
    }
    return this.errorMessages[ErrorCode.UNKNOWN_ERROR];
  }
}

export const apiErrorHandler = new ApiErrorHandler();
