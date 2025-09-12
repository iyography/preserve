import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, real, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users are handled by Supabase auth - no separate users table needed
// User IDs will be Supabase auth user UUIDs (varchar)

// Personas table for storing information about deceased loved ones
export const personas = pgTable("personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Supabase auth user UUID
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Onboarding approach used
  onboardingApproach: text("onboarding_approach").notNull(),
  // Status of persona creation
  status: text("status").notNull().default("in_progress"), // 'in_progress', 'completed'
  // Additional data specific to onboarding approach (stored as JSON)
  onboardingData: jsonb("onboarding_data").default({}),
});

// Photos and media uploads
export const personaMedia = pgTable("persona_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimetype: text("mimetype").notNull(),
  size: text("size").notNull(),
  url: text("url").notNull(),
  mediaType: text("media_type").notNull(), // 'photo', 'video', 'audio'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Onboarding sessions to track progress
export const onboardingSessions = pgTable("onboarding_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Supabase auth user UUID
  personaId: varchar("persona_id").references(() => personas.id),
  approach: text("approach").notNull(), // 'gradual-awakening', 'ai-guided-interview', etc.
  currentStep: text("current_step").notNull(),
  stepData: jsonb("step_data").default({}),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Conversations table for persistent chat sessions
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Supabase auth user UUID
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  title: text("title").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  status: text("status").notNull().default("active"), // 'active', 'archived'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Performance indexes
  userPersonaStatusIdx: index("conversations_user_persona_status_idx").on(table.userId, table.personaId, table.status),
  lastMessageIdx: index("conversations_last_message_idx").on(table.lastMessageAt.desc()),
}));

// Messages table for storing all chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(), // 'user', 'persona', 'system'
  content: text("content").notNull(),
  tokens: integer("tokens"),
  meta: jsonb("meta").default({}), // Additional metadata like retrieved memories, feedback, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Performance indexes for pagination and ordering
  conversationTimeIdx: index("messages_conversation_time_idx").on(table.conversationId, table.createdAt, table.id),
}));

// Memories table for storing learned information about personas
export const memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  type: text("type").notNull(), // 'episodic', 'semantic', 'preference', 'boundary', 'relationship'
  content: text("content").notNull(),
  source: text("source").notNull(), // 'onboarding', 'message', 'feedback'
  salience: real("salience").notNull().default(1.0), // How important/relevant this memory is
  lastUsedAt: timestamp("last_used_at"),
  usageCount: integer("usage_count").notNull().default(0),
  tags: text("tags").array().default(sql`'{}'::text[]`), // For categorization and search
  embedding: jsonb("embedding"), // For semantic search
  messageId: varchar("message_id").references(() => messages.id), // Traceability to source message
  conversationId: varchar("conversation_id").references(() => conversations.id), // Traceability to source conversation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Performance indexes
  personaIdx: index("memories_persona_idx").on(table.personaId),
  tagsIdx: index("memories_tags_gin_idx").on(table.tags),
}));

// Feedback table for user corrections and preferences
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Supabase auth user UUID
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  messageId: varchar("message_id").references(() => messages.id),
  memoryId: varchar("memory_id").references(() => memories.id), // Link feedback to specific memory
  kind: text("kind").notNull(), // 'thumbs_up', 'thumbs_down', 'correct', 'edit', 'pin', 'forget'
  payload: jsonb("payload"), // Additional data like corrected text, explanations
  status: text("status").notNull().default("pending"), // 'pending', 'applied'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Performance indexes
  personaConversationIdx: index("feedback_persona_conversation_idx").on(table.personaId, table.conversationId, table.messageId),
}));

// Pattern metrics for learning and adaptation
export const patternMetrics = pgTable("pattern_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => personas.id),
  metric: text("metric").notNull(), // 'topic_affinity', 'sentiment', 'verbosity', etc.
  window: text("window").notNull(), // '7d', '30d', 'all'
  value: jsonb("value").notNull(), // Metric data
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicates and enable efficient lookups
  personaMetricWindowUnique: uniqueIndex("pattern_metrics_persona_metric_window_unique").on(table.personaId, table.metric, table.window),
  personaIdx: index("pattern_metrics_persona_idx").on(table.personaId),
}));

// Relations (removed user relations since Supabase handles users)
export const personasRelations = relations(personas, ({ many }) => ({
  media: many(personaMedia),
  onboardingSessions: many(onboardingSessions),
  conversations: many(conversations),
  memories: many(memories),
  feedback: many(feedback),
  patternMetrics: many(patternMetrics),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  persona: one(personas, {
    fields: [conversations.personaId],
    references: [personas.id],
  }),
  messages: many(messages),
  feedback: many(feedback),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  feedback: many(feedback),
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  persona: one(personas, {
    fields: [memories.personaId],
    references: [personas.id],
  }),
  message: one(messages, {
    fields: [memories.messageId],
    references: [messages.id],
  }),
  conversation: one(conversations, {
    fields: [memories.conversationId],
    references: [conversations.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  persona: one(personas, {
    fields: [feedback.personaId],
    references: [personas.id],
  }),
  conversation: one(conversations, {
    fields: [feedback.conversationId],
    references: [conversations.id],
  }),
  message: one(messages, {
    fields: [feedback.messageId],
    references: [messages.id],
  }),
  memory: one(memories, {
    fields: [feedback.memoryId],
    references: [memories.id],
  }),
}));

export const patternMetricsRelations = relations(patternMetrics, ({ one }) => ({
  persona: one(personas, {
    fields: [patternMetrics.personaId],
    references: [personas.id],
  }),
}));

export const personaMediaRelations = relations(personaMedia, ({ one }) => ({
  persona: one(personas, {
    fields: [personaMedia.personaId],
    references: [personas.id],
  }),
}));

export const onboardingSessionsRelations = relations(onboardingSessions, ({ one }) => ({
  persona: one(personas, {
    fields: [onboardingSessions.personaId],
    references: [personas.id],
  }),
}));

// Insert schemas
export const insertPersonaSchema = createInsertSchema(personas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonaMediaSchema = createInsertSchema(personaMedia).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingSessionSchema = createInsertSchema(onboardingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMemorySchema = createInsertSchema(memories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertPatternMetricsSchema = createInsertSchema(patternMetrics).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Persona = typeof personas.$inferSelect;
export type InsertPersonaMedia = z.infer<typeof insertPersonaMediaSchema>;
export type PersonaMedia = typeof personaMedia.$inferSelect;
export type InsertOnboardingSession = z.infer<typeof insertOnboardingSessionSchema>;
export type OnboardingSession = typeof onboardingSessions.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertPatternMetrics = z.infer<typeof insertPatternMetricsSchema>;
export type PatternMetrics = typeof patternMetrics.$inferSelect;
