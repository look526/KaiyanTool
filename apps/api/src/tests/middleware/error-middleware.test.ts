import { AppError, errorMiddleware, asyncHandler } from '../../middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';

describe('AppError', () => {
  describe('static factory methods', () => {
    it('should create bad request error', () => {
      const error = AppError.badRequest('Invalid input', 'INVALID_INPUT');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toBe('Invalid input');
    });

    it('should create unauthorized error', () => {
      const error = AppError.unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create forbidden error', () => {
      const error = AppError.forbidden();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create not found error', () => {
      const error = AppError.notFound('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create validation error with details', () => {
      const details = { field: 'email', message: 'Invalid email format' };
      const error = AppError.validation('Validation failed', details);
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
    });

    it('should create internal error', () => {
      const error = AppError.internal();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('isOperational flag', () => {
    it('should be operational by default', () => {
      const error = AppError.badRequest('Test');
      expect(error.isOperational).toBe(true);
    });
  });
});

describe('errorMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      path: '/api/test',
      method: 'POST',
      userId: 'user-1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should handle AppError correctly', () => {
    const error = AppError.notFound('Project not found', 'PROJECT_NOT_FOUND');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Project not found',
      code: 'PROJECT_NOT_FOUND',
    });
  });

  it('should handle validation error with details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const details = { field: 'name' };
    const error = AppError.validation('Invalid input', details);

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
        details,
        stack: expect.any(String),
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: '服务器内部错误',
      code: 'INTERNAL_ERROR',
    });
  });

  it('should handle network errors as service unavailable', () => {
    const error = new Error('ECONNREFUSED');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'AI服务暂时不可用，请稍后再试',
      code: 'SERVICE_UNAVAILABLE',
    });
  });
});

describe('asyncHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should pass error to next on rejection', async () => {
    const error = new Error('Async error');
    const handler = asyncHandler(async () => {
      throw error;
    });

    await handler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should call handler successfully', async () => {
    const handler = asyncHandler(async (req, res) => {
      res.json({ success: true });
    });

    const mockJson = jest.fn();
    mockResponse.json = mockJson;

    await handler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockJson).toHaveBeenCalledWith({ success: true });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
