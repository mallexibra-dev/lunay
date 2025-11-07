import winston from 'winston';
import { env } from '@/env';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (stack) {
      log += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: {
    service: 'nextjs-starterkit',
    environment: env.NODE_ENV,
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Exit on error in production
  exitOnError: env.NODE_ENV === 'production',
});

// Add console transport for development
if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// API request logger helper
export function logApiRequest(req: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
}, startTime?: number) {
  const duration = startTime ? Date.now() - startTime : undefined;

  logger.info('API Request', {
    type: 'api_request',
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'],
    duration,
  });
}

// API response logger helper
export function logApiResponse(req: {
  method: string;
  url: string;
}, res: {
  statusCode: number;
}, startTime: number) {
  const duration = Date.now() - startTime;
  const level = res.statusCode >= 400 ? 'error' : 'info';

  logger.log(level, 'API Response', {
    type: 'api_response',
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration,
  });
}

// API error logger helper
export function logApiError(req: {
  method: string;
  url: string;
}, error: Error | string, statusCode?: number) {
  logger.error('API Error', {
    type: 'api_error',
    method: req.method,
    url: req.url,
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    statusCode,
  });
}

// Database operation logger helper
export function logDatabaseOperation(operation: string, table: string, duration?: number, error?: Error) {
  const level = error ? 'error' : 'info';

  logger.log(level, 'Database Operation', {
    type: 'database_operation',
    operation,
    table,
    duration,
    error: error?.message,
    stack: error?.stack,
  });
}

// Authentication logger helper
export function logAuthEvent(event: string, userId?: string | number, email?: string, ip?: string, error?: Error) {
  const level = error ? 'error' : 'info';

  logger.log(level, 'Authentication Event', {
    type: 'auth_event',
    event,
    userId,
    email,
    ip,
    error: error?.message,
    stack: error?.stack,
  });
}

// Security event logger helper
export function logSecurityEvent(event: string, details: Record<string, any>, ip?: string) {
  logger.warn('Security Event', {
    type: 'security_event',
    event,
    ip,
    ...details,
  });
}

// Performance logger helper
export function logPerformance(operation: string, duration: number, details?: Record<string, any>) {
  const level = duration > 1000 ? 'warn' : 'info'; // Warn if operation takes more than 1 second

  logger.log(level, 'Performance', {
    type: 'performance',
    operation,
    duration,
    ...details,
  });
}

// Event logger helper - for user actions and application events
export function logEvent(event: string, details: Record<string, unknown>) {
  logger.info('Application Event', {
    type: 'application_event',
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;