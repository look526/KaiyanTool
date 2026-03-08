import { ApiResponse, ErrorResponse, ResponseMeta } from '../types/response.types';

export abstract class BaseController {
  protected success<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
    return {
      success: true,
      data,
      meta,
    };
  }

  protected error(code: string, message: string, details?: any): ErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
  }

  protected paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T[]> {
    return this.success(data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  protected async execute<T>(
    handler: () => Promise<T>
  ): Promise<ApiResponse<T> | ErrorResponse> {
    try {
      const data = await handler();
      return this.success(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ErrorResponse {
    if (error.code) {
      return this.error(error.code, error.message, error.details);
    }
    return this.error('INTERNAL_ERROR', '服务器内部错误');
  }
}