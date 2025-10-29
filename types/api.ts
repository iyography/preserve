/**
 * Standardized API Response Types
 * Apple/Microsoft-Grade Quality
 *
 * Provides consistent response formats across all API endpoints
 * for better client-side handling and debugging.
 */

// =====================================================
// STANDARD RESPONSE FORMATS
// =====================================================

/**
 * Standard success response
 */
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  meta?: ApiMeta;
  timestamp: string;
}

/**
 * Standard error response
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string; // For validation errors
    stack?: string; // Only in development
  };
  timestamp: string;
}

/**
 * Response metadata (pagination, filtering, etc.)
 */
export interface ApiMeta {
  pagination?: PaginationMeta;
  filtering?: FilteringMeta;
  sorting?: SortingMeta;
  requestId?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Filtering metadata
 */
export interface FilteringMeta {
  filters: Record<string, any>;
  appliedCount: number;
}

/**
 * Sorting metadata
 */
export interface SortingMeta {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// =====================================================
// PAGINATION TYPES
// =====================================================

/**
 * Standard pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response data
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

// =====================================================
// ERROR CODES
// =====================================================

export enum ApiErrorCode {
  // Authentication & Authorization (401, 403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Not Found (404)
  NOT_FOUND = 'NOT_FOUND',
  PERSONA_NOT_FOUND = 'PERSONA_NOT_FOUND',
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  MEMORY_NOT_FOUND = 'MEMORY_NOT_FOUND',

  // Conflict (409)
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // Server Errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Business Logic Errors
  INVALID_STATE = 'INVALID_STATE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
}

// =====================================================
// PERSONA API TYPES
// =====================================================

/**
 * Persona with enhancement progress
 */
export interface PersonaWithProgress {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  onboardingApproach: string;
  onboardingData: Record<string, any>;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;

  // Enhancement Progress
  enhancementProgress: EnhancementProgress;

  // Statistics
  memoryCount: number;
  conversationCount: number;
  totalMessages: number;
}

/**
 * Enhancement progress for all sections
 */
export interface EnhancementProgress {
  setup: SectionProgress;
  memories: SectionProgress;
  legacy: SectionProgress;
  survey: SectionProgress;

  // Overall completion
  overallCompletion: number; // 0-100
  lastUpdated: string;
}

/**
 * Progress for a single enhancement section
 */
export interface SectionProgress {
  completed: boolean;
  completionPercentage: number; // 0-100
  lastUpdated: string | null;
  data?: Record<string, any>; // Section-specific data
}

// =====================================================
// MEMORY API TYPES
// =====================================================

/**
 * Memory with source tracking
 */
export interface MemoryWithSource {
  id: string;
  personaId: string;
  type: 'episodic' | 'semantic' | 'preference' | 'boundary' | 'relationship' | 'legacy_import' | 'questionnaire';
  content: string;
  source: MemorySource;
  salience: number;
  lastUsedAt: string | null;
  usageCount: number;
  tags: string[];
  embedding: Record<string, any> | null;
  messageId: string | null;
  conversationId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Memory source tracking
 */
export interface MemorySource {
  type: 'onboarding' | 'message' | 'feedback' | 'questionnaire' | 'obituary' | 'user_input';
  details?: MemorySourceDetails;
}

/**
 * Detailed memory source information
 */
export interface MemorySourceDetails {
  // For message-based memories
  conversationId?: string;
  messageId?: string;

  // For questionnaire memories
  questionId?: string;
  questionText?: string;

  // For obituary memories
  obituaryUrl?: string;
  obituarySection?: string;

  // For user input memories
  inputMethod?: 'manual' | 'import' | 'api';

  // Common
  extractedAt?: string;
  confidence?: number; // 0-1
}

// =====================================================
// CONVERSATION API TYPES
// =====================================================

/**
 * Conversation with latest message preview
 */
export interface ConversationListItem {
  id: string;
  userId: string;
  personaId: string;
  title: string;
  startedAt: string;
  lastMessageAt: string;
  status: 'active' | 'archived';
  createdAt: string;

