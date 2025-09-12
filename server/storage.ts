import { 
  type User, 
  type InsertUser,
  type Persona,
  type InsertPersona,
  type PersonaMedia,
  type InsertPersonaMedia,
  type OnboardingSession,
  type InsertOnboardingSession,
  users,
  personas,
  personaMedia,
  onboardingSessions
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Persona methods
  getPersona(id: string): Promise<Persona | undefined>;
  getPersonasByUser(userId: string): Promise<Persona[]>;
  createPersona(persona: InsertPersona): Promise<Persona>;
  updatePersona(id: string, updates: Partial<Persona>): Promise<Persona | undefined>;
  
  // Media methods
  getPersonaMedia(personaId: string): Promise<PersonaMedia[]>;
  createPersonaMedia(media: InsertPersonaMedia): Promise<PersonaMedia>;
  deletePersonaMedia(id: string): Promise<boolean>;
  
  // Onboarding session methods
  getOnboardingSession(id: string): Promise<OnboardingSession | undefined>;
  getOnboardingSessionByUser(userId: string, approach: string): Promise<OnboardingSession | undefined>;
  getOnboardingSessionsByUser(userId: string): Promise<OnboardingSession[]>;
  createOnboardingSession(session: InsertOnboardingSession): Promise<OnboardingSession>;
  updateOnboardingSession(id: string, updates: Partial<OnboardingSession>): Promise<OnboardingSession | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Persona methods
  async getPersona(id: string): Promise<Persona | undefined> {
    const [persona] = await db.select().from(personas).where(eq(personas.id, id));
    return persona || undefined;
  }

  async getPersonasByUser(userId: string): Promise<Persona[]> {
    return await db.select().from(personas).where(eq(personas.userId, userId));
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

  async updatePersona(id: string, updates: Partial<Persona>): Promise<Persona | undefined> {
    const [persona] = await db
      .update(personas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(personas.id, id))
      .returning();
    return persona || undefined;
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

  async deletePersonaMedia(id: string): Promise<boolean> {
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

  async updateOnboardingSession(id: string, updates: Partial<OnboardingSession>): Promise<OnboardingSession | undefined> {
    const [session] = await db
      .update(onboardingSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(onboardingSessions.id, id))
      .returning();
    return session || undefined;
  }
}

export const storage = new DatabaseStorage();
