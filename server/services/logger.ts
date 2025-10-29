/**
 * Structured Logging Service
 * Apple/Microsoft-Grade Quality
 *
 * Provides structured logging with different levels, contexts,
 * and production-ready formatting for debugging and monitoring.
 */

// =====================================================
// LOG LEVELS
// =====================================================

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

const LOG_LEVEL_PRIORITY = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4,
};

// =====================================================
// LOG ENTRY TYPES
// =====================================================

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: ErrorInfo;
  meta?: Record<string, any>;
}

interface LogContext {
  service?: string;
  userId?: string;
  personaId?: string;
  conversationId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
}

interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  code?: string;
}

// =====================================================
// LOGGER CLASS
// =====================================================

class Logger {
  private minLevel: LogLevel;
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
    this.minLevel = this.getMinLevel();
  }

  /**
   * Get minimum log level from environment
   */
  private getMinLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel;
    return envLevel && envLevel in LogLevel ? envLevel : LogLevel.INFO;
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'production') {
      // JSON format for production (easily parseable by log aggregators)
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();
      const level = entry.level.padEnd(5);
      const context = entry.context ? ` [${Object.entries(entry.context).map(([k, v]) => `${k}=${v}`).join(', ')}]` : '';
      const meta = entry.meta ? `\n  Meta: ${JSON.stringify(entry.meta, null, 2)}` : '';
      const error = entry.error ? `\n  Error: ${entry.error.name}: ${entry.error.message}${entry.error.stack ? '\n' + entry.error.stack : ''}` : '';

      return `[${timestamp}] ${level} ${entry.message}${context}${meta}${error}`;
    }
  }

  /**
   * Write log entry
   */
  private log(level: LogLevel, message: string, meta?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      meta,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: (error as any).code,
      };
    }

    const formatted = this.formatLog(entry);

    // Output to appropriate stream
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      console.error(formatted);
    } else if (level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, meta?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, meta, error);
  }

  /**
   * Log fatal error message
   */
  fatal(message: string, error?: Error, meta?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, meta, error);
  }

  // =====================================================
  // CONVENIENCE METHODS
  // =====================================================

  /**
   * Log API request
   */
  logRequest(method: string, endpoint: string, userId?: string): void {
    this.info('API Request', {
      method,
      endpoint,
      userId,
    });
  }

  /**
   * Log API response
   */
  logResponse(method: string, endpoint: string, statusCode: number, durationMs: number): void {
    this.info('API Response', {
      method,
      endpoint,
      statusCode,
      durationMs,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, durationMs: number): void {
    this.debug('Database Query', {
      query: query.slice(0, 200), // Truncate long queries
      durationMs,
    });
  }

  /**
   * Log external API call
   */
  logExternalCall(service: string, endpoint: string, durationMs: number): void {
    this.info('External API Call', {
      service,
      endpoint,
      durationMs,
    });
  }

  /**
   * Log business event
   */
  logEvent(event: string, details?: Record<string, any>): void {
    this.info(`Event: ${event}`, details);
  }

  /**
   * Log security event
   */
  logSecurity(event: string, userId?: string, details?: Record<string, any>): void {
    this.warn(`Security: ${event}`, {
      userId,
      ...details,
    });
  }

  /**
   * Log performance metric
   */
  logPerformance(operation: string, durationMs: number, meta?: Record<string, any>): void {
    const level = durationMs > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `Performance: ${operation}`, {
      durationMs,
      ...meta,
    });
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const logger = new Logger({
  service: 'preserving-connections',
});

// =====================================================
// REQUEST LOGGER MIDDLEWARE
// =====================================================

import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log request
  const requestLogger = logger.child({
    requestId: (req as any).id || Math.random().toString(36).substring(7),
    endpoint: req.path,
    method: req.method,
    userId: (req as any).user?.id,
  });

  requestLogger.logRequest(req.method, req.path, (req as any).user?.id);

  // Log response when finished
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    requestLogger.logResponse(req.method, req.path, res.statusCode, durationMs);
  });

  next();
}

// =====================================================
// EXPORTS
// =====================================================

export default logger;
export { Logger, LogLevel, type LogContext };
