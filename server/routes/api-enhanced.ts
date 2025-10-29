/**
 * Enhanced API Routes
 * Apple/Microsoft-Grade Quality
 *
 * New and improved API endpoints with:
 * - Standardized response formats
 * - Comprehensive error handling
 * - Pagination support
 * - Input validation
 * - Structured logging
 * - Enhancement progress tracking
 */

import type { Express, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { verifyJWT } from '../middleware/auth';
import { storage } from '../storage';
import {
  asyncHandler,
  sendSuccess,
  sendError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  validateOwnership,
  parsePaginationQuery,
  buildPaginatedResponse,
  getPaginationOffset,
} from '../utils/api-helpers';
import logger from '../services/logger';
import type {
  PersonaWithProgress,
  EnhancementProgress,
  SectionProgress,
  ConversationWithMessages,
  MessageWithContext,
} from '../../types/api';

// =====================================================
// ENHANCEMENT PROGRESS ENDPOINTS
// =====================================================

/**
 * GET /api/personas/:id/enhancement-progress
 * Get complete enhancement progress for a persona
 */
export function getEnhancementProgress(app: Express): void {
  app.get(
    '/api/personas/:id/enhancement-progress',
    verifyJWT,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const personaId = req.params.id;
      const userId = req.user!.id;

      logger.info('Fetching enhancement progress', { personaId, userId });

      // Verify persona exists and belongs to user
      const persona = await storage.getPersona(personaId);
      validateOwnership(persona, userId, 'Persona');

      // Calculate enhancement progress
      const progress = await calculateEnhancementProgress(personaId, userId);

      sendSuccess(res, progress);
    })
  );
}

/**
 * PUT /api/personas/:id/enhancement-progress
 * Update enhancement progress for a specific section
 */
export function updateEnhancementProgress(app: Express): void {
  app.put(
    '/api/personas/:id/enhancement-progress',
    verifyJWT,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const personaId = req.params.id;
      const userId = req.user!.id;
      const { section, data } = req.body;

      // Validate section
      const validSections = ['setup', 'memories', 'legacy', 'survey'];
      if (!section || !validSections.includes(section)) {
        throw new ValidationError(
          'Invalid section',
          { validSections },
          'section'
        );
      }

      logger.info('Updating enhancement progress', { personaId, userId, section });

      // Verify persona exists and belongs to user
      const persona = await storage.getPersona(personaId);
      validateOwnership(persona, userId, 'Persona');

      // Update section progress
      await updateSectionProgress(personaId, userId, section, data);

      // Return updated progress
      const progress = await calculateEnhancementProgress(personaId, userId);

      sendSuccess(res, progress);
    })
  );
}

// =====================================================
// PAGINATED CONVERSATION MESSAGES
// =====================================================

/**
 * GET /api/conversations/:id/messages (with pagination)
 * Get messages for a conversation with pagination support
 */
export function getPaginatedMessages(app: Express): void {
  app.get(
    '/api/conversations/:id/messages/paginated',
    verifyJWT,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const conversationId = req.params.id;
      const userId = req.user!.id;

      // Parse pagination params
      const { page, pageSize, sortBy, sortOrder } = parsePaginationQuery(req.query);

      logger.info('Fetching paginated messages', {
        conversationId,
        userId,
        page,
        pageSize,
      });

      // Verify conversation belongs to user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        throw new NotFoundError('Conversation');
      }

      // Get total count
      const totalMessages = await storage.getMessageCount(conversationId, userId);

      // Get paginated messages
      const offset = getPaginationOffset(page, pageSize);
      const messages = await storage.getMessagesByConversationPaginated(
        conversationId,
        userId,
        pageSize,
        offset,
        sortBy,
        sortOrder
      );

      // Build paginated response
      const paginatedData = buildPaginatedResponse(
        messages,
        page,
        pageSize,
        totalMessages
      );

      sendSuccess(res, paginatedData);
    })
  );
}

// =====================================================
// ENHANCED PERSONA WITH PROGRESS
// =====================================================

/**
 * GET /api/personas/:id/with-progress
 * Get persona with complete enhancement progress and statistics
 */
