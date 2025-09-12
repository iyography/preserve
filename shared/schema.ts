import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
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

// Relations (removed user relations since Supabase handles users)
export const personasRelations = relations(personas, ({ many }) => ({
  media: many(personaMedia),
  onboardingSessions: many(onboardingSessions),
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

// Types
export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Persona = typeof personas.$inferSelect;
export type InsertPersonaMedia = z.infer<typeof insertPersonaMediaSchema>;
export type PersonaMedia = typeof personaMedia.$inferSelect;
export type InsertOnboardingSession = z.infer<typeof insertOnboardingSessionSchema>;
export type OnboardingSession = typeof onboardingSessions.$inferSelect;
