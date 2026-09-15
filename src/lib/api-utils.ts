import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Helper function to create consistent responses
export function createResponse<T = any>(
  success: boolean,
  message: string,
  data?: T,
  options: {
    status?: number;
    errors?: Record<string, string[]>;
    requestId?: string;
  } = {}
): NextResponse {
  const meta = {
    timestamp: new Date().toISOString(),
    requestId: options.requestId || Math.random().toString(36).substring(2, 15),
  };

  const response: ApiResponse<T> | ApiError = {
    success,
    message,
    ...(data !== undefined && { data }),
    meta,
    ...(options.errors && { errors: options.errors }),
  };

  return NextResponse.json(response, {
    status: options.status || (success ? 200 : 500),
  });
}

// Success response helper
export function success<T = any>(
  data: T,
  message: string = 'Operation successful',
  options: { status?: number; requestId?: string } = {}
) {
  return createResponse(true, message, data, options);
}

// Error response helper
export function error(
  message: string,
  options: {
    status?: number;
    errors?: Record<string, string[]>;
    requestId?: string;
  } = {}
) {
  return createResponse(false, message, undefined, options);
}

// Common error helpers
export const apiError = {
  validation: (message: string, errors?: Record<string, string[]>) =>
    error(message, { status: 400, errors }),
  notFound: (message: string = 'Resource not found') =>
    error(message, { status: 404 }),
  unauthorized: (message: string = 'Unauthorized access') =>
    error(message, { status: 401 }),
  forbidden: (message: string = 'Access forbidden') =>
    error(message, { status: 403 }),
  serverError: (message: string = 'Internal server error') =>
    error(message, { status: 500 }),
};

// API wrapper for consistent error handling and logging
export function withApiHandler(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const url = req.nextUrl.pathname;
    const method = req.method;

    try {
      // Log request
      logger.info('API Request', {
        method,
        url,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for'),
      });

      // Execute handler
      const response = await handler(req, context);

      // Log response
      const duration = Date.now() - startTime;
      logger.info('API Response', {
        method,
        url,
        status: response.status,
        duration,
      });

      return response;
    } catch (err) {
      // Log error
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const statusCode = getErrorStatusCode(err);

      logger.error('API Error', {
        method,
        url,
        error: errorMessage,
        status: statusCode,
        duration,
      });

      return error(
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : errorMessage,
        { status: statusCode }
      );
    }
  };
}

// Helper to get status code from error
function getErrorStatusCode(error: unknown): number {
  if (error instanceof Error) {
    if (
      error.message.includes('Unauthorized') ||
      error.message.includes('Authentication')
    ) {
      return 401;
    }
    if (
      error.message.includes('Forbidden') ||
      error.message.includes('Permission')
    ) {
      return 403;
    }
    if (error.message.includes('Not found')) {
      return 404;
    }
    if (error.message.includes('Validation')) {
      return 400;
    }
  }
  return 500;
}

// HTTP method helpers
export const api = {
  get: (handler: (req: NextRequest, context?: any) => Promise<NextResponse>) =>
    withApiHandler(async (req, context) => {
      if (req.method !== 'GET') {
        return apiError.validation('Method not allowed');
      }
      return handler(req, context);
    }),

  post: (handler: (req: NextRequest, context?: any) => Promise<NextResponse>) =>
    withApiHandler(async (req, context) => {
      if (req.method !== 'POST') {
        return apiError.validation('Method not allowed');
      }
      return handler(req, context);
    }),

  put: (handler: (req: NextRequest, context?: any) => Promise<NextResponse>) =>
    withApiHandler(async (req, context) => {
      if (req.method !== 'PUT') {
        return apiError.validation('Method not allowed');
      }
      return handler(req, context);
    }),

  delete: (
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
  ) =>
    withApiHandler(async (req, context) => {
      if (req.method !== 'DELETE') {
        return apiError.validation('Method not allowed');
      }
      return handler(req, context);
    }),
};

// Helper to parse request body safely
export async function parseRequestBody(req: NextRequest): Promise<any> {
  try {
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await req.json();
    }
    return null;
  } catch {
    return null;
  }
}