export function getPersonaWithProgress(app: Express): void {
  app.get(
    '/api/personas/:id/with-progress',
    verifyJWT,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const personaId = req.params.id;
      const userId = req.user!.id;

      logger.info('Fetching persona with progress', { personaId, userId });

      // Get persona
      const persona = await storage.getPersona(personaId);
      validateOwnership(persona, userId, 'Persona');

      // Get enhancement progress
      const enhancementProgress = await calculateEnhancementProgress(personaId, userId);

      // Get statistics
      const [memoryCount, conversationCount, totalMessages] = await Promise.all([
        storage.getMemoryCount(personaId, userId),
        storage.getConversationCount(personaId, userId),
        storage.getTotalMessageCount(personaId, userId),
      ]);

      const personaWithProgress: PersonaWithProgress = {
        ...persona,
        enhancementProgress,
        memoryCount,
        conversationCount,
        totalMessages,
      };

      sendSuccess(res, personaWithProgress);
    })
  );
}

/**
 * GET /api/personas (enhanced with progress)
 * List all personas with enhancement progress
 */
export function listPersonasWithProgress(app: Express): void {
  app.get(
    '/api/personas/with-progress',
    verifyJWT,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;

      logger.info('Listing personas with progress', { userId });

      // Get all personas
      const personas = await storage.getPersonasByUser(userId);

      // Get progress for each persona
      const personasWithProgress = await Promise.all(
        personas.map(async (persona) => {
          const enhancementProgress = await calculateEnhancementProgress(
            persona.id,
            userId
          );

          const [memoryCount, conversationCount, totalMessages] = await Promise.all([
            storage.getMemoryCount(persona.id, userId),
            storage.getConversationCount(persona.id, userId),
            storage.getTotalMessageCount(persona.id, userId),
          ]);

          return {
            ...persona,
            enhancementProgress,
            memoryCount,
            conversationCount,
            totalMessages,
          } as PersonaWithProgress;
        })
      );

      sendSuccess(res, personasWithProgress);
    })
  );
}

// =====================================================
// FULL CONVERSATION WITH MESSAGES
// =====================================================

/**
 * GET /api/conversations/:id/full
 * Get complete conversation with messages and persona details
 */
export function getFullConversation(app: Express): void {
  app.get(
    '/api/conversations/:id/full',
    verifyJWT,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const conversationId = req.params.id;
      const userId = req.user!.id;

      // Parse pagination for messages
      const { page, pageSize, sortBy, sortOrder } = parsePaginationQuery(req.query);

      logger.info('Fetching full conversation', { conversationId, userId });

      // Get conversation
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        throw new NotFoundError('Conversation');
      }

      // Get persona
      const persona = await storage.getPersona(conversation.personaId);
      if (!persona) {
        throw new NotFoundError('Persona');
      }

      // Get paginated messages
      const totalMessages = await storage.getMessageCount(conversationId, userId);
      const offset = getPaginationOffset(page, pageSize);
      const messages = await storage.getMessagesByConversationPaginated(
        conversationId,
        userId,
        pageSize,
        offset,
        sortBy,
        sortOrder
      );

      // Build response
      const fullConversation: ConversationWithMessages = {
        ...conversation,
        messages: messages as MessageWithContext[],
        messagesPagination: buildPaginatedResponse(
          messages,
          page,
          pageSize,
          totalMessages
        ).pagination,
        persona: {
          id: persona.id,
          name: persona.name,
          relationship: persona.relationship,
          onboardingData: persona.onboardingData,
        },
      };

      sendSuccess(res, fullConversation);
    })
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate enhancement progress for a persona
 */
