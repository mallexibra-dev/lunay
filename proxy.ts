import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger, logPerformance, logApiRequest } from '@/lib/logger';

// Helper function to safely parse request body
async function safeParseBody(req: Request): Promise<unknown> {
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

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function proxy(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // Get client IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Log request for debugging
  logger.info('Proxy request', {
    method: request.method,
    pathname,
    ip,
    userAgent: request.headers.get('user-agent'),
  });

  // Security headers
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = await checkRateLimit(ip, pathname);
    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', {
        ip,
        pathname,
        count: rateLimitResult.count,
      });

      // Log API request
      logApiRequest(
        {
          method: request.method,
          url: pathname,
          headers: Object.fromEntries(request.headers.entries()),
          body:
            request.method !== 'GET'
              ? await safeParseBody(request.clone())
              : undefined,
        },
        startTime
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests',
          error: 'Rate limit exceeded',
        },
        { status: 429 }
      );
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set(
      'X-RateLimit-Remaining',
      String(100 - rateLimitResult.count)
    );
    response.headers.set(
      'X-RateLimit-Reset',
      String(rateLimitResult.resetTime)
    );
  }

  // Log API requests that pass through proxy
  if (pathname.startsWith('/api/')) {
    logApiRequest(
      {
        method: request.method,
        url: pathname,
        headers: Object.fromEntries(request.headers.entries()),
        body:
          request.method !== 'GET'
            ? await safeParseBody(request.clone())
            : undefined,
      },
      startTime
    );
  }

  // CORS handling for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://yourdomain.com', // Add your production domain
    ];

    if (allowedOrigins.includes(origin || '')) {
      response.headers.set('Access-Control-Allow-Origin', origin || '');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  // Log performance
  const duration = Date.now() - startTime;
  logPerformance('proxy_request', duration, {
    pathname,
    method: request.method,
  });

  return response;
}

// Rate limiting function
async function checkRateLimit(
  ip: string,
  pathname: string
): Promise<{ allowed: boolean; count: number; resetTime: number }> {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Limit per window

  const key = `${ip}:${pathname}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    const newRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return { allowed: true, count: 1, resetTime: newRecord.resetTime };
  }

  // Existing window
  if (record.count >= maxRequests) {
    return { allowed: false, count: record.count, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  return { allowed: true, count: record.count, resetTime: record.resetTime };
}

// Configure proxy matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
