/**
 * API Helper Utilities
 * Apple/Microsoft-Grade Quality
 *
 * Standardized response builders, error handlers, and validation utilities
 * for consistent API behavior across all endpoints.
 */

import type { Response } from 'express';
import { ZodError } from 'zod';
import type {
  ApiSuccess,
  ApiError,
  ApiErrorCode,
  PaginationMeta,
  PaginatedData,
  PaginationQuery,
} from '../../types/api';

// =====================================================
// RESPONSE BUILDERS
// =====================================================

/**
 * Build a standardized success response
 */
export function successResponse<T>(data: T, meta?: any): ApiSuccess<T> {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build a standardized error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any,
  field?: string
): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      field,
      stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send success response with proper status code
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: any
): void {
  res.status(statusCode).json(successResponse(data, meta));
}

/**
 * Send error response with proper status code
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any,
  field?: string
): void {
  res.status(statusCode).json(errorResponse(code, message, details, field));
}

// =====================================================
// ERROR CLASSES
// =====================================================

/**
 * Base API error class
 */
export class ApiErrorClass extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any,
    public field?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
export class ValidationError extends ApiErrorClass {
  constructor(message: string, details?: any, field?: string) {
    super('VALIDATION_ERROR', message, 400, details, field);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends ApiErrorClass {
  constructor(resource: string, details?: any) {
    super(
      `${resource.toUpperCase()}_NOT_FOUND`,
      `${resource} not found`,
      404,
      details
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends ApiErrorClass {
  constructor(message: string = 'Unauthorized', details?: any) {
    super('UNAUTHORIZED', message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends ApiErrorClass {
  constructor(message: string = 'Forbidden', details?: any) {
    super('FORBIDDEN', message, 403, details);
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict error
 */
export class ConflictError extends ApiErrorClass {
  constructor(message: string, details?: any) {
    super('ALREADY_EXISTS', message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends ApiErrorClass {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super('RATE_LIMIT_EXCEEDED', message, 429, details);
    this.name = 'RateLimitError';
  }
}

// =====================================================
// ERROR HANDLER MIDDLEWARE
// =====================================================

/**
 * Global error handler middleware
 * Converts errors to standardized API responses
 */
export function errorHandler(error: any, res: Response): void {
  // Log error
  console.error('[API Error]', {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Validation failed',
      error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
    );
  }

  // Handle API errors
  if (error instanceof ApiErrorClass) {
    return sendError(
      res,
      error.statusCode,
      error.code,
      error.message,
      error.details,
      error.field
    );
  }

  // Handle database errors
  if (error.code === '23505') {
    // PostgreSQL unique violation
    return sendError(res, 409, 'DUPLICATE_ENTRY', 'Resource already exists', {
      constraint: error.constraint,
    });
  }

  if (error.code === '23503') {
    // PostgreSQL foreign key violation
    return sendError(res, 400, 'INVALID_INPUT', 'Referenced resource does not exist', {
      constraint: error.constraint,
    });
  }

  // Handle generic errors
  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
}

// =====================================================
// PAGINATION HELPERS
// =====================================================

/**
 * Parse pagination query parameters with validation
 */
export function parsePaginationQuery(query: any): Required<PaginationQuery> {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '20', 10)));
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = (query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  return { page, pageSize, sortBy, sortOrder };
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Calculate pagination offset
 */
export function getPaginationOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Build paginated response
 */
export function buildPaginatedResponse<T>(
  items: T[],
  page: number,
  pageSize: number,
  totalItems: number
): PaginatedData<T> {
  return {
    items,
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate required fields
 */
export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new ValidationError(
      'Missing required fields',
      { missingFields: missing },
      missing[0]
    );
  }
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `Invalid value for ${fieldName}`,
      { value, allowedValues },
      fieldName
    );
  }
  return value as T;
}

// =====================================================
// OWNERSHIP VALIDATION
// =====================================================

/**
 * Validate resource ownership
 */
export function validateOwnership(
  resource: any,
  userId: string,
  resourceName: string
): void {
  if (!resource) {
    throw new NotFoundError(resourceName);
  }

  if (resource.userId !== userId) {
    throw new ForbiddenError(`You don't have access to this ${resourceName}`);
  }
}

// =====================================================
// ASYNC HANDLER WRAPPER
// =====================================================

/**
 * Wrap async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: any, res: Response, next?: any) => Promise<any>
) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      errorHandler(error, res);
    });
  };
}

// =====================================================
// SANITIZATION HELPERS
// =====================================================

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 5000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Sanitize array input
 */
export function sanitizeArray<T>(input: any[], maxLength: number = 100): T[] {
  if (!Array.isArray(input)) {
    throw new ValidationError('Expected an array');
  }

  if (input.length > maxLength) {
    throw new ValidationError(`Array too large (max ${maxLength} items)`);
  }

  return input;
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Response builders
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,

  // Error classes
  ApiErrorClass,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,

  // Error handler
  errorHandler,

  // Pagination
  parsePaginationQuery,
  buildPaginationMeta,
  getPaginationOffset,
  buildPaginatedResponse,

  // Validation
  isValidUUID,
  validateRequired,
  validateEnum,
  validateOwnership,

  // Utilities
  asyncHandler,
  sanitizeString,
  sanitizeArray,
};