async function calculateEnhancementProgress(
  personaId: string,
  userId: string
): Promise<EnhancementProgress> {
  const [
    setupProgress,
    memoriesProgress,
    legacyProgress,
    surveyProgress,
  ] = await Promise.all([
    calculateSetupProgress(personaId, userId),
    calculateMemoriesProgress(personaId, userId),
    calculateLegacyProgress(personaId, userId),
    calculateSurveyProgress(personaId, userId),
  ]);

  // Calculate overall completion
  const totalCompletion =
    (setupProgress.completionPercentage +
      memoriesProgress.completionPercentage +
      legacyProgress.completionPercentage +
      surveyProgress.completionPercentage) /
    4;

  return {
    setup: setupProgress,
    memories: memoriesProgress,
    legacy: legacyProgress,
    survey: surveyProgress,
    overallCompletion: Math.round(totalCompletion),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate setup section progress
 */
async function calculateSetupProgress(
  personaId: string,
  userId: string
): Promise<SectionProgress> {
  const persona = await storage.getPersona(personaId);
  if (!persona) {
    return {
      completed: false,
      completionPercentage: 0,
      lastUpdated: null,
    };
  }

  // Check if basic info is complete
  const hasName = !!persona.name;
  const hasRelationship = !!persona.relationship;
  const hasOnboardingData = Object.keys(persona.onboardingData || {}).length > 0;

  const completed = hasName && hasRelationship && hasOnboardingData;
  const completionPercentage = completed ? 100 : 50;

  return {
    completed,
    completionPercentage,
    lastUpdated: persona.updatedAt,
    data: {
      hasName,
      hasRelationship,
      hasOnboardingData,
    },
  };
}

/**
 * Calculate memories section progress
 */
async function calculateMemoriesProgress(
  personaId: string,
  userId: string
): Promise<SectionProgress> {
  const memoryCount = await storage.getMemoryCount(personaId, userId);

  // Consider complete if has at least 5 memories
  const completed = memoryCount >= 5;
  const completionPercentage = Math.min(100, (memoryCount / 5) * 100);

  return {
    completed,
    completionPercentage: Math.round(completionPercentage),
    lastUpdated: memoryCount > 0 ? new Date().toISOString() : null,
    data: {
      memoryCount,
    },
  };
}

/**
 * Calculate legacy section progress
 */
async function calculateLegacyProgress(
  personaId: string,
  userId: string
): Promise<SectionProgress> {
  // Check if persona has obituary data
  const persona = await storage.getPersona(personaId);
  const hasObituary = persona?.onboardingData?.obituaryUrl || persona?.onboardingData?.obituaryData;

  // Check for legacy-specific memories
  const legacyMemories = await storage.getMemoriesBySource(personaId, userId, 'obituary');

  const completed = !!hasObituary && legacyMemories.length > 0;
  const completionPercentage = hasObituary ? (legacyMemories.length > 0 ? 100 : 50) : 0;

  return {
    completed,
    completionPercentage,
    lastUpdated: hasObituary ? persona?.updatedAt || null : null,
    data: {
      hasObituary: !!hasObituary,
      legacyMemoryCount: legacyMemories.length,
    },
  };
}

/**
 * Calculate survey/questionnaire section progress
 */
async function calculateSurveyProgress(
  personaId: string,
  userId: string
): Promise<SectionProgress> {
  const progress = await storage.getQuestionnaireProgress(personaId, userId);

  if (!progress) {
    return {
      completed: false,
      completionPercentage: 0,
      lastUpdated: null,
    };
  }

  const completed = progress.isCompleted;
  const completionPercentage = completed ? 100 : (progress.currentStep / 10) * 100;

  return {
    completed,
    completionPercentage: Math.round(completionPercentage),
    lastUpdated: progress.updatedAt,
    data: {
      currentStep: progress.currentStep,
      isCompleted: progress.isCompleted,
    },
  };
}

/**
 * Update section progress (placeholder - customize based on section)
 */
async function updateSectionProgress(
  personaId: string,
  userId: string,
  section: string,
  data: any
): Promise<void> {
  logger.info('Updating section progress', { personaId, section, data });

  // Update based on section
  switch (section) {
    case 'setup':
      // Update persona basic info
      await storage.updatePersona(personaId, userId, data);
      break;

    case 'memories':
      // Memories are added separately via POST /api/memories
      logger.warn('Memories should be added via POST /api/memories endpoint');
      break;

    case 'legacy':
      // Update persona with obituary data
      await storage.updatePersona(personaId, userId, {
        onboardingData: {
          ...(await storage.getPersona(personaId))?.onboardingData,
          ...data,
        },
      });
      break;

    case 'survey':
      // Update questionnaire progress
      await storage.saveQuestionnaireProgress(personaId, userId, data);
      break;

    default:
      throw new ValidationError(`Unknown section: ${section}`);
  }
}

// =====================================================
// REGISTER ALL ROUTES
// =====================================================

export function registerEnhancedRoutes(app: Express): void {
  // Enhancement progress
  getEnhancementProgress(app);
  updateEnhancementProgress(app);

  // Personas with progress
  getPersonaWithProgress(app);
  listPersonasWithProgress(app);

  // Paginated messages
  getPaginatedMessages(app);
  getFullConversation(app);

  logger.info('Enhanced API routes registered');
}

export default registerEnhancedRoutes;