  // Preview
  lastMessage: MessagePreview | null;
  messageCount: number;
  unreadCount?: number;

  // Related data
  persona: {
    id: string;
    name: string;
    relationship: string;
  };
}

/**
 * Message preview for conversation lists
 */
export interface MessagePreview {
  id: string;
  role: 'user' | 'persona' | 'system';
  content: string; // Truncated
  createdAt: string;
}

/**
 * Full conversation with messages
 */
export interface ConversationWithMessages {
  id: string;
  userId: string;
  personaId: string;
  title: string;
  startedAt: string;
  lastMessageAt: string;
  status: 'active' | 'archived';
  createdAt: string;

  // Messages (paginated)
  messages: MessageWithContext[];
  messagesPagination?: PaginationMeta;

  // Related data
  persona: {
    id: string;
    name: string;
    relationship: string;
    onboardingData: Record<string, any>;
  };
}

/**
 * Message with context (memories used, feedback, etc.)
 */
export interface MessageWithContext {
  id: string;
  conversationId: string;
  role: 'user' | 'persona' | 'system';
  content: string;
  tokens: number | null;
  meta: MessageMeta;

  // Crisis detection
  flaggedForReview: boolean;
  crisisLevel: 'low' | 'medium' | 'high' | null;
  crisisKeywords: string[] | null;
  interventionDelivered: boolean;

  createdAt: string;
}

/**
 * Message metadata
 */
export interface MessageMeta {
  // Memories retrieved for this message
  memoriesUsed?: string[]; // Memory IDs
  memoriesCount?: number;

  // Feedback received
  feedbackIds?: string[];

  // Model info
  model?: string;
  temperature?: number;

  // Performance
  responseTime?: number;
  cached?: boolean;
}

// =====================================================
// LEGACY PARSING TYPES
// =====================================================

/**
 * Legacy.com obituary parsing result
 */
export interface ObituaryParseResult {
  success: boolean;
  source: {
    url: string;
    scrapedAt: string;
    method: 'scraping' | 'llm_fallback' | 'manual';
  };

  // Extracted data
  extractedData?: ObituaryData;

  // Raw content (for review)
  rawContent?: string;

  // Memories created
  memoriesCreated?: number;
  memoryIds?: string[];

  // Errors/warnings
  errors?: string[];
  warnings?: string[];
}

/**
 * Structured obituary data
 */
export interface ObituaryData {
  // Basic information
  fullName?: string;
  birthDate?: string;
  deathDate?: string;
  age?: number;
  residence?: string;

  // Life story
  biography?: string;
  lifeEvents?: LifeEvent[];

  // Relationships
  family?: FamilyMember[];

  // Interests & characteristics
  interests?: string[];
  occupation?: string;
  education?: string[];
  achievements?: string[];

  // Service information
  serviceInfo?: ServiceInfo;

  // Additional
  charityDonations?: CharityInfo[];
  photoUrls?: string[];
}

export interface LifeEvent {
  year?: number;
  description: string;
  category?: 'education' | 'career' | 'family' | 'achievement' | 'other';
}

export interface FamilyMember {
  name: string;
  relationship: string;
  status?: 'predeceased' | 'surviving';
}

export interface ServiceInfo {
  date?: string;
  time?: string;
  location?: string;
  type?: 'funeral' | 'memorial' | 'celebration_of_life' | 'private';
}

export interface CharityInfo {
  name: string;
  url?: string;
  description?: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;

  services: {
    database: ServiceHealth;
    ai: ServiceHealth;
    storage: ServiceHealth;
  };
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  lastCheck: string;
  error?: string;
}

// =====================================================
// TYPE GUARDS
// =====================================================

export function isApiSuccess<T>(response: ApiSuccess<T> | ApiError): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiSuccess | ApiError): response is ApiError {
  return response.success === false;
}

// =====================================================
// EXPORT TYPES
// =====================================================

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export default {
  ApiErrorCode,
  isApiSuccess,
  isApiError,
};
