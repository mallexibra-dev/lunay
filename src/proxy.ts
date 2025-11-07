import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { logger, logSecurityEvent, logPerformance, logApiRequest } from '@/lib/logger';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: 'user' | 'admin';
}

interface AuthSession {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

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
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
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
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = await checkRateLimit(ip, pathname);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_exceeded', {
        ip,
        pathname,
        count: rateLimitResult.count,
      }, ip);

      // Log API request (will be logged at request level in API wrapper)
      logApiRequest(
        {
          method: request.method,
          url: pathname,
          headers: Object.fromEntries(request.headers.entries()),
          body: request.method !== 'GET' ? await safeParseBody(request.clone()) : undefined,
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
    response.headers.set('X-RateLimit-Remaining', String(100 - rateLimitResult.count));
    response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));
  }

  // Authentication proxy
  const authResult = await handleAuthentication(request, pathname);
  if (authResult.redirect) {
    return authResult.redirect;
  }

  // Set auth headers for downstream use
  if (authResult.session) {
    response.headers.set('X-User-ID', String(authResult.session.user.id));
    response.headers.set('X-User-Role', authResult.session.user.role || 'user');
  }

  // Log API requests that pass through proxy
  if (pathname.startsWith('/api/')) {
    logApiRequest(
      {
        method: request.method,
        url: pathname,
        headers: Object.fromEntries(request.headers.entries()),
        body: request.method !== 'GET' ? await safeParseBody(request.clone()) : undefined,
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
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

// Authentication handler
async function handleAuthentication(
  request: NextRequest,
  pathname: string
): Promise<{ session?: AuthSession | null; redirect?: NextResponse }> {
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/api/auth',
    '/api/health',
    '/_next',
    '/favicon.ico',
  ];

  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path)
  );

  if (isPublicPath) {
    return {};
  }

  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      // Redirect to sign-in for protected routes
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('redirect', pathname);
        return {
          redirect: NextResponse.redirect(signInUrl),
        };
      }

      // For API routes, return unauthorized
      if (pathname.startsWith('/api/')) {
        return {
          redirect: NextResponse.json(
            {
              success: false,
              message: 'Authentication required',
            },
            { status: 401 }
          ),
        };
      }
    }

    // Role-based access control
    const userRole = (session?.user as any)?.role;
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      logSecurityEvent('unauthorized_admin_access', {
        pathname,
        userId: session?.user?.id,
        userRole,
      });

      return {
        redirect: NextResponse.redirect(new URL('/unauthorized', request.url)),
      };
    }

    return { session };
  } catch (error) {
    logger.error('Authentication error in proxy', {
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Redirect to sign-in on auth errors
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
      return {
        redirect: NextResponse.redirect(new URL('/auth/signin', request.url)),
      };
    }

    return {};
  }
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