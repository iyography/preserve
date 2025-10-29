import { 
  type Persona,
  type InsertPersona,
  type PersonaMedia,
  type InsertPersonaMedia,
  type OnboardingSession,
  type InsertOnboardingSession,
  type QuestionnaireProgress,
  type InsertQuestionnaireProgress,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Memory,
  type InsertMemory,
  type Feedback,
  type InsertFeedback,
  type PatternMetrics,
  type InsertPatternMetrics,
  type UserSettings,
  type InsertUserSettings,
  personas,
  personaMedia,
  onboardingSessions,
  questionnaireProgress,
  conversations,
  messages,
  memories,
  feedback,
  patternMetrics,
  userSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, max, getTableColumns, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Note: User management is handled by Supabase auth
  
  // Persona methods
  getPersona(id: string): Promise<Persona | undefined>;
  getPersonasByUser(userId: string): Promise<Persona[]>;
  createPersona(persona: InsertPersona): Promise<Persona>;
  updatePersona(id: string, userId: string, updates: Partial<Persona>): Promise<Persona | undefined>;
  deletePersona(id: string, userId: string): Promise<boolean>;
  
  // Media methods
  getPersonaMedia(personaId: string): Promise<PersonaMedia[]>;
  createPersonaMedia(media: InsertPersonaMedia): Promise<PersonaMedia>;
  deletePersonaMedia(id: string, userId: string): Promise<boolean>;
  
  // Onboarding session methods
  getOnboardingSession(id: string): Promise<OnboardingSession | undefined>;
  getOnboardingSessionByUser(userId: string, approach: string): Promise<OnboardingSession | undefined>;
  getOnboardingSessionsByUser(userId: string): Promise<OnboardingSession[]>;
  createOnboardingSession(session: InsertOnboardingSession): Promise<OnboardingSession>;
  updateOnboardingSession(id: string, userId: string, updates: Partial<OnboardingSession>): Promise<OnboardingSession | undefined>;

  // Questionnaire progress methods
  getQuestionnaireProgress(personaId: string, userId: string): Promise<QuestionnaireProgress | undefined>;
  saveQuestionnaireProgress(progress: InsertQuestionnaireProgress): Promise<QuestionnaireProgress>;
  deleteQuestionnaireProgress(personaId: string, userId: string): Promise<boolean>;

  // Conversation methods
  getConversation(id: string, userId: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  getConversationsByPersona(personaId: string, userId: string): Promise<Conversation[]>;
  getConversationCount(personaId: string, userId: string): Promise<number>;
  getTotalMessageCount(personaId: string, userId: string): Promise<number>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, userId: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string, userId: string): Promise<boolean>;

  // Message methods
  getMessagesByConversation(conversationId: string, userId: string): Promise<Message[]>;
  getMessagesByConversationPaginated(conversationId: string, userId: string, limit: number, offset: number, sortBy: string, sortOrder: 'asc' | 'desc'): Promise<Message[]>;
  getMessageCount(conversationId: string, userId: string): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, userId: string, updates: Partial<Message>): Promise<Message | undefined>;
  deleteMessage(id: string, userId: string): Promise<boolean>;

  // Memory methods
  getMemoriesByPersona(personaId: string, userId: string, limit?: number): Promise<Memory[]>;
  getMemoryById(id: string, userId: string): Promise<Memory | undefined>;
  searchMemoriesByTag(personaId: string, userId: string, tags: string[]): Promise<Memory[]>;
  getMemoryCount(personaId: string, userId: string): Promise<number>;
  getMemoriesBySource(personaId: string, userId: string, source: string): Promise<Memory[]>;
  createMemory(memory: InsertMemory): Promise<Memory>;
  updateMemory(id: string, userId: string, updates: Partial<Memory>): Promise<Memory | undefined>;
  deleteMemory(id: string, userId: string): Promise<boolean>;

  // Feedback methods
  getFeedbackByPersona(personaId: string, userId: string): Promise<Feedback[]>;
  getFeedbackByConversation(conversationId: string, userId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: string, userId: string, updates: Partial<Feedback>): Promise<Feedback | undefined>;
  deleteFeedback(id: string, userId: string): Promise<boolean>;

  // Pattern metrics methods
  getPatternMetrics(personaId: string, userId: string, metric?: string, window?: string): Promise<PatternMetrics[]>;
  upsertPatternMetric(metric: InsertPatternMetrics, userId: string): Promise<PatternMetrics>;
  deletePatternMetric(id: string, userId: string): Promise<boolean>;

  // User settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Note: User management is handled by Supabase auth
  
  // Persona methods
  async getPersona(id: string): Promise<Persona | undefined> {
    const [persona] = await db.select().from(personas).where(eq(personas.id, id));
    return persona || undefined;
  }

  async getPersonasByUser(userId: string): Promise<Persona[]> {
    // Create proper subquery for memory counts using Drizzle query builder
    const memoryCountsSubquery = db
      .select({
        personaId: memories.personaId,
        memoryCount: count(memories.id).as('memory_count')
      })
      .from(memories)
      .groupBy(memories.personaId)
      .as('memory_counts');
    
    // Create subquery for questionnaire memories (memories with questionnaire tag)
    const questionnaireCountsSubquery = db
      .select({
        personaId: memories.personaId,
        questionnaireCount: count(memories.id).as('questionnaire_count')
      })
      .from(memories)
      .where(sql`'questionnaire' = ANY(COALESCE(${memories.tags}, '{}'))`)
      .groupBy(memories.personaId)
      .as('questionnaire_counts');
    
    // Create subquery for legacy memories (memories with legacy.com tag)
    const legacyCountsSubquery = db
      .select({
        personaId: memories.personaId,
        legacyCount: count(memories.id).as('legacy_count')
      })
      .from(memories)
      .where(sql`'legacy.com' = ANY(COALESCE(${memories.tags}, '{}'))`)
      .groupBy(memories.personaId)
      .as('legacy_counts');
    
    // Enhanced query to include enhancement completion information
    const personasData = await db
      .select({
        persona: personas,
        memoryCount: memoryCountsSubquery.memoryCount,
        questionnaireCount: questionnaireCountsSubquery.questionnaireCount,
        legacyCount: legacyCountsSubquery.legacyCount,
      })
      .from(personas)
      .leftJoin(memoryCountsSubquery, eq(personas.id, memoryCountsSubquery.personaId))
      .leftJoin(questionnaireCountsSubquery, eq(personas.id, questionnaireCountsSubquery.personaId))
      .leftJoin(legacyCountsSubquery, eq(personas.id, legacyCountsSubquery.personaId))
      .where(eq(personas.userId, userId))
      .orderBy(desc(personas.createdAt));

    // Transform the result to include enhancement completion information
    return personasData.map(row => ({
      ...row.persona,
      enhancementCounts: {
        memories: row.memoryCount || 0,
        onboarding: row.persona.onboardingData && Object.keys(row.persona.onboardingData).length > 0 && 
                     Object.values(row.persona.onboardingData).some(val => val && typeof val === 'string' && val.trim().length > 0) ? 1 : 0,
        legacy: row.legacyCount || 0,
        questionnaire: row.questionnaireCount || 0
      }
    }));
  }

  async createPersona(insertPersona: InsertPersona): Promise<Persona> {
    const [persona] = await db
      .insert(personas)
      .values({
        ...insertPersona,
        updatedAt: new Date(),
      })
      .returning();
    return persona;
  }

  async updatePersona(id: string, userId: string, updates: Partial<Persona>): Promise<Persona | undefined> {
    // Only update personas that belong to the authenticated user
    const [persona] = await db
      .update(personas)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(personas.id, id), eq(personas.userId, userId)))
      .returning();
    return persona || undefined;
  }

  async deletePersona(id: string, userId: string): Promise<boolean> {
    // First verify the persona belongs to the user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, id), eq(personas.userId, userId)));
    
    if (personaCheck.length === 0) {
      return false; // Persona doesn't exist or doesn't belong to user
    }

    // Delete all related learning data in proper cascade order
    // First delete feedback (depends on conversations, messages, memories)
    await db
      .delete(feedback)
      .where(eq(feedback.personaId, id));
    
    // Delete pattern metrics
    await db
      .delete(patternMetrics)
      .where(eq(patternMetrics.personaId, id));
    
    // Delete memories
    await db
      .delete(memories)
      .where(eq(memories.personaId, id));
    
    // Delete all messages from conversations for this persona
    await db
      .delete(messages)
      .where(sql`${messages.conversationId} IN (SELECT id FROM ${conversations} WHERE ${conversations.personaId} = ${id})`);
    
    // Delete conversations
    await db
      .delete(conversations)
      .where(eq(conversations.personaId, id));
    
    // Delete onboarding sessions
    await db
      .delete(onboardingSessions)
      .where(eq(onboardingSessions.personaId, id));
    
    // Delete related media
    await db
      .delete(personaMedia)
      .where(eq(personaMedia.personaId, id));
    
    // Finally delete the persona
    const result = await db
      .delete(personas)
      .where(and(eq(personas.id, id), eq(personas.userId, userId)))
      .returning();
    
    return result.length > 0;
  }
  
  // Media methods
  async getPersonaMedia(personaId: string): Promise<PersonaMedia[]> {
    return await db.select().from(personaMedia).where(eq(personaMedia.personaId, personaId));
  }

  async createPersonaMedia(insertMedia: InsertPersonaMedia): Promise<PersonaMedia> {
    const [media] = await db
      .insert(personaMedia)
      .values(insertMedia)
      .returning();
    return media;
  }

  async deletePersonaMedia(id: string, userId: string): Promise<boolean> {
    // First check if the media belongs to a persona owned by the authenticated user
    const mediaWithPersona = await db
      .select({ 
        mediaId: personaMedia.id,
        personaUserId: personas.userId 
      })
      .from(personaMedia)
      .innerJoin(personas, eq(personaMedia.personaId, personas.id))
      .where(eq(personaMedia.id, id));
    
    if (mediaWithPersona.length === 0 || mediaWithPersona[0].personaUserId !== userId) {
      return false; // Media not found or doesn't belong to user
    }
    
    // Now safe to delete
    const result = await db.delete(personaMedia).where(eq(personaMedia.id, id)).returning();
    return result.length > 0;
  }
  
  // Onboarding session methods
  async getOnboardingSession(id: string): Promise<OnboardingSession | undefined> {
    const [session] = await db.select().from(onboardingSessions).where(eq(onboardingSessions.id, id));
    return session || undefined;
  }

  async getOnboardingSessionByUser(userId: string, approach: string): Promise<OnboardingSession | undefined> {
    const [session] = await db
      .select()
      .from(onboardingSessions)
      .where(and(
        eq(onboardingSessions.userId, userId),
        eq(onboardingSessions.approach, approach)
      ))
      .orderBy(onboardingSessions.createdAt)
      .limit(1);
    return session || undefined;
  }

  async getOnboardingSessionsByUser(userId: string): Promise<OnboardingSession[]> {
    return await db
      .select()
      .from(onboardingSessions)
      .where(eq(onboardingSessions.userId, userId))
      .orderBy(onboardingSessions.createdAt);
  }

  async createOnboardingSession(insertSession: InsertOnboardingSession): Promise<OnboardingSession> {
    const [session] = await db
      .insert(onboardingSessions)
      .values({
        ...insertSession,
        updatedAt: new Date(),
      })
      .returning();
    return session;
  }

  async updateOnboardingSession(id: string, userId: string, updates: Partial<OnboardingSession>): Promise<OnboardingSession | undefined> {
    // Only update sessions that belong to the authenticated user
    const [session] = await db
      .update(onboardingSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(onboardingSessions.id, id), eq(onboardingSessions.userId, userId)))
      .returning();
    return session || undefined;
  }

  // Questionnaire progress methods
  async getQuestionnaireProgress(personaId: string, userId: string): Promise<QuestionnaireProgress | undefined> {
    // First verify the persona belongs to the user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));
    
    if (personaCheck.length === 0) {
      return undefined; // Persona doesn't exist or doesn't belong to user
    }

    const [progress] = await db
      .select()
      .from(questionnaireProgress)
      .where(and(
        eq(questionnaireProgress.personaId, personaId),
        eq(questionnaireProgress.userId, userId)
      ));
    return progress || undefined;
  }

  async saveQuestionnaireProgress(progress: InsertQuestionnaireProgress): Promise<QuestionnaireProgress> {
    // Check if progress already exists for this user and persona
    const existing = await db
      .select()
      .from(questionnaireProgress)
      .where(and(
        eq(questionnaireProgress.personaId, progress.personaId),
        eq(questionnaireProgress.userId, progress.userId)
      ));

    if (existing.length > 0) {
      // Update existing progress
      const [updated] = await db
        .update(questionnaireProgress)
        .set({ 
          ...progress, 
          updatedAt: new Date() 
        })
        .where(and(
          eq(questionnaireProgress.personaId, progress.personaId),
          eq(questionnaireProgress.userId, progress.userId)
        ))
        .returning();
      return updated;
    } else {
      // Create new progress
      const [created] = await db
        .insert(questionnaireProgress)
        .values(progress)
        .returning();
      return created;
    }
  }

  async deleteQuestionnaireProgress(personaId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(questionnaireProgress)
      .where(and(
        eq(questionnaireProgress.personaId, personaId),
        eq(questionnaireProgress.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  // Conversation methods
  async getConversation(id: string, userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return conversation || undefined;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    // Get conversations with their last message content using a simpler approach
    const conversationsData = await db
      .select({
        conversation: conversations,
        lastMessageContent: messages.content,
      })
      .from(conversations)
      .leftJoin(
        messages,
        eq(conversations.id, messages.conversationId)
      )
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.lastMessageAt), desc(messages.createdAt));

    // Group by conversation and get the latest message for each
    const conversationMap = new Map<string, any>();
    
    for (const row of conversationsData) {
      const conv = row.conversation;
      if (!conversationMap.has(conv.id)) {
        conversationMap.set(conv.id, {
          ...conv,
          lastMessageContent: row.lastMessageContent || null,
        });
      }
    }

    return Array.from(conversationMap.values()).sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }

  async getConversationsByPersona(personaId: string, userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.personaId, personaId), eq(conversations.userId, userId)))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    // Verify the persona belongs to the user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, insertConversation.personaId), eq(personas.userId, insertConversation.userId)));
    
    if (personaCheck.length === 0) {
      throw new Error("Persona not found or access denied");
    }

    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: string, userId: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set(updates)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return conversation || undefined;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    // First verify the conversation belongs to the user
    const conversationCheck = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    
    if (conversationCheck.length === 0) {
      return false; // Conversation doesn't exist or doesn't belong to user
    }

    // Now safe to delete all related messages
    await db
      .delete(messages)
      .where(eq(messages.conversationId, id));
    
    // Then delete the conversation
    const result = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    
    return result.length > 0;
  }

  // Message methods
  async getMessagesByConversation(conversationId: string, userId: string): Promise<Message[]> {
    // First verify the conversation belongs to the user
    const conversationCheck = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
    
    if (conversationCheck.length === 0) {
      return []; // Conversation doesn't exist or doesn't belong to user
    }

    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    // Verify the conversation exists and belongs to the user (assuming userId will be provided via context)
    // Note: This will need userId parameter when implementing API routes
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateMessage(id: string, userId: string, updates: Partial<Message>): Promise<Message | undefined> {
    // First verify the message belongs to a conversation owned by the user
    const messageCheck = await db
      .select({ messageId: messages.id })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(eq(messages.id, id), eq(conversations.userId, userId)));
    
    if (messageCheck.length === 0) {
      return undefined; // Message doesn't exist or doesn't belong to user
    }

    const [message] = await db
      .update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
    return message || undefined;
  }

  async deleteMessage(id: string, userId: string): Promise<boolean> {
    // First verify the message belongs to a conversation owned by the user
    const messageCheck = await db
      .select({ messageId: messages.id })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(eq(messages.id, id), eq(conversations.userId, userId)));
    
    if (messageCheck.length === 0) {
      return false; // Message doesn't exist or doesn't belong to user
    }

    const result = await db.delete(messages).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  // Memory methods
  async getMemoriesByPersona(personaId: string, userId: string, limit?: number): Promise<Memory[]> {
    // First verify the persona belongs to the user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));
    
    if (personaCheck.length === 0) {
      return []; // Persona doesn't exist or doesn't belong to user
    }

    const query = db
      .select()
      .from(memories)
      .where(eq(memories.personaId, personaId))
      .orderBy(desc(memories.salience), desc(memories.createdAt));

    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getAllMemoriesByUser(userId: string, limit?: number): Promise<(Memory & { personaName: string })[]> {
    const query = db
      .select({
        memory: memories,
        personaName: personas.name
      })
      .from(memories)
      .innerJoin(personas, eq(memories.personaId, personas.id))
      .where(eq(personas.userId, userId))
      .orderBy(desc(memories.salience), desc(memories.createdAt));

    const results = limit ? await query.limit(limit) : await query;
    
    return results.map(row => ({
      ...row.memory,
      personaName: row.personaName
    }));
  }

  async getMemoryById(id: string, userId: string): Promise<Memory | undefined> {
    const [memory] = await db
      .select()
      .from(memories)
      .innerJoin(personas, eq(memories.personaId, personas.id))
      .where(and(eq(memories.id, id), eq(personas.userId, userId)));
    
    return memory?.memories || undefined;
  }

  async searchMemoriesByTag(personaId: string, userId: string, tags: string[]): Promise<Memory[]> {
    // First verify the persona belongs to the user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));
    
    if (personaCheck.length === 0) {
      return []; // Persona doesn't exist or doesn't belong to user
    }

    // Use array overlap operator to check if any of the searched tags exist in the memory's tags
    return await db
      .select()
      .from(memories)
      .where(and(
        eq(memories.personaId, personaId),
        // Use PostgreSQL array overlap operator
        sql`${memories.tags} && ${tags}`
      ))
      .orderBy(desc(memories.salience));
  }

  async createMemory(insertMemory: InsertMemory): Promise<Memory> {
    // Note: Ownership verification will be handled at API layer with userId context
    const [memory] = await db
      .insert(memories)
      .values(insertMemory)
      .returning();
    return memory;
  }

  async updateMemory(id: string, userId: string, updates: Partial<Memory>): Promise<Memory | undefined> {
    // First verify the memory belongs to a persona owned by the user
    const memoryCheck = await db
      .select({ memoryId: memories.id })
      .from(memories)
      .innerJoin(personas, eq(memories.personaId, personas.id))
      .where(and(eq(memories.id, id), eq(personas.userId, userId)));
    
    if (memoryCheck.length === 0) {
      return undefined; // Memory doesn't exist or doesn't belong to user
    }

    const [memory] = await db
      .update(memories)
      .set(updates)
      .where(eq(memories.id, id))
      .returning();
    return memory || undefined;
  }

  async deleteMemory(id: string, userId: string): Promise<boolean> {
    // First verify the memory belongs to a persona owned by the user
    const memoryCheck = await db
      .select({ memoryId: memories.id })
      .from(memories)
      .innerJoin(personas, eq(memories.personaId, personas.id))
      .where(and(eq(memories.id, id), eq(personas.userId, userId)));
    
    if (memoryCheck.length === 0) {
      return false; // Memory doesn't exist or doesn't belong to user
    }

    const result = await db.delete(memories).where(eq(memories.id, id)).returning();
    return result.length > 0;
  }

  // Feedback methods
  async getFeedbackByPersona(personaId: string, userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(and(eq(feedback.personaId, personaId), eq(feedback.userId, userId)))
      .orderBy(desc(feedback.createdAt));
  }

  async getFeedbackByConversation(conversationId: string, userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(and(eq(feedback.conversationId, conversationId), eq(feedback.userId, userId)))
      .orderBy(desc(feedback.createdAt));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    // Note: Ownership verification will be handled at API layer with userId context
    const [feedbackRecord] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return feedbackRecord;
  }

  async updateFeedback(id: string, userId: string, updates: Partial<Feedback>): Promise<Feedback | undefined> {
    const [feedbackRecord] = await db
      .update(feedback)
      .set(updates)
      .where(and(eq(feedback.id, id), eq(feedback.userId, userId)))
      .returning();
    return feedbackRecord || undefined;
  }

  async deleteFeedback(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(feedback)
      .where(and(eq(feedback.id, id), eq(feedback.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Pattern metrics methods
  async getPatternMetrics(personaId: string, userId: string, metric?: string, window?: string): Promise<PatternMetrics[]> {
    // First verify the persona belongs to the user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));
    
    if (personaCheck.length === 0) {
      return []; // Persona doesn't exist or doesn't belong to user
    }

    const conditions = [eq(patternMetrics.personaId, personaId)];
    if (metric) conditions.push(eq(patternMetrics.metric, metric));
    if (window) conditions.push(eq(patternMetrics.window, window));

    return await db
      .select()
      .from(patternMetrics)
      .where(and(...conditions))
      .orderBy(desc(patternMetrics.updatedAt));
  }

  async upsertPatternMetric(insertPatternMetrics: InsertPatternMetrics, userId: string): Promise<PatternMetrics> {
    // First verify the persona belongs to the user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, insertPatternMetrics.personaId), eq(personas.userId, userId)));
    
    if (personaCheck.length === 0) {
      throw new Error("Persona not found or access denied");
    }
    // Now safe to try to update first
    const [updated] = await db
      .update(patternMetrics)
      .set({ 
        value: insertPatternMetrics.value, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(patternMetrics.personaId, insertPatternMetrics.personaId),
        eq(patternMetrics.metric, insertPatternMetrics.metric),
        eq(patternMetrics.window, insertPatternMetrics.window)
      ))
      .returning();

    if (updated) {
      return updated;
    }

    // If no update, insert new
    const [inserted] = await db
      .insert(patternMetrics)
      .values(insertPatternMetrics)
      .returning();
    return inserted;
  }

  async deletePatternMetric(id: string, userId: string): Promise<boolean> {
    // First verify the pattern metric belongs to a persona owned by the user
    const metricCheck = await db
      .select({ metricId: patternMetrics.id })
      .from(patternMetrics)
      .innerJoin(personas, eq(patternMetrics.personaId, personas.id))
      .where(and(eq(patternMetrics.id, id), eq(personas.userId, userId)));
    
    if (metricCheck.length === 0) {
      return false; // Metric doesn't exist or doesn't belong to user
    }

    const result = await db.delete(patternMetrics).where(eq(patternMetrics.id, id)).returning();
    return result.length > 0;
  }

  // User Settings methods
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    
    return result[0];
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [created] = await db
      .insert(userSettings)
      .values(settings)
      .returning();
    return created;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const [updated] = await db
      .update(userSettings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    return updated;
  }

  // =====================================================
  // ENHANCED QUERY METHODS FOR API
  // =====================================================

  /**
   * Get message count for a conversation
   */
  async getMessageCount(conversationId: string, userId: string): Promise<number> {
    // Verify conversation belongs to user
    const conversationCheck = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));

    if (conversationCheck.length === 0) {
      return 0;
    }

    const [result] = await db
      .select({ count: count(messages.id) })
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    return result?.count || 0;
  }

  /**
   * Get paginated messages for a conversation
   */
  async getMessagesByConversationPaginated(
    conversationId: string,
    userId: string,
    limit: number,
    offset: number,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<Message[]> {
    // Verify conversation belongs to user
    const conversationCheck = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));

    if (conversationCheck.length === 0) {
      return [];
    }

    const orderFn = sortOrder === 'asc' ? asc : desc;
    const orderColumn = sortBy === 'createdAt' ? messages.createdAt : messages.createdAt;

    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get memory count for a persona
   */
  async getMemoryCount(personaId: string, userId: string): Promise<number> {
    // Verify persona belongs to user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));

    if (personaCheck.length === 0) {
      return 0;
    }

    const [result] = await db
      .select({ count: count(memories.id) })
      .from(memories)
      .where(eq(memories.personaId, personaId));

    return result?.count || 0;
  }

  /**
   * Get conversation count for a persona
   */
  async getConversationCount(personaId: string, userId: string): Promise<number> {
    // Verify persona belongs to user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));

    if (personaCheck.length === 0) {
      return 0;
    }

    const [result] = await db
      .select({ count: count(conversations.id) })
      .from(conversations)
      .where(and(
        eq(conversations.personaId, personaId),
        eq(conversations.userId, userId)
      ));

    return result?.count || 0;
  }

  /**
   * Get total message count across all conversations for a persona
   */
  async getTotalMessageCount(personaId: string, userId: string): Promise<number> {
    // Verify persona belongs to user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));

    if (personaCheck.length === 0) {
      return 0;
    }

    const [result] = await db
      .select({ count: count(messages.id) })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(
        eq(conversations.personaId, personaId),
        eq(conversations.userId, userId)
      ));

    return result?.count || 0;
  }

  /**
   * Get memories filtered by source
   */
  async getMemoriesBySource(
    personaId: string,
    userId: string,
    source: string
  ): Promise<Memory[]> {
    // Verify persona belongs to user
    const personaCheck = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, userId)));

    if (personaCheck.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(memories)
      .where(and(
        eq(memories.personaId, personaId),
        eq(memories.source, source)
      ))
      .orderBy(desc(memories.salience), desc(memories.createdAt));
  }
}

export const storage = new DatabaseStorage();
